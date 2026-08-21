import crypto from "crypto";
import OpenAI from "openai";

const openai = process.env.OPENAI_API ? new OpenAI({ apiKey: process.env.OPENAI_API }) : null;

// The web_search tool needs a model that supports it on the Responses API.
const MODEL = process.env.OPENAI_WEB_SEARCH_MODEL || "gpt-4o";

const toArray = (v) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);
const str = (v) => String(v ?? "").trim();

// Job boards that host live postings. Aggregator/spam domains are excluded so
// candidates land on a real application page rather than a scraped copy.
const ALLOWED_HOSTS = [
  "linkedin.com", "indeed.com", "naukri.com", "glassdoor.com", "glassdoor.co.in",
  "wellfound.com", "angel.co", "monster.com", "monsterindia.com", "shine.com",
  "instahyre.com", "cutshort.io", "hirist.tech", "hirist.com", "foundit.in",
  "ziprecruiter.com", "dice.com", "greenhouse.io", "lever.co", "ashbyhq.com",
  "workable.com", "smartrecruiters.com", "jobvite.com", "icims.com", "myworkdayjobs.com",
  "workday.com", "successfactors.com", "taleo.net", "bamboohr.com", "recruitee.com",
  "teamtailor.com", "breezy.hr", "personio.de", "join.com", "remoteok.com",
  "weworkremotely.com", "remote.co", "himalayas.app", "otta.com", "builtin.com",
  "simplyhired.com", "careers.google.com", "jobs.apple.com", "amazon.jobs",
];

// Scrapers that republish other boards' listings, and university career portals
// that sit behind a student login — a candidate can't actually apply on either.
const DENIED_HOSTS = [
  "bebee.com", "jooble.org", "neuvoo.com", "trabajo.org", "jobrapido.com",
  "careerjet.com", "jobisjob.com", "adzuna.com", "whatjobs.com", "learn4good.com",
  "jobsora.com", "jobted.com", "smartjobboard.com", "recruit.net", "joblum.com",
];

