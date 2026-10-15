/**
 * DataVertex candidate sourcing (https://docs.data-vertex.com/).
 *
 * Used behind "Upload Resume from ZepDB": sourced candidates are saved as
 * ResumeData, so everything after sourcing is the normal ZepDB flow.
 *
 * Credits: a JD search is 2 credits for a whole page (up to 100 profiles); a
 * detailed-profile lookup is 1 credit per profile. Lookups are what cost money,
 * so the search page is ranked by title first and only the best few profiles
 * are looked up (VERTEX_LOOKUP_BUDGET), never the whole page.
 */

const BASE_URL = "https://api.data-vertex.com/v1";

// Candidates handed back per search.
export const VERTEX_SOURCE_LIMIT = Number(process.env.VERTEX_SOURCE_LIMIT) || 2;
// Profiles looked up (1 credit each) to pick those candidates from: the limit
// plus a couple of spares in case some look worse once their full profile is in.
export const VERTEX_LOOKUP_BUDGET = Number(process.env.VERTEX_LOOKUP_BUDGET) || VERTEX_SOURCE_LIMIT + 2;
// Search page size: a page costs the same however many profiles it holds.
const SEARCH_PAGE_SIZE = 100;
// Minimum local relevance (0-100) a candidate needs against the JD to be preferred.
export const VERTEX_MIN_RELEVANCE = Number(process.env.VERTEX_MIN_RELEVANCE) || 40;
// JD search costs 2 credits instead of 1 when it returns results.
export const SEARCH_CREDITS = 2;
export const LOOKUP_CREDITS = 1;

export const maxSourcingCredits = () => SEARCH_CREDITS + VERTEX_LOOKUP_BUDGET * LOOKUP_CREDITS;

const call = async (path, { method = "GET", body } = {}) => {
    const apiKey = process.env.VERTEX_API_KEY || process.env.DATAVERTEX_API_KEY;
    if (!apiKey) throw new Error("Candidate sourcing is not configured.");

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
        const err = new Error(data.message || `Sourcing request failed (${res.status})`);
        err.status = res.status;
        throw err;
    }
    return data;
};

export const getCreditsRemaining = async () => {
    const data = await call("/account");
    return data.credits_remaining;
};

/**
 * Search by job description (`jd_search`): DataVertex parses titles, location,
 * experience, major and industry out of the JD and merges them with `criteria`.
 * Falls back to plain structured criteria when no JD text is given.
 */
export const searchProfiles = async (criteria, jdText) => {
    const body = { search_criteria: criteria, page_size: SEARCH_PAGE_SIZE, start: 1, include_similar_titles: true };
    if (jdText) body.jd_search = jdText;
    const data = await call("/search", { method: "POST", body });
    return { profiles: data.data?.profiles || [], creditsUsed: data.credits?.used || 0 };
};

export const lookupProfile = async (profile) => {
    const identifier = profile.linkedin_url ? { linkedin_url: profile.linkedin_url } : { candidate_id: String(profile.id) };
    const data = await call("/lookup", {
        method: "POST",
        body: { ...identifier, reveal_detailed_person_enrichment: true },
    });
    const contact = data.data?.contacts?.[0];
    return {
        profile: contact?.success ? contact.profile : null,
        creditsUsed: data.credits?.used || 0,
    };
};

const text = (v) => (typeof v === "string" ? v.trim() : "");
const first = (...vals) => vals.map(text).find(Boolean) || "";

const yearOf = (value) => {
    const m = typeof value === "string" || typeof value === "number" ? String(value).match(/\b(19|20)\d{2}\b/) : null;
    return m ? Number(m[0]) : null;
};

// The lookup payload doesn't document the shape of experience entries, so read
// the common spellings of each field.
const mapExperience = (entries) =>
    (entries || []).map((e) => {
        const start = first(e.start_date, e.starts_at, e.start, e.from);
        const end = first(e.end_date, e.ends_at, e.end, e.to);
        return {
            title: first(e.title, e.job_title, e.position, e.role),
            company: first(e.company, e.company_name, e.employer, e.organization),
            duration: first(e.duration) || (start ? `${start} - ${end || "Present"}` : ""),
            points: [first(e.description, e.summary)].filter(Boolean),
        };
    });

