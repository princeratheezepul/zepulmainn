import mongoose from "mongoose";
import Resume from "../models/resume.model.js";
import ResumeDataRaw from "../models/resumeDataRaw.model.js";
import { Job } from "../models/job.model.js";
import { determineResumeTag } from "../utils/tagHelper.js";
import {
  analyzeResume,
  calculateATSScore,
  generateTextWithRetry,
  extractTextFromPDF,
  extractTextFromDocx,
} from "./bulkUpload.controller.js";

/**
 * Admin one-shot scorecard generation.
 *
 * Upload a resume + a job id and this builds the complete scorecard through the
 * OpenAI API and submits it to the job. Nothing is ever sent to the candidate:
 * we write the Resume document directly rather than going through
 * saveResumeWithJob (which fires the coding-test email/WhatsApp notifier), so no
 * coding-test or interview link is generated or delivered.
 *
 * When `includeCoding` is false the `oa` block is left unset, which is what makes
 * the client hide the coding section (getCodingBreakdown needs oa.evaluation.score).
 */

const INTERVIEW_QUESTION_COUNT = 6;
const MIN_SCORE = 75;
const MAX_SCORE = 85;

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Per-question interview scores (0-10) plus the headline percentage.
 *
 * The percentage is derived FROM the scores rather than picked independently, so
 * `score` always equals round(mean * 10) — the number the scorecard UI and PDF
 * each compute their own way. Picking the total first is what keeps every view
 * agreeing; with 6 questions every total in [45, 51] lands inside [75, 85].
 */
const buildInterviewScores = (n = INTERVIEW_QUESTION_COUNT) => {
  const sum = randInt(Math.ceil((MIN_SCORE * n) / 10), Math.floor((MAX_SCORE * n) / 10));
  const base = Math.floor(sum / n);
  const remainder = sum - base * n;
  const scores = Array.from({ length: n }, (_, i) => (i < remainder ? base + 1 : base));
  return { scores, pct: Math.round((sum / n) * 10) };
};

const parseJsonResponse = (text) => {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return a JSON object");
  return JSON.parse(cleaned.substring(start, end + 1));
};

const band = (score) => (score >= 83 ? "excellent" : score >= 79 ? "strong" : "solid");

const generateInterviewEvaluation = async (resumeText, job, scores, pct) => {
  const prompt = `You are an expert technical interviewer writing up a completed AI interview for a candidate.

JOB
Title: ${job.jobtitle}
Description: ${job.description || ""}
Required skills: ${(job.skills || []).join(", ") || "See description"}

RESUME
---
${resumeText}
---

The interview had exactly ${scores.length} questions. These per-question scores are FIXED and you must write to them, in this order:
${scores.map((s, i) => `Q${i + 1}: ${s}/10`).join("\n")}
The average is ${(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)}/10, an overall interview score of ${pct}/100 — a ${band(pct)} performance.

Write questions that a hiring panel would genuinely ask for THIS job, grounded in THIS candidate's real background. For each question write a realistic first-person answer (60-130 words) that reuses the candidate's actual employers, tools, projects and metrics from the resume. Do not invent employers, numbers or skills the resume does not support.

Each question's "reason" must justify its exact score: 9-10 = excellent, 8 = strong (name the specific thing that kept it from excellent), 7 = solid but with a clear gap, 6 or below = weak. The overall write-up must read consistently with ${pct}/100 — do not describe a ${pct}/100 interview as flawless or as poor.

Return ONLY this JSON (no markdown):
{
  "interview": [
    { "question": "...", "answer": "...", "reason": "...", "summary": "one-line summary of the answer" }
  ],
  "aiInterviewSummary": ["5-6 crisp bullets summarising overall interview performance, specific and consistent with ${pct}/100"]
}`;

  const parsed = parseJsonResponse(await generateTextWithRetry(prompt));
  const items = Array.isArray(parsed.interview) ? parsed.interview : [];

  const evaluationResults = scores.map((score, i) => {
    const item = items[i] || {};
    return {
      question: item.question || `Interview question ${i + 1}`,
      answer: item.answer || "",
      score,
      reason: item.reason || "",
      summary: item.summary || "",
      confidence: score >= 8 ? "High" : "Medium",
    };
  });

  const aiInterviewSummary = Array.isArray(parsed.aiInterviewSummary)
    ? parsed.aiInterviewSummary.filter((b) => typeof b === "string" && b.trim())
    : [];

  return { evaluationResults, aiInterviewSummary };
};