const isBlockedHost = (host) =>
  DENIED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`)) ||
  // .edu / .ac.uk / .edu.in career portals are student-gated
  /(^|\.)(edu|ac)(\.[a-z]{2,3})?$/.test(host) ||
  /(^|\.)ac\.[a-z]{2,3}$/.test(host);

const isUsableJobUrl = (raw) => {
  const value = str(raw);
  if (!value) return false;
  let url;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;

  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  if (isBlockedHost(host)) return false;

  // Always allow a company's own careers page (careers.acme.com, acme.com/careers/…)
  const looksLikeCareersPage =
    /(^|\.)(careers|jobs|job|apply|hiring|recruiting)\./.test(host) ||
    /\/(careers|jobs|job|opportunities|openings|vacancies)(\/|$|\?)/i.test(url.pathname);

  const onKnownBoard = ALLOWED_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));

  return onKnownBoard || looksLikeCareersPage;
};

// A long result set can be cut off mid-object by the output token cap. Rather
// than lose every job in the batch, walk the array and keep the elements that
// did close, ignoring braces that appear inside strings.
const salvageTruncatedArray = (text) => {
  const start = text.indexOf("[");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;
  let lastComplete = -1;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escaped) { escaped = false; continue; }
    if (ch === "\\") { escaped = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;

    if (ch === "[" || ch === "{") depth++;
    else if (ch === "]" || ch === "}") {
      depth--;
      // Back to array level after closing an element: that element is intact.
      if (depth === 1 && ch === "}") lastComplete = i;
    }
  }

  if (lastComplete === -1) return null;
  try {
    return JSON.parse(`${text.slice(start, lastComplete + 1)}]`);
  } catch {
    return null;
  }
};

// The model sometimes wraps JSON in ```json fences or adds a sentence around it.
const extractJson = (text) => {
  const raw = str(text);
  if (!raw) return null;

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : raw;

  try {
    return JSON.parse(candidate);
  } catch {
    // Fall back to the outermost {...} or [...] block in the response
    const start = candidate.search(/[[{]/);
    const end = Math.max(candidate.lastIndexOf("]"), candidate.lastIndexOf("}"));
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(candidate.slice(start, end + 1));
    } catch {
      return salvageTruncatedArray(candidate);
    }
  }
};

// Build the natural-language search brief the web-search tool works from.
const buildSearchBrief = (profile = {}, extraQuery = "") => {
  const roles = toArray(profile.desiredRoles).map(str).filter(Boolean);
  const skills = toArray(profile.skills).map(str).filter(Boolean).slice(0, 12);
  const locations = toArray(profile.locations).map(str).filter(Boolean);
  const industries = toArray(profile.industries).map(str).filter(Boolean).slice(0, 5);

  const lines = [];
  if (roles.length) lines.push(`Target roles: ${roles.join(", ")}`);
  if (skills.length) lines.push(`Skills: ${skills.join(", ")}`);
  if (typeof profile.experienceYears === "number") {
    lines.push(`Experience: ~${profile.experienceYears} years`);
  }
  if (profile.seniority) lines.push(`Seniority: ${profile.seniority}`);
  if (locations.length) lines.push(`Preferred locations: ${locations.join(", ")}`);
  if (profile.workType) lines.push(`Work type: ${profile.workType}`);
  if (profile.employmentType) lines.push(`Employment type: ${profile.employmentType}`);
  if (industries.length) lines.push(`Industries: ${industries.join(", ")}`);
  if (profile.summary) lines.push(`What they want: ${str(profile.summary)}`);
  if (extraQuery) lines.push(`Additional request from the candidate: ${str(extraQuery)}`);

  if (!lines.length && toArray(profile.keywords).length) {
    lines.push(`Keywords: ${toArray(profile.keywords).slice(0, 20).join(", ")}`);
  }

  return lines.join("\n");
};

// Boards label internships inconsistently — sometimes only in the title, sometimes
// only in the employment type. Treat either as a match.
const INTERNSHIP_RE = /\b(intern|internship|interns|trainee|traineeship|apprentice|apprenticeship|co-?op|summer\s+analyst|graduate\s+intern|articleship)\b/i;

const detectInternship = (jobtitle, employmentType, description) =>
  INTERNSHIP_RE.test(employmentType) ||
  INTERNSHIP_RE.test(jobtitle) ||
  INTERNSHIP_RE.test(description);

const normalizeJob = (item) => {
  const url = str(item?.url || item?.applyUrl || item?.link);
  if (!isUsableJobUrl(url)) return null;

  const jobtitle = str(item?.jobtitle || item?.title || item?.role);
  if (!jobtitle) return null;

  const score = Number(item?.matchScore);
  const description = str(item?.description || item?.summary);
  const rawEmploymentType = str(item?.employmentType);

  // Description is a weak signal on its own ("...intern with the design team"),
  // so it only counts when the title or type doesn't already settle it.
  const isInternship =
    detectInternship(jobtitle, rawEmploymentType, "") ||
    (!rawEmploymentType && detectInternship("", "", description));

  return {
    // Hash the full URL: results are merged from two searches, so a positional id
    // would collide, and a truncated encoding collides across same-domain URLs.
    _id: `web-${crypto.createHash("sha1").update(url).digest("hex").slice(0, 16)}`,
    source: "web",
    sourceName: str(item?.source || item?.board) || (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return "web";
      }
    })(),
    url,
    jobtitle,
    company: str(item?.company),
    location: str(item?.location),
    type: str(item?.type),
    // Surface a consistent label even when the board left the field blank.
    employmentType: rawEmploymentType || (isInternship ? "Internship" : ""),
    isInternship,
    salary: str(item?.salary),
    postedAt: str(item?.postedAt || item?.posted),
    description,
    matchScore: Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0,
    matchReasons: toArray(item?.matchReasons || item?.reasons).map(str).filter(Boolean).slice(0, 4),
  };
};

export const isWebJobSearchConfigured = () => Boolean(openai);

