import crypto from "crypto";
import mongoose from "mongoose";
import { CandidateInterviewSession } from "../models/candidateInterviewSession.model.js";
import Candidate from "../models/candidate.model.js";
import { Job } from "../models/job.model.js";
import { startWebCallForCandidateInterview } from "../services/vapi.service.js";
import {
  analyzeTranscript,
  matchJobs,
  buildQueryProfile,
  extractQueryTerms,
} from "../services/candidateMatch.service.js";
import { searchWebJobs, isWebJobSearchConfigured } from "../services/webJobSearch.service.js";

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

// ─── GET /api/candidate-interview/candidate/:candidateId/web-jobs ───────────
// Live postings scraped from the internet via OpenAI web search, matched to the
// candidate's interview profile. Served separately from the DB matches so a slow
// (or unavailable) web search never blocks the dashboard from rendering.
const WEB_JOBS_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const getWebJobsForCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ message: "Invalid candidate id" });
    }

    const session = await CandidateInterviewSession.findOne({
      candidateId,
      status: "analyzed",
    }).sort({ updatedAt: -1 });

    if (!session || !session.analysis) {
      return res.status(200).json({ jobs: [], cached: false, configured: isWebJobSearchConfigured() });
    }

    const cached = session.webJobs?.items || [];
    const fetchedAt = session.webJobs?.fetchedAt ? new Date(session.webJobs.fetchedAt).getTime() : 0;
    const isFresh = cached.length > 0 && Date.now() - fetchedAt < WEB_JOBS_TTL_MS;
    const forceRefresh = String(req.query?.refresh || "") === "true";

    if (isFresh && !forceRefresh) {
      return res.status(200).json({ jobs: cached, cached: true, fetchedAt: session.webJobs.fetchedAt });
    }

    const jobs = await searchWebJobs(session.analysis, {
      jobsLimit: Number(req.query?.jobs) || 5,
      internshipsLimit: Number(req.query?.internships) || 5,
      query: String(req.query?.q || ""),
    });

    if (jobs.length) {
      session.webJobs = { items: jobs, fetchedAt: new Date() };
      await session.save();
      return res.status(200).json({ jobs, cached: false, fetchedAt: session.webJobs.fetchedAt });
    }

    // Search came back empty (or failed) — serve stale results rather than nothing.
    return res.status(200).json({
      jobs: cached,
      cached: cached.length > 0,
      fetchedAt: session.webJobs?.fetchedAt || null,
      configured: isWebJobSearchConfigured(),
    });
  } catch (error) {
    console.error("Error fetching web jobs for candidate:", error);
    return res.status(500).json({ message: "Failed to fetch web jobs", jobs: [] });
  }
};

// ─── Free-text job search (post-interview) ──────────────────────────────────
// Once a candidate has done their AI interview they can search for specific roles
// on demand. The typed query drives the match; their interview profile supplies
// soft context so results stay personal.

const MAX_QUERY_LEN = 200;

// Load the candidate's stored profile, if they have completed an interview.
const loadCandidateProfile = async (candidateId) => {
  const session = await CandidateInterviewSession.findOne({
    candidateId,
    status: "analyzed",
  }).sort({ updatedAt: -1 });
  return session?.analysis || null;
};

const readQuery = (req) => String(req.body?.query ?? req.query?.q ?? "").trim().slice(0, MAX_QUERY_LEN);

// ─── POST /api/candidate-interview/candidate/:candidateId/search ────────────
// Database matches only — fast, so the results list paints immediately.
export const searchJobsForCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ message: "Invalid candidate id" });
    }

    const query = readQuery(req);
    if (!query) return res.status(400).json({ message: "Please enter what you're looking for" });

    const profile = await loadCandidateProfile(candidateId);
    const searchProfile = buildQueryProfile(query, profile);

    // No recent-jobs fallback: an empty result is the honest answer to a query
    // that matches nothing, and beats padding the list with unrelated roles.
    const matches = await matchJobs(searchProfile, {
      limit: 12,
      fallbackToRecent: false,
      requireAnyTerm: extractQueryTerms(query),
    });

    return res.status(200).json({
      query,
      matches: matches.map((m) => shapeJob(m.job, m.score, m.reasons)),
    });
  } catch (error) {
    console.error("Error searching jobs for candidate:", error);
    return res.status(500).json({ message: "Search failed", matches: [] });
  }
};

// ─── POST /api/candidate-interview/candidate/:candidateId/search/web ────────
// Live web results for the same query. Split from the DB search because it takes
// 10-25s and shouldn't hold up the fast half.
//
// Web searches cost real money per call, so identical repeat queries are served
// from a short-lived in-memory cache rather than re-searched.
const WEB_SEARCH_CACHE = new Map();
const WEB_SEARCH_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const WEB_SEARCH_CACHE_MAX = 200;

const readWebSearchCache = (key) => {
  const hit = WEB_SEARCH_CACHE.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > WEB_SEARCH_CACHE_TTL_MS) {
    WEB_SEARCH_CACHE.delete(key);
    return null;
  }
  return hit.jobs;
};

const writeWebSearchCache = (key, jobs) => {
  // Map preserves insertion order, so the first key is the oldest.
  if (WEB_SEARCH_CACHE.size >= WEB_SEARCH_CACHE_MAX) {
    WEB_SEARCH_CACHE.delete(WEB_SEARCH_CACHE.keys().next().value);
  }
  WEB_SEARCH_CACHE.set(key, { jobs, at: Date.now() });
};

const INTERNSHIP_QUERY_RE = /\b(intern|interns|internship|internships|trainee|apprentice|apprenticeship)\b/i;

export const searchWebJobsForCandidateQuery = async (req, res) => {
  try {
    const { candidateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ message: "Invalid candidate id" });
    }

    const query = readQuery(req);
    if (!query) return res.status(400).json({ message: "Please enter what you're looking for" });

    const cacheKey = `${candidateId}|${query.toLowerCase()}`;
    const cached = readWebSearchCache(cacheKey);
    if (cached) return res.status(200).json({ query, jobs: cached, cached: true });

    const profile = await loadCandidateProfile(candidateId);
    const searchProfile = buildQueryProfile(query, profile);

    // Respect what they typed: an internship-flavoured query returns internships,
    // anything else stays jobs-dominant with a couple of internships alongside.
    const wantsInternships = INTERNSHIP_QUERY_RE.test(query);
    const jobs = await searchWebJobs(searchProfile, {
      jobsLimit: wantsInternships ? 0 : 8,
      internshipsLimit: wantsInternships ? 10 : 2,
      query,
    });

    if (jobs.length) writeWebSearchCache(cacheKey, jobs);

    return res.status(200).json({
      query,
      jobs,
      cached: false,
      configured: isWebJobSearchConfigured(),
    });
  } catch (error) {
    console.error("Error searching web jobs for candidate:", error);
    return res.status(500).json({ message: "Web search failed", jobs: [] });
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
