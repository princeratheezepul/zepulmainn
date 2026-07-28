import mongoose from "mongoose";
import Resume from "../models/resume.model.js";
import { Job } from "../models/job.model.js";
import { generateTextWithRetry } from "./bulkUpload.controller.js";

/**
 * Candidate Success Blueprint — the post-evaluation ZepPrep.
 *
 * Generated once a candidate has completed the AI interview (and coding test, if
 * the role required one). Unlike the apply-time prep pack, this draws on the
 * interview and coding EVIDENCE already on the Resume doc to prepare the candidate
 * for their upcoming CLIENT interviews.
 *
 * The manager downloads it (next to the scorecard), but the document is written
 * TO the candidate. So, like the scorecard's candidate-facing cousins, it carries
 * NO numeric scores, NO ratings and NO hiring recommendation — strengths and gaps
 * are expressed as evidence and preparation opportunities, never as a verdict.
 *
 * Result is cached on `resume.blueprintDocument` so re-downloads are instant.
 */

const BLUEPRINT_MODEL = "gpt-4o-mini";
const MAX_RESUME_CHARS = 5000;

const parseJsonResponse = (text) => {
  const cleaned = String(text || "").replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return a JSON object");
  return JSON.parse(cleaned.substring(start, end + 1));
};

const asArray = (v) => (Array.isArray(v) ? v.filter((x) => x != null && String(x).trim()) : []);
const asString = (v) => (typeof v === "string" ? v.trim() : "");

const buildRef = (resumeId, company) => {
  const idPart = String(resumeId).slice(-4).toUpperCase();
  const co = (company || "ZEP").replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4).padEnd(4, "X");
  return `ZB-${idPart}-${co}`;
};

// Has the candidate actually completed the AI interview?
export const hasInterviewEvidence = (resume) =>
  Array.isArray(resume?.interviewEvaluation?.evaluationResults) &&
  resume.interviewEvaluation.evaluationResults.length > 0;

// Compress the interview transcript for the prompt. Scores are included so the
// model can tell strengths from gaps, but the OUTPUT is told never to surface them.
const summariseInterview = (resume) => {
  const results = asArray(resume?.interviewEvaluation?.evaluationResults);
  if (!results.length) return "No AI interview on record.";
  const lines = results.slice(0, 8).map((r, i) => {
    const q = asString(r.question) || `Question ${i + 1}`;
    const summary = asString(r.summary) || asString(r.answer).slice(0, 160);
    const reason = asString(r.reason);
    const strong = typeof r.score === "number" ? (r.score >= 8 ? "strong" : r.score >= 7 ? "adequate" : "weak") : "";
    return `- Q: ${q}\n  Candidate: ${summary}${reason ? `\n  Note: ${reason}` : ""}${strong ? `\n  (internal: ${strong})` : ""}`;
  });
  const bullets = asArray(resume?.interviewEvaluation?.aiInterviewSummary);
  return `${lines.join("\n")}${bullets.length ? `\nOverall interview notes:\n${bullets.map((b) => `- ${b}`).join("\n")}` : ""}`;
};

const summariseCoding = (resume) => {
  const oa = resume?.oa;
  if (!oa?.evaluation && !(oa?.questions?.length)) return "No coding assessment on record.";
  const ev = oa.evaluation || {};
  const topics = asArray(oa.questions).map((q) => asString(q.title)).filter(Boolean);
  return [
    topics.length ? `Problems attempted: ${topics.join("; ")}` : "",
    asString(ev.feedback) ? `Feedback: ${ev.feedback}` : "",
    asString(ev.complexityAnalysis) ? `Complexity: ${ev.complexityAnalysis}` : "",
    asString(ev.improvementSuggestions) ? `To improve: ${ev.improvementSuggestions}` : "",
  ].filter(Boolean).join("\n") || "Coding assessment completed.";
};