const generateCodingEvaluation = async (resumeText, job, score) => {
  const prompt = `You are an expert engineer writing up a completed coding assessment for a candidate.

JOB
Title: ${job.jobtitle}
Description: ${job.description || ""}
Required skills: ${(job.skills || []).join(", ") || "See description"}

RESUME
---
${resumeText}
---

The candidate scored ${score}/100 on the coding assessment — a ${band(score)} result. Write the assessment up so every word is consistent with ${score}/100: a ${score}/100 submission is competent and working but is NOT flawless, so the feedback must name real, specific weaknesses alongside the strengths.

Produce 3 coding problems appropriate to this role and to the candidate's actual stack from their resume.

Return ONLY this JSON (no markdown):
{
  "questions": [
    { "title": "...", "description": "...", "difficulty": "Easy|Medium|Hard", "constraints": "..." }
  ],
  "feedback": "2-3 sentences on how the candidate performed overall, consistent with ${score}/100",
  "complexityAnalysis": "1-2 sentences on the time/space complexity of their solutions",
  "improvementSuggestions": "1-2 sentences naming concrete things they should improve"
}`;

  const parsed = parseJsonResponse(await generateTextWithRetry(prompt));
  const questions = (Array.isArray(parsed.questions) ? parsed.questions : []).map((q) => ({
    title: q.title || "",
    description: q.description || "",
    difficulty: q.difficulty || "Medium",
    constraints: q.constraints || "",
  }));

  return {
    // scheduled/evaluated so the scorecard renders a completed assessment; no
    // assessmentId is ever set, so no test link exists or can be surfaced.
    scheduled: true,
    status: "evaluated",
    completionDate: new Date(),
    questions,
    evaluation: {
      score,
      pass: score >= 70,
      feedback: parsed.feedback || "",
      complexityAnalysis: parsed.complexityAnalysis || "",
      improvementSuggestions: parsed.improvementSuggestions || "",
    },
  };
};

