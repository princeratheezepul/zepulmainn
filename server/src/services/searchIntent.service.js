/**
 * Turning what a candidate typed into something a matcher can use.
 *
 * The old search handed the raw phrase to the scorer as if it were a job title,
 * which meant "senior react developer in bangalore" was matched word by word —
 * "senior" scored against "Senior Accountant", "bangalore" was hunted for inside
 * job descriptions, and "in" was a search term. Splitting the phrase into a role,
 * skills and constraints first is what makes the results answer the question.
 *
 * The interview profile is layered in underneath as *soft* context: it boosts and
 * breaks ties, but it never overrides something the candidate just typed. That is
 * the part that makes results better after talking to the AI agent without making
 * an explicit search drift back towards the interview.
 */

import OpenAI from "openai";
import { tokenize, termTokens } from "./jobText.util.js";

const openai = process.env.OPENAI_API ? new OpenAI({ apiKey: process.env.OPENAI_API }) : null;
const MODEL = "gpt-4o-mini";

// The database search waits on this parse, so it is kept short — a slow parse
// falls back to the rule-based reading rather than holding up the results.
const PARSE_TIMEOUT_MS = 3500;

const toList = (v) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);
const str = (v) => String(v ?? "").trim();
const lc = (v) => str(v).toLowerCase();
const uniq = (arr) => [...new Set(arr.filter(Boolean))];

// ─── Rule-based reading (also the fallback when OpenAI is unavailable) ───────

const INTERNSHIP_RE = /\b(intern|interns|internship|internships|trainee|apprentice|apprenticeship|co-?op|articleship)\b/i;
const CONTRACT_RE = /\b(contract|contractor|freelance|freelancing|consultant|consulting|temp|temporary)\b/i;
const PART_TIME_RE = /\b(part[\s-]?time)\b/i;
const FULL_TIME_RE = /\b(full[\s-]?time|permanent)\b/i;

const REMOTE_RE = /\b(remote|work from home|wfh|anywhere)\b/i;
const HYBRID_RE = /\bhybrid\b/i;
const ONSITE_RE = /\b(on[\s-]?site|onsite|in[\s-]?office|work from office)\b/i;

const SENIOR_RE = /\b(senior|sr\.?|principal|staff|architect)\b/i;
const LEAD_RE = /\b(lead|head|director|vp|manager|managerial)\b/i;
const JUNIOR_RE = /\b(junior|jr\.?|entry[\s-]?level|fresher|freshers|graduate|trainee|beginner)\b/i;
const MID_RE = /\b(mid[\s-]?level|mid)\b/i;

const YEARS_RE = /\b(\d{1,2})\s*(?:\+|plus)?\s*(?:-|to)?\s*(\d{1,2})?\s*(?:\+)?\s*(?:years?|yrs?)\b/i;

// Cities the candidates on this platform actually search for. Only used by the
// fallback parser — the model handles anything outside this list.
const CITIES = [
  "bengaluru", "bangalore", "mumbai", "delhi", "new delhi", "gurugram", "gurgaon",
  "noida", "hyderabad", "chennai", "pune", "kolkata", "ahmedabad", "jaipur",
  "chandigarh", "indore", "kochi", "cochin", "coimbatore", "trivandrum",
  "thiruvananthapuram", "bhubaneswar", "nagpur", "lucknow", "vizag",
  "visakhapatnam", "mysore", "mysuru", "surat", "vadodara", "goa", "mohali",
  "london", "manchester", "berlin", "amsterdam", "dublin", "paris", "madrid",
  "lisbon", "warsaw", "singapore", "dubai", "abu dhabi", "doha", "riyadh",
  "sydney", "melbourne", "toronto", "vancouver", "new york", "san francisco",
  "seattle", "austin", "boston", "chicago", "los angeles", "denver", "atlanta",
  "tokyo", "hong kong", "kuala lumpur", "bangkok", "manila", "jakarta",
  "india", "usa", "uk", "canada", "australia", "germany", "europe",
];

