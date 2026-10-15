import express from "express";
import { processZepDBQuery, getZepDBStats, matchJobWithZepDB, scoreCandidateForJob } from "../controllers/zepdb.controller.js";
import { getSourcingEstimate, sourceCandidatesForJob } from "../controllers/vertex.controller.js";
import { verifyRecruiterJWT } from "../middleware/recruiter.auth.middleware.js";
import { openAILimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

// Apply recruiter authentication middleware to all routes
router.use(verifyRecruiterJWT);

// Outside sourcing is for recruiters not created by a Pro recruiter; Pro-created
// recruiters keep the plain ZepDB search.
const notProCreated = (req, res, next) => {
    if (req.user?.isCreatedByProRecruiter) {
        return res.status(403).json({ message: "Not available for this recruiter account." });
    }
    next();
};
router.get("/sourcing/estimate", notProCreated, getSourcingEstimate);
router.post("/sourcing/search/:jobId", notProCreated, sourceCandidatesForJob);

// Submitting a sourced candidate is open to License Partner recruiters (the
// controller only lets them submit candidates sourced for their own partner).
router.post("/score-candidate/:jobId", scoreCandidateForJob);

// ZepDB is Zepul's own talent pool; License Partner recruiters don't get the rest.
router.use((req, res, next) => {
    if (req.user?.licensePartnerId) {
        return res.status(403).json({ message: "ZepDB isn't available to License Partner recruiters." });
    }
    next();
});

// Process ZepDB query (hits OpenAI — rate limited per user)
router.post("/query", openAILimiter, processZepDBQuery);

// Phase 1: fast ZepDB search, returns candidates with existing-score flags
router.post("/match-job/:jobId", matchJobWithZepDB);

// Get ZepDB statistics
router.get("/stats", getZepDBStats);

export default router;
