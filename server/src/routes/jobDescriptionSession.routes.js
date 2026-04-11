import express from "express";
import {
    createSession,
    getSession,
    startSession,
    endSession,
    handleWebhook,
} from "../controllers/jobDescriptionSession.controller.js";

const router = express.Router();

// Webhook must come BEFORE /:sessionId to avoid param conflict
router.post("/webhook/vapi", handleWebhook);

router.post("/", createSession);
router.get("/:sessionId", getSession);
router.post("/:sessionId/start", startSession);
router.post("/:sessionId/end", endSession);

export default router;
