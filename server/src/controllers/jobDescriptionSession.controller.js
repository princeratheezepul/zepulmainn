import crypto from "crypto";
import { JobDescriptionSession } from "../models/jobDescriptionSession.model.js";
import { TestMeet } from "../models/testMeet.model.js";
import { startWebCallForJobDescription } from "../services/vapi.service.js";

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_BASE_URL = process.env.VAPI_BASE_URL || "https://api.vapi.ai";

const isSyntheticCallId = (callId) =>
    typeof callId === "string" &&
    (callId.startsWith("web-call-") || callId.startsWith("mock-call-"));

/**
 * Fetch the final transcript from Vapi by callId (fallback if webhook missed it)
 */
const fetchTranscriptFromVapi = async (callId) => {
    if (!VAPI_API_KEY || !callId) return null;
    try {
        const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
            headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
        });
        if (!response.ok) return null;
        const data = await response.json();
        return (
            data?.transcript ||
            data?.messages?.map((m) => m.content).join("\n") ||
            data?.endOfCallReport?.transcript ||
            null
        );
    } catch (err) {
        console.error("Error fetching transcript from Vapi:", err.message);
        return null;
    }
};

// ─── POST /api/job-description-sessions ─────────────────────────────────────
export const createSession = async (req, res) => {
    try {
        const sessionId = crypto.randomBytes(24).toString("hex");
        const recruiterId = req.id || req.body?.recruiterId || null;

        await JobDescriptionSession.create({
            sessionId,
            recruiterId,
            status: "pending",
        });

        const sessionLink = `${process.env.FRONTEND_URL || "http://localhost:5173"
            }/describeJob/${sessionId}`;

        console.log("✅ Job description session created:", sessionId);

        return res.status(201).json({
            message: "Session created successfully",
            sessionId,
            link: sessionLink,
        });
    } catch (error) {
        console.error("Error creating job description session:", error);
        return res.status(500).json({ message: "Failed to create session" });
    }
};

// ─── GET /api/job-description-sessions/:sessionId ────────────────────────────
export const getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await JobDescriptionSession.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.status === "completed") {
            return res.status(410).json({ message: "This session has already been completed" });
        }

        return res.status(200).json({
            session: {
                id: session._id,
                sessionId: session.sessionId,
                status: session.status,
            },
        });
    } catch (error) {
        console.error("Error fetching job description session:", error);
        return res.status(500).json({ message: "Failed to fetch session" });
    }
};

// ─── POST /api/job-description-sessions/:sessionId/start ────────────────────
export const startSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await JobDescriptionSession.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.status === "completed") {
            return res.status(400).json({ message: "Session has already been completed" });
        }

        if (session.status === "active") {
            return res.status(400).json({ message: "Session is already active" });
        }

        const { callId, joinConfig } = await startWebCallForJobDescription();

        if (joinConfig?.assistantId && !session.vapiAssistantId) {
            session.vapiAssistantId = joinConfig.assistantId;
        }

        if (callId && !isSyntheticCallId(callId)) {
            session.vapiCallId = callId;
        }

        session.status = "active";
        session.joinConfig = joinConfig;
        await session.save();

        return res.status(200).json({
            message: "Session started",
            callId,
            joinConfig,
        });
    } catch (error) {
        console.error("Error starting job description session:", error);
        return res.status(500).json({ message: "Failed to start session" });
    }
};

// ─── POST /api/job-description-sessions/:sessionId/end ──────────────────────
export const endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await JobDescriptionSession.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        if (session.status !== "active") {
            return res.status(400).json({
                message: `Session is not active. Current status: ${session.status}`,
            });
        }

        // Try to fetch transcript from Vapi if not already stored
        if (session.vapiCallId && !session.transcript && !isSyntheticCallId(session.vapiCallId)) {
            const transcript = await fetchTranscriptFromVapi(session.vapiCallId);
            if (transcript) {
                session.transcript = transcript;
                console.log("Transcript fetched from Vapi, length:", transcript.length);
            }
        }

        session.status = "completed";
        await session.save();

        // Save transcript as description in TestMeet
        if (session.transcript) {
            await TestMeet.create({ description: session.transcript });
            console.log("✅ Transcript saved to TestMeet, length:", session.transcript.length);
        }

        return res.status(200).json({
            message: "Session ended successfully",
            session: {
                id: session._id,
                status: session.status,
                transcriptLength: session.transcript?.length || 0,
            },
        });
    } catch (error) {
        console.error("Error ending job description session:", error);
        return res.status(500).json({ message: "Failed to end session" });
    }
};

