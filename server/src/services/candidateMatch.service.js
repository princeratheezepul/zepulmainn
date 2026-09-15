/**
 * Matching candidates to the jobs in Zepul's own database.
 *
 * Two entry points: recommendations built from the AI interview profile, and
 * on-demand search driven by what the candidate typed. Both rank through the
 * same scorer (jobRank.service.js) so a posting is judged identically in either
 * list; they differ only in how strict the relevance gate is.
 */

import OpenAI from "openai";
import { Job } from "../models/job.model.js";
import { indexDocument, buildIdf, tokenize, FLAT_IDF } from "./jobText.util.js";
import { rankDocuments } from "./jobRank.service.js";
import { buildProfileIntent, intentQueryTerms } from "./searchIntent.service.js";

const openai = process.env.OPENAI_API ? new OpenAI({ apiKey: process.env.OPENAI_API }) : null;
const MODEL = "gpt-4o-mini";

const toArray = (v) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);
const lc = (s) => String(s || "").toLowerCase();
const uniq = (arr) => [...new Set(arr)];

// ─── Interview transcript → career profile ──────────────────────────────────

/**
 * Extract a structured career profile from the interview transcript.
 * Uses OpenAI when available; otherwise falls back to a keyword-based profile.
 */
export const analyzeTranscript = async (transcript) => {
  const text = String(transcript || "").trim();
  if (!text) {
    return {
      desiredRoles: [],
      skills: [],
      experienceYears: null,
      seniority: "",
      locations: [],
      workType: "",
      employmentType: "",
      industries: [],
      summary: "",
      keywords: [],
      source: "empty",
    };
  }

  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: MODEL,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You analyze a career-discovery interview transcript between an AI interviewer (Thea) and a job seeker. Extract the candidate's job preferences. Output ONLY a valid JSON object.",
          },
          {
            role: "user",
            content: `Transcript:\n${text.slice(0, 12000)}\n\nReturn JSON with exactly these keys:
"desiredRoles" (array of job title strings the candidate wants),
"skills" (array of concrete skills/technologies mentioned),
"experienceYears" (number or null),
"seniority" (one of: "junior","mid","senior","lead","" if unknown),
"locations" (array of preferred location strings),
"workType" (one of: "remote","hybrid","onsite","" if unknown),
"employmentType" (one of: "Full-time","Part-time","Contract","" if unknown),
"industries" (array of preferred industries/domains),
"summary" (2-3 sentence summary of what the candidate is looking for),
"keywords" (array of 10-20 important lowercase keywords for matching).
Output only raw JSON, no markdown.`,
          },
        ],
      });

      const raw = completion.choices?.[0]?.message?.content ?? "{}";
      const parsed = JSON.parse(raw);

      return {
        desiredRoles: uniq(toArray(parsed.desiredRoles).map((s) => String(s))),
        skills: uniq(toArray(parsed.skills).map((s) => String(s))),
        experienceYears:
          typeof parsed.experienceYears === "number" ? parsed.experienceYears : null,
        seniority: String(parsed.seniority || ""),
        locations: uniq(toArray(parsed.locations).map((s) => String(s))),
        workType: String(parsed.workType || ""),
        employmentType: String(parsed.employmentType || ""),
        industries: uniq(toArray(parsed.industries).map((s) => String(s))),
        summary: String(parsed.summary || ""),
        keywords: uniq(toArray(parsed.keywords).map((s) => lc(s))),
        source: "openai",
      };
    } catch (err) {
      console.error("analyzeTranscript OpenAI error, falling back to keywords:", err.message);
    }
  }

  // Fallback: derive keywords directly from the candidate's words
  const keywords = uniq(tokenize(text)).slice(0, 40);

  return {
    desiredRoles: [],
    skills: [],
    experienceYears: null,
    seniority: "",
    locations: [],
    workType: "",
    employmentType: "",
    industries: [],
    summary: "",
    keywords,
    source: "keywords",
  };
};

// ─── Job corpus ─────────────────────────────────────────────────────────────
//
// Every open posting is tokenised once and held in memory for a minute, rather
// than re-read and re-parsed on each search. That is what lets the search score
// the whole board instead of the 300 most recent rows, at a fraction of the work
// the old per-request scan cost — and the document frequencies the scorer needs
// can only be computed over the corpus as a whole.

