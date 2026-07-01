import crypto from "crypto";
import mongoose from "mongoose";
import { CandidateInterviewSession } from "../models/candidateInterviewSession.model.js";
import Candidate from "../models/candidate.model.js";
import { Job } from "../models/job.model.js";
import { startWebCallForCandidateInterview } from "../services/vapi.service.js";
import { analyzeTranscript, matchJobs } from "../services/candidateMatch.service.js";

const VAPI_API_KEY = process.env.VAPI_API_KEY;
const VAPI_BASE_URL = process.env.VAPI_BASE_URL || "https://api.vapi.ai";

const isSyntheticCallId = (callId) =>
  typeof callId === "string" &&
  (callId.startsWith("web-call-") || callId.startsWith("mock-call-"));

const fetchTranscriptFromVapi = async (callId) => {
  if (!VAPI_API_KEY || !callId || isSyntheticCallId(callId)) return null;
  try {
    const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
      headers: { Authorization: `Bearer ${VAPI_API_KEY}` },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return (
      data?.transcript ||
      data?.artifact?.transcript ||
      data?.messages?.map((m) => `${m.role || ""}: ${m.content || m.message || ""}`).join("\n") ||
      data?.endOfCallReport?.transcript ||
      null
    );
  } catch (err) {
    console.error("Error fetching transcript from Vapi:", err.message);
    return null;
  }
};

// Shape a job document for the client
const shapeJob = (job, score, reasons) => ({
  _id: job._id,
  jobtitle: job.jobtitle,
  company: job.company || "",
  location: job.location || "",
  type: job.type || "",
  employmentType: job.employmentType || "",
  experience: job.experience ?? null,
  skills: Array.isArray(job.skills) ? job.skills : [],
  description: job.description || "",
  matchScore: score,
  matchReasons: reasons || [],
});

// Run analysis + matching for a session and persist the result.
const analyzeAndMatch = async (session) => {
  const profile = await analyzeTranscript(session.transcript);
  const matches = await matchJobs(profile, { limit: 12 });

  session.analysis = profile;
  session.matchedJobs = matches.map((m) => ({
    jobId: m.job._id,
    score: m.score,
    reasons: m.reasons,
  }));
  session.status = "analyzed";
  await session.save();

  return {
    analysis: profile,
    matches: matches.map((m) => shapeJob(m.job, m.score, m.reasons)),
  };
};

// ─── POST /api/candidate-interview ──────────────────────────────────────────
export const createSession = async (req, res) => {
  try {
    const sessionId = crypto.randomBytes(24).toString("hex");
    const candidateId = req.body?.candidateId || null;

    await CandidateInterviewSession.create({
      sessionId,
      candidateId,
      status: "pending",
    });

    console.log("✅ Candidate interview session created:", sessionId);
    return res.status(201).json({ message: "Session created", sessionId });
  } catch (error) {
    console.error("Error creating candidate interview session:", error);
    return res.status(500).json({ message: "Failed to create session" });
  }
};

// ─── GET /api/candidate-interview/:sessionId ────────────────────────────────
export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await CandidateInterviewSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    return res.status(200).json({
      session: {
        sessionId: session.sessionId,
        status: session.status,
        hasTranscript: !!session.transcript,
      },
    });
  } catch (error) {
    console.error("Error fetching candidate interview session:", error);
    return res.status(500).json({ message: "Failed to fetch session" });
  }
};

// ─── POST /api/candidate-interview/:sessionId/start ─────────────────────────
export const startSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await CandidateInterviewSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status === "active") {
      return res.status(400).json({ message: "Session is already active" });
    }

    // Build candidate context if available
    let candidate = null;
    if (session.candidateId) {
      candidate = await Candidate.findById(session.candidateId).lean().catch(() => null);
    }

    const { callId, joinConfig } = await startWebCallForCandidateInterview({
      candidate: candidate
        ? {
            fullName: candidate.fullName,
            email: candidate.email,
            phoneNumber: candidate.phoneNumber,
            address: candidate.address,
          }
        : {},
      durationMinutes: 30,
    });

    if (joinConfig?.assistantId) session.vapiAssistantId = joinConfig.assistantId;
    if (callId && !isSyntheticCallId(callId)) session.vapiCallId = callId;

    session.status = "active";
    session.joinConfig = joinConfig;
    await session.save();

    return res.status(200).json({ message: "Session started", callId, joinConfig });
  } catch (error) {
    console.error("Error starting candidate interview session:", error);
    return res.status(500).json({ message: "Failed to start session" });
  }
};

