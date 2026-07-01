import express from 'express';
import {
  candidateSignup,
  candidateLogin,
  completeCandidateProfile,
  getCandidateById,
} from '../controllers/candidate.controller.js';

const router = express.Router();

// Public routes
router.post('/signup', candidateSignup);
router.post('/login', candidateLogin);

// Profile routes
router.put('/:id/profile', completeCandidateProfile);
router.get('/:id', getCandidateById);

export default router;