// Words that describe the shape of the job rather than its subject. Kept out of
// the role so "remote internship" does not become a job title.
const MODIFIER_WORDS = new Set([
  "remote", "hybrid", "onsite", "wfh", "anywhere", "fulltime", "parttime",
  "full", "part", "time", "contract", "freelance", "temporary", "permanent",
  "internship", "intern", "trainee", "fresher", "graduate", "entry", "level",
  "year", "years", "yrs", "experience", "salary", "lpa", "ctc", "stipend",
  // Seniority adjectives. They are captured separately and drive the experience
  // band; leaving them in the role made "senior react developer" score against
  // "Senior Accountant" on the strength of the word "senior" alone. Role nouns
  // that also imply seniority — lead, head, manager, director — stay put.
  "senior", "sr", "junior", "jr", "mid", "principal", "staff", "experienced",
  "paid", "unpaid", "urgent", "immediate", "joiner", "new", "latest",
]);

const detectEmploymentType = (q) => {
  if (INTERNSHIP_RE.test(q)) return "Internship";
  if (CONTRACT_RE.test(q)) return "Contract";
  if (PART_TIME_RE.test(q)) return "Part-time";
  if (FULL_TIME_RE.test(q)) return "Full-time";
  return "";
};

const detectWorkType = (q) => {
  if (REMOTE_RE.test(q)) return "remote";
  if (HYBRID_RE.test(q)) return "hybrid";
  if (ONSITE_RE.test(q)) return "onsite";
  return "";
};

const detectSeniority = (q) => {
  if (JUNIOR_RE.test(q)) return "junior";
  if (SENIOR_RE.test(q)) return "senior";
  if (LEAD_RE.test(q)) return "lead";
  if (MID_RE.test(q)) return "mid";
  return "";
};

const detectLocations = (q) => {
  const hay = ` ${lc(q).replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ")} `;
  const found = CITIES.filter((city) => hay.includes(` ${city} `));
  // Prefer the longest name when two overlap ("new york" over "york").
  return uniq(
    found
      .sort((a, b) => b.length - a.length)
      .filter((city, i, all) => !all.slice(0, i).some((longer) => longer.includes(city)))
  ).slice(0, 3);
};

const detectExperience = (q) => {
  const m = q.match(YEARS_RE);
  if (!m) return { minExperience: null, maxExperience: null };
  const a = Number(m[1]);
  const b = m[2] ? Number(m[2]) : null;
  if (!Number.isFinite(a)) return { minExperience: null, maxExperience: null };
  if (b !== null && Number.isFinite(b)) return { minExperience: Math.min(a, b), maxExperience: Math.max(a, b) };
  return { minExperience: a, maxExperience: /\+|plus/.test(m[0]) ? null : a + 2 };
};

/** Read a query with regexes alone — no network, always available. */
export const parseQueryWithRules = (query) => {
  const q = str(query);
  const employmentType = detectEmploymentType(q);
  const workType = detectWorkType(q);
  const seniority = detectSeniority(q);
  const locations = detectLocations(q);
  const { minExperience, maxExperience } = detectExperience(q);

  // Whatever is left once the shape words and the location are removed is what
  // the candidate is actually looking for.
  const locationTokens = new Set(locations.flatMap((l) => tokenize(l, { keepStopWords: true })));
  const roleTokens = tokenize(q).filter(
    (t) => !MODIFIER_WORDS.has(t) && !locationTokens.has(t) && !/^\d+$/.test(t)
  );

  return {
    roles: roleTokens.length ? [roleTokens.join(" ")] : [],
    skills: [],
    keywords: roleTokens,
    locations,
    workType,
    employmentType,
    seniority,
    minExperience,
    maxExperience,
    source: "rules",
  };
};

// ─── Model-based reading ────────────────────────────────────────────────────

