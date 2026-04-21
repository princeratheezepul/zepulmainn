import express from "express";
import { processZepDBQuery, getZepDBStats, matchJobWithZepDB, scoreCandidateForJob } from "../controllers/zepdb.controller.js";
import { verifyRecruiterJWT } from "../middleware/recruiter.auth.middleware.js";

const router = express.Router();

// Apply recruiter authentication middleware to all routes
router.use(verifyRecruiterJWT);

// Process ZepDB query
router.post("/query", processZepDBQuery);

// Phase 1: fast ZepDB search, returns candidates with existing-score flags
router.post("/match-job/:jobId", matchJobWithZepDB);

// Phase 2: score one candidate (called in parallel from frontend)
router.post("/score-candidate/:jobId", scoreCandidateForJob);

// Get ZepDB statistics
router.get("/stats", getZepDBStats);

export default router;
