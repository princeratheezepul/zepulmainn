import express from "express";
import {
  createSession,
  getSession,
  startSession,
  endSession,
  getMatches,
  getLatestForCandidate,
  getWebJobsForCandidate,
  searchJobsForCandidate,
  searchWebJobsForCandidateQuery,
  handleWebhook,
} from "../controllers/candidateInterview.controller.js";

const router = express.Router();

// Webhook must come BEFORE /:sessionId to avoid param conflict
router.post("/webhook/vapi", handleWebhook);

// Per-candidate latest interview (multi-segment path, no conflict with /:sessionId)
router.get("/candidate/:candidateId/latest", getLatestForCandidate);
router.get("/candidate/:candidateId/web-jobs", getWebJobsForCandidate);

// On-demand search once the candidate has completed their interview
router.post("/candidate/:candidateId/search", searchJobsForCandidate);
router.post("/candidate/:candidateId/search/web", searchWebJobsForCandidateQuery);

router.post("/", createSession);
router.get("/:sessionId", getSession);
router.post("/:sessionId/start", startSession);
router.post("/:sessionId/end", endSession);
router.get("/:sessionId/matches", getMatches);

export default router;
