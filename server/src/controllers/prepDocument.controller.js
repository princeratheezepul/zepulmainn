import mongoose from "mongoose";
import Resume from "../models/resume.model.js";
import { Job } from "../models/job.model.js";
import { generateTextWithRetry } from "./bulkUpload.controller.js";

/**
 * ZepPrep — the candidate-facing interview-preparation pack.
 *
 * Generated on demand from a candidate's application (a Resume doc) plus the Job
 * it targets. The heavy lifting is a single OpenAI call that turns the JD, the
 * resume, and the apply-time analysis into the 10-section document the client
 * renders to PDF. The result is cached on `resume.prepDocument` so re-downloads
 * are instant and don't re-hit the model.
 *
 * This document goes to the CANDIDATE, so — unlike the internal scorecard — it
 * never carries numeric scores, the hiring recommendation, or internal concerns.
 * It is coaching, not a verdict.
 */

const PREP_MODEL = "gpt-4o-mini";
const MAX_RESUME_CHARS = 6000;

const parseJsonResponse = (text) => {
  const cleaned = String(text || "").replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return a JSON object");
  return JSON.parse(cleaned.substring(start, end + 1));
};

const asArray = (v) => (Array.isArray(v) ? v.filter((x) => x != null && String(x).trim()) : []);
const asString = (v) => (typeof v === "string" ? v.trim() : "");

// Stable-ish reference code for the document header, e.g. ZP-8842-MRDN.
const buildRef = (resumeId, company) => {
  const idPart = String(resumeId).slice(-4).toUpperCase();
  const co = (company || "ZEP").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4).padEnd(4, "X");
  return `ZP-${idPart}-${co}`;
};

const formatSalaryAnchor = (salary) => {
  if (!salary) return "not specified";
  const { min, max } = salary;
  if (min && max) return `${min}–${max} (as posted)`;
  if (min) return `from ${min} (as posted)`;
  if (max) return `up to ${max} (as posted)`;
  return "not specified";
};

