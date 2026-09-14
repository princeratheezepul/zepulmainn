/**
 * Scoring a posting against a search intent.
 *
 * Used by both halves of the candidate dashboard — the Zepul database search and
 * the re-ranking of live web results — so a job is judged the same way whichever
 * list it appears in.
 *
 * Three ideas drive the ranking:
 *
 *  1. Rare words count more. "kubernetes" narrows a search; "developer" barely
 *     does. Weighting every term by inverse document frequency is what stops one
 *     generic word in the query from admitting the whole job board.
 *  2. The final score is a weighted average of the parts that actually apply, not
 *     a sum of bonuses. A sum saturates — with the old scoring, everything decent
 *     hit the 100 cap and the ordering inside the top of the list was arbitrary.
 *  3. A constraint the candidate actually typed ("in Bangalore", "internship") is
 *     a filter, not a bonus. Contradicting one costs the posting real points, so
 *     a wrong-city result sinks instead of riding in on its title.
 */

import {
  termTokens,
  termHit,
  hasPhrase,
  idfWeight,
  termWeight,
  tokenize,
} from "./jobText.util.js";

const toList = (v) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);
const uniq = (arr) => [...new Set(arr)];

const INTERNSHIP_RE = /\b(intern|interns|internship|internships|trainee|traineeship|apprentice|apprenticeship|co-?op|summer\s+analyst|articleship)\b/i;

// What each seniority label implies in years, used to spot a posting that is
// clearly aimed at a different career stage than the one being searched for.
const SENIORITY_BAND = {
  junior: [0, 2],
  mid: [2, 6],
  senior: [5, 12],
  lead: [8, 30],
};

export const isInternshipDoc = (doc = {}) =>
  INTERNSHIP_RE.test(String(doc.employmentType || "")) ||
  INTERNSHIP_RE.test(String(doc.title || ""));

// A term found only in the body of a description counts for less when deciding
// whether a posting is a match at all. "Work closely with designers on launches"
// should not make a marketing role an answer to a search for "designer".
const BODY_EVIDENCE = 0.6;

/**
 * Weighted coverage of a set of terms: what fraction of the query's *meaning*
 * this posting actually accounts for. 1 means every term landed in a title.
 *
 * `ratio` is for ranking and `strictRatio` — which discounts body-only hits — is
 * for deciding whether the posting belongs in the results at all.
 */
const coverage = (terms, idx, idf) => {
  let total = 0;
  let got = 0;
  let strict = 0;
  const hits = [];

  for (const term of terms) {
    const tokens = termTokens(term);
    if (!tokens.length) continue;
    const weight = termWeight(idf, tokens);
    total += weight;
    const { hit, where } = termHit(tokens, idx);
    if (hit > 0) {
      got += weight * hit;
      strict += weight * (where === "body" ? hit * BODY_EVIDENCE : hit);
      hits.push({ term, hit, weight });
    }
  }

  hits.sort((a, b) => b.weight * b.hit - a.weight * a.hit);
  return {
    applicable: total > 0,
    ratio: total ? got / total : 0,
    strictRatio: total ? strict / total : 0,
    hits: hits.map((h) => h.term),
  };
};

/**
 * How well the posting's title matches one of the target roles. Title match is
 * the strongest single signal a job search has, so it is measured on its own
 * rather than folded into general keyword coverage.
 */
const roleFit = (roles, idx, idf) => {
  let best = 0;
  let bestRole = "";

  for (const role of roles) {
    const tokens = termTokens(role);
    if (!tokens.length) continue;

    const total = tokens.reduce((sum, t) => sum + idfWeight(idf, t), 0);
    if (!total) continue;

    const inTitle = tokens.reduce(
      (sum, t) => sum + (idx.titleSet.has(t) ? idfWeight(idf, t) : 0),
      0
    );
    let fit = inTitle / total;

    // Exact phrase in the title — "React Developer" for "react developer".
    if (fit > 0 && hasPhrase(idx.titlePhrase, tokens)) fit = Math.min(1, fit + 0.15);

    // Words the title missed still count, at a discount, if the skills list or
    // the description carries them.
    if (fit < 1) {
      const elsewhere = tokens.reduce((sum, t) => {
        if (idx.titleSet.has(t)) return sum;
        if (idx.skillSet.has(t)) return sum + idfWeight(idf, t) * 0.45;
        if (idx.bodySet.has(t)) return sum + idfWeight(idf, t) * 0.3;
        return sum;
      }, 0);
      fit = Math.min(1, fit + elsewhere / total);
    }

    if (fit > best) {
      best = fit;
      bestRole = role;
    }
  }

  return { applicable: roles.length > 0, fit: best, role: bestRole };
};