// One web-search pass, scoped to either regular openings or internships. A single
// blended prompt reliably under-delivers on internships (job boards are dominated
// by full-time roles), so each category gets its own search budget.
const runSearch = async ({ brief, count, internshipsOnly, exclude = [], broaden = false }) => {
  const kindLine = internshipsOnly
    ? `Find ONLY internships, trainee, apprenticeship, co-op or graduate-intern openings in this candidate's field and skill area. Include them even when the candidate is experienced. Run internship-specific searches (e.g. "<role> internship <location>", "<skill> intern hiring").`
    : `Find ONLY regular openings — full-time, part-time or contract roles. Do NOT include internships, trainee or apprenticeship postings.`;

  const typeRule = internshipsOnly
    ? `- Set employmentType to exactly "Internship" for every entry.`
    : `- Never set employmentType to "Internship"; skip any internship posting you come across.`;

  const excludeBlock = exclude.length
    ? `\n\nAlready collected — do NOT return these URLs again:\n${exclude.slice(0, 15).join("\n")}`
    : "";

  // Only sent on a top-up pass, when the first search came back short.
  const broadenBlock = broaden
    ? `\n\nThe earlier search came up short, so widen it aggressively: other cities and "remote — anywhere", adjacent job titles, smaller and lesser-known companies, and ${
        internshipsOnly
          ? `dedicated internship boards (Internshala, Unstop, LetsIntern, Wellfound, Weekday, LinkedIn internship filter)`
          : `additional job boards you have not searched yet`
      }. Returning ${count} results matters more than a perfect fit here.`
    : "";

  const response = await openai.responses.create({
    model: MODEL,
    tools: [{ type: "web_search_preview", search_context_size: "medium" }],
    tool_choice: { type: "web_search_preview" },
    // A dozen postings with descriptions runs past the default cap and the JSON
    // gets cut mid-object; this leaves comfortable headroom.
    max_output_tokens: 8000,
    input: [
      {
        role: "system",
        content:
          "You are a job-sourcing assistant. Use web search to find REAL, currently open postings " +
          "that match the candidate brief. Only report postings you actually found in search results — " +
          "never invent a company, a title, or a URL. Every url must be a direct link to the posting " +
          "or its application page on a job board (LinkedIn, Indeed, Naukri, Wellfound, Internshala, " +
          "Greenhouse, Lever, Workday, Ashby, etc.) or the employer's own careers site. " +
          "Never use university or college career portals (.edu / .ac sites) or scraper aggregator " +
          "sites — the candidate must be able to apply without a student login. Respond with raw JSON only.",
      },
      {
        role: "user",
        content: `Candidate brief:\n${brief}\n\n${kindLine}\n\nReturn ${count} distinct postings if you can find that many. Prefer recent postings and respect the location / work-type preferences where given; widen the location or seniority before returning fewer than ${count} results.\n\nReturn ONLY a JSON object of this exact shape:\n{"jobs":[{"jobtitle":"string","company":"string","location":"string","type":"remote|hybrid|onsite|\\"\\"","employmentType":"Full-time|Part-time|Contract|Internship|\\"\\"","salary":"string or empty","postedAt":"string or empty","description":"1-2 sentence summary of the role","url":"direct link to the posting","source":"the job board or company site name","matchScore":0-100,"matchReasons":["short reason","short reason"]}]}\n\nRules:\n- One entry per distinct posting; no duplicate URLs or duplicate company+title pairs.\n- Omit any posting whose real URL you could not find.\n${typeRule}\n- matchScore reflects fit with the brief.\n- No markdown, no commentary, JSON only.${excludeBlock}${broadenBlock}`,
      },
    ],
  });

  const raw = str(response?.output_text);
  const parsed = extractJson(raw);
  const items = Array.isArray(parsed) ? parsed : toArray(parsed?.jobs);
  const label = internshipsOnly ? "internships" : "jobs";

  // Both failure modes below return an empty list rather than throwing, so
  // without these logs a pass that silently yields nothing is invisible.
  if (!items.length) {
    console.warn(
      `searchWebJobs: ${label} pass produced no parseable items (${raw.length} chars of output): ${raw.slice(0, 200)}`
    );
    return [];
  }

  const normalized = items.map(normalizeJob).filter(Boolean);
  if (!normalized.length) {
    console.warn(`searchWebJobs: ${label} pass — all ${items.length} items dropped (unusable URL or missing title)`);
  }
  return normalized;
};

const byScore = (a, b) => b.matchScore - a.matchScore;