const buildPrompt = (job, resume) => {
  const resumeText = (resume.raw_text || "").slice(0, MAX_RESUME_CHARS);
  return `You are a senior career coach writing a "Candidate Success Blueprint" for a candidate who has just completed Zepul's evaluation (an AI interview${resume?.oa?.evaluation ? " and a coding assessment" : ""}) and will now face CLIENT interviews. The document is addressed TO THE CANDIDATE and is warm and encouraging.

ABSOLUTE RULES:
- NEVER include numeric scores, ratings, percentages, pass/fail, or any hiring recommendation.
- In "Your Evaluation Highlights", present gaps ONLY as preparation opportunities, never as failures.
- Every strength you list must reference concrete evidence from the resume, the coding assessment, or the AI interview.
- Nothing generic: no boilerplate learning lists; tie everything to THIS candidate, THIS role and THIS company.

=== THE JOB ===
Company: ${job.company || "(not specified — infer the industry from the role)"}
Role: ${job.jobtitle || ""}
Location: ${job.location || ""} ${job.type ? `(${job.type})` : ""}
Required skills: ${asArray(job.skills).join(", ") || "see description"}
Key responsibilities: ${asArray(job.keyResponsibilities).join(" | ") || "see description"}
Description:
"""
${job.description || ""}
"""

=== EVALUATION EVIDENCE ===
Detected skills: ${asArray(resume.skills).join(", ") || "see resume"}
Noted strengths: ${asArray(resume.keyStrength).join(" | ") || "derive from evidence"}
Noted concerns (for YOUR reasoning only — reframe as opportunities): ${asArray(resume.potentialConcern).join(" | ") || "none recorded"}
AI interview:
${summariseInterview(resume)}
Coding assessment:
${summariseCoding(resume)}
Resume:
"""
${resumeText}
"""

Return ONLY this JSON, no markdown:
{
  "congratulations": "2-3 warm sentences congratulating the candidate on completing the Zepul evaluation and introducing this blueprint for their client interviews",
  "companyIntelligence": {
    "overview": ["4 bullets: company overview, products, industry, recent developments — each prefixed like 'Overview: ...'"],
    "operating": ["4 bullets: leadership, culture, work environment, growth strategy — each prefixed like 'Leadership: ...'"]
  },
  "roleIntelligence": {
    "teamStructure": ["1-2 bullets"],
    "responsibilities": ["2-3 bullets"],
    "successMetrics": ["2 bullets"],
    "technologies": ["1-2 bullets naming the stack"],
    "stakeholders": ["1-2 bullets"],
    "businessImpact": ["1-2 bullets"]
  },
  "evaluation": {
    "strengths": ["4 bullets — each prefixed by a label AND citing evidence, e.g. 'Problem solving: ... (AI interview)' or 'Technical depth: ... (coding assessment)'"],
    "areasToRevisit": ["3 bullets — framed as preparation opportunities, each naming the topic and why a quick refresh helps"]
  },
  "clientGuidance": {
    "interviewersExplore": ["3 bullets on what client interviewers are likely to probe"],
    "projectsToHighlight": ["2 bullets naming real projects/work from the resume"],
    "experiencesToEmphasise": ["2 bullets"],
    "topicsToPrepare": ["2 bullets"]
  },
  "technicalRefresh": [
    { "topic": "", "why": "why it may come up, tied to the evaluation", "focus": "what specifically to review" }
  ],
  "behavioural": {
    "approach": "2 sentences on structuring answers (e.g. the STAR method) tailored to this candidate",
    "points": ["5 behavioural preparation POINTS written as plain statements, NOT questions — each tells the candidate which story or quality to be ready to demonstrate, tied to their evidence"]
  },
  "practicePoints": ["5 personalised practice POINTS written as plain statements, NOT questions — each names a topic or scenario to rehearse that resembles what the client will probe, tied to the resume, JD, company and interview"],
  "compensation": {
    "estimatedRange": "indicative range for this role and location",
    "marketBenchmark": "one line on current market rates",
    "offerEvaluationTips": ["2 bullets"]
  },
  "checklist": [ { "label": "", "detail": "short actionable line" } ]
}

Provide 4 items in technicalRefresh, 5 in behavioural.points, 5 in practicePoints, and 6 in checklist.`;
};

const mapTopicList = (arr) =>
  asArray(arr)
    .map((t) => ({ topic: asString(t?.topic), why: asString(t?.why), focus: asString(t?.focus) }))
    .filter((t) => t.topic);

