import mongoose from "mongoose";
import Resume from "../models/resume.model.js";
import ResumeData from "../models/resumeData.model.js";
import { Job } from "../models/job.model.js";
import { canAccessResume } from "../utils/resourceAccess.js";
import { requestRoleConfirmation } from "./resume.controller.js";
import { lookupProfile, contactFromProfile } from "../services/vertex.service.js";
import { buildMailer } from "../services/email.service.js";

/**
 * The manager's hands-on steps on a job page: choosing who Zeus reaches out to,
 * revealing a shortlisted candidate's phone number, and emailing the prep brief.
 */

const AT_CLIENT = ["shortlisted", "offered", "hired"];
const MAX_OUTREACH = 100;

const ownsJob = (req, job) =>
  req.role === "admin" || req.role === "accountmanager" || String(job?.managerId || "") === String(req.id);

const canActOn = (req, resume, job) => ownsJob(req, job) || canAccessResume(req, resume);

const escapeHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// @desc   Invite the chosen candidates to confirm interest in the role
// @route  POST /api/manager/resumes/job/:jobId/outreach  { resumeIds: [] }
export const outreachCandidates = async (req, res) => {
  try {
    const { jobId } = req.params;
    const ids = [...new Set((Array.isArray(req.body?.resumeIds) ? req.body.resumeIds : []).map(String))]
      .filter((id) => mongoose.isValidObjectId(id));
    if (!mongoose.isValidObjectId(jobId)) return res.status(400).json({ message: "Invalid job id." });
    if (!ids.length) return res.status(400).json({ message: "Choose at least one candidate." });
    if (ids.length > MAX_OUTREACH) return res.status(400).json({ message: `Reach out to at most ${MAX_OUTREACH} candidates at a time.` });

    const job = await Job.findById(jobId).lean();
    if (!job) return res.status(404).json({ message: "Job not found." });

    const resumes = await Resume.find({ _id: { $in: ids }, jobId: job._id });
    const results = [];
    for (const resume of resumes) {
      if (!canActOn(req, resume, job)) { results.push({ resumeId: resume._id, sent: false, reason: "No access" }); continue; }
      if (resume.status === "rejected") { results.push({ resumeId: resume._id, sent: false, reason: "Rejected" }); continue; }
      const status = resume.roleConfirmation?.status;
      if (status === "accepted" || status === "declined") {
        results.push({ resumeId: resume._id, sent: false, reason: "Already answered" });
        continue;
      }
      // eslint-disable-next-line no-await-in-loop
      const r = await requestRoleConfirmation(resume, job);
      results.push({ resumeId: resume._id, ...r });
    }
    const missing = ids.filter((id) => !resumes.some((r) => String(r._id) === id));
    missing.forEach((id) => results.push({ resumeId: id, sent: false, reason: "Not on this job" }));

    return res.status(200).json({ sent: results.filter((r) => r.sent).length, results });
  } catch (err) {
    console.error("outreachCandidates error:", err);
    return res.status(500).json({ message: "Could not send the invites." });
  }
};

