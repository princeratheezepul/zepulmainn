import ResumeData from "../models/resumeData.model.js";
import Resume from "../models/resume.model.js";
import { Job } from "../models/job.model.js";
import { zepDBAnalysisFor } from "./zepdb.controller.js";
import {
    VERTEX_SOURCE_LIMIT,
    VERTEX_MIN_RELEVANCE,
    VERTEX_MIN_SCORE,
    VERTEX_LOOKUP_BUDGET,
    SEARCH_CREDITS,
    LOOKUP_CREDITS,
    maxSourcingCredits,
    getCreditsRemaining,
    searchProfiles,
    lookupProfile,
    profileToResumeData,
    searchTiersForJob,
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

        const jd = jdTextForJob(job);
        // Strictest filters first; an empty search is not charged, so loosen
        // step by step rather than report an empty ZepDB.
        let profiles = [];
        let creditsUsed = 0;
        for (const criteria of searchTiersForJob(job)) {
            ({ profiles, creditsUsed } = await searchProfiles(criteria, jd));
            if (profiles.length) break;
        }

        // Profiles sourced before are already stored, so they cost nothing to
        // reuse; ones already submitted to this job don't take a slot again.
        const urls = profiles.map((p) => p.linkedin_url).filter(Boolean);
        const storedAll = urls.length ? await ResumeData.find({ linkedinUrl: { $in: urls }, licensePartnerId }) : [];
        const submitted = storedAll.length
            ? await Resume.find({ jobId: job._id, resumeDataId: { $in: storedAll.map((d) => d._id) } }).select("resumeDataId").lean()
            : [];
        const submittedIds = new Set(submitted.map((r) => String(r.resumeDataId)));
        const storedUrls = new Set(storedAll.map((d) => d.linkedinUrl));
        const pool = storedAll
            .filter((doc) => !submittedIds.has(String(doc._id)))
            .map((doc) => ({ doc, score: relevanceScore(scorable(doc), job), open: false }));

        // Lookups cost a credit each, so rank the rest of the page by title,
        // employer and location and look up only the best few.
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
            // Saved even if not picked: the lookup is paid for, so a later search reuses it free.
            const doc = await ResumeData.create({ ...body, licensePartnerId });
            pool.push({ doc, score: relevanceScore(scorable(doc), job), open: r.profile.open_to_job_opportunities === true });
        }

        // Shortlist on job-fit relevance, job-seekers nudged ahead...
        const rank = (c) => (c.score >= VERTEX_MIN_RELEVANCE ? 1000 : 0) + c.score + (c.open ? 10 : 0);
        pool.sort((a, b) => rank(b) - rank(a));
        const shortlist = pool.slice(0, VERTEX_SOURCE_LIMIT + VERTEX_LOOKUP_BUDGET);

        // ...then score the shortlist the way the scorecard will (no sourcing
        // credits) and hand back the highest CV scores, VERTEX_MIN_SCORE+ first.
        // The analyses are cached, so submitting shows the same score.
        await Promise.all(shortlist.map(async (c) => {
            try {
                const analysis = await zepDBAnalysisFor(c.doc, job, { relevance: c.score });
                c.ats = Number(analysis.ats_score) || 0;
            } catch (e) {
                console.error("Sourcing pre-score failed:", e.message);
                c.ats = c.score; // fall back to local relevance
            }
        }));
        const atsRank = (c) => (c.ats >= VERTEX_MIN_SCORE ? 1000 : 0) + c.ats + c.score / 100;
        shortlist.sort((a, b) => atsRank(b) - atsRank(a));
        const picked = shortlist.slice(0, VERTEX_SOURCE_LIMIT);
        const found = picked.map((c) => c.doc);
        const scores = new Map(picked.map((c) => [String(c.doc._id), c.ats]));

        res.status(200).json({
            success: true,
            data: {
                job: { title: job.jobtitle, id: job._id },
                candidates: found.map((d) => toCandidate(d, null, scores.get(String(d._id)))),
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
