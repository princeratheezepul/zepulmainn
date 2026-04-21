import express from 'express';
import { generateAssessment, generateAvaloqAssessment, getAssessment, submitAssessment, runCode } from '../controllers/assessment.controller.js';
import { verifyRecruiterJWT } from '../middleware/recruiter.auth.middleware.js';

const router = express.Router();

// Health check (must be before wildcard routes)
router.get('/test/health', (req, res) => res.json({ status: "ok", message: "Assessment API is reachable" }));

// Recruiter routes
router.post('/generate', verifyRecruiterJWT, generateAssessment);
router.post('/generate-avaloq', verifyRecruiterJWT, generateAvaloqAssessment);

// Public candidate routes (No auth required, protected by assessmentId)
router.get('/:assessmentId', getAssessment);
router.post('/:assessmentId/submit', submitAssessment);
router.post('/:assessmentId/run', runCode);

export default router;