const defaultChecklist = () => [
  { label: "Company research", detail: "Review sections 2–3; hold one recent fact about the company." },
  { label: "Resume review", detail: "Reread your resume; be ready to expand on every project." },
  { label: "Key projects", detail: "Have your headline projects ready to walk through in depth." },
  { label: "Questions to ask", detail: "Prepare two questions for the client interviewer." },
  { label: "Interview setup", detail: "Test camera, mic and network; find a quiet space." },
  { label: "Documentation", detail: "Keep your ID, portfolio and any references handy." },
];

const shapeContent = (raw, job, resume) => {
  const ci = raw.companyIntelligence || {};
  const ri = raw.roleIntelligence || {};
  const ev = raw.evaluation || {};
  const cg = raw.clientGuidance || {};
  const beh = raw.behavioural || {};
  const comp = raw.compensation || {};

  const checklist = asArray(raw.checklist)
    .map((i) => ({ label: asString(i?.label), detail: asString(i?.detail) }))
    .filter((i) => i.label);

  return {
    congratulations:
      asString(raw.congratulations) ||
      "Congratulations on completing the Zepul evaluation. This blueprint is here to help you approach your upcoming client interviews with confidence.",
    companyIntelligence: {
      overview: asArray(ci.overview),
      operating: asArray(ci.operating),
    },
    roleIntelligence: {
      teamStructure: asArray(ri.teamStructure),
      responsibilities: asArray(ri.responsibilities),
      successMetrics: asArray(ri.successMetrics),
      technologies: asArray(ri.technologies),
      stakeholders: asArray(ri.stakeholders),
      businessImpact: asArray(ri.businessImpact),
    },
    evaluation: {
      strengths: asArray(ev.strengths),
      areasToRevisit: asArray(ev.areasToRevisit),
    },
    clientGuidance: {
      interviewersExplore: asArray(cg.interviewersExplore),
      projectsToHighlight: asArray(cg.projectsToHighlight),
      experiencesToEmphasise: asArray(cg.experiencesToEmphasise),
      topicsToPrepare: asArray(cg.topicsToPrepare),
    },
    technicalRefresh: mapTopicList(raw.technicalRefresh),
    behavioural: {
      approach: asString(beh.approach),
      points: asArray(beh.points),
    },
    practicePoints: asArray(raw.practicePoints),
    compensation: {
      estimatedRange: asString(comp.estimatedRange),
      marketBenchmark: asString(comp.marketBenchmark),
      offerEvaluationTips: asArray(comp.offerEvaluationTips),
    },
    checklist: checklist.length ? checklist : defaultChecklist(),
  };
};