// One minute, so a newly posted job surfaces promptly without every search
// paying to re-read and re-tokenise the board.
const CORPUS_TTL_MS = 60 * 1000;
const CORPUS_MAX = 5000;

const JOB_FIELDS =
  "jobtitle company location type employmentType experience skills description " +
  "keyResponsibilities preferredQualifications createdAt";

let corpus = { at: 0, indexes: [], idf: FLAT_IDF };
let refreshing = null;

const toJobDoc = (job) => ({
  job,
  title: job.jobtitle || "",
  company: job.company || "",
  location: job.location || "",
  type: job.type || "",
  employmentType: job.employmentType || "",
  experience: typeof job.experience === "number" ? job.experience : null,
  createdAt: job.createdAt || null,
  skills: toArray(job.skills),
  body: [
    job.description || "",
    toArray(job.keyResponsibilities).join(" "),
    toArray(job.preferredQualifications).join(" "),
  ].join(" "),
});

const refreshCorpus = async () => {
  const jobs = await Job.find({ isClosed: { $ne: true }, isActive: { $ne: false } })
    .select(JOB_FIELDS)
    .sort({ createdAt: -1 })
    .limit(CORPUS_MAX)
    .lean();

  const indexes = jobs.map((job) => indexDocument(toJobDoc(job)));
  corpus = { at: Date.now(), indexes, idf: buildIdf(indexes) };
  return corpus;
};

const loadCorpus = async () => {
  if (corpus.indexes.length && Date.now() - corpus.at < CORPUS_TTL_MS) return corpus;
  if (refreshing) return refreshing;

  refreshing = refreshCorpus()
    .catch((err) => {
      console.error("loadCorpus error:", err.message);
      // Serve the previous snapshot rather than failing the search outright.
      return corpus;
    })
    .finally(() => {
      refreshing = null;
    });

  return refreshing;
};

// ─── Ranking entry points ───────────────────────────────────────────────────

const shape = (results) =>
  results.map((r) => ({ job: r.doc.job, score: r.score, reasons: r.reasons }));

// A result has to account for this much of the query's weighted meaning to be
// shown. Below it, the posting shares only incidental words with the search.
const SEARCH_MIN_COVERAGE = 0.4;
const SEARCH_MIN_SCORE = 20;
// Recommendations are presented as "matched to you from your AI interview", so
// the bar is higher than for a search the candidate can see the wording of — a
// weak match here reads as the product being wrong about them.
const RECOMMEND_MIN_SCORE = 25;

/**
 * On-demand search. The gate is deliberately strict: an empty result is the
 * honest answer to a query nothing matches, and it beats a full page of roles
 * that merely share the word "developer" with what was typed.
 */
export const searchJobs = async (intent, { limit = 12 } = {}) => {
  const { indexes, idf } = await loadCorpus();
  if (!indexes.length) return [];

  const terms = intentQueryTerms(intent);
  const results = rankDocuments(indexes, intent, idf, {
    limit,
    minScore: SEARCH_MIN_SCORE,
    minCoverage: terms.length ? SEARCH_MIN_COVERAGE : 0,
  });

  return shape(results);
};

/**
 * Recommendations from the interview profile. Everything the interview said is a
 * preference rather than a requirement, so there is no coverage gate — but a
 * posting still has to clear a floor before it is presented as "matched to you".
 */
export const recommendJobs = async (profile, { limit = 12, resume = null } = {}) => {
  const { indexes, idf } = await loadCorpus();
  if (!indexes.length) return [];

  const intent = buildProfileIntent(profile, resume);
  const results = rankDocuments(indexes, intent, idf, {
    limit,
    minScore: RECOMMEND_MIN_SCORE,
    minCoverage: 0,
  });

  if (results.length) return shape(results);

  // Nothing cleared the floor (an empty or unusable profile). Show the newest
  // openings so the dashboard is not blank, with no score claimed for them.
  return indexes.slice(0, limit).map((idx) => ({ job: idx.doc.job, score: 0, reasons: [] }));
};
