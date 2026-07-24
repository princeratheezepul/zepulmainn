import mongoose from "mongoose";
import Resume from "../models/resume.model.js";
import { Job } from "../models/job.model.js";
import Candidate from "../models/candidate.model.js";
import { determineResumeTag } from "../utils/tagHelper.js";
import { analyzeResume, calculateATSScore } from "./bulkUpload.controller.js";
import { generateAssessmentForResume, sendAssessmentEmail } from "./assessment.controller.js";
import { warmPrepDocument } from "./prepDocument.controller.js";

// Map the internal pipeline state to a candidate-friendly status label.
// The candidate never sees scores/scorecards — only this high-level stage.
const friendlyStatus = (r) => {
  if (!r) return "Applied";
  if (r.isRejected || r.status === "rejected") return "Not selected";
  if (r.status === "hired") return "Hired";
  if (r.status === "offered") return "Offer extended";
  if (r.status === "shortlisted") return "Shortlisted";
  if (r.interviewScheduled || r.status === "scheduled") return "Interview stage";
  if (r.oa?.scheduled || r.avaloqOa?.scheduled) return "Assessment";
  if (r.status === "screening" || r.status === "submitted") return "Under review";
  return "Applied";
};

const shapeJob = (job) => ({
  _id: job._id,
  jobtitle: job.jobtitle,
  company: job.company || "",
  location: job.location || "",
  type: job.type || "",
  employmentType: job.employmentType || "",
  experience: job.experience ?? null,
  salary: job.salary || null,
  skills: Array.isArray(job.skills) ? job.skills : [],
  keyResponsibilities: Array.isArray(job.keyResponsibilities) ? job.keyResponsibilities : [],
  preferredQualifications: Array.isArray(job.preferredQualifications) ? job.preferredQualifications : [],
  description: job.description || "",
  hiringDeadline: job.hiringDeadline || null,
  isClosed: !!job.isClosed,
  createdAt: job.createdAt,
});

// Fire-and-forget pipeline kickoff (assessment generation + email).
const kickoffPipeline = async (resumeId) => {
  try {
    const { resume, job, assessmentLink } = await generateAssessmentForResume(resumeId);
    if (resume?.email && assessmentLink) {
      await sendAssessmentEmail(resume.email, resume.name, assessmentLink, job.jobtitle).catch(
        (e) => console.error("[candidateApply] assessment email failed:", e.message)
      );
    }
  } catch (err) {
    console.error(`[candidateApply] pipeline kickoff failed for ${resumeId}:`, err.message);
  }
};

// ─── GET /api/candidate-application/job/:jobId?candidateId= ──────────────────
export const getCandidateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { candidateId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job id" });
    }

    const job = await Job.findById(jobId).lean();
    if (!job) return res.status(404).json({ message: "Job not found" });

    let application = null;
    if (candidateId && mongoose.Types.ObjectId.isValid(candidateId)) {
      const existing = await Resume.findOne({ jobId, candidateId }).lean();
      if (existing) {
        application = { id: existing._id, status: friendlyStatus(existing), appliedAt: existing.createdAt };
      }
    }

    return res.status(200).json({ job: shapeJob(job), application });
  } catch (err) {
    console.error("getCandidateJob error:", err);
    return res.status(500).json({ message: "Failed to load job" });
  }
};

// ─── POST /api/candidate-application/job/:jobId/apply ────────────────────────
// body: { candidateId, text (resume text), name?, email?, phone? }
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { candidateId, text, name, email, phone } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid job id" });
    }
    if (!candidateId || !mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ message: "A valid candidateId is required" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Resume text is required" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });
    if (job.isClosed) return res.status(400).json({ message: "This job is no longer accepting applications" });

    const candidate = await Candidate.findById(candidateId).lean().catch(() => null);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });

    // Prevent duplicate applications
    const already = await Resume.findOne({ jobId, candidateId });
    if (already) {
      return res.status(200).json({
        message: "You have already applied to this job",
        alreadyApplied: true,
        application: { id: already._id, status: friendlyStatus(already), appliedAt: already.createdAt },
      });
    }

    // Analyze the resume (best-effort — never block the application on AI errors)
    let analysis = {};
    let atsResult = {};
    try {
      const jobForAI = {
        jobtitle: job.jobtitle,
        description: job.description,
        skills: job.skills,
        experience: job.experience,
      };
      const [a, ats] = await Promise.all([
        analyzeResume(text, jobForAI),
        calculateATSScore(text, jobForAI),
      ]);
      analysis = a || {};
      atsResult = ats || {};
    } catch (aiErr) {
      console.error("[candidateApply] AI analysis failed, saving basic application:", aiErr.message);
    }

    const tag = determineResumeTag(job.jobtitle, job.description);
    const assignedRecruiter =
      Array.isArray(job.assignedRecruiters) && job.assignedRecruiters.length
        ? job.assignedRecruiters[0]
        : null;

    const resumeObject = {
      ...analysis,
      jobId,
      tag,
      candidateId,
      isCandidateApplication: true,
      status: "applied",
      // Ensure contact fields exist so the pipeline can reach the candidate
      name: analysis.name || name || candidate.fullName || candidate.email,
      email: analysis.email || email || candidate.email,
      phone: analysis.phone || phone || candidate.phoneNumber || "",
      raw_text: text,
      // Surface to the assigned recruiter/manager pipeline
      recruiterId: assignedRecruiter,
      managerId: job.managerId || null,
    };

    if (atsResult && typeof atsResult.ats_score === "number") {
      resumeObject.overallScore = Math.round(atsResult.ats_score);
      resumeObject.ats_score = atsResult.ats_score;
      resumeObject.ats_reason = atsResult.ats_reason;
      resumeObject.ats_breakdown = atsResult.ats_breakdown;
    }

    const saved = await new Resume(resumeObject).save();
    await Job.findByIdAndUpdate(jobId, { $inc: { totalApplication_number: 1 } });

    res.status(201).json({
      message: "Application submitted successfully",
      application: { id: saved._id, status: friendlyStatus(saved), appliedAt: saved.createdAt },
    });

    // Kick off the normal pipeline after responding
    kickoffPipeline(saved._id);
    // Warm the ZepPrep pack in the background so the candidate's download is instant.
    warmPrepDocument(saved._id);
  } catch (err) {
    console.error("applyToJob error:", err);
    return res.status(500).json({ message: "Failed to submit application", error: err.message });
  }
};

// ─── GET /api/candidate-application/candidate/:candidateId ───────────────────
export const getCandidateApplications = async (req, res) => {
  try {
    const { candidateId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({ message: "Invalid candidate id" });
    }

    const resumes = await Resume.find({ candidateId })
      .populate("jobId")
      .sort({ createdAt: -1 })
      .lean();

    const applications = resumes
      .filter((r) => r.jobId) // skip if job was deleted
      .map((r) => ({
        applicationId: r._id,
        status: friendlyStatus(r),
        appliedAt: r.createdAt,
        job: {
          _id: r.jobId._id,
          jobtitle: r.jobId.jobtitle,
          company: r.jobId.company || "",
          location: r.jobId.location || "",
          type: r.jobId.type || "",
          employmentType: r.jobId.employmentType || "",
        },
      }));

    return res.status(200).json({ applications });
  } catch (err) {
    console.error("getCandidateApplications error:", err);
    return res.status(500).json({ message: "Failed to fetch applications" });
  }
};
