import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";
import { Job } from "../models/job.model.js";
import Resume from "../models/resume.model.js";
import Recruiter from "../models/recruiter.model.js";
import { startWebCallForMeeting, deleteAssistant } from "../services/vapi.service.js";
import {
  sendMeetingInviteEmail,
  sendMeetingCancelEmail,
  sendMeetingRescheduleEmail,
} from "../services/email.service.js";

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.FRONT_END_URL ||
  "http://localhost:5173";

const trimText = (text = "", limit = 2500) => {
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

const isSyntheticCallId = (callId) =>
  typeof callId === "string" &&
  (callId.startsWith("web-call-") || callId.startsWith("mock-call-"));

export const createMeeting = async (req, res) => {
  try {
    const { jobId, resumeId, candidateEmail, scheduledAt, durationMinutes } =
      req.body;

    if (!jobId || !resumeId || !candidateEmail || !scheduledAt) {
      return res
        .status(400)
        .json({ message: "jobId, resumeId, candidateEmail, scheduledAt are required" });
    }

    const [job, resume, recruiter] = await Promise.all([
      Job.findById(jobId),
      Resume.findById(resumeId),
      Recruiter.findById(req.id || req.user?._id),
    ]);

    if (!job) return res.status(404).json({ message: "Job not found" });
    if (!resume) return res.status(404).json({ message: "Resume not found" });
    if (!recruiter)
      return res.status(401).json({ message: "Recruiter not authorized" });

    // Ownership/authorization: ensure recruiter is assigned to the job or resume
    const recruiterIdStr = String(recruiter._id);
    const jobAssigned = Array.isArray(job?.assignedRecruiters)
      ? job.assignedRecruiters.some((r) => String(r) === recruiterIdStr)
      : false;
    const resumeOwned =
      resume?.recruiterId && String(resume.recruiterId) === recruiterIdStr;

    if (!jobAssigned || !resumeOwned) {
      return res
        .status(403)
        .json({ message: "Not authorized to create a meeting for this job/resume" });
    }

    const token = crypto.randomBytes(24).toString("hex");

    const meeting = await Meeting.create({
      jobId,
      resumeId,
      recruiterId: recruiter._id,
      candidateEmail: candidateEmail.toLowerCase(),
      scheduledAt,
      durationMinutes: durationMinutes || 40,
      token,
      status: "scheduled",
      // Optional pre-configured assistant; if not set, service will create one per meeting
      vapiAssistantId: process.env.VAPI_ASSISTANT_ID || undefined,
    });

    const inviteLink = `${FRONTEND_URL.replace(/\/$/, "")}/meeting/${token}`;

    // Email functionality removed as per user request
    // console.log("AI interview meeting link:", inviteLink);

    console.log("AI interview meeting link:", inviteLink);

    return res.status(201).json({
      message: "Meeting created successfully",
      data: { meetingId: meeting._id, token, inviteLink },
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return res.status(500).json({ message: "Failed to create meeting" });
  }
};

export const resendInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const meeting = await Meeting.findOne({ token }).populate([
      { path: "jobId" },
      { path: "resumeId" },
      { path: "recruiterId" },
    ]);

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    // Ownership check: only creator recruiter can resend
    if (String(meeting.recruiterId?._id || meeting.recruiterId) !== String(req.id)) {
      return res.status(403).json({ message: "Not authorized to resend this meeting" });
    }

    const inviteLink = `${FRONTEND_URL.replace(/\/$/, "")}/meeting/${token}`;

    await sendMeetingInviteEmail({
      to: meeting.candidateEmail,
      jobTitle: meeting.jobId?.jobtitle || "Interview",
      companyName: meeting.jobId?.company || "Zepul",
      candidateName: meeting.resumeId?.name || "",
      scheduledAt: meeting.scheduledAt,
      timeZone: req.body?.timeZone || "UTC",
      durationMinutes: meeting.durationMinutes,
      inviteLink,
      mode: "Video Call (AI-led interview)",
      locationLabel: "Meeting Link",
      interviewerNames: meeting.recruiterId?.fullname || "AI Interviewer",
      recruiterFullName: meeting.recruiterId?.fullname || "",
      recruiterTitle:
        meeting.recruiterId?.role ||
        meeting.recruiterId?.type ||
        "Recruiter",
      recruiterPhone: meeting.recruiterId?.phone || "",
      recruiterEmail: meeting.recruiterId?.email || "",
      companyWebsite:
        process.env.COMPANY_WEBSITE ||
        "https://www.zepul.com",
    });

    return res.status(200).json({ message: "Invite resent" });
  } catch (error) {
    console.error("Error resending invite:", error);
    return res.status(500).json({ message: "Failed to resend invite" });
  }
};

export const cancelMeeting = async (req, res) => {
  try {
    const { token } = req.params;
    const meeting = await Meeting.findOne({ token });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    // Ownership check
    if (String(meeting.recruiterId) !== String(req.id)) {
      return res.status(403).json({ message: "Not authorized to cancel this meeting" });
    }

    meeting.status = "canceled";
    await meeting.save();

    const job = await Job.findById(meeting.jobId);
    const recruiter = await Recruiter.findById(meeting.recruiterId);
    const resume = await Resume.findById(meeting.resumeId);

    await sendMeetingCancelEmail({
      to: meeting.candidateEmail,
      jobTitle: job?.jobtitle || "Interview",
      companyName: job?.company || "Zepul",
      candidateName: resume?.name || "",
      recruiterFullName: recruiter?.fullname || "",
      recruiterTitle: recruiter?.role || recruiter?.type || "Recruiter",
      recruiterEmail: recruiter?.email || "",
      recruiterPhone: recruiter?.phone || "",
      companyWebsite: process.env.COMPANY_WEBSITE || "https://www.zepul.com",
    });

    return res.status(200).json({ message: "Meeting canceled" });
  } catch (error) {
    console.error("Error canceling meeting:", error);
    return res.status(500).json({ message: "Failed to cancel meeting" });
  }
};

export const rescheduleMeeting = async (req, res) => {
  try {
    const { token } = req.params;
    const { scheduledAt, durationMinutes } = req.body || {};
    const meeting = await Meeting.findOne({ token });
    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    // Ownership check
    if (String(meeting.recruiterId) !== String(req.id)) {
      return res.status(403).json({ message: "Not authorized to reschedule this meeting" });
    }

    if (!scheduledAt) {
      return res.status(400).json({ message: "scheduledAt is required" });
    }

    meeting.scheduledAt = scheduledAt;
    if (durationMinutes) {
      meeting.durationMinutes = durationMinutes;
    }
    meeting.status = "scheduled";
    await meeting.save();

    const job = await Job.findById(meeting.jobId);
    const recruiter = await Recruiter.findById(meeting.recruiterId);
    const resume = await Resume.findById(meeting.resumeId);
    const inviteLink = `${FRONTEND_URL.replace(/\/$/, "")}/meeting/${token}`;

    await sendMeetingRescheduleEmail({
      to: meeting.candidateEmail,
      jobTitle: job?.jobtitle || "Interview",
      companyName: job?.company || "Zepul",
      candidateName: resume?.name || "",
      scheduledAt: meeting.scheduledAt,
      timeZone: req.body?.timeZone || "UTC",
      durationMinutes: meeting.durationMinutes,
      inviteLink,
      recruiterFullName: recruiter?.fullname || "",
      recruiterTitle: recruiter?.role || recruiter?.type || "Recruiter",
      recruiterEmail: recruiter?.email || "",
      recruiterPhone: recruiter?.phone || "",
      companyWebsite: process.env.COMPANY_WEBSITE || "https://www.zepul.com",
    });

    return res.status(200).json({ message: "Meeting rescheduled" });
  } catch (error) {
    console.error("Error rescheduling meeting:", error);
    return res.status(500).json({ message: "Failed to reschedule meeting" });
  }
};

export const getRecruiterMeetings = async (req, res) => {
  try {
    const recruiterId = req.id || req.user?._id;
    if (!recruiterId) {
      return res.status(401).json({ message: "Recruiter not authorized" });
    }

    const { resumeId, jobId, status } = req.query;
    const query = { recruiterId };

    if (resumeId) query.resumeId = resumeId;
    if (jobId) query.jobId = jobId;
    if (status) query.status = status;

    const meetings = await Meeting.find(query)
      .populate("jobId", "jobtitle company")
      .populate("resumeId", "name email")
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      meetings: meetings.map((m) => ({
        id: m._id,
        token: m.token,
        status: m.status,
        scheduledAt: m.scheduledAt,
        durationMinutes: m.durationMinutes,
        candidateEmail: m.candidateEmail,
        job: m.jobId ? { id: m.jobId._id, title: m.jobId.jobtitle, company: m.jobId.company } : null,
        resume: m.resumeId ? { id: m.resumeId._id, name: m.resumeId.name, email: m.resumeId.email } : null,
        transcript: m.transcript,
        recordingUrl: m.recordingUrl,
        report: m.report,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching recruiter meetings:", error);
    return res.status(500).json({ message: "Failed to fetch meetings" });
  }
};

export const getMeetingByToken = async (req, res) => {
  try {
    const { token } = req.params;
    const meeting = await Meeting.findOne({ token }).populate([
      { path: "jobId" },
      { path: "resumeId" },
    ]);

    if (!meeting)
      return res.status(404).json({ message: "Meeting not found" });

    if (meeting.status === "canceled")
      return res.status(410).json({ message: "Meeting canceled" });

    // Prevent accessing completed meetings
    if (meeting.status === "completed")
      return res.status(410).json({ message: "Meeting has been completed" });

    const job = meeting.jobId;
    const resume = meeting.resumeId;

    const context = {
      job: {
        title: job?.jobtitle,
        description: trimText(job?.description, 3000),
        location: job?.location,
        skills: job?.skills || [],
      },
      resume: {
        name: resume?.name,
        email: resume?.email,
        phone: resume?.phone,
        summary: trimText(
          resume?.raw_text ||
          `${resume?.title || ""} ${resume?.about || ""}`,
          3000
        ),
        skills: resume?.skills || [],
        experience: resume?.experience,
      },
    };

    return res.status(200).json({
      meeting: {
        id: meeting._id,
        scheduledAt: meeting.scheduledAt,
        durationMinutes: meeting.durationMinutes,
        status: meeting.status,
        token: meeting.token,
        vapiAssistantId: meeting.vapiAssistantId,
        context,
      },
    });
  } catch (error) {
    console.error("Error fetching meeting:", error);
    return res.status(500).json({ message: "Failed to fetch meeting" });
  }
};

export const startMeeting = async (req, res) => {
  try {
    const { token } = req.params;
    const meeting = await Meeting.findOne({ token }).populate([
      { path: "jobId" },
      { path: "resumeId" },
    ]);

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    // Prevent re-accessing if already started or completed
    if (meeting.status === "canceled" || meeting.status === "completed" || meeting.status === "active") {
      return res.status(400).json({
        message: meeting.status === "active"
          ? "Meeting is already in progress"
          : meeting.status === "completed"
            ? "Meeting has already been completed"
            : "Meeting not active"
      });
    }

    // Timing guards: allow starting within a reasonable window around the scheduled time.
    const now = new Date();
    const scheduled = new Date(meeting.scheduledAt);
    const earlyWindowMs = 15 * 60 * 1000; // 15 minutes before scheduled
    const lateWindowMs =
      (meeting.durationMinutes || 40) * 60 * 1000 + 30 * 60 * 1000; // duration + 30 minute buffer

    if (now.getTime() < scheduled.getTime() - earlyWindowMs) {
      return res
        .status(400)
        .json({ message: "Meeting is not yet available to start" });
    }

    if (now.getTime() > scheduled.getTime() + lateWindowMs) {
      meeting.status = "expired";
      await meeting.save();
      return res
        .status(410)
        .json({ message: "Meeting window has expired" });
    }

    // Prepare context for assistant creation (if needed)
    const context = {
      job: meeting.jobId
        ? {
          jobtitle: meeting.jobId.jobtitle,
          description: trimText(meeting.jobId.description),
          skills: meeting.jobId.skills || [],
          location: meeting.jobId.location,
          employmentType: meeting.jobId.employmentType,
        }
        : null,
      resume: meeting.resumeId
        ? {
          name: meeting.resumeId.name,
          title: meeting.resumeId.title,
          email: meeting.resumeId.email,
          phone: meeting.resumeId.phone,
          experience: meeting.resumeId.experience,
          skills: meeting.resumeId.skills || [],
          aiSummary: meeting.resumeId.aiSummary || {},
          potentialConcern: meeting.resumeId.potentialConcern || [],
          keyStrength: meeting.resumeId.keyStrength || [],
        }
        : null,
      durationMinutes: meeting.durationMinutes || 40,
    };

    const { callId, joinConfig } = await startWebCallForMeeting({
      assistantId: meeting.vapiAssistantId,
      context,
    });

    // If a new assistant was created, save it to the meeting
    if (joinConfig?.assistantId && !meeting.vapiAssistantId) {
      meeting.vapiAssistantId = joinConfig.assistantId;
    }

    meeting.status = "active";
    if (callId && !isSyntheticCallId(callId)) {
      meeting.vapiCallId = callId;
    }
    meeting.joinConfig = joinConfig;
    await meeting.save();

    return res.status(200).json({
      message: "Meeting started",
      callId,
      joinConfig,
    });
  } catch (error) {
    console.error("Error starting meeting:", error);
    return res.status(500).json({ message: "Failed to start meeting" });
  }
};

/**
 * Fetch transcript from Vapi API for a given call ID (fallback when webhooks don't deliver)
 */
const fetchTranscriptFromVapi = async (callId) => {
  const VAPI_API_KEY = process.env.VAPI_API_KEY;
  const VAPI_BASE_URL = process.env.VAPI_BASE_URL || "https://api.vapi.ai";

  if (!VAPI_API_KEY || !callId) {
    console.warn("Cannot fetch transcript: missing API key or callId");
    return null;
  }

  try {
    const endpoint = `${VAPI_BASE_URL}/call/${callId}`;
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch call data: ${response.status}`);
      return null;
    }

    const callData = await response.json();
    // Try multiple possible locations for transcript
    return callData?.transcript ||
      callData?.messages?.map(m => m.content).join("\n") ||
      callData?.endOfCallReport?.transcript ||
      null;
  } catch (error) {
    console.error("Error fetching transcript from Vapi:", error.message);
    return null;
  }
};

export const endMeeting = async (req, res) => {
  try {
    const { token } = req.params;
    const meeting = await Meeting.findOne({ token });

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (meeting.status !== "active") {
      return res.status(400).json({
        message: `Meeting is not active. Current status: ${meeting.status}`
      });
    }

    // If we have a callId but no transcript, try to fetch it from Vapi API
    // This is a fallback in case webhooks didn't deliver the transcript (e.g., on ejection)
    if (meeting.vapiCallId && !meeting.transcript) {
      if (isSyntheticCallId(meeting.vapiCallId)) {
        console.warn("Skipping transcript fetch for synthetic callId:", meeting.vapiCallId);
      } else {
        const transcript = await fetchTranscriptFromVapi(meeting.vapiCallId);
        if (transcript) {
          meeting.transcript = transcript;
          console.log("Transcript fetched from Vapi API, length:", transcript.length);
        } else {
          console.warn("Could not fetch transcript from Vapi API - may not be available yet");
        }
      }
    } else if (meeting.transcript) {
      console.log("Transcript already exists in database, length:", meeting.transcript.length);
    }

    meeting.status = "completed";
    await meeting.save();

    // Note: Not deleting assistant to preserve webhook functionality

    return res.status(200).json({
      message: "Meeting ended successfully",
      meeting: {
        id: meeting._id,
        status: meeting.status,
        transcriptLength: meeting.transcript?.length || 0,
      },
    });
  } catch (error) {
    console.error("Error ending meeting:", error);
    return res.status(500).json({ message: "Failed to end meeting" });
  }
};

/**
 * Handle function call from Vapi (for end_interview tool)
 * This is called when the AI agent calls the end_interview function
 */
export const handleVapiFunctionCall = async (req, res) => {
  try {
    const { callId, functionCall } = req.body || {};

    if (!callId) {
      return res.status(400).json({ message: "Missing callId" });
    }

    // Find meeting by callId
    const meeting = await Meeting.findOne({ vapiCallId: callId });

    if (!meeting) {
      console.error("Meeting not found for function call, callId:", callId);
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Handle end_interview function
    if (functionCall?.name === "end_interview") {
      console.log("✅ AI called end_interview function. Reason:", functionCall.arguments?.reason || "Not provided");

      // Do not mark completed here. Wait for end-of-call webhook so transcript/report can persist.
      meeting.meta = meeting.meta || {};
      meeting.meta.endInterviewRequested = true;
      meeting.meta.endInterviewRequestedAt = new Date();
      await meeting.save();

      // Return success - Vapi will end the call gracefully
      return res.status(200).json({
        result: "Interview ended successfully. Thank you for your time."
      });
    }

    // Unknown function
    return res.status(400).json({ message: "Unknown function" });
  } catch (error) {
    console.error("Error handling function call:", error);
    return res.status(500).json({ message: "Function call processing failed" });
  }
};

export const handleVapiWebhook = async (req, res) => {
  try {
    // Log incoming webhook for debugging
    console.log("=== Vapi Webhook Received ===");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));

    // Signature verification if secret is configured
    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers["x-vapi-signature"];
      if (!signature) {
        console.warn("Webhook received without signature (secret is configured)");
        return res.status(401).json({ message: "Missing webhook signature" });
      }
      const payloadString = JSON.stringify(req.body || {});
      const computed = crypto
        .createHmac("sha256", webhookSecret)
        .update(payloadString)
        .digest("hex");
      const valid =
        signature.length === computed.length &&
        crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(computed));
      if (!valid) {
        console.warn("Webhook signature mismatch");
        return res.status(401).json({ message: "Invalid webhook signature" });
      }
    }

    // Vapi webhook structure: { message: { type, call: { id }, ... } }
    const message = req.body?.message || req.body;
    const type = message?.type || req.body?.type;
    const call = message?.call || {};
    const callId = call?.id || message?.callId || req.body?.callId || req.body?.id;

    console.log("Parsed webhook - Type:", type, "CallId:", callId);

    if (!callId) {
      console.error("Webhook missing callId. Full body:", JSON.stringify(req.body, null, 2));
      return res.status(400).json({ message: "Missing callId" });
    }

    // Try to find meeting by callId, or by assistantId if callId doesn't match
    let meeting = await Meeting.findOne({ vapiCallId: callId });

    // If not found by callId, try to find by assistantId (for web calls, callId might be different)
    if (!meeting && call?.assistantId) {
      meeting = await Meeting.findOne({
        vapiAssistantId: call.assistantId,
        status: { $in: ["active", "scheduled", "completed"] },
      }).sort({ updatedAt: -1 });
      if (meeting) {
        // Update the callId for future webhooks
        meeting.vapiCallId = callId;
        await meeting.save();
      }
    }

    if (!meeting) {
      console.error("Meeting not found for callId:", callId);
      // Log all active meetings for debugging
      const activeMeetings = await Meeting.find({ status: { $in: ["active", "scheduled", "completed"] } }).select("vapiCallId vapiAssistantId token status");
      console.log("Active meetings:", JSON.stringify(activeMeetings, null, 2));
      return res.status(404).json({ message: "Meeting not found for call" });
    }

    console.log("Found meeting:", meeting._id, "Status:", meeting.status);
    // Promote real callId from webhook if initial value was synthetic/missing/stale.
    if (
      callId &&
      (!meeting.vapiCallId ||
        isSyntheticCallId(meeting.vapiCallId) ||
        meeting.vapiCallId !== callId)
    ) {
      meeting.vapiCallId = callId;
    }

    // Handle different webhook event types
    switch (type) {
      case "status-update":
      case "call.started":
        meeting.status = "active";
        console.log("Meeting status updated to: active");
        break;

      case "transcript":
      case "transcript.updated":
        const transcript = message?.transcript || call?.transcript || message?.transcriptText || req.body?.transcript;
        if (transcript) {
          // Append or replace transcript
          if (meeting.transcript) {
            meeting.transcript += "\n" + transcript;
          } else {
            meeting.transcript = transcript;
          }
          console.log("Transcript updated, length:", meeting.transcript.length);
        }
        break;

      case "tool-calls":
      case "tool.outputs":
        const toolCalls = message?.toolCalls || message?.outputs || call?.toolOutputs;
        meeting.toolOutputs = toolCalls;
        console.log("Tool outputs saved");
        break;

      case "function-call":
        // Handle function calls from the AI agent
        const functionCall = message?.functionCall || message?.function || req.body?.functionCall || call?.functionCall;
        console.log("Function call received:", functionCall?.name || "unknown");

        // Store function call in toolOutputs
        if (functionCall) {
          meeting.toolOutputs = meeting.toolOutputs || [];
          if (Array.isArray(meeting.toolOutputs)) {
            meeting.toolOutputs.push(functionCall);
          } else {
            meeting.toolOutputs = [functionCall];
          }
        }

        // Handle end_interview function call
        if (functionCall?.name === "end_interview") {
          let parsedReason = null;
          if (typeof functionCall?.arguments === "string") {
            try {
              parsedReason = JSON.parse(functionCall.arguments)?.reason || null;
            } catch (error) {
              parsedReason = null;
            }
          }

          const reason =
            functionCall?.arguments?.reason ||
            functionCall?.parameters?.reason ||
            parsedReason ||
            "Interview completed";
          console.log("AI requested to end interview. Reason:", reason);

          // Do not mark completed on function call. Wait for end-of-call webhook to persist final transcript/report.
          meeting.meta = meeting.meta || {};
          meeting.meta.endInterviewRequested = true;
          meeting.meta.endInterviewReason = reason;
          meeting.meta.endInterviewRequestedAt = new Date();

          // Save the meeting first
          await meeting.save();

          // Return response to Vapi - this tells Vapi to end the call gracefully
          // Vapi expects a response with the function result
          return res.status(200).json({
            result: "Interview ended successfully. Thank you for your time.",
          });
        }

        // For other function calls, just acknowledge
        return res.status(200).json({ result: "Function call processed" });

      case "end-of-call-report":
      case "call.completed":
      case "call.ended":
        meeting.status = "completed";

        // Get transcript from various possible locations
        const finalTranscript = message?.transcript ||
          call?.transcript ||
          message?.transcriptText ||
          message?.endOfCallReport?.transcript ||
          call?.transcript ||
          req.body?.transcript ||
          meeting.transcript;

        if (finalTranscript) {
          meeting.transcript = finalTranscript;
        }

        meeting.recordingUrl = call?.recordingUrl || message?.recordingUrl || message?.recording?.url || req.body?.recordingUrl;
        meeting.toolOutputs = message?.toolCalls || message?.toolOutputs || call?.toolOutputs;

        // Extract report data
        const report = message?.endOfCallReport || message?.report || {};
        meeting.report = meeting.report || {};
        meeting.report.summary = meeting.report.summary || report.summary || report.analysis;
        meeting.report.scores = meeting.report.scores || report.scores || report.metrics;
        meeting.report.recommendation = meeting.report.recommendation || report.recommendation;

        // Update Resume with interview score
        if (meeting.resumeId && meeting.report.scores) {
          try {
            console.log("Processing interview scores for resume:", meeting.resumeId);
            const scores = meeting.report.scores;
            let totalScore = 0;
            let count = 0;
            let evaluationResults = [];

            // Handle different score formats (Array or Object)
            if (Array.isArray(scores)) {
              scores.forEach(s => {
                const val = parseFloat(s.score || s.value);
                if (!isNaN(val)) {
                  totalScore += val;
                  count++;
                  evaluationResults.push({ criterion: s.name || s.criterion || "General", score: val });
                }
              });
            } else if (typeof scores === 'object') {
              Object.entries(scores).forEach(([key, val]) => {
                const numVal = parseFloat(val);
                if (!isNaN(numVal)) {
                  totalScore += numVal;
                  count++;
                  evaluationResults.push({ criterion: key, score: numVal });
                }
              });
            }

            if (count > 0) {
              // Calculate average
              let average = totalScore / count;

              // Convert to percentage (0-100)
              // Assumption: Vapi scores are typically 0-10. If average is <= 10, multiply by 10.
              let finalScore = Math.round(average <= 10 ? average * 10 : average);
              finalScore = Math.min(Math.max(finalScore, 0), 100); // Clamp between 0-100

              console.log(`Updating Resume ${meeting.resumeId} with score: ${finalScore}`);

              await Resume.findByIdAndUpdate(meeting.resumeId, {
                score: finalScore,
                recommendation: meeting.report.recommendation,
                "interviewEvaluation.evaluationResults": evaluationResults.map(r => ({
                  question: r.criterion, // Map criterion to question field to preserve label
                  score: r.score
                })),
                "interviewEvaluation.evaluatedAt": new Date()
              });
            }
          } catch (err) {
            console.error("Error updating resume with interview score:", err);
          }
        }

        console.log("Meeting completed. Transcript length:", meeting.transcript?.length || 0);
        console.log("Recording URL:", meeting.recordingUrl);
        console.log("Report summary:", meeting.report.summary ? "Yes" : "No");

        // Note: Not deleting assistant to preserve webhook functionality
        // Assistants can be cleaned up manually or via scheduled task if needed
        break;

      case "error":
      case "call.error":
        // Handle error/ejection events - check if transcript is included
        console.log("Error/ejection event received:", type);
        const errorTranscript = message?.transcript ||
          call?.transcript ||
          message?.transcriptText ||
          req.body?.transcript;

        if (errorTranscript) {
          console.log("Transcript found in error event, saving...");
          if (meeting.transcript) {
            meeting.transcript += "\n" + errorTranscript;
          } else {
            meeting.transcript = errorTranscript;
          }
        }

        // If meeting is still active and we got an ejection error, mark as completed
        // but don't overwrite existing transcript if we don't have a new one
        if (meeting.status === "active" && message?.error?.type === "ejected") {
          console.log("Ejection detected - marking meeting as completed");
          meeting.status = "completed";
          // Keep existing transcript if we have one, or use error transcript if available
          if (!meeting.transcript && errorTranscript) {
            meeting.transcript = errorTranscript;
          }
        }
        break;

      default:
        console.log("Unhandled webhook type:", type);
        // Check if this unhandled event contains transcript data
        const defaultTranscript = message?.transcript || call?.transcript || req.body?.transcript;
        if (defaultTranscript && !meeting.transcript) {
          console.log("Found transcript in unhandled event type, saving...");
          meeting.transcript = defaultTranscript;
        }
        // Still save the meeting in case there's useful data
        break;
    }

    await meeting.save();
    console.log("✅ Meeting saved successfully. Transcript length:", meeting.transcript?.length || 0);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};


