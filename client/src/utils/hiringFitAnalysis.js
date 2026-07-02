/**
 * hiringFitAnalysis.js
 * -------------------------------------------------------------------------
 * Turns the data already stored on a resume (+ its job) into a "Hiring
 * Decision Engine" view: role-specific, evidence-based, actionable signals
 * that help a hiring manager decide in 2-3 minutes.
 *
 * Everything here is PURE (no React, no network) and derived from data the
 * backend already produces, so it works instantly for every existing
 * candidate with no re-processing:
 *   - resumeData.skills / non_technical_skills / work_experience / raw_text
 *   - resumeData.ats_breakdown  (per-component score + reason, weighted points)
 *   - resumeData.oa / avaloqOa  (coding evaluation)
 *   - resumeData.interviewEvaluation.evaluationResults (per-question score)
 *   - jobData.skills / keyResponsibilities / preferredQualifications
 *
 * Design principle: never fabricate confident numbers out of nothing. When a
 * signal isn't present we return `hasData: false` so the UI can hide the
 * section rather than inventing content.
 * -------------------------------------------------------------------------
 */

/* ────────────────────────────── text helpers ────────────────────────────── */

const toText = (value) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(toText).join(' ');
  if (typeof value === 'object') {
    try {
      return Object.values(value).map(toText).join(' ');
    } catch {
      return '';
    }
  }
  return String(value);
};

const normalize = (s) => toText(s).toLowerCase();

// Collapse to bare alphanumerics: "Node.js" -> "nodejs", "Spring Boot" -> "springboot"
const collapse = (s) => normalize(s).replace(/[^a-z0-9]/g, '');

// Spaced, punctuation-stripped form for phrase / word-boundary matching.
const spaced = (s) => ` ${normalize(s).replace(/[^a-z0-9]+/g, ' ').trim()} `;

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
const round = (n) => Math.round(n);
const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

/**
 * Is `skill` present in `text`?  Handles multi-word skills, punctuation
 * variants (Node.js / nodejs) and avoids trivial substring false-positives
 * (e.g. "go" inside "google") by using word boundaries for short tokens.
 */
const skillFoundIn = (skill, text) => {
  const rawSkill = normalize(skill).trim();
  if (!rawSkill) return false;
  const haystackSpaced = spaced(text);
  const haystackCollapsed = collapse(text);

  // 1) whole-phrase, word-boundary match ("spring boot", "rest api")
  const phrase = rawSkill.replace(/[^a-z0-9]+/g, ' ').trim();
  if (phrase && haystackSpaced.includes(` ${phrase} `)) return true;

  // 2) collapsed match for punctuated tech names ("node.js" -> "nodejs")
  const collapsedSkill = collapse(skill);
  if (collapsedSkill.length >= 4 && haystackCollapsed.includes(collapsedSkill)) return true;

  // 3) short skills (<=3 chars like "go", "c", "ai") must match as a word
  if (collapsedSkill.length > 0 && collapsedSkill.length < 4) {
    return haystackSpaced.includes(` ${phrase} `);
  }

  return false;
};

/* ─────────────────────── resume section corpora ─────────────────────────── */

/**
 * Split the resume into labelled sections so we can report WHERE a skill was
 * found (Work Experience, Project Experience, etc.) rather than just "found".
 */
export const buildSectionCorpora = (resumeData = {}) => {
  const ai = resumeData.aiSummary || {};
  return {
    // ordered by evidential strength (strongest first)
    sections: [
      { label: 'Work Experience', text: toText(resumeData.work_experience) + ' ' + toText(resumeData.experience) + ' ' + toText(ai.technicalExperience) },
      { label: 'Project Experience', text: toText(ai.projectExperience) + ' ' + toText(ai.keyAchievements) },
      { label: 'Certifications', text: toText(resumeData.certifications) },
      { label: 'Education', text: toText(resumeData.education) + ' ' + toText(ai.education) },
      { label: 'Listed Skill', text: toText(resumeData.skills) + ' ' + toText(resumeData.non_technical_skills) },
    ],
    // catch-all so we can still say "Resume" if it only appears in raw text
    all: toText(resumeData.raw_text) + ' ' +
      toText(resumeData.skills) + ' ' +
      toText(resumeData.non_technical_skills) + ' ' +
      toText(resumeData.work_experience) + ' ' +
      toText(resumeData.education) + ' ' +
      toText(resumeData.certifications) + ' ' +
      Object.values(ai).map(toText).join(' ') + ' ' +
      toText(resumeData.about) + ' ' +
      toText(resumeData.title),
  };
};

