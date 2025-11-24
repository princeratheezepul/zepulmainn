import express from 'express';
import { inviteCandidate } from '../controllers/hackerrank.controller.js';
import { verifyRecruiterJWT } from '../middleware/recruiter.auth.middleware.js';

const router = express.Router();

router.post('/invite', verifyRecruiterJWT, inviteCandidate);

export default router;