const PARSE_SYSTEM = `You turn a job seeker's search box text into structured search criteria.
Only record a constraint the text actually states — never guess a city, a seniority or an employment type that is not there.
Output ONLY a valid JSON object.`;

const PARSE_USER = (q) => `Search text: "${q}"

Return JSON with exactly these keys:
"roles": array of 1-3 job titles this describes, shortest useful form first (e.g. "react developer", not "senior react developer in bangalore"). Normalise abbreviations.
"skills": array of concrete skills, technologies or specialisms named or clearly implied by the role (e.g. "react developer" implies ["react","javascript"]). Max 8.
"keywords": array of other meaningful lowercase search words. Max 8.
"locations": array of places named in the text. Empty if none is named.
"workType": one of "remote","hybrid","onsite", or "" if not stated.
"employmentType": one of "Full-time","Part-time","Contract","Internship", or "" if not stated.
"seniority": one of "junior","mid","senior","lead", or "" if not stated.
"minExperience": number of years or null.
"maxExperience": number of years or null.

Output only raw JSON, no markdown.`;

const ALLOWED_WORK = new Set(["remote", "hybrid", "onsite"]);
const ALLOWED_EMPLOYMENT = new Set(["Full-time", "Part-time", "Contract", "Internship"]);
const ALLOWED_SENIORITY = new Set(["junior", "mid", "senior", "lead"]);

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

const parseQueryWithModel = async (query) => {
  const completion = await openai.chat.completions.create(
    {
      model: MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: PARSE_SYSTEM },
        { role: "user", content: PARSE_USER(query) },
      ],
    },
    { timeout: PARSE_TIMEOUT_MS, maxRetries: 0 }
  );

  const parsed = JSON.parse(completion.choices?.[0]?.message?.content ?? "{}");
  const workType = lc(parsed.workType);
  const seniority = lc(parsed.seniority);
  const employmentType = str(parsed.employmentType);

  return {
    roles: uniq(toList(parsed.roles).map(str)).slice(0, 3),
    skills: uniq(toList(parsed.skills).map(str)).slice(0, 8),
    keywords: uniq(toList(parsed.keywords).map(lc)).slice(0, 8),
    locations: uniq(toList(parsed.locations).map(str)).slice(0, 3),
    workType: ALLOWED_WORK.has(workType) ? workType : "",
    employmentType: ALLOWED_EMPLOYMENT.has(employmentType) ? employmentType : "",
    seniority: ALLOWED_SENIORITY.has(seniority) ? seniority : "",
    minExperience: num(parsed.minExperience),
    maxExperience: num(parsed.maxExperience),
    source: "openai",
  };
};

// ─── Parse cache ────────────────────────────────────────────────────────────
//
// The dashboard fires the database search and the web search at the same moment
// for one query. Caching the in-flight promise (not just the result) means the
// two requests share a single parse instead of each paying for its own, and both
// halves of the page are guaranteed to be matching against the same reading.

const PARSE_CACHE = new Map();
const PARSE_CACHE_TTL_MS = 15 * 60 * 1000;
const PARSE_CACHE_MAX = 300;

const cacheKey = (query) => lc(query).replace(/\s+/g, " ");

const readParseCache = (key) => {
  const hit = PARSE_CACHE.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > PARSE_CACHE_TTL_MS) {
    PARSE_CACHE.delete(key);
    return null;
  }
  return hit.promise;
};

const writeParseCache = (key, promise) => {
  if (PARSE_CACHE.size >= PARSE_CACHE_MAX) {
    PARSE_CACHE.delete(PARSE_CACHE.keys().next().value);
  }
  PARSE_CACHE.set(key, { promise, at: Date.now() });
};

/**
 * Read a search query into structured criteria. Never rejects — a model failure
 * or a timeout falls back to the rule-based reading.
 */