const buildPrompt = (job, resume) => {
  const resumeText = (resume.raw_text || "").slice(0, MAX_RESUME_CHARS);
  const priorSkills = asArray(resume.skills).join(", ");
  const priorStrengths = asArray(resume.keyStrength).join(" | ");

  return `You are a senior career coach writing a personalised interview-preparation pack ("ZepPrep") for a candidate who has just applied to a job through Zepul. The pack goes DIRECTLY TO THE CANDIDATE, so it is supportive and coaching in tone. It must NEVER contain numeric scores, a hiring recommendation, an accept/reject verdict, or anything that reads as an internal evaluation.

=== THE JOB ===
Company: ${job.company || "(not specified — infer the industry from the role and keep company facts general)"}
Role: ${job.jobtitle || ""}
Employment type: ${job.employmentType || "Full-time"}
Location: ${job.location || ""} ${job.type ? `(${job.type})` : ""}
Experience expected: ${job.experience != null ? `${job.experience} years` : "not specified"}
Posted salary anchor: ${formatSalaryAnchor(job.salary)}
Required skills: ${asArray(job.skills).join(", ") || "see description"}
Key responsibilities: ${asArray(job.keyResponsibilities).join(" | ") || "see description"}
Preferred qualifications: ${asArray(job.preferredQualifications).join(" | ") || "none listed"}
Description:
"""
${job.description || ""}
"""

=== THE CANDIDATE (resume) ===
Detected skills: ${priorSkills || "see resume"}
Noted strengths: ${priorStrengths || "derive from resume"}
Resume text:
"""
${resumeText}
"""

=== INSTRUCTIONS ===
Produce content for a 10-section document. Ground EVERY point in either the job description or the candidate's actual resume — no filler, nothing generic that could apply to any candidate.
- Section 2 (About the Company): use genuinely known public facts. If you are not confident about a specific fact, give industry-typical, role-relevant guidance instead of inventing specifics. Keep it interview-focused, never a marketing blurb.
- Section 3 (Role Intelligence): go beyond restating the JD — infer what success and hidden expectations really look like.
- Section 4 (Understanding Your Profile): NO scores. "areasToStrengthen" must be honest and specific (missing technologies from the JD, thin experience, missing certifications) but framed constructively.
- Sections 6 & 7 (questions): make them specific to THIS candidate against THIS role — reference their actual background. Never generic.
- Section 9 (Salary): give an indicative market range for the role and location as negotiation context; make clear it is an estimate, not an offer.

Return ONLY this JSON, no markdown:
{
  "opportunity": {
    "company": "", "role": "", "employmentType": "", "location": "", "department": "", "reportsTo": "",
    "purpose": "1-2 sentences on the purpose of the role",
    "whyItMatters": "1-2 sentences on why the role matters to the business"
  },
  "company": {
    "whatTheyDo": ["4 bullets: overview, business model, products, customers — each prefixed like 'Overview: ...'"],
    "howTheyThink": ["4 bullets: culture & values, leadership, recent news, growth bets — each prefixed like 'Culture & values: ...'"]
  },
  "roleIntelligence": {
    "successLooksLike": ["3 concise bullets"],
    "dailyResponsibilities": ["3 concise bullets"],
    "keyStakeholders": ["2 concise bullets"],
    "technologies": ["1-2 bullets naming the actual stack"],
    "hiddenExpectations": ["3 bullets inferred from the JD"]
  },
  "profile": {
    "strengths": ["4 bullets, each prefixed by a label like 'Relevant projects: ...', tied to the resume"],
    "areasToStrengthen": ["3 bullets, each prefixed by a label like 'Missing tech: ...'"],
    "discussionTopics": ["3 bullets — topics likely to come up given this candidate + role"]
  },
  "topicsToRevise": [
    { "priority": "High", "topic": "", "why": "one line", "focus": "specific sub-topics to study" }
  ],
  "technicalQuestions": [
    { "question": "", "why": "one line on why this question fits this candidate + role" }
  ],
  "behaviouralQuestions": [
    { "question": "", "why": "one line tying it to company values or the resume" }
  ],
  "interviewStrategy": {
    "introduceYourself": "2-3 sentences of tailored guidance",
    "projectsToDiscuss": ["2 bullets naming real projects from the resume"],
    "achievementsToHighlight": ["3 bullets"],
    "questionsToAsk": ["3 sharp questions the candidate should ask the interviewer"]
  },
  "salary": {
    "estimatedRange": "", "typicalForExperience": "", "demand": "", "outlook": "",
    "careerProgression": "1-2 sentences"
  },
  "checklist": [
    { "label": "", "detail": "short actionable line" }
  ]
}

Provide 5 items in topicsToRevise (mix of High/Medium/Low), 5 in technicalQuestions, 5 in behaviouralQuestions, and 8 in checklist.`;
};

// Normalise whatever the model returns into the exact shape the client renders,
// so a missing/renamed field degrades gracefully instead of breaking the PDF.
const shapeContent = (raw, job, resume) => {
  const o = raw.opportunity || {};
  const c = raw.company || {};
  const ri = raw.roleIntelligence || {};
  const p = raw.profile || {};
  const strat = raw.interviewStrategy || {};
  const sal = raw.salary || {};

  const revise = asArray(raw.topicsToRevise).map((t) => ({
    priority: ["High", "Medium", "Low"].includes(t?.priority) ? t.priority : "Medium",
    topic: asString(t?.topic),
    why: asString(t?.why),
    focus: asString(t?.focus),
  })).filter((t) => t.topic);

  const mapQ = (arr) =>
    asArray(arr).map((q) => ({ question: asString(q?.question), why: asString(q?.why) })).filter((q) => q.question);

  const checklist = asArray(raw.checklist)
    .map((i) => ({ label: asString(i?.label), detail: asString(i?.detail) }))
    .filter((i) => i.label);

  return {
    opportunity: {
      company: asString(o.company) || job.company || "",
      role: asString(o.role) || job.jobtitle || "",
      employmentType: asString(o.employmentType) || job.employmentType || "Full-time",
      location: asString(o.location) || job.location || "",
      department: asString(o.department),
      reportsTo: asString(o.reportsTo),
      purpose: asString(o.purpose),
      whyItMatters: asString(o.whyItMatters),
    },
    company: {
      whatTheyDo: asArray(c.whatTheyDo),
      howTheyThink: asArray(c.howTheyThink),
    },
    roleIntelligence: {
      successLooksLike: asArray(ri.successLooksLike),
      dailyResponsibilities: asArray(ri.dailyResponsibilities),
      keyStakeholders: asArray(ri.keyStakeholders),
      technologies: asArray(ri.technologies),
      hiddenExpectations: asArray(ri.hiddenExpectations),
    },
    profile: {
      strengths: asArray(p.strengths),
      areasToStrengthen: asArray(p.areasToStrengthen),
      discussionTopics: asArray(p.discussionTopics),
    },
    topicsToRevise: revise,
    technicalQuestions: mapQ(raw.technicalQuestions),
    behaviouralQuestions: mapQ(raw.behaviouralQuestions),
    interviewStrategy: {
      introduceYourself: asString(strat.introduceYourself),
      projectsToDiscuss: asArray(strat.projectsToDiscuss),
      achievementsToHighlight: asArray(strat.achievementsToHighlight),
      questionsToAsk: asArray(strat.questionsToAsk),
    },
    salary: {
      estimatedRange: asString(sal.estimatedRange),
      typicalForExperience: asString(sal.typicalForExperience),
      demand: asString(sal.demand),
      outlook: asString(sal.outlook),
      careerProgression: asString(sal.careerProgression),
    },
    checklist: checklist.length ? checklist : defaultChecklist(),
  };
};