const experienceYears = (entries) => {
    const starts = (entries || [])
        .map((e) => yearOf(e.start_date ?? e.starts_at ?? e.start ?? e.from))
        .filter(Boolean);
    return starts.length ? Math.max(0, new Date().getFullYear() - Math.min(...starts)) : 0;
};

/** A ResumeData document body for a looked-up profile. */
export const profileToResumeData = (profile, searchHit) => {
    const history = profile.experience?.length ? profile.experience : profile.job_history;
    const skills = (profile.skills || []).map((s) => (typeof s === "string" ? s : first(s?.name, s?.skill))).filter(Boolean);
    const experience = mapExperience(history);
    const education = (profile.education || []).map((e) => ({
        institution: first(e.school, e.school_name, e.institution),
        degree: first(e.degree, e.degree_name, e.field_of_study),
        points: [],
    }));

    return {
        name: first(profile.name, searchHit?.name),
        role: first(profile.current_title, searchHit?.current_title, profile.headline),
        experienceYears: experienceYears(history),
        experience,
        education,
        skills: { points: skills },
        searchableSkills: skills.map((s) => s.toLowerCase()),
        searchableText: [profile.headline, profile.summary, profile.candidate_location, ...skills].filter(Boolean).join(" "),
        achievements: { points: [] },
        projects: [],
        linkedinUrl: first(profile.linkedin_url, searchHit?.linkedin_url),
        source: "vertex",
    };
};

// Job locations are free text ("Remote - Hyderabad", "Pune / Hybrid"); the
// search only matches real places, so keep the place names and drop the work-mode words.
const WORK_MODE = /\b(remote|hybrid|on-?site|work from home|wfh|anywhere|pan india|flexible)\b/gi;

export const placesFromLocation = (location) =>
    text(location)
        .replace(WORK_MODE, " ")
        .split(/[-,/|()&+]/)
        .map((p) => p.trim())
        .filter(Boolean);

// Job skills are sometimes saved as whole sentences from the JD rather than tags,
// which can never match a profile. Keep real tags and pull known tech terms out of the prose.
const TECH_TERMS = ["python", "java", "spring boot", "spring", "javascript", "typescript", "react", "angular", "vue", "node.js", "node", "express",
    "django", "flask", "fastapi", "golang", "go", "rust", "c++", "c#", ".net", "php", "laravel", "ruby", "rails", "kotlin", "swift", "scala",
    "html", "css", "sql", "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch", "kafka", "rabbitmq", "graphql", "rest",
    "restful apis", "microservices", "docker", "kubernetes", "aws", "azure", "gcp", "snowflake", "terraform", "jenkins", "ci/cd", "git",
    "github", "jira", "agile", "linux", "spark", "hadoop", "airflow", "tensorflow", "pytorch", "pandas", "next.js", "redux", "flutter"];

export const effectiveSkills = (job) => {
    const tags = [];
    const prose = [];
    for (const s of job.skills || []) {
        (text(s).length <= 40 && text(s).split(/\s+/).length <= 4 ? tags : prose).push(text(s));
    }
    if (tags.length >= 3) return tags;
    const src = norm([...prose, tags.join(" "), job.jobtitle, job.description].join(" "));
    const mined = TECH_TERMS.filter((t) => hasTerm(src, t) && !tags.some((x) => norm(x) === t));
    // Drop "spring" when "spring boot" is present, etc.
    const deduped = mined.filter((t) => !mined.some((o) => o !== t && o.includes(t) && o.split(" ").length > t.split(" ").length));
    return [...tags, ...deduped].slice(0, 12);
};

const JD_MAX = 8000; // API limit is 8,500 characters

/** Compact JD text for `jd_search`: the facts the parser can use, then the full description. */
export const jdTextForJob = (job) => {
    const must = effectiveSkills(job).filter((s) => !(job.intake?.niceToHaveSkills || []).includes(s));
    const exp = job.experience
        ? `${job.experience}${job.intake?.experienceMax ? `-${job.intake.experienceMax}` : "+"} years of experience`
        : "";
    const parts = [
        `Job title: ${job.jobtitle}`,
        job.location && `Location: ${placesFromLocation(job.location).join(", ")}`,
        exp && `Experience: ${exp}`,
        must.length && `Required skills: ${must.join(", ")}`,
        job.intake?.niceToHaveSkills?.length && `Nice to have: ${job.intake.niceToHaveSkills.join(", ")}`,
        job.keyResponsibilities?.length && `Responsibilities: ${job.keyResponsibilities.join("; ")}`,
        job.description,
    ].filter(Boolean);
    return parts.join("\n").slice(0, JD_MAX);
};

