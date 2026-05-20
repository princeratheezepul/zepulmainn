import express from "express";
import { processZepDBQuery, getZepDBStats } from "../controllers/zepdb.controller.js";
import { verifyRecruiterJWT } from "../middleware/recruiter.auth.middleware.js";
import { openAILimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

// Apply recruiter authentication middleware to all routes
router.use(verifyRecruiterJWT);

// Process ZepDB query (hits OpenAI — rate limited per user)
router.post("/query", openAILimiter, processZepDBQuery);

// Get ZepDB statistics
router.get("/stats", getZepDBStats);

export default router;
