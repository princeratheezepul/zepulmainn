import crypto from "crypto";
import { Meeting } from "../models/meeting.model.js";
import { Job } from "../models/job.model.js";
import Resume from "../models/resume.model.js";
import Recruiter from "../models/recruiter.model.js";
import { startWebCallForMeeting } from "../services/vapi.service.js";
import {
  sendMeetingInviteEmail,
  sendMeetingCancelEmail,
  sendMeetingRescheduleEmail,
} from "../services/email.service.js";
import crypto from "crypto";

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
    // Signature verification if secret is configured
    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = req.headers["x-vapi-signature"];
      if (!signature) {
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
        return res.status(401).json({ message: "Invalid webhook signature" });
      }
    }

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