// Drop repeats by URL and by company+title, keeping the highest-scoring copy.
const dedupe = (jobs) => {
  const seenUrls = new Set();
  const seenRoles = new Set();
  const out = [];

  for (const job of [...jobs].sort(byScore)) {
    const urlKey = job.url.toLowerCase();
    const roleKey = `${job.company.toLowerCase()}|${job.jobtitle.toLowerCase()}`;
    if (seenUrls.has(urlKey) || (job.company && seenRoles.has(roleKey))) continue;
    seenUrls.add(urlKey);
    seenRoles.add(roleKey);
    out.push(job);
  }
  return out;
};

/**
 * Search the live web for postings that fit the candidate's profile, returning a
 * guaranteed mix of regular jobs and internships. Uses the OpenAI Responses API
 * with the built-in web search tool.
 *
 * Never throws — returns [] on any failure so the DB results still render.
 */
export const searchWebJobs = async (
  profile,
  { jobsLimit = 5, internshipsLimit = 5, query = "" } = {}
) => {
  if (!openai) {
    console.warn("searchWebJobs: OPENAI_API is not set — skipping web job search");
    return [];
  }

  const brief = buildSearchBrief(profile, query);
  if (!brief.trim()) return [];

  const jobsTarget = Math.max(0, Math.min(10, jobsLimit));
  const internshipsTarget = Math.max(0, Math.min(10, internshipsLimit));
  if (!jobsTarget && !internshipsTarget) return [];

  // Ask for a couple extra per category — some get dropped for unusable URLs or
  // as duplicates, and the buffer keeps us at target after that filtering.
  const BUFFER = 3;

  // Run both passes concurrently; one failing must not sink the other.
  const [jobsResult, internshipsResult] = await Promise.allSettled([
    jobsTarget
      ? runSearch({ brief, count: jobsTarget + BUFFER, internshipsOnly: false })
      : Promise.resolve([]),
    internshipsTarget
      ? runSearch({ brief, count: internshipsTarget + BUFFER, internshipsOnly: true })
      : Promise.resolve([]),
  ]);

  if (jobsResult.status === "rejected") {
    console.error("searchWebJobs (jobs) error:", jobsResult.reason?.message || jobsResult.reason);
  }
  if (internshipsResult.status === "rejected") {
    console.error(
      "searchWebJobs (internships) error:",
      internshipsResult.reason?.message || internshipsResult.reason
    );
  }

  let pool = dedupe([
    ...(jobsResult.status === "fulfilled" ? jobsResult.value : []),
    ...(internshipsResult.status === "fulfilled" ? internshipsResult.value : []),
  ]);

  // Classify off the detected flag rather than which search produced it — either
  // pass can leak the other category despite the prompt.
  const pick = (all) => ({
    jobs: all.filter((j) => !j.isInternship).slice(0, jobsTarget),
    internships: all.filter((j) => j.isInternship).slice(0, internshipsTarget),
  });

  let { jobs, internships } = pick(pool);

  // A single pass often under-delivers on internships. Run one broadened top-up
  // for whichever category came up short — capped at one extra round so cost and
  // latency stay bounded.
  const shortfalls = [];
  if (jobs.length < jobsTarget) {
    shortfalls.push({ internshipsOnly: false, need: jobsTarget - jobs.length });
  }
  if (internships.length < internshipsTarget) {
    shortfalls.push({ internshipsOnly: true, need: internshipsTarget - internships.length });
  }

  if (shortfalls.length) {
    const exclude = pool.map((j) => j.url);
    const topUps = await Promise.allSettled(
      shortfalls.map((sf) =>
        runSearch({
          brief,
          count: sf.need + BUFFER,
          internshipsOnly: sf.internshipsOnly,
          exclude,
          broaden: true,
        })
      )
    );

    const extra = topUps.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
    topUps
      .filter((r) => r.status === "rejected")
      .forEach((r) => console.error("searchWebJobs top-up error:", r.reason?.message || r.reason));

    if (extra.length) {
      pool = dedupe([...pool, ...extra]);
      ({ jobs, internships } = pick(pool));
    }
  }

  if (jobs.length < jobsTarget || internships.length < internshipsTarget) {
    console.warn(
      `searchWebJobs: returning ${jobs.length}/${jobsTarget} jobs and ${internships.length}/${internshipsTarget} internships`
    );
  }

  // Jobs first, then internships — each already sorted by score via dedupe().
  return [...jobs, ...internships];
};
