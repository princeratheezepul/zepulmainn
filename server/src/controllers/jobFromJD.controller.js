import OpenAI from "openai";
import { extractTextFromPDF, extractTextFromDocx } from "./bulkUpload.controller.js";

const openai = process.env.OPENAI_API ? new OpenAI({ apiKey: process.env.OPENAI_API }) : null;

const MODEL = "gpt-4o-mini";

// A JD longer than this is truncated — the tail of a long posting is usually
// boilerplate (EEO statements, benefits blurbs) and not worth the tokens.
const MAX_JD_CHARS = 24000;
const MIN_USABLE_CHARS = 80;

const EXTRACTION_PROMPT = `You are a recruitment assistant. Read the job description below and extract it into a valid JSON object with exactly these keys:
"jobtitle" (string), "description" (string: a clear 3-5 sentence overview of the role), "location" (string), "type" (exactly one of: remote, onsite, hybrid), "employmentType" (one of: Full-time, Part-time, Contract, Internship, Freelance), "salary" (object with "min" and "max" as numbers; use 0 when not stated), "skills" (array of strings), "experience" (integer years, 0 if not stated), "keyResponsibilities" (array of strings), "preferredQualifications" (array of strings), "openpositions" (integer, default 1), "cvStrengthCutoff" (integer 0-100: the minimum CV match score a candidate should reach for this role — infer a sensible value from how senior and demanding the role is, and use 70 when you have nothing to go on).

Rules:
- Use only what the document supports. Do not invent a company, salary or location that is not there — leave those as empty strings or 0.
- Output ONLY raw JSON. No markdown, no code fences, no commentary.`;

const textFromUpload = async (file) => {
  const { mimetype, originalname = "", buffer } = file;
  const ext = originalname.toLowerCase().split(".").pop();

  if (mimetype === "application/pdf" || ext === "pdf") {
    return await extractTextFromPDF(buffer);
  }
  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    return await extractTextFromDocx(buffer);
  }
  if (mimetype?.startsWith("text/") || ext === "txt") {
    return buffer.toString("utf8");
  }
  throw new Error(`Unsupported file type: ${originalname || mimetype}`);
};

const asString = (value) => (typeof value === "string" ? value.trim() : "");
const asStringArray = (value) =>
  Array.isArray(value) ? value.map((v) => String(v).trim()).filter(Boolean) : [];
const asNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};
const asCutoff = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.min(100, Math.max(0, Math.round(num)));
};

// @desc   Read an uploaded job description (PDF/DOCX/TXT) and return structured
//         job fields for the manager to review before creating the job. This
//         only parses — creation still goes through POST /api/manager/create-job.
// @route  POST /api/manager/job-from-jd   (multipart, field: jobDescription)
export const createJobFromJD = async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ message: "OpenAI is not configured on the server" });
    }

    const upload = req.file;
    if (!upload) {
      return res.status(400).json({ message: "Please attach a job description file." });
    }

    let jdText;
    try {
      jdText = String((await textFromUpload(upload)) || "").trim();
    } catch (err) {
      return res.status(415).json({ message: err.message || "Could not read that file." });
    }

    if (jdText.length < MIN_USABLE_CHARS) {
      return res.status(422).json({
        message:
          "We couldn't read enough text from that file. If it's a scanned image, please upload a text-based PDF or a DOCX.",
      });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: EXTRACTION_PROMPT },
        { role: "user", content: jdText.slice(0, MAX_JD_CHARS) },
      ],
    });

    let parsed;
    try {
      parsed = JSON.parse(completion.choices?.[0]?.message?.content ?? "{}");
    } catch {
      return res.status(502).json({ message: "Could not understand that job description. Please try another file." });
    }

    const validTypes = ["remote", "onsite", "hybrid"];
    const type = validTypes.includes(String(parsed.type || "").toLowerCase())
      ? String(parsed.type).toLowerCase()
      : "onsite";

    return res.status(200).json({
      success: true,
      job: {
        jobtitle: asString(parsed.jobtitle),
        description: asString(parsed.description),
        location: asString(parsed.location),
        type,
        employmentType: asString(parsed.employmentType) || "Full-time",
        salary: {
          min: asNumber(parsed.salary?.min),
          max: asNumber(parsed.salary?.max),
        },
        skills: asStringArray(parsed.skills),
        experience: asNumber(parsed.experience),
        cvStrengthCutoff: asCutoff(parsed.cvStrengthCutoff),
        keyResponsibilities: asStringArray(parsed.keyResponsibilities),
        preferredQualifications: asStringArray(parsed.preferredQualifications),
        openpositions: Math.max(1, asNumber(parsed.openpositions) || 1),
      },
    });
  } catch (error) {
    console.error("job-from-jd error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
