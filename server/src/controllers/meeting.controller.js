import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";
import { Job } from "../models/job.model.js";
import Resume from "../models/resume.model.js";
import Recruiter from "../models/recruiter.model.js";
import { startWebCallForMeeting } from "../services/vapi.service.js";
import { sendMeetingInviteEmail } from "../services/email.service.js";

const FRONTEND_URL =
  process.env.FRONTEND_URL ||
  process.env.FRONT_END_URL ||
  "http://localhost:5173";

const trimText = (text = "", limit = 2500) => {
  if (!text) return "";
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

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
      vapiAssistantId:
        process.env.VAPI_ASSISTANT_ID || "assistant_placeholder_configure_env",
    });

    const inviteLink = `${FRONTEND_URL.replace(/\/$/, "")}/meeting/${token}`;
    await sendMeetingInviteEmail({
      to: candidateEmail,
      jobTitle: job.jobtitle,
      companyName: job.company || "Zepul",
      candidateName: resume.name || "",
      scheduledAt,
      timeZone: req.body?.timeZone || "UTC",
      durationMinutes: meeting.durationMinutes,
      inviteLink,
      mode: "Video Call (AI-led interview)",
      locationLabel: "Meeting Link",
      interviewerNames: recruiter.fullname || "AI Interviewer",
      recruiterFullName: recruiter.fullname || "",
      recruiterTitle: recruiter.role || recruiter.type || "Recruiter",
      recruiterPhone: recruiter.phone || "",
      recruiterEmail: recruiter.email || "",
      companyWebsite:
        process.env.COMPANY_WEBSITE ||
        "https://www.zepul.com",
    });

    return res.status(201).json({
      message: "Meeting created and invite sent",
      data: { meetingId: meeting._id, token },
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    return res.status(500).json({ message: "Failed to create meeting" });
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
    const meeting = await Meeting.findOne({ token });

    if (!meeting) return res.status(404).json({ message: "Meeting not found" });

    if (meeting.status === "canceled" || meeting.status === "completed") {
      return res.status(400).json({ message: "Meeting not active" });
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

    const assistantId =
      meeting.vapiAssistantId ||
      process.env.VAPI_ASSISTANT_ID ||
      "assistant_placeholder_configure_env";

    const { callId, joinConfig } = await startWebCallForMeeting({
      assistantId,
      context: req.body?.context,
    });

    meeting.status = "active";
    meeting.vapiCallId = callId;
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

export const handleVapiWebhook = async (req, res) => {
  try {
    const event = req.body || {};
    const { type, data = {} } = event;
    const callId = data?.callId || data?.id;

    if (!callId) {
      return res.status(400).json({ message: "Missing callId" });
    }

    const meeting = await Meeting.findOne({ vapiCallId: callId });
    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found for call" });
    }

    switch (type) {
      case "call.started":
        meeting.status = "active";
        break;
      case "transcript.updated":
        meeting.transcript = data?.transcript || meeting.transcript;
        break;
      case "tool.outputs":
        meeting.toolOutputs = data?.outputs;
        break;
      case "call.completed":
        meeting.status = "completed";
        meeting.transcript = data?.transcript || meeting.transcript;
        meeting.recordingUrl = data?.recordingUrl || meeting.recordingUrl;
        meeting.toolOutputs = data?.toolOutputs || meeting.toolOutputs;
        meeting.report = meeting.report || {};
        meeting.report.summary =
          meeting.report.summary || data?.summary || data?.report;
        meeting.report.scores = meeting.report.scores || data?.scores;
        break;
      default:
        break;
    }

    await meeting.save();
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};