const locationMatches = (idx, locations) =>
  locations.some((loc) => {
    const tokens = tokenize(loc, { keepStopWords: true });
    return tokens.length > 0 && hasPhrase(idx.locationPhrase, tokens);
  });

/**
 * Agreement with the constraints the candidate stated, plus the penalty for
 * contradicting them. Returns fit in 0..1 and a penalty in points.
 */
const constraintFit = (idx, intent) => {
  const doc = idx.doc || {};
  const c = intent.constraints || {};
  const reasons = [];
  const parts = [];
  let penalty = 0;

  const locations = toList(c.locations);
  if (locations.length) {
    const isRemote = String(doc.type || "").toLowerCase() === "remote";
    if (locationMatches(idx, locations)) {
      parts.push(1);
      reasons.push(`In ${doc.location || locations[0]}`);
    } else if (isRemote) {
      // Remote satisfies any city the candidate named.
      parts.push(0.85);
      reasons.push("Remote — works from anywhere");
    } else if (!String(doc.location || "").trim()) {
      parts.push(0.5); // Location not stated; no basis to punish it.
    } else {
      parts.push(0);
      penalty += 24;
    }
  }

  const workType = String(c.workType || "").toLowerCase();
  if (workType) {
    const jobType = String(doc.type || "").toLowerCase();
    if (!jobType) parts.push(0.5);
    else if (jobType === workType) {
      parts.push(1);
      reasons.push(`${doc.type} as you asked`);
    } else {
      parts.push(0);
      penalty += 16;
    }
  }

  const wantsInternship = INTERNSHIP_RE.test(String(c.employmentType || ""));
  const jobIsInternship = isInternshipDoc(doc);
  if (wantsInternship) {
    if (jobIsInternship) {
      parts.push(1);
      reasons.push("Internship");
    } else {
      // An internship search returning senior roles is the clearest kind of
      // wrong answer, so this is the heaviest penalty in the scorer.
      parts.push(0);
      penalty += 34;
    }
  } else if (c.employmentType) {
    const wanted = String(c.employmentType).toLowerCase();
    const actual = String(doc.employmentType || "").toLowerCase();
    if (!actual) parts.push(0.5);
    else if (actual.includes(wanted) || wanted.includes(actual)) {
      parts.push(1);
      reasons.push(doc.employmentType);
    } else {
      parts.push(0);
      penalty += jobIsInternship ? 22 : 12;
    }
  } else if (jobIsInternship && intent.query) {
    // They did not ask for an internship. Below a real opening in general, and a
    // contradiction outright when they asked for a senior or lead role.
    const senior = ["senior", "lead"].includes(String(c.seniority || "").toLowerCase());
    penalty += senior ? 26 : 10;
  }

  // Experience / seniority. A stated band that the posting sits well outside of
  // means the posting is aimed at a different career stage.
  const band = c.seniority ? SENIORITY_BAND[String(c.seniority).toLowerCase()] : null;
  const min = typeof c.minExperience === "number" ? c.minExperience : band?.[0] ?? null;
  const max = typeof c.maxExperience === "number" ? c.maxExperience : band?.[1] ?? null;

  if ((min !== null || max !== null) && typeof doc.experience === "number") {
    const lo = min ?? 0;
    const hi = max ?? 99;
    if (doc.experience >= lo && doc.experience <= hi) {
      parts.push(1);
      reasons.push(`Experience fits (~${doc.experience} yrs)`);
    } else {
      const gap = doc.experience < lo ? lo - doc.experience : doc.experience - hi;
      parts.push(Math.max(0, 1 - gap / 5));
      if (gap > 2) penalty += Math.min(14, gap * 3);
    }
  }

  return {
    applicable: parts.length > 0,
    fit: parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0,
    penalty,
    reasons,
  };
};