const defaultChecklist = () => [
  { label: "Company research", detail: "Review sections 2–3 and hold one recent fact about the company." },
  { label: "Resume review", detail: "Reread your own resume; be ready to defend every claim." },
  { label: "Portfolio / work samples", detail: "Have relevant projects open and ready to walk through." },
  { label: "Revise topics", detail: "Cover the High-priority items in section 5." },
  { label: "Your questions", detail: "Pick two questions from section 8 to ask the interviewer." },
  { label: "Meeting setup", detail: "Test camera, mic, network, and find a quiet space." },
  { label: "Environment", detail: "Have your IDE and a notepad ready for technical rounds." },
  { label: "Dress code", detail: "Smart-casual unless told otherwise." },
];

// Deterministic fallback so the download button always yields a usable document,
// even if OpenAI is unconfigured or fails. Built purely from job + resume data.
const buildFallbackContent = (job, resume) => {
  const jobSkills = asArray(job.skills);
  const resumeSkills = asArray(resume.skills).map((s) => s.toLowerCase());
  const missing = jobSkills.filter((s) => !resumeSkills.includes(String(s).toLowerCase()));
  const matched = jobSkills.filter((s) => resumeSkills.includes(String(s).toLowerCase()));

  return {
    opportunity: {
      company: job.company || "",
      role: job.jobtitle || "",
      employmentType: job.employmentType || "Full-time",
      location: job.location || "",
      department: "",
      reportsTo: "",
      purpose: asArray(job.keyResponsibilities)[0] || "Contribute to the team's core objectives for this role.",
      whyItMatters: "This role directly supports the team's goals and the wider business.",
    },
    company: {
      whatTheyDo: job.company
        ? [`Overview: ${job.company} is the hiring organisation for this role — research their products, customers and market before the interview.`]
        : ["Overview: Research the hiring organisation's products, customers and market before the interview."],
      howTheyThink: ["Culture & values: Look up the company's stated values and recent news so you can speak to why you want to join."],
    },
    roleIntelligence: {
      successLooksLike: asArray(job.keyResponsibilities).slice(0, 3),
      dailyResponsibilities: asArray(job.keyResponsibilities).slice(0, 3),
      keyStakeholders: ["The hiring manager and immediate team named in the job description."],
      technologies: jobSkills.length ? [jobSkills.join(", ")] : [],
      hiddenExpectations: asArray(job.preferredQualifications).slice(0, 3),
    },
    profile: {
      strengths: matched.length
        ? [`Matched skills: your resume already shows ${matched.join(", ")} — core to this role.`]
        : ["Draw a clear line from your strongest past work to this role's requirements."],
      areasToStrengthen: missing.length
        ? [`Missing from your resume: ${missing.join(", ")} — appear in the job's required skills.`]
        : ["Review the job description for any requirement your resume does not yet evidence."],
      discussionTopics: ["Be ready to explain how your experience maps onto this role's responsibilities."],
    },
    topicsToRevise: (missing.length ? missing : jobSkills).slice(0, 5).map((s, i) => ({
      priority: i < 2 ? "High" : i < 4 ? "Medium" : "Low",
      topic: s,
      why: "Named in the job's required skills.",
      focus: `Refresh the fundamentals of ${s} and prepare an example of using it.`,
    })),
    technicalQuestions: jobSkills.slice(0, 5).map((s) => ({
      question: `Walk me through a time you used ${s} to solve a real problem.`,
      why: `${s} is a required skill for this role.`,
    })),
    behaviouralQuestions: [
      { question: "Tell me about a time you owned a project end-to-end.", why: "Ownership is valued in most teams." },
      { question: "Describe a time you handled competing priorities.", why: "Tests prioritisation and judgement." },
      { question: "Give an example of feedback you received and acted on.", why: "Signals growth mindset." },
      { question: "Tell me about a conflict with a teammate and how you resolved it.", why: "Tests collaboration." },
      { question: "Describe your proudest achievement and why.", why: "Lets you lead with a strength." },
    ],
    interviewStrategy: {
      introduceYourself: "Open with your most relevant experience for this role, then say why this opportunity is the right next step for you.",
      projectsToDiscuss: ["The project on your resume most relevant to this role's responsibilities."],
      achievementsToHighlight: ["A measurable result you can attach a number to.", "An example of leadership or ownership."],
      questionsToAsk: [
        "What does success look like in the first 90 days?",
        "What's the biggest challenge the team is facing right now?",
        "How is the team structured and who would I work with most closely?",
      ],
    },
    salary: {
      estimatedRange: "Research current market rates for this role and location before discussing numbers.",
      typicalForExperience: "",
      demand: "",
      outlook: "",
      careerProgression: "Ask the interviewer about growth paths from this role.",
    },
    checklist: defaultChecklist(),
  };
};

