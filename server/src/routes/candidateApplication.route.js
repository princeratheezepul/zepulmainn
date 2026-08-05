import express from "express";
import multer from "multer";
import {
  getCandidateJob,
  applyToJob,
  getCandidateApplications,
} from "../controllers/candidateApplication.controller.js";
import {
  getPrepDocument,
  generatePrepFromUpload,
} from "../controllers/prepDocument.controller.js";
import { openAILimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

// Resume + JD for the anonymous prep flow. Memory storage — nothing is written to
// disk or the database; the buffers only live long enough to extract their text.
const prepUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 2 },
  fileFilter: (req, file, cb) => {
    const ok = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (ok.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only PDF, DOCX or TXT files are allowed"), false);
  },
});

// Surface multer's own rejections (size/type) as JSON instead of a 500 stack.
const handleUploadErrors = (handler) => (req, res, next) =>
  handler(req, res, (err) => {
    if (!err) return next();
    const tooBig = err.code === "LIMIT_FILE_SIZE";
    return res
      .status(tooBig ? 413 : 415)
      .json({ message: tooBig ? "Files must be under 10MB." : err.message });
  });

router.get("/job/:jobId", getCandidateJob);
router.post("/job/:jobId/apply", applyToJob);
router.get("/candidate/:candidateId", getCandidateApplications);
router.get("/prep/:applicationId", getPrepDocument);

// Public and OpenAI-backed, so it carries the shared spend limiter.
router.post(
  "/prep/from-upload",
  openAILimiter,
  handleUploadErrors(
    prepUpload.fields([
      { name: "resume", maxCount: 1 },
      { name: "jobDescription", maxCount: 1 },
    ])
  ),
  generatePrepFromUpload
);

export default router;
