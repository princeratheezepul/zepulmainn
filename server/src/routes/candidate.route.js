import express from 'express';
import {
  candidateSignup,
  candidateLogin,
  completeCandidateProfile,
  getCandidateById,
  getCandidateResume,
  updateCandidateResume,
} from '../controllers/candidate.controller.js';
import { verifyCandidate, requireSelf } from '../middleware/candidate.auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', candidateSignup);
router.post('/login', candidateLogin);

// Profile routes
router.put('/:id/profile', completeCandidateProfile);
router.get('/:id', getCandidateById);

// Resume routes — a candidate's resume is theirs alone, so these are the only
// candidate endpoints behind the session token.
router.get('/:id/resume', verifyCandidate, requireSelf, getCandidateResume);
router.put('/:id/resume', verifyCandidate, requireSelf, updateCandidateResume);

export default router;
