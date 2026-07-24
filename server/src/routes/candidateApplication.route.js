import express from "express";
import {
  getCandidateJob,
  applyToJob,
  getCandidateApplications,
} from "../controllers/candidateApplication.controller.js";
import { getPrepDocument } from "../controllers/prepDocument.controller.js";

const router = express.Router();

router.get("/job/:jobId", getCandidateJob);
router.post("/job/:jobId/apply", applyToJob);
router.get("/candidate/:candidateId", getCandidateApplications);
router.get("/prep/:applicationId", getPrepDocument);

export default router;
