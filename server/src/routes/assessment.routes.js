import express from 'express';
import { generateAssessment, getAssessment, submitAssessment, runCode } from '../controllers/assessment.controller.js';
import { verifyRecruiterJWT } from '../middleware/recruiter.auth.middleware.js';

const router = express.Router();

// Recruiter routes
router.post('/generate', verifyRecruiterJWT, generateAssessment);

// Public candidate routes (No auth required, protected by assessmentId)
router.get('/:assessmentId', getAssessment);
router.post('/:assessmentId/submit', submitAssessment);
router.post('/:assessmentId/run', runCode);

export default router;
