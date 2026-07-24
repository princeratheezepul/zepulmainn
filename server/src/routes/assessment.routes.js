import express from 'express';
import { generateAssessment, generateAvaloqAssessment, getAssessment, submitAssessment, runCode, uploadAssessmentScreenshot, getAssessmentScreenshots } from '../controllers/assessment.controller.js';
import { verifyRecruiterJWT } from '../middleware/recruiter.auth.middleware.js';
import { multiAuthMiddleware } from '../middleware/multi.auth.middleware.js';
import { openAILimiter, screenshotLimiter } from '../middleware/rateLimiters.js';
import { screenshotUpload } from '../middleware/multer.js';

const router = express.Router();

// Health check (must be before wildcard routes)
router.get('/test/health', (req, res) => res.json({ status: "ok", message: "Assessment API is reachable" }));

// Recruiter routes (hit OpenAI — rate limited per user)
router.post('/generate', verifyRecruiterJWT, openAILimiter, generateAssessment);
router.post('/generate-avaloq', verifyRecruiterJWT, openAILimiter, generateAvaloqAssessment);

// Recruiter/manager/admin: view proctoring snapshots for a session (presigned URLs).
router.get('/:assessmentId/screenshots', multiAuthMiddleware, getAssessmentScreenshots);

// Public candidate routes (No auth required, protected by assessmentId)
router.get('/:assessmentId', getAssessment);
router.post('/:assessmentId/submit', submitAssessment);
router.post('/:assessmentId/run', runCode);
// Public proctoring upload (gated by assessmentId; hardened by limiter + size/type + session guard).
router.post('/:assessmentId/screenshot', screenshotLimiter, screenshotUpload, uploadAssessmentScreenshot);

export default router;
