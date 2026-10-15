// Zeus job intake: shared helpers for the chat and voice agents and for every
// stage that reads the intake brief stored on a Job.

// Clamp the Zeus intake brief to the model's enums and ranges so a bad AI
// extraction can't fail job creation. Returns null when nothing usable arrived.
export const sanitizeIntake = (raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const str = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
    const list = (v, max = 20) => (Array.isArray(v) ? v.map((x) => str(String(x), 120)).filter(Boolean).slice(0, max) : []);
    const num = (v, lo, hi, fallback = null) => {
        if (v === null || v === undefined || v === '') return fallback;
        const n = Number(v);
        return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : fallback;
    };
    const oneOf = (v, opts, fallback) => (opts.includes(v) ? v : fallback);
    const date = (v) => {
        const d = v ? new Date(v) : null;
        return d && !Number.isNaN(d.getTime()) ? d : null;
    };
    const bool = (v, fallback = false) => (typeof v === 'boolean' ? v : fallback);
    const wm = raw.workModel || {};
    const ctc = raw.ctc || {};
    const wa = raw.workAuth || {};
    const ct = raw.codingTest || {};
    const iv = raw.interview || {};
    const cd = raw.conditional || {};
    const dom = raw.domain || {};
    const prov = {};
    if (raw.provenance && typeof raw.provenance === 'object') {
        for (const [k, v] of Object.entries(raw.provenance)) {
            if (['employer', 'extracted', 'default'].includes(v)) prov[String(k).slice(0, 60)] = v;
        }
    }
    return {
        seniority: oneOf(raw.seniority, ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director'], null),
        experienceMax: num(raw.experienceMax, 0, 60),
        niceToHaveSkills: list(raw.niceToHaveSkills, 10),
        successAt12m: list(raw.successAt12m, 3),
        domain: { level: oneOf(dom.level, ['Required', 'Preferred', 'Not needed'], 'Not needed'), tags: list(dom.tags, 10) },
        workModel: { hybridDays: num(wm.hybridDays, 1, 5), radiusKm: num(wm.radiusKm, 0, 1000, 40), relocation: bool(wm.relocation) },
        ctc: { currency: str(ctc.currency, 8) || null, stretch: num(ctc.stretch, 0, 1e12), variablePct: num(ctc.variablePct, 0, 100) },
        noticeMaxDays: num(raw.noticeMaxDays, 0, 180, 60),
        latestJoiningDate: date(raw.latestJoiningDate),
        workAuth: { sponsorship: bool(wa.sponsorship), authorisedIn: list(wa.authorisedIn, 20) },
        contractMonths: num(raw.contractMonths, 1, 60),
        shortlistSize: num(raw.shortlistSize, 1, 20, 5),
        shortlistDue: date(raw.shortlistDue),
        codingTest: {
            required: bool(ct.required),
            stack: list(ct.stack, 10),
            difficulty: oneOf(ct.difficulty, ['Easy', 'Medium', 'Hard'], 'Medium'),
            durationMin: num(ct.durationMin, 20, 120, 45),
            cutoff: num(ct.cutoff, 0, 100, 70),
        },
        interview: { focus: list(iv.focus, 5), mustAsk: list(iv.mustAsk, 5), dealBreakers: str(iv.dealBreakers, 500) },
        conditional: {
            confidential: bool(cd.confidential),
            targetCompanies: list(cd.targetCompanies),
            excludedCompanies: list(cd.excludedCompanies),
            certifications: list(cd.certifications),
            languages: list(cd.languages),
            conditions: str(cd.conditions, 500),
            timezoneOverlapHours: num(cd.timezoneOverlapHours, 0, 8),
            timezone: str(cd.timezone, 60),
            reportingTo: str(cd.reportingTo, 120),
            teamSize: num(cd.teamSize, 0, 100000),
            whyJoin: str(cd.whyJoin, 300),
        },
        provenance: prov,
    };
};


export const INTAKE_EXTRACTION_PROMPT = `Extract the job posting details into a valid JSON object with exactly these keys:
"jobtitle" (string), "description" (string, a full job description drafted from every field captured: responsibilities, success at 6-12 months, must-have and nice-to-have skills, domain, notice period, work authorisation, coding test and interview focus, and why join; never include protected attributes), "location" (string), "type" (must be exactly one of: remote, onsite, hybrid), "employmentType" (string: Full-time or Part-time or Contract; use Contract for contract-to-hire), "salary" (object with min and max as numbers), "skills" (array of strings, must-haves first then nice-to-haves), "experience" (integer, the minimum years), "keyResponsibilities" (array of strings), "preferredQualifications" (array of strings), "openpositions" (integer default 1), "cvStrengthCutoff" (integer 0-100, or null if the user did not set one), and "intake" (object) with these keys, using null / [] / false when not captured: "seniority" (Junior, Mid, Senior, Lead, Manager or Director), "experienceMax" (integer), "niceToHaveSkills" (array), "successAt12m" (array), "domain" ({level: Required|Preferred|Not needed, tags: array}), "workModel" ({hybridDays: 1-5 or null, radiusKm: number, relocation: boolean}), "ctc" ({currency: string, stretch: number, variablePct: number}), "noticeMaxDays" (0-180), "latestJoiningDate" (YYYY-MM-DD or null), "workAuth" ({sponsorship: boolean, authorisedIn: array of countries}), "contractMonths" (integer or null), "shortlistSize" (1-20), "shortlistDue" (YYYY-MM-DD or null), "codingTest" ({required: boolean, stack: array, difficulty: Easy|Medium|Hard, durationMin: 20-120, cutoff: 0-100}), "interview" ({focus: array, mustAsk: array, dealBreakers: string}), "conditional" ({confidential: boolean, targetCompanies: array, excludedCompanies: array, certifications: array, languages: array, conditions: string, timezoneOverlapHours: 0-8 or null, timezone: string, reportingTo: string, teamSize: integer or null, whyJoin: string up to 300 chars}), "provenance" (object mapping each of the 13 field groups, e.g. "cvThreshold", "ctc", "skills", "noticeMaxDays", "shortlistSize", "codingTest", to "employer" if the manager stated it, "extracted" if inferred from their message and confirmed, or "default" if it is a default they accepted). Never include age, gender, nationality, religion, marital status, disability or photos.
Output ONLY raw JSON. No markdown, no code fences, no extra text.`;

/**
 * Consistency rules from the spec. `errors` are impossible values that block
 * job creation; `warnings` are advice the caller can surface.
 */
export const intakeProblems = ({ experience, salary, cvStrengthCutoff, skills, intake }) => {
  const errors = [];
  const warnings = [];
  const expMax = intake?.experienceMax;
  if (Number.isFinite(expMax) && Number.isFinite(Number(experience)) && Number(experience) > expMax) {
    errors.push(`Minimum experience (${experience}) is above the maximum (${expMax}).`);
  }
  const min = Number(salary?.min);
  const max = Number(salary?.max);
  if (Number.isFinite(min) && Number.isFinite(max) && max > 0 && min > max) {
    errors.push(`CTC minimum (${min}) is above the maximum (${max}).`);
  }
  const stretch = intake?.ctc?.stretch;
  if (Number.isFinite(stretch) && Number.isFinite(max) && max > 0 && stretch < max) {
    errors.push(`CTC stretch ceiling (${stretch}) is below the maximum (${max}).`);
  }
  const cutoff = Number(cvStrengthCutoff);
  if (cvStrengthCutoff !== null && cvStrengthCutoff !== undefined && Number.isFinite(cutoff) && cutoff > 90) {
    warnings.push(`A CV threshold of ${cutoff} may leave fewer candidates than the shortlist size.`);
  }
  const mustHaves = Array.isArray(skills) ? skills.length - (intake?.niceToHaveSkills?.length || 0) : 0;
  if (mustHaves > 5) {
    warnings.push(`${mustHaves} must-have skills is a lot; consider moving some to nice-to-have.`);
  }
  if (intake?.codingTest?.required && intake.codingTest.stack?.length === 0) {
    warnings.push("Coding test is on but no language/stack was set.");
  }
  return { errors, warnings };
};

/** Plain-text summary of the intake brief for AI prompts. Empty when none. */
export const intakePromptContext = (job) => {
  const i = job?.intake;
  if (!i) return "";
  const must = (job.skills || []).filter((s) => !(i.niceToHaveSkills || []).includes(s));
  const lines = [
    i.seniority && `Seniority: ${i.seniority}`,
    must.length && `Must-have skills (weight highest): ${must.join(", ")}`,
    i.niceToHaveSkills?.length && `Nice-to-have skills: ${i.niceToHaveSkills.join(", ")}`,
    i.domain?.level && i.domain.level !== "Not needed" &&
      `Domain experience (${i.domain.level}): ${(i.domain.tags || []).join(", ")}`,
    job.keyResponsibilities?.length && `Responsibilities: ${job.keyResponsibilities.join("; ")}`,
    i.successAt12m?.length && `Success at 6-12 months: ${i.successAt12m.join("; ")}`,
    i.interview?.focus?.length && `Interview focus areas: ${i.interview.focus.join(", ")}`,
    i.interview?.mustAsk?.length && `Must-ask questions: ${i.interview.mustAsk.join(" | ")}`,
    i.interview?.dealBreakers && `Deal-breakers (probe these first): ${i.interview.dealBreakers}`,
    i.conditional?.languages?.length && `Languages: ${i.conditional.languages.join(", ")}`,
    i.conditional?.certifications?.length && `Certifications: ${i.conditional.certifications.join(", ")}`,
  ].filter(Boolean);
  return lines.join("\n");
};

const stripFences = (s) =>
  String(s || "").replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

/**
 * Turn a voice-intake transcript into Job fields (same shape the chat agent
 * produces). Returns null when the transcript has no usable role.
 */
export const extractJobFromTranscript = async (openai, transcript, model = "gpt-4o-mini") => {
  if (!openai || !transcript || String(transcript).trim().length < 40) return null;
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: "You turn a recorded job-intake conversation between Zeus (an AI hiring assistant) and an employer into structured data. Only use facts the employer stated or confirmed." },
      { role: "user", content: `TRANSCRIPT:\n${String(transcript).slice(0, 30000)}\n\n${INTAKE_EXTRACTION_PROMPT}` },
    ],
    response_format: { type: "json_object" },
  });
  const data = JSON.parse(stripFences(completion.choices?.[0]?.message?.content));
  if (!data?.jobtitle || String(data.jobtitle).trim().length < 2) return null;
  const types = ["remote", "onsite", "hybrid"];
  const intake = sanitizeIntake(data.intake);
  const cutoff = Number(data.cvStrengthCutoff);
  return {
    jobtitle: String(data.jobtitle).slice(0, 200),
    description: String(data.description || ""),
    location: String(data.location || ""),
    type: types.includes(String(data.type).toLowerCase()) ? String(data.type).toLowerCase() : "onsite",
    employmentType: ["Full-time", "Part-time", "Contract"].includes(data.employmentType) ? data.employmentType : "Full-time",
    salary: { min: Number(data.salary?.min) || 0, max: Number(data.salary?.max) || 0 },
    skills: Array.isArray(data.skills) ? data.skills.map(String) : [],
    experience: Number(data.experience) || 0,
    cvStrengthCutoff: data.cvStrengthCutoff != null && Number.isFinite(cutoff) ? cutoff : null,
    keyResponsibilities: Array.isArray(data.keyResponsibilities) ? data.keyResponsibilities.map(String) : [],
    preferredQualifications: Array.isArray(data.preferredQualifications) ? data.preferredQualifications.map(String) : [],
    openpositions: Number(data.openpositions) || 1,
    intake,
  };
};