// ─── POST /api/job-description-sessions/webhook/vapi ────────────────────────
export const handleWebhook = async (req, res) => {
    try {
        const message = req.body?.message || req.body;
        const type = message?.type || req.body?.type;
        const call = message?.call || {};
        const callId =
            call?.id ||
            message?.callId ||
            req.body?.callId ||
            req.body?.id;

        console.log("[JobDesc Webhook] type:", type, "callId:", callId);

        if (!callId) {
            return res.status(400).json({ message: "Missing callId" });
        }

        // Find session by callId or vapiAssistantId
        let session = await JobDescriptionSession.findOne({ vapiCallId: callId });

        if (!session && call?.assistantId) {
            session = await JobDescriptionSession.findOne({
                vapiAssistantId: call.assistantId,
                status: { $in: ["active", "pending"] },
            }).sort({ updatedAt: -1 });

            if (session) {
                session.vapiCallId = callId;
            }
        }

        if (!session) {
            console.error("[JobDesc Webhook] Session not found for callId:", callId);
            return res.status(404).json({ message: "Session not found for call" });
        }

        // Promote real callId if synthetic/missing
        if (
            callId &&
            (!session.vapiCallId ||
                isSyntheticCallId(session.vapiCallId) ||
                session.vapiCallId !== callId)
        ) {
            session.vapiCallId = callId;
        }

        switch (type) {
            case "status-update":
            case "call.started":
                session.status = "active";
                break;

            case "transcript":
            case "transcript.updated": {
                const transcript =
                    message?.transcript ||
                    call?.transcript ||
                    message?.transcriptText ||
                    req.body?.transcript;
                if (transcript) {
                    session.transcript = session.transcript
                        ? session.transcript + "\n" + transcript
                        : transcript;
                }
                break;
            }

            case "function-call": {
                const functionCall =
                    message?.functionCall ||
                    message?.function ||
                    req.body?.functionCall ||
                    call?.functionCall;

                if (functionCall?.name === "end_description") {
                    let reason = "Job description completed";
                    if (typeof functionCall?.arguments === "string") {
                        try {
                            reason = JSON.parse(functionCall.arguments)?.reason || reason;
                        } catch (_) { }
                    } else if (functionCall?.arguments?.reason) {
                        reason = functionCall.arguments.reason;
                    }

                    console.log("[JobDesc] AI called end_description. Reason:", reason);
                    session.meta = session.meta || {};
                    session.meta.endDescriptionRequested = true;
                    session.meta.endDescriptionReason = reason;
                    session.meta.endDescriptionRequestedAt = new Date();
                    await session.save();

                    return res.status(200).json({
                        result: "Job description session ended. Thank you for your time!",
                    });
                }

                return res.status(200).json({ result: "Function call processed" });
            }

            case "end-of-call-report":
            case "call.completed":
            case "call.ended": {
                session.status = "completed";

                const finalTranscript =
                    message?.transcript ||
                    call?.transcript ||
                    message?.transcriptText ||
                    message?.endOfCallReport?.transcript ||
                    req.body?.transcript ||
                    session.transcript;

                if (finalTranscript) {
                    session.transcript = finalTranscript;
                }

                session.recordingUrl =
                    call?.recordingUrl ||
                    message?.recordingUrl ||
                    message?.recording?.url ||
                    req.body?.recordingUrl;

                console.log(
                    "[JobDesc Webhook] Session completed. Transcript length:",
                    session.transcript?.length || 0
                );

                // Save transcript as description in TestMeet
                if (session.transcript) {
                    await TestMeet.create({ description: session.transcript });
                    console.log("✅ [Webhook] Transcript saved to TestMeet, length:", session.transcript.length);
                }

                break;
            }

            default:
                console.log("[JobDesc Webhook] Unhandled event type:", type);
        }

        await session.save();
        return res.status(200).json({ received: true });
    } catch (error) {
        console.error("Error handling job description webhook:", error);
        return res.status(500).json({ message: "Webhook processing failed" });
    }
};