// @desc   Phone number of a shortlisted candidate. Uses the number on file, or
//         looks the profile up on DataVertex for ZepDB candidates who have none.
// @route  POST /api/manager/resumes/:resumeId/reveal-phone
export const revealPhone = async (req, res) => {
  try {
    const { resumeId } = req.params;
    if (!mongoose.isValidObjectId(resumeId)) return res.status(400).json({ message: "Invalid candidate id." });

    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ message: "Candidate not found." });
    const job = await Job.findById(resume.jobId).select("managerId").lean();
    if (!canActOn(req, resume, job)) return res.status(403).json({ message: "You can't view this candidate." });
    if (!AT_CLIENT.includes(resume.status)) {
      return res.status(409).json({ message: "Phone numbers unlock once the candidate is shortlisted." });
    }

    const reply = (phone, countryCode, source) =>
      res.status(200).json({ phone: phone || null, countryCode: countryCode || null, source });

    if (resume.phone) return reply(resume.phone, resume.countryCode, "on-file");

    const profile = resume.resumeDataId ? await ResumeData.findById(resume.resumeDataId) : null;
    if (profile?.phone) {
      await Resume.updateOne({ _id: resume._id }, { $set: { phone: profile.phone, countryCode: profile.countryCode || "91" } });
      return reply(profile.phone, profile.countryCode || "91", "zepdb");
    }

    if (!profile?.linkedinUrl) return reply(null, null, "none");

    // One lookup credit.
    let found = null;
    try {
      const { profile: looked } = await lookupProfile({ linkedin_url: profile.linkedinUrl });
      const contact = contactFromProfile(looked);
      found = contact.phone;
      if (contact.email && !profile.emailId) profile.emailId = contact.email;
    } catch (e) {
      console.error(`[revealPhone] Vertex lookup failed for resume ${resume._id}:`, e.message);
      return res.status(502).json({ message: "Couldn't reach the sourcing provider to fetch the phone number." });
    }

    if (!found) {
      await profile.save().catch(() => {});
      return reply(null, null, "none");
    }
    profile.phone = found.phone;
    profile.countryCode = found.countryCode || "91";
    await profile.save().catch((e) => console.error("[revealPhone] profile not saved:", e.message));
    await Resume.updateOne({ _id: resume._id }, { $set: { phone: found.phone, countryCode: found.countryCode || "91" } });
    return reply(found.phone, found.countryCode || "91", "vertex");
  } catch (err) {
    console.error("revealPhone error:", err);
    return res.status(500).json({ message: "Could not fetch the phone number." });
  }
};

// @desc   Email the Candidate Success Blueprint (prep brief) to a shortlisted
//         candidate. The page sends the rendered document as HTML.
// @route  POST /api/manager/resumes/:resumeId/blueprint/email  { html }
export const emailBlueprint = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const html = typeof req.body?.html === "string" ? req.body.html : "";
    if (!mongoose.isValidObjectId(resumeId)) return res.status(400).json({ message: "Invalid candidate id." });
    if (!html || html.length > 1_500_000) return res.status(400).json({ message: "The prep brief is missing or too large." });

    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ message: "Candidate not found." });
    const job = await Job.findById(resume.jobId).select("managerId jobtitle company").lean();
    if (!canActOn(req, resume, job)) return res.status(403).json({ message: "You can't email this candidate." });
    if (!AT_CLIENT.includes(resume.status)) return res.status(409).json({ message: "Only shortlisted candidates get the prep brief." });
    if (!resume.blueprintDocument?.content) return res.status(409).json({ message: "Prepare the blueprint first." });

    let to = resume.email;
    if (!to && resume.resumeDataId) to = (await ResumeData.findById(resume.resumeDataId).select("emailId").lean())?.emailId;
    if (!to) return res.status(409).json({ message: "No email address on file for this candidate." });

    const name = resume.name || "there";
    const role = job?.jobtitle || "the role";
    const company = job?.company ? ` at ${job.company}` : "";
    const safeFile = `ZepPrep-Blueprint-${String(resume.name || "candidate").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "candidate"}.html`;

    await buildMailer().sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Your prep brief for ${role}${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; line-height: 1.7; color: #1f2937;">
          <h2 style="color: #2563eb;">Congratulations, ${escapeHtml(name)}!</h2>
          <p>You've been shortlisted for <strong>${escapeHtml(role)}</strong>${escapeHtml(company)}.</p>
          <p>Attached is your personal <strong>ZepPrep Candidate Success Blueprint</strong>: what to expect in the client interviews, what to refresh, and how to present your strengths. Open it in any browser; you can print it or save it as a PDF from there.</p>
          <p>Good luck!</p>
          <p style="margin-top: 24px;">Best regards,<br/>The Recruitment Team</p>
        </div>`,
      attachments: [{ filename: safeFile, content: html, contentType: "text/html; charset=utf-8" }],
    });

    const emailedAt = new Date();
    await Resume.updateOne({ _id: resume._id }, { $set: { "blueprintDocument.emailedAt": emailedAt, "blueprintDocument.emailedTo": to } });
    return res.status(200).json({ emailedAt, to });
  } catch (err) {
    console.error("emailBlueprint error:", err);
    return res.status(500).json({ message: "Could not email the prep brief." });
  }
};
