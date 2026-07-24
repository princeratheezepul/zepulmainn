import express from "express";
import {
  createMeeting,
  getMeetingByToken,
  getRecruiterMeetings,
  handleVapiWebhook,
  startMeeting,
  endMeeting,
  resendInvite,
  cancelMeeting,
  rescheduleMeeting,
  uploadMeetingScreenshot,
  getMeetingScreenshots,
} from "../controllers/meeting.controller.js";
import { verifyRecruiterJWT } from "../middleware/recruiter.auth.middleware.js";
import { screenshotLimiter } from "../middleware/rateLimiters.js";
import { screenshotUpload } from "../middleware/multer.js";
import {
  validateCreateMeeting,
  validateStartMeeting,
  validateRescheduleMeeting,
} from "../validators/meeting.validator.js";

const router = express.Router();

router.post("/", verifyRecruiterJWT, validateCreateMeeting, createMeeting);
router.get("/recruiter/meetings", verifyRecruiterJWT, getRecruiterMeetings);
// Recruiter (owner only): presigned URLs for an interview's proctoring snapshots.
router.get("/:meetingId/screenshots", verifyRecruiterJWT, getMeetingScreenshots);
router.get("/:token", getMeetingByToken);
router.post("/:token/start", validateStartMeeting, startMeeting);
router.post("/:token/end", endMeeting);
// Public proctoring upload (gated by the meeting token; hardened by limiter + size/type + active guard).
router.post("/:token/screenshot", screenshotLimiter, screenshotUpload, uploadMeetingScreenshot);
router.post("/:token/resend", verifyRecruiterJWT, resendInvite);
router.post("/:token/cancel", verifyRecruiterJWT, cancelMeeting);
router.post(
  "/:token/reschedule",
  verifyRecruiterJWT,
  validateRescheduleMeeting,
  rescheduleMeeting
);
router.post("/webhook/vapi", handleVapiWebhook);

export default router;