export const parseSearchQuery = async (query) => {
  const q = str(query);
  if (!q) return parseQueryWithRules("");
  if (!openai) return parseQueryWithRules(q);

  const key = cacheKey(q);
  const cached = readParseCache(key);
  if (cached) return cached;

  const rules = parseQueryWithRules(q);
  const promise = parseQueryWithModel(q)
    .then((model) => {
      // Regexes are more literal than the model about the words that were
      // actually typed, so a constraint either side spotted is kept.
      if (!model.roles.length) model.roles = rules.roles;
      if (!model.locations.length) model.locations = rules.locations;
      if (!model.workType) model.workType = rules.workType;
      if (!model.employmentType) model.employmentType = rules.employmentType;
      if (!model.seniority) model.seniority = rules.seniority;
      if (model.minExperience === null) model.minExperience = rules.minExperience;
      if (model.maxExperience === null) model.maxExperience = rules.maxExperience;
      model.keywords = uniq([...model.keywords, ...rules.keywords]).slice(0, 12);
      return model;
    })
    .catch((err) => {
      console.warn("parseSearchQuery: falling back to rules —", err?.message || err);
      PARSE_CACHE.delete(key); // Don't cache a failure.
      return rules;
    });

  writeParseCache(key, promise);
  return promise;
};

// ─── Intent assembly ────────────────────────────────────────────────────────

/** Soft context drawn from the AI interview and, if there is one, the resume. */
const buildSoftContext = (profile, resume) => {
  const p = profile || {};
  const r = resume || {};

  return {
    roles: uniq([...toList(p.desiredRoles).map(str), str(r.title)]).slice(0, 5),
    skills: uniq([
      ...toList(p.skills).map(str),
      ...toList(r.skills).map(str),
    ]).slice(0, 20),
    keywords: uniq(toList(p.keywords).map(lc)).slice(0, 20),
    locations: uniq(toList(p.locations).map(str)).slice(0, 3),
    workType: lc(p.workType),
    employmentType: str(p.employmentType),
    seniority: lc(p.seniority),
    experienceYears: num(p.experienceYears),
  };
};

/**
 * Intent for a typed search. What the candidate wrote becomes the hard
 * constraints; the interview profile and resume sit underneath as soft context.
 */
export const buildSearchIntent = async ({ query, profile = null, resume = null }) => {
  const q = str(query);
  const parsed = await parseSearchQuery(q);
  const soft = buildSoftContext(profile, resume);

  return {
    query: q,
    // Only fall back to the interview's roles when the query names none at all
    // ("remote jobs in Pune"). Skills never fall back: a search for "java
    // developer" must not inherit React from the interview and then count React
    // postings as having answered the question.
    roles: parsed.roles.length ? parsed.roles : soft.roles,
    skills: parsed.skills,
    keywords: parsed.keywords,
    constraints: {
      locations: parsed.locations,
      workType: parsed.workType,
      employmentType: parsed.employmentType,
      seniority: parsed.seniority,
      minExperience: parsed.minExperience,
      maxExperience: parsed.maxExperience,
    },
    soft,
    source: parsed.source,
  };
};

/**
 * Intent for the recommendations list, where there is no query — everything the
 * interview said is a preference, so nothing is treated as a hard constraint.
 */
export const buildProfileIntent = (profile, resume = null) => {
  const soft = buildSoftContext(profile, resume);
  const p = profile || {};

  return {
    query: "",
    roles: soft.roles,
    skills: soft.skills.slice(0, 12),
    keywords: soft.keywords.slice(0, 12),
    constraints: {
      locations: [],
      workType: "",
      employmentType: "",
      seniority: "",
      // The interview's experience level still shapes the band, just without the
      // hard penalty a typed "5 years" would carry.
      minExperience: null,
      maxExperience: null,
    },
    soft,
    source: p.source ? `profile:${p.source}` : "profile",
  };
};

/** Terms a query search must find somewhere — used for the relevance gate. */
export const intentQueryTerms = (intent) =>
  uniq([...toList(intent.roles), ...toList(intent.skills), ...toList(intent.keywords)])
    .filter((t) => termTokens(t).length > 0);