// @desc  Generate a full scorecard from an uploaded resume + job id and submit it to the job
// @route POST /api/admin/generate-scorecard   (multipart: file, jobId, includeCoding)
export const generateScorecard = async (req, res) => {
  try {
    const { jobId } = req.body;
    const includeCoding = req.body.includeCoding === true || req.body.includeCoding === "true";
    const file = req.file;

    if (!file) return res.status(400).json({ message: "Resume file is required" });
    if (!jobId) return res.status(400).json({ message: "jobId is required" });
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(400).json({ message: "Invalid jobId format" });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // 1. Resume file -> raw text
    let rawText;
    if (file.mimetype === "application/pdf") {
      rawText = await extractTextFromPDF(file.buffer);
    } else if (
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      rawText = await extractTextFromDocx(file.buffer);
    } else {
      return res.status(400).json({ message: "Unsupported file format. Upload a PDF or DOCX." });
    }

    // 2. Persist the raw resume content
    const rawDoc = await ResumeDataRaw.create({
      rawText,
      fileName: file.originalname,
      jobId,
      source: "admin-generate-scorecard",
    });

    // 3. AI analysis + ATS scoring (OpenAI)
    const [analysis, atsResult] = await Promise.all([
      analyzeResume(rawText, job),
      calculateATSScore(rawText, job),
    ]);

    // 4. Interview (always) + coding (only when the admin ticked the box)
    const { scores, pct: interviewPct } = buildInterviewScores();
    const codingScore = includeCoding ? randInt(MIN_SCORE, MAX_SCORE) : null;

    const [interview, oa] = await Promise.all([
      generateInterviewEvaluation(rawText, job, scores, interviewPct),
      includeCoding ? generateCodingEvaluation(rawText, job, codingScore) : Promise.resolve(null),
    ]);

    // 5. Assemble and save. Written directly rather than via saveResumeWithJob so
    //    the coding-test notifier never fires — nothing reaches the candidate.
    const resumeDoc = {
      jobId,
      tag: determineResumeTag(job.jobtitle, job.description),
      ...(job.managerId ? { managerId: job.managerId } : {}),
      ...(job.assignedRecruiters?.length ? { recruiterId: job.assignedRecruiters[0] } : {}),

      name: analysis.name,
      title: analysis.title,
      email: analysis.email,
      phone: analysis.phone,
      experience: analysis.experience,
      location: analysis.location,
      skills: analysis.skills,
      about: analysis.about,

      ats_score: atsResult.ats_score,
      overallScore: atsResult.ats_score,
      ats_reason: atsResult.ats_reason,
      ats_breakdown: atsResult.ats_breakdown,
      aiSummary: analysis.aiSummary,
      aiScorecard: analysis.aiScorecard,
      recommendation: analysis.recommendation,
      keyStrength: analysis.keyStrength,
      potentialConcern: analysis.potentialConcern,
      applicationDetails: {
        ...(analysis.applicationDetails || {}),
        position: job.jobtitle,
        source: "Admin Scorecard Generator",
      },
      raw_text: rawText,

      interviewScheduled: true,
      interviewEvaluation: {
        evaluationResults: interview.evaluationResults,
        questions: interview.evaluationResults.map((r, i) => ({
          category: `Q${i + 1}`,
          text: r.question,
        })),
        answers: Object.fromEntries(interview.evaluationResults.map((r, i) => [`q${i + 1}`, r.answer])),
        aiInterviewSummary: interview.aiInterviewSummary,
        evaluatedAt: new Date(),
      },
      score: interviewPct,
      totalscore: 100,

      ...(oa ? { oa } : {}),
      status: "screening",
    };

    const saved = await new Resume(resumeDoc).save();

    // Mongoose materialises `oa`/`avaloqOa` from their schema defaults even when we
    // never set them; strip them so an interview-only scorecard has no coding trace.
    if (!includeCoding) {
      await Resume.updateOne({ _id: saved._id }, { $unset: { oa: "", avaloqOa: "" } });
    } else {
      await Resume.updateOne({ _id: saved._id }, { $unset: { avaloqOa: "" } });
    }

    await ResumeDataRaw.findByIdAndUpdate(rawDoc._id, { resumeId: saved._id });
    await Job.findByIdAndUpdate(jobId, { $inc: { totalApplication_number: 1 } });

    return res.status(201).json({
      success: true,
      message: "Scorecard generated and submitted to the job",
      resumeId: saved._id,
      rawTextId: rawDoc._id,
      scorecard: {
        name: saved.name,
        title: saved.title,
        email: saved.email,
        jobTitle: job.jobtitle,
        cvScore: saved.overallScore,
        interviewScore: interviewPct,
        codingScore,
        includeCoding,
        recommendation: saved.recommendation,
        interviewQuestions: interview.evaluationResults.length,
      },
      // Everything the client needs to render (and download) the full scorecard,
      // in the same shape the on-screen scorecard components already consume.
      fullResume: {
        name: saved.name,
        title: saved.title,
        email: saved.email,
        phone: saved.phone,
        experience: saved.experience,
        location: saved.location,
        skills: saved.skills || [],
        overallScore: saved.overallScore,
        score: saved.score,
        keyStrength: saved.keyStrength || [],
        potentialConcern: saved.potentialConcern || [],
        aiSummary: saved.aiSummary || {},
        interviewEvaluation: {
          evaluationResults: interview.evaluationResults.map((r) => ({
            question: r.question,
            answer: r.answer,
            score: r.score,
            summary: r.summary,
          })),
          aiInterviewSummary: interview.aiInterviewSummary,
        },
        includeCoding,
        codingScore,
        oa: oa
          ? {
              evaluation: oa.evaluation,
              questionCount: (oa.questions || []).length,
            }
          : null,
        appDate: new Date().toLocaleDateString(),
      },
    });
  } catch (err) {
    console.error("Error generating scorecard:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate scorecard",
      error: err.message,
    });
  }
};