/** Locate the strongest evidence section for a skill, or null if absent. */
export const findSkillEvidence = (skill, corpora) => {
  for (const section of corpora.sections) {
    if (skillFoundIn(skill, section.text)) return section.label;
  }
  if (skillFoundIn(skill, corpora.all)) return 'Resume';
  return null;
};

/* ───────────────────── required skills from the job ─────────────────────── */

export const getRequiredSkills = (jobData = {}) => {
  const raw = Array.isArray(jobData?.skills) ? jobData.skills : [];
  const seen = new Set();
  const out = [];
  for (const s of raw) {
    const key = collapse(s);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(String(s).trim());
  }
  return out;
};

/* ─────────────────── 1. Skill fit: strong / missing ─────────────────────── */

export const analyzeSkillFit = (resumeData = {}, jobData = {}) => {
  const required = getRequiredSkills(jobData);
  const corpora = buildSectionCorpora(resumeData);

  const strongMatches = [];
  const missingSkills = [];

  required.forEach((req) => {
    const evidence = findSkillEvidence(req, corpora);
    if (evidence) strongMatches.push({ requirement: req, evidence });
    else missingSkills.push({ requirement: req, status: 'Not Found' });
  });

  // If the job carries no explicit skills list we still surface the resume's
  // own top skills as demonstrated strengths (evidence-based, not JD-matched).
  let derivedFromResume = false;
  if (required.length === 0 && Array.isArray(resumeData.skills)) {
    derivedFromResume = true;
    resumeData.skills.slice(0, 6).forEach((s) => {
      strongMatches.push({ requirement: s, evidence: 'Listed Skill' });
    });
  }

  const matchRatio = required.length ? strongMatches.length / required.length : null;

  return {
    required,
    strongMatches,
    missingSkills,
    matchRatio,               // null when job has no skills list
    hasJobSkills: required.length > 0,
    derivedFromResume,
  };
};

/* ─────────────────────── 2. Hiring risk analysis ────────────────────────── */

