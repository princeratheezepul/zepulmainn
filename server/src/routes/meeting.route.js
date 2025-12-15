import express from "express";
import {
  createMeeting,
  getMeetingByToken,
  handleVapiWebhook,
  startMeeting,
} from "../controllers/meeting.controller.js";
import { verifyRecruiterJWT } from "../middleware/recruiter.auth.middleware.js";
import {
  validateCreateMeeting,
  validateStartMeeting,
} from "../validators/meeting.validator.js";

const router = express.Router();

router.post("/", verifyRecruiterJWT, validateCreateMeeting, createMeeting);
router.get("/:token", getMeetingByToken);
router.post("/:token/start", validateStartMeeting, startMeeting);
router.post("/webhook/vapi", handleVapiWebhook);

export default router;

