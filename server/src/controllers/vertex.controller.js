import ResumeData from "../models/resumeData.model.js";
import Resume from "../models/resume.model.js";
import { Job } from "../models/job.model.js";
import { zepDBAnalysisFor } from "./zepdb.controller.js";
import {
    VERTEX_SOURCE_LIMIT,
    VERTEX_MIN_RELEVANCE,
    VERTEX_MIN_SCORE,
    VERTEX_MIN_SKILL_MATCH,
    VERTEX_LOOKUP_ROUNDS,
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

        // Score a candidate the way the scorecard will (no sourcing credits).
        // The analysis is cached, so submitting shows the same score.
        const assess = async (c) => {
            try {
                const analysis = await zepDBAnalysisFor(c.doc, job, { relevance: c.score });
                c.ats = Number(analysis.ats_score) || 0;
                const skills = Array.isArray(analysis.skillScores) ? analysis.skillScores : [];
                c.skillMatch = skills.length ? skills.filter((s) => Number(s.score) >= 50).length / skills.length : 0;
            } catch (e) {
                console.error("Sourcing pre-score failed:", e.message);
                c.ats = 0;
                c.skillMatch = 0;
            }
            c.qualified = c.ats > VERTEX_MIN_SCORE && c.skillMatch >= VERTEX_MIN_SKILL_MATCH;
            return c;
        };
        const rank = (c) => (c.score >= VERTEX_MIN_RELEVANCE ? 1000 : 0) + c.score + (c.open ? 10 : 0);
        const qualified = () => pool.filter((c) => c.qualified);

        // Stored candidates are free, so try the most relevant of them first.
        pool.sort((a, b) => rank(b) - rank(a));
        await Promise.all(pool.slice(0, VERTEX_SOURCE_LIMIT + VERTEX_LOOKUP_BUDGET).map(assess));

        // Lookups cost a credit each, so rank the rest of the page by title,
        // employer and location and look them up a batch at a time, stopping as
        // soon as enough candidates clear the bar.
        const queue = profiles
            .filter((p) => !p.linkedin_url || !storedUrls.has(p.linkedin_url))
            .map((hit) => ({ hit, pre: hitScore(hit, job) }))
            .sort((a, b) => b.pre - a.pre);
        for (let round = 0; round < VERTEX_LOOKUP_ROUNDS && queue.length && qualified().length < VERTEX_SOURCE_LIMIT; round++) {
            const batch = queue.splice(0, VERTEX_LOOKUP_BUDGET);
            const results = await Promise.all(
                batch.map(({ hit }) => lookupProfile(hit).then((r) => ({ hit, ...r })).catch((e) => {
                    console.error("Sourcing lookup failed:", e.message);
                    return null;
                }))
            );
            const fresh = [];
            for (const r of results.filter(Boolean)) {
                creditsUsed += r.creditsUsed;
                if (!r.profile) continue;
                const body = profileToResumeData(r.profile, r.hit);
                if (!body.name) continue;
                // Saved even if not picked: the lookup is paid for, so a later search reuses it free.
                const doc = await ResumeData.create({ ...body, licensePartnerId });
                fresh.push({ doc, score: relevanceScore(scorable(doc), job), open: r.profile.open_to_job_opportunities === true });
            }
            pool.push(...fresh);
            await Promise.all(fresh.map(assess));
        }

        // Only candidates over the bar are handed back, highest CV score first.
        const picked = qualified()
            .sort((a, b) => (b.ats + b.skillMatch * 10 + (b.open ? 2 : 0)) - (a.ats + a.skillMatch * 10 + (a.open ? 2 : 0)))
            .slice(0, VERTEX_SOURCE_LIMIT);
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
