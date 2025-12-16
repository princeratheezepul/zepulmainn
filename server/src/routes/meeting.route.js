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
} from "../controllers/meeting.controller.js";
import { verifyRecruiterJWT } from "../middleware/recruiter.auth.middleware.js";
import {
  validateCreateMeeting,
  validateStartMeeting,
  validateRescheduleMeeting,
} from "../validators/meeting.validator.js";

const router = express.Router();

router.post("/", verifyRecruiterJWT, validateCreateMeeting, createMeeting);
router.get("/recruiter/meetings", verifyRecruiterJWT, getRecruiterMeetings);
router.get("/:token", getMeetingByToken);
router.post("/:token/start", validateStartMeeting, startMeeting);
router.post("/:token/end", endMeeting);
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