/** Soft agreement with the candidate's interview profile — a boost, never a penalty. */
const profileFit = (idx, intent, idf) => {
  const soft = intent.soft || {};
  const doc = idx.doc || {};
  const terms = uniq([...toList(soft.skills), ...toList(soft.keywords)]).slice(0, 24);
  const cov = coverage(terms, idx, idf);

  const parts = [];
  const reasons = [];
  if (cov.applicable) {
    parts.push(cov.ratio);
    if (cov.hits.length) {
      reasons.push(`Matches your profile: ${cov.hits.slice(0, 4).join(", ")}`);
    }
  }

  // Preferences from the interview only nudge, because the candidate did not
  // restate them in this search.
  const softLocations = toList(soft.locations);
  if (softLocations.length && !toList(intent.constraints?.locations).length) {
    parts.push(locationMatches(idx, softLocations) ? 1 : 0.4);
  }
  if (soft.workType && !intent.constraints?.workType && doc.type) {
    parts.push(String(doc.type).toLowerCase() === String(soft.workType).toLowerCase() ? 1 : 0.4);
  }

  return {
    applicable: parts.length > 0,
    fit: parts.length ? parts.reduce((a, b) => a + b, 0) / parts.length : 0,
    reasons,
  };
};

// Among otherwise equal postings, the fresher one is the better answer.
const freshnessBoost = (doc) => {
  const created = doc.createdAt ? new Date(doc.createdAt).getTime() : 0;
  if (!created) return 0;
  const days = (Date.now() - created) / 86_400_000;
  if (days <= 7) return 3;
  if (days <= 30) return 2;
  if (days <= 90) return 1;
  return 0;
};

const WEIGHTS = { role: 40, skill: 28, profile: 14, constraints: 18 };

/**
 * Score one indexed posting against an intent.
 * Returns the 0-100 score, why it matched, and how much of the query it covered
 * (the caller uses coverage to decide whether the result is relevant at all).
 */
export const scoreDocument = (idx, intent, idf) => {
  const roles = toList(intent.roles);
  const skills = toList(intent.skills);
  const keywords = toList(intent.keywords);

  const role = roleFit(roles, idx, idf);
  const skill = coverage(skills, idx, idf);
  const profile = profileFit(idx, intent, idf);
  const constraints = constraintFit(idx, intent);

  const parts = [
    { w: WEIGHTS.role, fit: role.fit, on: role.applicable },
    { w: WEIGHTS.skill, fit: skill.ratio, on: skill.applicable },
    { w: WEIGHTS.profile, fit: profile.fit, on: profile.applicable },
    { w: WEIGHTS.constraints, fit: constraints.fit, on: constraints.applicable },
  ].filter((p) => p.on);

  // Weighted average of the applicable parts. Dividing by the weight that was
  // actually in play keeps a query with no stated skills on the same 0-100 scale
  // as one that lists five.
  const weight = parts.reduce((s, p) => s + p.w, 0);
  const base = weight ? parts.reduce((s, p) => s + p.w * p.fit, 0) / weight : 0;

  const score = Math.max(
    0,
    Math.min(100, Math.round(base * 100 + freshnessBoost(idx.doc || {}) - constraints.penalty))
  );

  // How much of what they actually typed this posting accounts for. Role and
  // skill terms only — profile context must never make an off-topic job look
  // like it answered the query.
  const queryTerms = uniq([...roles, ...skills, ...keywords]);
  const queryCoverage = queryTerms.length ? coverage(queryTerms, idx, idf).strictRatio : 1;

  const reasons = [];
  if (role.fit >= 0.75 && role.role) {
    reasons.push(`Title matches "${idx.doc?.title || role.role}"`);
  } else if (role.fit >= 0.4 && role.role) {
    reasons.push(`Related to "${role.role}"`);
  }
  if (skill.hits.length) reasons.push(`Skills: ${skill.hits.slice(0, 4).join(", ")}`);
  reasons.push(...constraints.reasons);
  reasons.push(...profile.reasons);

  return {
    score,
    queryCoverage,
    penalty: constraints.penalty,
    reasons: uniq(reasons).slice(0, 4),
  };
};

/**
 * Rank indexed postings against an intent.
 *
 * `minCoverage` is the relevance gate: a posting has to account for at least
 * this much of the query's weighted meaning to be shown at all. It replaces the
 * old "any one query word appears anywhere" filter, under which a search for
 * "senior react developer in bangalore" admitted every posting that happened to
 * contain the word "developer".
 */
export const rankDocuments = (
  indexes,
  intent,
  idf,
  { limit = 12, minScore = 0, minCoverage = 0 } = {}
) => {
  const scored = [];

  for (const idx of indexes) {
    const result = scoreDocument(idx, intent, idf);
    if (result.score < minScore) continue;
    if (result.queryCoverage < minCoverage) continue;
    scored.push({ idx, doc: idx.doc, ...result });
  }

  scored.sort((a, b) => b.score - a.score || b.queryCoverage - a.queryCoverage);
  return scored.slice(0, limit);
};