// Deterministic fallback built from resume + evaluation data, so a download always
// yields a usable document even if the model is unavailable.
const buildFallbackContent = (job, resume) => {
  const jobSkills = asArray(job.skills);
  const resumeSkills = asArray(resume.skills).map((s) => s.toLowerCase());
  const missing = jobSkills.filter((s) => !resumeSkills.includes(String(s).toLowerCase()));
  const improve = asString(resume?.oa?.evaluation?.improvementSuggestions);
  const weakInterview = asArray(resume?.interviewEvaluation?.evaluationResults)
    .filter((r) => typeof r.score === "number" && r.score < 8)
    .map((r) => asString(r.question))
    .filter(Boolean);

  return {
    congratulations:
      "Congratulations on completing the Zepul evaluation process. This personalised blueprint has been prepared to help you confidently approach your upcoming client interviews.",
    companyIntelligence: {
      overview: [
        job.company
          ? `Overview: ${job.company} is the client for this role — research their products, market and customers before the interview.`
          : "Overview: Research the client's products, market and customers before the interview.",
      ],
      operating: ["Culture: Look up the company's values, leadership and recent news so you can speak to why you want to join."],
    },
    roleIntelligence: {
      teamStructure: [],
      responsibilities: asArray(job.keyResponsibilities).slice(0, 3),
      successMetrics: [],
      technologies: jobSkills.length ? [jobSkills.join(", ")] : [],
      stakeholders: [],
      businessImpact: [],
    },
    evaluation: {
      strengths: asArray(resume.keyStrength).length
        ? asArray(resume.keyStrength).map((s) => `Strength: ${s}`)
        : ["Strength: You completed the full Zepul evaluation, including the AI interview — evidence of your commitment and communication."],
      areasToRevisit: [
        ...(missing.length ? [`Opportunity: Brush up on ${missing.join(", ")} — listed in the role's required skills.`] : []),
        ...(improve ? [`Opportunity: ${improve}`] : []),
      ].slice(0, 3),
    },
    clientGuidance: {
      interviewersExplore: ["Expect a deep dive into your most relevant recent experience for this role."],
      projectsToHighlight: ["The project on your resume most relevant to this role."],
      experiencesToEmphasise: ["Experience that maps directly onto the role's core responsibilities."],
      topicsToPrepare: missing.length ? [`A quick refresher on ${missing[0]}.`] : ["The role's core requirements."],
    },
    technicalRefresh: (missing.length ? missing : jobSkills).slice(0, 4).map((s) => ({
      topic: s,
      why: "Relevant to the role's required skills.",
      focus: `Refresh the fundamentals of ${s} and prepare a concrete example.`,
    })),
    behavioural: {
      approach: "Structure your answers with the STAR method — Situation, Task, Action, Result — and lead with the result.",
      points: (weakInterview.length
        ? weakInterview.slice(0, 2).map((q) => `Be ready to expand on your response about "${q}" with a concrete example and a measurable outcome.`)
        : []
      ).concat([
        "Prepare a story that shows you owning a project end-to-end, leading with the result you drove.",
        "Have an example of overcoming a challenge with a team, highlighting collaboration and communication.",
        "Be ready to describe a decision you made under pressure and the judgement behind it.",
      ]).slice(0, 5),
    },
    practicePoints: jobSkills.slice(0, 5).map(
      (s) => `Rehearse how you have applied ${s} in a real project, with a specific example and outcome.`
    ),
    compensation: {
      estimatedRange: "Research current market rates for this role and location before discussing numbers.",
      marketBenchmark: "",
      offerEvaluationTips: ["Weigh growth and learning alongside compensation.", "Clarify role expectations and progression before accepting."],
    },
    checklist: defaultChecklist(),
  };
};

const ensureBlueprintContent = async (resume, job, { force = false } = {}) => {
  if (!force && resume.blueprintDocument?.content) {
    return { content: resume.blueprintDocument.content, generatedAt: resume.blueprintDocument.generatedAt, fromCache: true };
  }

  let content;
  try {
    const raw = parseJsonResponse(await generateTextWithRetry(buildPrompt(job, resume), BLUEPRINT_MODEL));
    content = shapeContent(raw, job, resume);
  } catch (err) {
    console.error(`[blueprint] generation failed for resume ${resume._id}, using fallback:`, err.message);
    content = buildFallbackContent(job, resume);
  }

  const generatedAt = new Date();
  await Resume.updateOne(
    { _id: resume._id },
    { $set: { "blueprintDocument.content": content, "blueprintDocument.generatedAt": generatedAt } }
  );
  return { content, generatedAt, fromCache: false };
};

// @desc   Get (or generate) the Candidate Success Blueprint for an evaluated candidate
// @route  GET /api/manager/resumes/:resumeId/blueprint?refresh=
export const getBlueprintDocument = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { refresh } = req.query;

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: "Invalid resume id" });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) return res.status(404).json({ message: "Candidate not found" });

    if (!hasInterviewEvidence(resume)) {
      return res.status(409).json({
        message: "The blueprint is available once the candidate has completed the AI interview.",
      });
    }

    const job = await Job.findById(resume.jobId).lean();
    if (!job) return res.status(404).json({ message: "Job for this candidate no longer exists" });

    const { content, generatedAt, fromCache } = await ensureBlueprintContent(resume, job, {
      force: refresh === "true" || refresh === "1",
    });

    return res.status(200).json({
      blueprint: {
        meta: {
          candidateName: resume.name || "Candidate",
          role: job.jobtitle || "",
          company: job.company || "",
          generatedAt,
          ref: buildRef(resume._id, job.company),
        },
        content,
      },
      fromCache,
    });
  } catch (err) {
    console.error("getBlueprintDocument error:", err);
    return res.status(500).json({ message: "Failed to build blueprint", error: err.message });
  }
};
