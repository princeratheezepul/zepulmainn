/**
 * Where a candidate's own resume lives.
 *
 * It is stored in two places, deliberately:
 *  - ResumeDataRaw holds the raw extracted text under `rawText` — the same shape
 *    the resume-data pipeline already writes — and `candidate.resumeID` points at
 *    it. This is the durable copy, and the one other parts of the system can
 *    reach through the reference that was already on the model.
 *  - `candidate.resume` holds the AI reading of that text plus the filename, so
 *    the profile panel and dashboard can render a resume without a second lookup
 *    or a second parse.
 *
 * Everything that accepts a resume from a candidate — signing up, completing a
 * profile, replacing it later — goes through `saveCandidateResume`, so the two
 * copies cannot drift apart.
 */

import OpenAI from "openai";
import ResumeDataRaw from "../models/resumeDataRaw.model.js";

const openai = process.env.OPENAI_API ? new OpenAI({ apiKey: process.env.OPENAI_API }) : null;
const MODEL = "gpt-4o-mini";

// Enough text to be a resume, small enough to keep the parse affordable.
export const MIN_RESUME_CHARS = 50;
export const MAX_RESUME_CHARS = 60000;

export const TOO_SHORT_MESSAGE =
  "We couldn't read enough text from that file. Please upload a text-based PDF or DOCX.";

/** Normalises and length-checks incoming resume text. Returns "" if unusable. */
export const readResumeText = (text) => {
  const trimmed = typeof text === "string" ? text.trim() : "";
  return trimmed.length >= MIN_RESUME_CHARS ? trimmed.slice(0, MAX_RESUME_CHARS) : "";
};

/**
 * Reads a resume into a profile shape. Unlike the recruiting-side parse this is
 * job-agnostic — it describes the candidate, not their fit for a role.
 * Returns null when the parse is unavailable; the raw text is stored regardless.
 */
export const parseResumeProfile = async (text) => {
  if (!openai) return null;
  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You extract a candidate profile from resume text. Report only what the resume states — never invent employers, dates, or qualifications. Output ONLY a valid JSON object.",
        },
        {
          role: "user",
          content: `Extract this resume into JSON with exactly these keys:
{
  "name": "Full name, or empty string",
  "title": "Current or most recent professional title",
  "email": "", "phone": "", "location": "",
  "experienceYears": 0,
  "about": "2-3 sentence professional summary drawn from the resume",
  "skills": ["technical skills"],
  "experience": [{ "title": "", "company": "", "duration": "", "points": ["responsibilities and achievements"] }],
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "projects": [{ "title": "", "points": [""] }],
  "certifications": [""],
  "languages": [""]
}
Use an empty string or empty array for anything the resume doesn't state.

Resume text:
---
${text.slice(0, MAX_RESUME_CHARS)}
---`,
        },
      ],
    });
    return JSON.parse(completion.choices?.[0]?.message?.content || "");
  } catch (err) {
    console.error("[candidateResume] parse failed, storing text only:", err.message);
    return null;
  }
};

/**
 * Stores `text` as this candidate's resume, replacing whatever was there.
 *
 * Mutates and saves `candidate`. The raw copy is updated in place when one
 * already exists so a candidate accumulates one ResumeDataRaw document rather
 * than one per upload. A failed AI parse is not fatal: the candidate still ends
 * up with their resume, just without the structured reading of it.
 */
export const saveCandidateResume = async (candidate, { text, fileName = "" } = {}) => {
  const resumeText = readResumeText(text);
  if (!resumeText) {
    const err = new Error(TOO_SHORT_MESSAGE);
    err.code = "RESUME_TOO_SHORT";
    throw err;
  }

  const safeFileName = typeof fileName === "string" ? fileName.slice(0, 200) : "";

  const rawPayload = {
    rawText: resumeText,
    fileName: safeFileName,
    candidateId: candidate._id,
    source: "candidate",
    uploadedAt: new Date(),
  };

  let rawDoc = null;
  if (candidate.resumeID) {
    rawDoc = await ResumeDataRaw.findByIdAndUpdate(candidate.resumeID, rawPayload, { new: true });
  }
  // No reference yet, or it pointed at a document that has since been removed.
  if (!rawDoc) {
    rawDoc = await ResumeDataRaw.create(rawPayload);
  }

  const parsed = await parseResumeProfile(resumeText);

  candidate.resumeID = rawDoc._id;
  candidate.resume = {
    fileName: safeFileName,
    text: resumeText,
    parsed,
    updatedAt: new Date(),
  };
  await candidate.save();

  return { resume: candidate.resume, rawResumeId: rawDoc._id, parsed };
};