const listPhrase = (items, max = 3) => {
  const arr = items.slice(0, max);
  if (arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(', ')}, and ${arr[arr.length - 1]}`;
};

export const analyzeHiringRisk = (resumeData = {}, jobData = {}, skillFit) => {
  const fit = skillFit || analyzeSkillFit(resumeData, jobData);
  const role = jobData?.jobtitle || resumeData?.title || 'this role';
  const overall = Number(resumeData.overallScore ?? resumeData.ats_score ?? 0);

  const matchedNames = fit.strongMatches.map((m) => m.requirement);
  const missingNames = fit.missingSkills.map((m) => m.requirement);

  // Blend skill-match ratio with the overall CV score.
  let level;
  const ratio = fit.matchRatio;
  if (ratio == null) {
    // No JD skills to check against — fall back to CV score bands.
    level = overall >= 78 ? 'Low' : overall >= 60 ? 'Medium' : 'High';
  } else {
    const missShare = fit.required.length ? missingNames.length / fit.required.length : 0;
    if (ratio >= 0.8 && overall >= 65) level = 'Low';
    else if (ratio >= 0.55 || (ratio >= 0.45 && overall >= 70)) level = 'Medium';
    else level = 'High';
    // A large block of missing mandatory skills escalates risk.
    if (missShare >= 0.5 && level === 'Low') level = 'Medium';
    if (missShare >= 0.7) level = 'High';
  }

  // Role-specific justification referencing real matched / missing skills.
  let justification;
  const strongPart = matchedNames.length
    ? `Candidate demonstrates strong evidence of ${listPhrase(matchedNames)}`
    : `Resume shows limited direct evidence of the core skills for ${role}`;

  if (missingNames.length && level !== 'Low') {
    justification = `${strongPart}, but lacks verifiable evidence of ${listPhrase(missingNames)} required for ${role}.`;
  } else if (missingNames.length) {
    justification = `${strongPart}. ${missingNames.length} required skill(s) (${listPhrase(missingNames)}) could not be verified from the resume and should be confirmed in interview.`;
  } else if (matchedNames.length) {
    justification = `${strongPart}, covering the mandatory skills for ${role} with no major gaps identified.`;
  } else {
    justification = `Insufficient structured skill data to assess fit for ${role}; manual review recommended.`;
  }

  return { level, justification, matchedNames, missingNames };
};

/* ───────────────── 3. Explain every score (CV strength) ─────────────────── */

// Maximum weight (in points) of each ats_breakdown component, per the backend
// ATS rubric. These double as the "weight %" shown to the hiring manager.
const ATS_COMPONENT_META = [
  { key: 'skill_match', label: 'Skill Match', max: 30 },
  { key: 'experience_relevance', label: 'Experience Relevance', max: 25 },
  { key: 'project_achievement', label: 'Project & Achievement', max: 15 },
  { key: 'consistency_check', label: 'Career Consistency', max: 15 },
  { key: 'competitive_fit', label: 'Competitive Fit', max: 5 },
  { key: 'interview_prediction', label: 'Behavioral Signal', max: 5 },
  { key: 'resume_quality', label: 'Resume Quality', max: 5 },
  { key: 'ai_generated_detection', label: 'Authenticity', max: 5 },
];

const AI_SCORECARD_META = [
  { key: 'technicalSkillMatch', label: 'Technical Skill Match', weight: 40 },
  { key: 'competitiveFit', label: 'Competitive Fit', weight: 25 },
  { key: 'consistencyCheck', label: 'Career Consistency', weight: 20 },
  { key: 'teamLeadership', label: 'Team Leadership', weight: 15 },
];

export const getScoreBreakdown = (resumeData = {}) => {
  const breakdown = resumeData.ats_breakdown;
  const total = round(Number(resumeData.overallScore ?? resumeData.ats_score ?? 0));

  // Preferred source: ats_breakdown (has per-component reasons = evidence).
  if (breakdown && typeof breakdown === 'object') {
    const components = ATS_COMPONENT_META
      .filter((m) => breakdown[m.key] && typeof breakdown[m.key].score === 'number')
      .map((m) => {
        const points = Number(breakdown[m.key].score);
        return {
          key: m.key,
          label: m.label,
          weight: m.max,                                  // shown as "weight %"
          points,                                         // points earned (of max)
          max: m.max,
          score: clamp(round((points / m.max) * 100)),    // normalised 0-100
          reason: breakdown[m.key].reason || '',
        };
      });
    if (components.length) {
      return { hasData: true, source: 'ats', total, components, headline: resumeData.ats_reason || '' };
    }
  }

  // Fallback: aiScorecard (0-100 numbers, no reasons).
  const sc = resumeData.aiScorecard;
  if (sc && typeof sc === 'object') {
    const components = AI_SCORECARD_META
      .filter((m) => typeof sc[m.key] === 'number')
      .map((m) => ({
        key: m.key,
        label: m.label,
        weight: m.weight,
        score: clamp(round(sc[m.key])),
        reason: '',
      }));
    if (components.length) {
      const weighted = round(
        components.reduce((a, c) => a + c.score * c.weight, 0) /
        components.reduce((a, c) => a + c.weight, 0)
      );
      return { hasData: true, source: 'aiScorecard', total: total || weighted, components, headline: '' };
    }
  }

  return { hasData: false, source: null, total, components: [] };
};

/* ──────────────── 4. Coding assessment competency breakdown ─────────────── */

const TOPIC_RULES = [
  { label: 'Data Structures', kws: ['array', 'string', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash', 'hashmap', 'heap', 'matrix', 'set', 'map', 'trie'] },
  { label: 'Algorithms', kws: ['sort', 'search', 'binary search', 'dynamic programming', 'recursion', 'greedy', 'backtrack', 'traverse', 'dfs', 'bfs', 'sliding window', 'two pointer', 'optimi', 'complexity'] },
  { label: 'Database Concepts', kws: ['sql', 'query', 'join', 'database', 'schema', 'index', 'table', 'select ', 'aggregate'] },
  { label: 'API Understanding', kws: ['api', 'endpoint', 'rest', 'http', 'request', 'response', 'json', 'fetch', 'service'] },
  { label: 'Debugging', kws: ['debug', 'bug', 'fix the', 'error', 'trace'] },
];

const detectTopics = (questionsText) => {
  const t = normalize(questionsText);
  const found = [];
  TOPIC_RULES.forEach((rule) => {
    if (rule.kws.some((k) => t.includes(k))) found.push(rule.label);
  });
  return found;
};

// Small, signal-driven adjustment to the overall score for a given competency,
// derived from the evaluator's own complexity / improvement notes (not random).
const competencyDelta = (label, overall, notes) => {
  const n = normalize(notes);
  let d = 0;
  const posAlgo = ['optimal', 'efficient', 'o(n)', 'o(log', 'well structured', 'clean'];
  const negAlgo = ['brute force', 'inefficient', 'o(n^2)', 'o(n2)', 'suboptimal', 'improve the time', 'improve time', 'better complexity'];
  if (label === 'Algorithms') {
    if (posAlgo.some((k) => n.includes(k))) d += 5;
    if (negAlgo.some((k) => n.includes(k))) d -= 8;
  }
  if (label === 'Data Structures' && n.includes('data structure')) {
    d += n.includes('appropriate') || n.includes('correct') ? 4 : -4;
  }
  // If the improvement notes explicitly call out a topic, nudge it down.
  if (n.includes(label.toLowerCase())) d -= 3;
  return clamp(overall + d);
};

export const getCodingBreakdown = (resumeData = {}) => {
  // Prefer whichever assessment actually has an evaluation with a score.
  const candidates = [
    { data: resumeData.oa, label: 'Coding Assessment' },
    { data: resumeData.avaloqOa, label: 'Banking / SQL Assessment' },
  ].filter((c) => c.data && c.data.evaluation && typeof c.data.evaluation.score === 'number');

  if (!candidates.length) return { hasData: false };

  const { data: oa, label: assessedLabel } = candidates[0];
  const evalr = oa.evaluation || {};
  const overall = clamp(round(Number(evalr.score)));
  const questions = Array.isArray(oa.questions) ? oa.questions : [];
  const notes = `${toText(evalr.complexityAnalysis)} ${toText(evalr.improvementSuggestions)} ${toText(evalr.feedback)}`;

  // Determine which competencies were actually assessed.
  let topics;
  if (oa === resumeData.avaloqOa) {
    // Avaloq questions carry an explicit `section` -> map directly.
    const sectionMap = { sql: 'Database Concepts', banking: 'Banking Domain', debugging: 'Debugging', coding: 'Problem Solving' };
    const set = new Set();
    questions.forEach((q) => {
      const s = normalize(q.section);
      Object.keys(sectionMap).forEach((k) => { if (s.includes(k)) set.add(sectionMap[k]); });
    });
    topics = [...set];
  } else {
    const qText = questions.map((q) => `${toText(q.title)} ${toText(q.description)} ${toText(q.constraints)}`).join(' ');
    topics = detectTopics(qText);
  }

  // Problem Solving is always the headline competency for a coding test.
  const ordered = ['Problem Solving', ...topics.filter((t) => t !== 'Problem Solving')];
  const seen = new Set();
  const competencies = ordered
    .filter((t) => (seen.has(t) ? false : (seen.add(t), true)))
    .map((label) => ({
      label,
      score: label === 'Problem Solving' ? overall : competencyDelta(label, overall, notes),
    }));

  const sorted = [...competencies].sort((a, b) => b.score - a.score);
  const strengths = sorted.filter((c) => c.score >= 75).map((c) => c.label);
  const weaknesses = sorted.filter((c) => c.score < 60).map((c) => c.label);

  // Test-case info if present on submissions/evaluation (best-effort).
  const submissionCount = Array.isArray(oa.submissions) ? oa.submissions.length : 0;

  return {
    hasData: true,
    assessedLabel,
    overall,
    pass: !!evalr.pass,
    competencies,
    strengths,
    weaknesses,
    questionCount: questions.length,
    submissionCount,
    feedback: toText(evalr.feedback),
    complexityAnalysis: toText(evalr.complexityAnalysis),
    improvementSuggestions: toText(evalr.improvementSuggestions),
  };
};

/* ─────────────────── 5. AI interview evaluation ─────────────────────────── */

const CONFIDENCE_SCORE = { High: 9, Medium: 6.5, Low: 4 };

export const getInterviewEvaluation = (resumeData = {}) => {
  const evalObj = resumeData.interviewEvaluation || {};
  const results = Array.isArray(evalObj.evaluationResults) ? evalObj.evaluationResults : [];
  if (!results.length) return { hasData: false };

  const scores = results.map((r) => Number(r.score) || 0);   // each /10
  const meanScore = avg(scores);

  // Confidence: average of per-answer confidence labels, else the mean score.
  const confVals = results
    .map((r) => CONFIDENCE_SCORE[r.confidence])
    .filter((v) => typeof v === 'number');
  const confidence = confVals.length ? avg(confVals) : meanScore;

  // Consistency of scores -> "structured thinking" proxy (low spread = better).
  const spread = scores.length ? Math.max(...scores) - Math.min(...scores) : 0;
  const structured = clamp(meanScore + (spread <= 2 ? 0.5 : spread >= 5 ? -0.8 : 0), 0, 10);

  // Technical depth: mean nudged by technical vocabulary in reasons/answers.
  const techKw = ['architecture', 'algorithm', 'complexity', 'design', 'scal', 'database', 'system', 'optimi', 'trade-off', 'tradeoff', 'framework', 'api', 'security', 'performance'];
  const corpus = normalize(results.map((r) => `${toText(r.reason)} ${toText(r.summary)} ${toText(r.answer)}`).join(' '));
  const techHits = techKw.reduce((a, k) => a + (corpus.includes(k) ? 1 : 0), 0);
  const technical = clamp(meanScore + (techHits >= 4 ? 0.6 : techHits >= 2 ? 0.2 : -0.6), 0, 10);

  const clarity = clamp(meanScore + (spread <= 2 ? 0.3 : -0.3), 0, 10);

  const round1 = (n) => Math.round(n * 10) / 10;
  const communication = [
    { metric: 'Clarity', score: round1(clarity) },
    { metric: 'Confidence', score: round1(confidence) },
    { metric: 'Structured Thinking', score: round1(structured) },
    { metric: 'Technical Depth', score: round1(technical) },
  ];

  // Strongest / weakest actual responses (evidence-based).
  const byScore = results
    .map((r, i) => ({ ...r, _i: i, _score: Number(r.score) || 0 }))
    .sort((a, b) => b._score - a._score);

  const toResp = (r) => r && ({
    question: toText(r.question),
    answerSummary: toText(r.summary) || (toText(r.answer).slice(0, 240) + (toText(r.answer).length > 240 ? '…' : '')),
    why: toText(r.reason) || toText(r.summary),
    score: Number(r.score) || 0,
    confidence: r.confidence || null,
  });

  const strongest = toResp(byScore[0]);
  const weakest = byScore.length > 1 ? toResp(byScore[byScore.length - 1]) : null;

  const summaryBullets = Array.isArray(evalObj.aiInterviewSummary) ? evalObj.aiInterviewSummary : [];

  return {
    hasData: true,
    count: results.length,
    avgScore10: Math.round(meanScore * 10) / 10,
    communication,
    strongest,
    weakest,
    summaryBullets,
  };
};

/* ─────────────────── 6. Final hiring recommendation ─────────────────────── */

export const getFinalRecommendation = (resumeData = {}, jobData = {}, parts = {}) => {
  const skillFit = parts.skillFit || analyzeSkillFit(resumeData, jobData);
  const risk = parts.risk || analyzeHiringRisk(resumeData, jobData, skillFit);
  const coding = parts.coding || getCodingBreakdown(resumeData);
  const interview = parts.interview || getInterviewEvaluation(resumeData);
  const scoreBreakdown = parts.scoreBreakdown || getScoreBreakdown(resumeData);
  const role = jobData?.jobtitle || resumeData?.title || 'this role';

  // Gather available signals on a 0-100 scale with sensible weights.
  const signals = [];
  const cv = Number(scoreBreakdown.total || resumeData.overallScore || resumeData.ats_score || 0);
  if (cv > 0) signals.push({ label: 'CV Strength', value: cv, weight: 0.3 });
  if (skillFit.hasJobSkills && skillFit.matchRatio != null)
    signals.push({ label: 'Skill Match', value: round(skillFit.matchRatio * 100), weight: 0.3 });
  if (coding.hasData) signals.push({ label: 'Coding', value: coding.overall, weight: 0.2 });
  if (interview.hasData) signals.push({ label: 'Interview', value: round(interview.avgScore10 * 10), weight: 0.2 });

  const wsum = signals.reduce((a, s) => a + s.weight, 0) || 1;
  const composite = round(signals.reduce((a, s) => a + s.value * s.weight, 0) / wsum);

  // Decision matrix: composite performance × risk.
  let recommendation;
  if (composite >= 75 && risk.level === 'Low') recommendation = 'Recommended';
  else if (composite >= 62 && risk.level !== 'High') recommendation = 'Recommended with Reservations';
  else if (composite >= 72 && risk.level === 'High') recommendation = 'Recommended with Reservations';
  else recommendation = 'Not Recommended';

  // Role-specific, evidence-based reasoning.
  const matched = skillFit.strongMatches.map((m) => m.requirement);
  const missing = skillFit.missingSkills.map((m) => m.requirement);
  const bits = [];

  if (matched.length)
    bits.push(`Candidate demonstrates strong ${listPhrase(matched)} capabilities relevant to ${role}`);
  else
    bits.push(`Candidate's resume shows limited direct evidence of the core skills for ${role}`);

  const perf = [];
  if (coding.hasData) perf.push(`${coding.pass ? 'passed' : 'completed'} the coding assessment (${coding.overall}/100)`);
  if (interview.hasData) perf.push(`scored ${interview.avgScore10}/10 in the AI interview`);
  if (perf.length) bits.push(`and ${perf.join(' and ')}`);

  if (missing.length) {
    const critical = risk.level === 'High';
    bits.push(`. ${missing.length === 1 ? `Lack of ${missing[0]}` : `Missing evidence of ${listPhrase(missing)}`} is ${critical ? 'a significant gap for this role and should be closely validated' : 'noted but may be trainable; confirm in a final screen'}`);
  } else {
    bits.push('. No mandatory skill gaps were identified');
  }

  return {
    recommendation,
    reason: bits.join('') + '.',
    composite,
    signals: signals.map(({ label, value }) => ({ label, value })),
    riskLevel: risk.level,
  };
};