const norm = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9+#.\s]/g, " ").replace(/\s+/g, " ").trim();
const STOP = new Set(["senior", "junior", "lead", "sr", "jr", "and", "the", "of", "for", "developer", "engineer"]);

// Common spellings profiles use for the same skill.
const ALIASES = {
    "restful apis": ["rest api", "rest apis", "restful"], "rest apis": ["restful", "rest api"], "rest": ["restful"],
    "node.js": ["node", "nodejs"], "node": ["node.js", "nodejs"], "javascript": ["js"], "typescript": ["ts"],
    "postgresql": ["postgres"], "aws": ["amazon web services"], "gcp": ["google cloud"], "kubernetes": ["k8s"],
    "golang": ["go"], "ci cd": ["continuous integration"], "github": ["git"], "react": ["react.js", "reactjs"],
};

const hasOne = (haystack, t) =>
    !!t && ((` ${haystack} `).includes(` ${t} `) || (t.length > 3 && haystack.includes(t)));

const hasTerm = (haystack, term) => {
    const t = norm(term);
    return hasOne(haystack, t) || (ALIASES[t] || []).some((a) => hasOne(haystack, norm(a)));
};

/**
 * Local relevance (0-100) of a sourced candidate against the job. DataVertex
 * returns no match score, so this is what filters and ranks the results:
 * must-have skills 55, title fit 25, experience fit 20 (nice-to-haves add a bonus).
 * `c` is { title, skills[], text, years } (normalised from a profile or ResumeData).
 */
export const relevanceScore = (c, job) => {
    const nice = (job.intake?.niceToHaveSkills || []).map(norm);
    const must = effectiveSkills(job).map(norm).filter((s) => s && !nice.includes(s));
    const hay = norm([c.title, ...(c.skills || []), c.text].join(" "));
    const skillSet = new Set((c.skills || []).map(norm));

    const hit = (s) => skillSet.has(s) || hasTerm(hay, s);
    const mustRatio = must.length ? must.filter(hit).length / must.length : 0.6;
    const niceRatio = nice.length ? nice.filter(hit).length / nice.length : 0;

    const jobWords = norm(job.jobtitle).split(" ").filter((w) => w && !STOP.has(w));
    const candTitle = norm(c.title);
    let titleRatio = jobWords.length
        ? jobWords.filter((w) => candTitle.includes(w)).length / jobWords.length
        : 0.5;
    // A title naming a required skill ("Node.js Developer" for a backend role) is a fit too.
    if (must.some((sk) => hasTerm(candTitle, sk))) titleRatio = Math.max(titleRatio, 0.8);

    const min = Number(job.experience) || 0;
    const max = Number(job.intake?.experienceMax) || min + 6;
    const y = Number(c.years) || 0;
    let expRatio = 1;
    if (c.years == null) expRatio = 0.5; // unknown (search hits carry no history)
    else if (min && y < min) expRatio = Math.max(0, 1 - (min - y) / Math.max(min, 1));
    else if (y > max) expRatio = Math.max(0.3, 1 - (y - max) / 10);

    return Math.round(Math.min(100, mustRatio * 55 + titleRatio * 25 + expRatio * 20 + niceRatio * 5));
};

/** Title-only relevance of a raw search hit, used to decide which profiles are worth a lookup. */
export const hitScore = (hit, job) =>
    relevanceScore({ title: hit.current_title || "", skills: [], text: "", years: null }, job);

/** Adapt a ResumeData document or a looked-up profile body for relevanceScore. */
export const scorable = (body) => ({
    title: body.role || "",
    skills: body.skills?.points || [],
    text: [body.searchableText, ...(body.experience || []).flatMap((e) => [e.title, ...(e.points || [])])].join(" "),
    years: body.experienceYears,
});

/** Search filters derived from a job. */
export const criteriaForJob = (job) => {
    const criteria = { current_title: [job.jobtitle] };
    const places = placesFromLocation(job.location);
    if (places.length) criteria.location = places;
    return criteria;
};
