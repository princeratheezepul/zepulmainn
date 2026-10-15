import ResumeData from "../models/resumeData.model.js";
import Resume from "../models/resume.model.js";
import { Job } from "../models/job.model.js";
import {
    VERTEX_SOURCE_LIMIT,
    VERTEX_MIN_RELEVANCE,
    VERTEX_LOOKUP_BUDGET,
    SEARCH_CREDITS,
    LOOKUP_CREDITS,
    maxSourcingCredits,
    getCreditsRemaining,
    searchProfiles,
    lookupProfile,
    profileToResumeData,
    criteriaForJob,
    jdTextForJob,
    relevanceScore,
    scorable,
    hitScore,
} from "../services/vertex.service.js";

// Candidates belong to one pool: Zepul's (null) or a single License Partner's.
// A recruiter carries the partner on their record; a manager who is itself a
// License Partner is that pool's owner.
export const poolIdFor = (req) =>
    req.role === "manager"
        ? (req.user?.isLicensePartner ? req.user._id : null)
        : (req.user?.licensePartnerId || null);

const toCandidate = (doc, existing, relevance) => ({
    id: doc._id,
    name: doc.name,
    role: doc.role || "N/A",
    experienceYears: doc.experienceYears || 0,
    skills: doc.skills?.points || [],
    existing,
    relevance,
});

// Shown before a search runs, so the recruiter knows what it will cost.
export const getSourcingEstimate = async (req, res) => {
    let creditsRemaining = null;
    try {
        creditsRemaining = await getCreditsRemaining();
    } catch (error) {
        console.error("Sourcing balance error:", error.message);
    }
    const maxCredits = maxSourcingCredits();
    res.status(200).json({
        success: true,
        data: {
            maxCredits,
            searchCredits: SEARCH_CREDITS,
            perProfileCredits: LOOKUP_CREDITS,
            candidateLimit: VERTEX_SOURCE_LIMIT,
            creditsRemaining,
            enoughCredits: creditsRemaining === null ? true : creditsRemaining >= maxCredits,
        },
    });
};

export const sourceCandidatesForJob = async (req, res) => {
    try {
        const licensePartnerId = poolIdFor(req);
        const job = await Job.findById(req.params.jobId).lean();
        if (!job) return res.status(404).json({ success: false, message: "Job not found" });

        const criteria = criteriaForJob(job);
        const jd = jdTextForJob(job);
        let { profiles, creditsUsed } = await searchProfiles(criteria, jd);
        // A narrow location can match nobody; an empty search is not charged, so
        // widen to the JD alone rather than report an empty ZepDB.
        if (!profiles.length && criteria.location) {
            ({ profiles, creditsUsed } = await searchProfiles({ current_title: criteria.current_title }, jd));
        }

        // Profiles sourced before are already stored, so they cost nothing to reuse.
        const urls = profiles.map((p) => p.linkedin_url).filter(Boolean);
        const stored = urls.length ? await ResumeData.find({ linkedinUrl: { $in: urls }, licensePartnerId }) : [];
        const storedUrls = new Set(stored.map((d) => d.linkedinUrl));
        const pool = stored.map((doc) => ({ doc, score: relevanceScore(scorable(doc), job), open: false }));

        // Lookups cost a credit each, so rank the rest of the page by title and
        // look up only the best few rather than the whole page.
        const toLookUp = profiles
            .filter((p) => !p.linkedin_url || !storedUrls.has(p.linkedin_url))
            .map((hit) => ({ hit, pre: hitScore(hit, job) }))
            .sort((a, b) => b.pre - a.pre)
            .slice(0, VERTEX_LOOKUP_BUDGET);
        const results = await Promise.all(
            toLookUp.map(({ hit }) => lookupProfile(hit).then((r) => ({ hit, ...r })).catch((e) => {
                console.error("Sourcing lookup failed:", e.message);
                return null;
            }))
        );
        for (const r of results.filter(Boolean)) {
            creditsUsed += r.creditsUsed;
            if (!r.profile) continue;
            const body = profileToResumeData(r.profile, r.hit);
            if (!body.name) continue;
            pool.push({ body, score: relevanceScore(scorable(body), job), open: r.profile.open_to_job_opportunities === true });
        }

        // Candidates above the relevance cutoff come first, best fit first, with
        // job-seekers nudged ahead; weaker ones only fill spots nobody better took.
        const rank = (c) => (c.score >= VERTEX_MIN_RELEVANCE ? 1000 : 0) + c.score + (c.open ? 10 : 0);
        pool.sort((a, b) => rank(b) - rank(a));
        const scores = new Map();
        const found = [];
        for (const c of pool.slice(0, VERTEX_SOURCE_LIMIT)) {
            const doc = c.doc || await ResumeData.create({ ...c.body, licensePartnerId });
            scores.set(String(doc._id), c.score);
            found.push(doc);
        }

        const submitted = await Resume.find({ jobId: job._id, resumeDataId: { $in: found.map((d) => d._id) } })
            .select("resumeDataId").lean();
        const submittedIds = new Set(submitted.map((r) => String(r.resumeDataId)));

        res.status(200).json({
            success: true,
            data: {
                job: { title: job.jobtitle, id: job._id },
                candidates: found.map((d) => toCandidate(d, submittedIds.has(String(d._id)) ? { resumeId: null } : null, scores.get(String(d._id)))),
                creditsUsed,
            },
        });
    } catch (error) {
        console.error("Sourcing error:", error);
        const insufficient = error.status === 403 && /credit/i.test(error.message);
        res.status(insufficient ? 402 : 500).json({
            success: false,
            message: insufficient ? "Not enough sourcing credits for this search." : "Failed to search ZepDB",
        });
    }
};
