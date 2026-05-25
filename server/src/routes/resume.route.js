import express from "express";
import { saveResume, saveResumeWithJob, getResumesByJob, searchResumesByJobRole, getResumeById, requestAnotherRound, submitToManager, updateResumeStatus, scheduleInterview, getResumesByRecruiter, getResumesByTag, updateResumeTag, getResumeStatsByRecruiter, getMonthlySubmissionData, getMonthlyShortlistData, saveInterviewEvaluation, getAverageScoreData, parseResumeWithAI, evaluatePrompt } from "../controllers/resume.controller.js";
import { verifyRecruiterJWT } from "../middleware/recruiter.auth.middleware.js";
import { anyAuth } from "../middleware/anyAuth.middleware.js";
import { openAILimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

// More specific routes first
router.post("/parse-ai", verifyRecruiterJWT, parseResumeWithAI);
router.post("/evaluate-prompt", anyAuth, openAILimiter, evaluatePrompt);
router.post("/save/:jobId", verifyRecruiterJWT, saveResumeWithJob);
router.post("/save", verifyRecruiterJWT, saveResume);
router.get("/recruiter", verifyRecruiterJWT, getResumesByRecruiter);
router.get("/stats/recruiter", verifyRecruiterJWT, getResumeStatsByRecruiter);
router.get("/stats/monthly", verifyRecruiterJWT, getMonthlySubmissionData);
router.get("/stats/shortlist", verifyRecruiterJWT, getMonthlyShortlistData);
router.get("/stats/average-score", verifyRecruiterJWT, getAverageScoreData);
router.get("/tag/:tag", anyAuth, getResumesByTag);
router.get("/job/:jobId", anyAuth, getResumesByJob);
router.get("/search/:jobId", anyAuth, searchResumesByJobRole);
router.get("/:resumeId", anyAuth, getResumeById);
router.patch('/:resumeId/tag', anyAuth, updateResumeTag);
router.patch('/:resumeId/status', verifyRecruiterJWT, updateResumeStatus);
router.patch('/:resumeId', verifyRecruiterJWT, updateResumeStatus);
router.patch('/:resumeId/request-another-round', anyAuth, requestAnotherRound);
router.patch('/:resumeId/submit-to-manager', anyAuth, submitToManager);
router.post('/:resumeId/schedule-interview', anyAuth, scheduleInterview);
router.post('/:resumeId/save-interview-evaluation', verifyRecruiterJWT, saveInterviewEvaluation);

export default router;