// Core: return cached content, or generate + cache it. Returns { content, generatedAt, fromCache }.
const ensurePrepContent = async (resume, job, { force = false } = {}) => {
  if (!force && resume.prepDocument?.content) {
    return { content: resume.prepDocument.content, generatedAt: resume.prepDocument.generatedAt, fromCache: true };
  }

  let content;
  try {
    const raw = parseJsonResponse(await generateTextWithRetry(buildPrompt(job, resume), PREP_MODEL));
    content = shapeContent(raw, job, resume);
  } catch (err) {
    console.error(`[zepPrep] generation failed for resume ${resume._id}, using fallback:`, err.message);
    content = buildFallbackContent(job, resume);
  }

  const generatedAt = new Date();
  await Resume.updateOne(
    { _id: resume._id },
    { $set: { "prepDocument.content": content, "prepDocument.generatedAt": generatedAt } }
  );
  return { content, generatedAt, fromCache: false };
};

// @desc   Get (or generate) the ZepPrep pack for a candidate's application
// @route  GET /api/candidate-application/prep/:applicationId?candidateId=&refresh=
export const getPrepDocument = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { candidateId, refresh } = req.query;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return res.status(400).json({ message: "Invalid application id" });
    }

    const resume = await Resume.findById(applicationId);
    if (!resume) return res.status(404).json({ message: "Application not found" });

    // If a candidateId is supplied, make sure it owns this application.
    if (candidateId) {
      if (!mongoose.Types.ObjectId.isValid(candidateId) || String(resume.candidateId) !== String(candidateId)) {
        return res.status(403).json({ message: "This application does not belong to you" });
      }
    }

    const job = await Job.findById(resume.jobId).lean();
    if (!job) return res.status(404).json({ message: "Job for this application no longer exists" });

    const { content, generatedAt, fromCache } = await ensurePrepContent(resume, job, {
      force: refresh === "true" || refresh === "1",
    });

    return res.status(200).json({
      prep: {
        meta: {
          candidateName: resume.name || "Candidate",
          role: content.opportunity.role || job.jobtitle || "",
          company: content.opportunity.company || job.company || "",
          generatedAt,
          ref: buildRef(resume._id, content.opportunity.company || job.company),
        },
        content,
      },
      fromCache,
    });
  } catch (err) {
    console.error("getPrepDocument error:", err);
    return res.status(500).json({ message: "Failed to build prep document", error: err.message });
  }
};

// Exported for reuse: kick off generation right after a candidate applies so the
// pack is usually warm by the time they click download.
export const warmPrepDocument = async (resumeId) => {
  try {
    const resume = await Resume.findById(resumeId);
    if (!resume || resume.prepDocument?.content) return;
    const job = await Job.findById(resume.jobId).lean();
    if (!job) return;
    await ensurePrepContent(resume, job);
  } catch (err) {
    console.error(`[zepPrep] warm generation failed for ${resumeId}:`, err.message);
  }
};
