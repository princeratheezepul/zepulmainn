import OpenAI from "openai";
import { Job } from "../models/job.model.js";

const openai = process.env.OPENAI_API ? new OpenAI({ apiKey: process.env.OPENAI_API }) : null;
const MODEL = "gpt-4o-mini";

// Common stop words to ignore when building a keyword profile from raw text
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "you", "your", "are", "was", "were",
  "have", "has", "had", "but", "not", "from", "they", "them", "their", "would",
  "want", "looking", "role", "job", "work", "like", "really", "just", "about",
  "into", "what", "when", "where", "which", "who", "will", "can", "could", "should",
  "more", "some", "any", "yeah", "okay", "know", "think", "kind", "going", "good",
  "great", "well", "right", "lot", "also", "able", "i'm", "i've", "it's", "zeus",
  "zepul", "interview", "candidate", "assistant", "hello", "thanks", "thank",
]);

const toArray = (v) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);
const lc = (s) => String(s || "").toLowerCase();
const uniq = (arr) => [...new Set(arr)];

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
              "You analyze a career-discovery interview transcript between an AI interviewer (Zeus) and a job seeker. Extract the candidate's job preferences. Output ONLY a valid JSON object.",
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
  const keywords = uniq(
    lc(text)
      .replace(/[^a-z0-9+#.\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOP_WORDS.has(w))
  ).slice(0, 40);

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

/**
 * Score a single job against the extracted profile. Returns { score, reasons }.
 * Score is normalized to 0-100.
 */
const scoreJob = (job, profile) => {
  const reasons = [];
  let score = 0;

  const jobTitle = lc(job.jobtitle);
  const jobSkills = toArray(job.skills).map(lc);
  const jobText = [
    jobTitle,
    lc(job.description),
    toArray(job.keyResponsibilities).map(lc).join(" "),
    toArray(job.preferredQualifications).map(lc).join(" "),
  ].join(" ");

  const desiredRoles = toArray(profile.desiredRoles).map(lc);
  const profileSkills = toArray(profile.skills).map(lc);
  const keywords = toArray(profile.keywords).map(lc);

  // 1) Role title match (strongest signal) — up to 45
  let titleHit = false;
  for (const role of desiredRoles) {
    if (!role) continue;
    if (jobTitle.includes(role) || role.includes(jobTitle)) {
      score += 45;
      reasons.push(`Title matches your target role "${job.jobtitle}"`);
      titleHit = true;
      break;
    }
    // partial: share a significant word
    const roleWords = role.split(/\s+/).filter((w) => w.length >= 4);
    if (roleWords.some((w) => jobTitle.includes(w))) {
      score += 25;
      reasons.push(`Title is related to "${job.jobtitle}"`);
      titleHit = true;
      break;
    }
  }

  // 2) Skills overlap — up to 35
  if (profileSkills.length && jobSkills.length) {
    const overlap = profileSkills.filter((s) =>
      jobSkills.some((js) => js.includes(s) || s.includes(js))
    );
    if (overlap.length) {
      const pts = Math.min(35, overlap.length * 12);
      score += pts;
      reasons.push(`Skills match: ${uniq(overlap).slice(0, 5).join(", ")}`);
    }
  }

  // 3) Skills/keywords found in the job description — up to 20
  const descTerms = uniq([...profileSkills, ...keywords]).filter(Boolean);
  if (descTerms.length) {
    const descHits = descTerms.filter((t) => t.length >= 3 && jobText.includes(t));
    if (descHits.length) {
      const pts = Math.min(20, descHits.length * 4);
      score += pts;
      if (!titleHit || score < 50) {
        reasons.push(`Relevant to: ${uniq(descHits).slice(0, 4).join(", ")}`);
      }
    }
  }

  // 4) Experience proximity — up to 10
  if (typeof profile.experienceYears === "number" && typeof job.experience === "number") {
    const diff = Math.abs(profile.experienceYears - job.experience);
    if (diff <= 1) {
      score += 10;
      reasons.push(`Experience level fits (~${job.experience} yrs)`);
    } else if (diff <= 3) {
      score += 5;
    }
  }

  // 5) Work type / location preference — up to 10
  if (profile.workType && lc(job.type) === lc(profile.workType)) {
    score += 6;
    reasons.push(`${job.type} work as you preferred`);
  }
  if (toArray(profile.locations).some((loc) => loc && lc(job.location).includes(lc(loc)))) {
    score += 4;
    reasons.push(`Located in your preferred area`);
  }

  return { score: Math.min(100, Math.round(score)), reasons: uniq(reasons).slice(0, 4) };
};

/**
 * Match the profile against all open jobs in the database.
 * Returns an array of { job, score, reasons } sorted by score desc.
 */
export const matchJobs = async (profile, { limit = 12 } = {}) => {
  const jobs = await Job.find({ isClosed: { $ne: true }, isActive: { $ne: false } })
    .sort({ createdAt: -1 })
    .limit(300)
    .lean();

  const scored = jobs
    .map((job) => {
      const { score, reasons } = scoreJob(job, profile);
      return { job, score, reasons };
    })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score);

  // If nothing scored (e.g. empty profile), fall back to most recent jobs
  const results = scored.length ? scored : jobs.slice(0, limit).map((job) => ({ job, score: 0, reasons: [] }));

  return results.slice(0, limit);
};
