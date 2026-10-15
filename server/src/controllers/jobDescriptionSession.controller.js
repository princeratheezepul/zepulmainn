import crypto from "crypto";
import { JobDescriptionSession } from "../models/jobDescriptionSession.model.js";
import { TestMeet } from "../models/testMeet.model.js";
import { startWebCallForJobDescription } from "../services/vapi.service.js";
import OpenAI from "openai";
import jwt from "jsonwebtoken";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Company } from "../models/company.model.js";
import { extractJobFromTranscript, intakeProblems } from "../utils/jobIntake.js";

const openai = process.env.OPENAI_API ? new OpenAI({ apiKey: process.env.OPENAI_API }) : null;

// The session routes are public, so identify a logged-in manager from the token
// when one is sent. Anything else (bad token, non-manager) is just anonymous.
const managerFromRequest = async (req) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) return null;
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded._id).select("type isEmployerManager isLicensePartner companys");
        return user && user.type === "manager" ? user : null;
    } catch {
        return null;
    }
};

// Turn a finished voice session into a Job, once. Mirrors createJobm's
// ownership rules. Never throws: a failed extraction leaves the transcript in
// place for the team to process by hand, as before.
const createJobFromSession = async (session) => {
    if (session.jobId || !session.managerId || !session.transcript) return null;
    // /end and the Vapi webhook can both finish a session; only one may create.
    const claimed = await JobDescriptionSession.findOneAndUpdate(
        { _id: session._id, jobId: null, "meta.jobClaimed": { $ne: true } },
        { $set: { "meta.jobClaimed": true } }
    );
    if (!claimed) return null;
    try {
        const data = await extractJobFromTranscript(openai, session.transcript);
        if (!data) {
            console.warn("[JobDesc] No usable job in transcript for session", session.sessionId);
            return null;
        }
        const { errors, warnings } = intakeProblems(data);
        session.meta = { ...(session.meta || {}), jobClaimed: true, intakeWarnings: [...errors, ...warnings] };
        session.markModified("meta");
        // Impossible values (e.g. min > max) are dropped rather than saved wrong.
        if (errors.length) {
            if (data.salary.min > data.salary.max) data.salary = { min: 0, max: 0 };
            if (data.intake?.experienceMax != null && data.experience > data.intake.experienceMax) data.intake.experienceMax = null;
            if (data.intake?.ctc?.stretch != null && data.intake.ctc.stretch < data.salary.max) data.intake.ctc.stretch = null;
        }

        const manager = await User.findById(session.managerId).select("isEmployerManager isLicensePartner companys");
        const companyDoc = manager?.companys?.[0] ? await Company.findById(manager.companys[0]) : null;
        const job = await Job.create({
            ...data,
            isEmployerPrivate: Boolean(manager?.isEmployerManager),
            licensePartnerId: manager?.isLicensePartner ? manager._id : null,
            managerId: session.managerId,
            company: companyDoc?.name || "Zepul Pro Company",
            companyId: companyDoc?._id,
            internalNotes: session.meta?.partial
                ? "Generated via AI voice intake from a partial transcript (call ended early) — please review"
                : "Generated via AI voice intake",
        });
        await User.findByIdAndUpdate(session.managerId, { $push: { jobs: job._id } });
        session.jobId = job._id;
        console.log("✅ [JobDesc] Job created from voice session:", job._id.toString());
        return job;
    } catch (err) {
        console.error("[JobDesc] Failed to create job from session:", err.message);
        return null;
    }
};

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
        const manager = await managerFromRequest(req);

        await JobDescriptionSession.create({
            sessionId,
            recruiterId: manager ? null : recruiterId,
            managerId: manager?._id || null,
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

// ─── POST /api/job-description-sessions/:sessionId/transcript ───────────────
// The browser streams the transcript so far while the call runs, so a call that
// dies suddenly still leaves something to build the job from.
export const saveTranscript = async (req, res) => {
    try {
        const transcript = typeof req.body?.transcript === "string" ? req.body.transcript.slice(0, 200000) : "";
        const session = await JobDescriptionSession.findOne({ sessionId: req.params.sessionId });
        if (!session) return res.status(404).json({ message: "Session not found" });
        if (session.jobId) return res.status(200).json({ saved: false });
        if (transcript.length > (session.transcript?.length || 0)) {
            session.transcript = transcript;
            await session.save();
        }
        return res.status(200).json({ saved: true });
    } catch (error) {
        console.error("Error saving job description transcript:", error);
        return res.status(500).json({ message: "Failed to save transcript" });
    }
};

// ─── POST /api/job-description-sessions/:sessionId/end ──────────────────────
// Body (optional): { transcript, partial } — the client's copy of the
// conversation, used when the call ended abruptly and Vapi never delivered one.
export const endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await JobDescriptionSession.findOne({ sessionId });

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        const clientTranscript = typeof req.body?.transcript === "string" ? req.body.transcript.slice(0, 200000) : "";
        if (clientTranscript.length > (session.transcript?.length || 0)) {
            session.transcript = clientTranscript;
        }
        if (req.body?.partial) {
            session.meta = { ...(session.meta || {}), partial: true };
            session.markModified("meta");
        }

        // A retry after an abrupt stop may arrive when the session is already
        // completed but no job was made; let it through to try again.
        const retryable = session.status === "completed" && !session.jobId && session.transcript;
        if (session.status !== "active" && !retryable) {
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
        await createJobFromSession(session);
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
                jobId: session.jobId || null,
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

                await createJobFromSession(session);

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