// ─── POST /api/candidate-interview/:sessionId/end ───────────────────────────
// Body may include { transcript, callId } captured by the browser SDK.
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { transcript: clientTranscript, callId } = req.body || {};

    const session = await CandidateInterviewSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (callId && !isSyntheticCallId(callId)) session.vapiCallId = callId;

    // Prefer the transcript assembled by the browser; fall back to Vapi REST.
    if (clientTranscript && clientTranscript.trim()) {
      session.transcript = clientTranscript.trim();
    } else if (!session.transcript && session.vapiCallId) {
      const fetched = await fetchTranscriptFromVapi(session.vapiCallId);
      if (fetched) session.transcript = fetched;
    }

    session.status = "completed";
    await session.save();

    const result = await analyzeAndMatch(session);

    return res.status(200).json({
      message: "Interview analyzed",
      analysis: result.analysis,
      matches: result.matches,
      transcriptLength: session.transcript?.length || 0,
    });
  } catch (error) {
    console.error("Error ending candidate interview session:", error);
    return res.status(500).json({ message: "Failed to analyze interview" });
  }
};

// ─── GET /api/candidate-interview/:sessionId/matches ────────────────────────
export const getMatches = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await CandidateInterviewSession.findOne({ sessionId });
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Re-analyze if not done yet but a transcript exists
    if (session.status !== "analyzed" && session.transcript) {
      const result = await analyzeAndMatch(session);
      return res.status(200).json({ analysis: result.analysis, matches: result.matches });
    }

    const ids = (session.matchedJobs || []).map((m) => m.jobId);
    const jobs = await Job.find({ _id: { $in: ids } }).lean();
    const jobMap = new Map(jobs.map((j) => [String(j._id), j]));

    const matches = (session.matchedJobs || [])
      .map((m) => {
        const job = jobMap.get(String(m.jobId));
        return job ? shapeJob(job, m.score, m.reasons) : null;
      })
      .filter(Boolean);

    return res.status(200).json({ analysis: session.analysis, matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return res.status(500).json({ message: "Failed to fetch matches" });
  }
};

// ─── GET /api/candidate-interview/candidate/:candidateId/latest ─────────────
// Source of truth for whether THIS candidate has completed an interview, and
// their matched jobs. Used by the dashboard / ZepJobs so state never leaks
// between different candidates on the same browser.
export const getLatestForCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ message: "Invalid candidate id" });
    }

    const session = await CandidateInterviewSession.findOne({
      candidateId,
      status: "analyzed",
    }).sort({ updatedAt: -1 });

    if (!session) {
      return res.status(200).json({ hasInterviewed: false, analysis: null, matches: [] });
    }

    const ids = (session.matchedJobs || []).map((m) => m.jobId);
    const jobs = await Job.find({ _id: { $in: ids } }).lean();
    const jobMap = new Map(jobs.map((j) => [String(j._id), j]));

    const matches = (session.matchedJobs || [])
      .map((m) => {
        const job = jobMap.get(String(m.jobId));
        return job ? shapeJob(job, m.score, m.reasons) : null;
      })
      .filter(Boolean);

    return res.status(200).json({ hasInterviewed: true, analysis: session.analysis, matches });
  } catch (error) {
    console.error("Error fetching latest interview for candidate:", error);
    return res.status(500).json({ message: "Failed to fetch interview" });
  }
};

// ─── POST /api/candidate-interview/webhook/vapi ─────────────────────────────
export const handleWebhook = async (req, res) => {
  try {
    const message = req.body?.message || req.body;
    const type = message?.type || req.body?.type;
    const call = message?.call || {};
    const callId = call?.id || message?.callId || req.body?.callId || req.body?.id;

    if (!callId) return res.status(200).json({ received: true });

    let session = await CandidateInterviewSession.findOne({ vapiCallId: callId });
    if (!session && call?.assistantId) {
      session = await CandidateInterviewSession.findOne({
        vapiAssistantId: call.assistantId,
        status: { $in: ["active", "pending"] },
      }).sort({ updatedAt: -1 });
      if (session) session.vapiCallId = callId;
    }
    if (!session) return res.status(200).json({ received: true });

    switch (type) {
      case "status-update":
      case "call.started":
        if (session.status === "pending") session.status = "active";
        break;

      case "transcript":
      case "transcript.updated": {
        const t = message?.transcript || call?.transcript || message?.transcriptText;
        if (t) session.transcript = session.transcript ? `${session.transcript}\n${t}` : t;
        break;
      }

      case "end-of-call-report":
      case "call.completed":
      case "call.ended": {
        const finalTranscript =
          message?.transcript ||
          call?.transcript ||
          message?.endOfCallReport?.transcript ||
          session.transcript;
        if (finalTranscript) session.transcript = finalTranscript;
        session.recordingUrl =
          call?.recordingUrl || message?.recordingUrl || message?.recording?.url;
        if (session.status !== "analyzed") session.status = "completed";
        break;
      }

      default:
        break;
    }

    await session.save();
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error handling candidate interview webhook:", error);
    return res.status(200).json({ received: true });
  }
};