/* ─────────────────────────── convenience ────────────────────────────────── */

/** Build the full decision object in one call. */
export const buildHiringDecision = (resumeData = {}, jobData = {}) => {
  const skillFit = analyzeSkillFit(resumeData, jobData);
  const risk = analyzeHiringRisk(resumeData, jobData, skillFit);
  const scoreBreakdown = getScoreBreakdown(resumeData);
  const coding = getCodingBreakdown(resumeData);
  const interview = getInterviewEvaluation(resumeData);
  const recommendation = getFinalRecommendation(resumeData, jobData, {
    skillFit, risk, scoreBreakdown, coding, interview,
  });
  return { skillFit, risk, scoreBreakdown, coding, interview, recommendation };
};

export const RISK_STYLES = {
  Low: { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', dot: 'bg-green-500', label: 'Low Risk' },
  Medium: { text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-500', label: 'Medium Risk' },
  High: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', label: 'High Risk' },
};

export const RECOMMENDATION_STYLES = {
  Recommended: { text: 'text-green-800', bg: 'bg-green-50', border: 'border-green-300', dot: 'bg-green-500' },
  'Recommended with Reservations': { text: 'text-yellow-800', bg: 'bg-yellow-50', border: 'border-yellow-300', dot: 'bg-yellow-500' },
  'Not Recommended': { text: 'text-red-800', bg: 'bg-red-50', border: 'border-red-300', dot: 'bg-red-500' },
};
