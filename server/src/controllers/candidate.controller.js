import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import OpenAI from "openai";
import Candidate from "../models/candidate.model.js";

const openai = process.env.OPENAI_API ? new OpenAI({ apiKey: process.env.OPENAI_API }) : null;
const MODEL = "gpt-4o-mini";

// Enough text to be a resume, small enough to keep the parse affordable.
const MIN_RESUME_CHARS = 50;
const MAX_RESUME_CHARS = 60000;

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: ACCESS_TOKEN_SECRET (or JWT_SECRET) is not set. Refusing to start with an insecure default.');
}

const generateToken = (candidate) =>
  jwt.sign(
    { id: candidate._id, email: candidate.email, type: 'candidate' },
    JWT_SECRET,
    { expiresIn: "24h" }
  );

// Strip the password before sending a candidate back to the client
const sanitize = (candidate) => {
  const obj = candidate.toObject ? candidate.toObject() : { ...candidate };
  delete obj.password;
  return obj;
};

// POST /api/candidate/signup  { email, password }
export const candidateSignup = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await Candidate.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Candidate already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const candidate = await Candidate.create({ email, password: hashedPassword });

    const accessToken = generateToken(candidate);
    const user = sanitize(candidate);

    res.status(201).json({
      status: 201,
      message: "Candidate created successfully",
      data: { user, accessToken },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

// POST /api/candidate/login  { email, password }
export const candidateLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const candidate = await Candidate.findOne({ email });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const isMatch = await bcrypt.compare(password, candidate.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = generateToken(candidate);
    const user = sanitize(candidate);

    res.json({
      status: 200,
      message: "Login successful",
      data: { user, accessToken },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// PUT /api/candidate/:id/profile  { fullName, phoneNumber, address }
export const completeCandidateProfile = async (req, res) => {
  const { id } = req.params;
  const { fullName, phoneNumber, address } = req.body;
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { fullName, phoneNumber, address },
      { new: true, runValidators: true }
    );
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({
      status: 200,
      message: "Profile updated successfully",
      data: { user: sanitize(candidate) },
    });
  } catch (err) {
    res.status(500).json({ message: "Profile update failed", error: err.message });
  }
};

// GET /api/candidate/:id
export const getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).populate('resumeID');
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json({ status: 200, data: { user: sanitize(candidate) } });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch candidate", error: err.message });
  }
};

/**
 * Reads a resume into a profile shape. Unlike the recruiting-side parse this is
 * job-agnostic — it describes the candidate, not their fit for a role.
 * Returns null when the parse is unavailable; the raw text is stored regardless.
 */
const parseResumeProfile = async (text) => {
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
    const raw = completion.choices?.[0]?.message?.content || "";
    return JSON.parse(raw);
  } catch (err) {
    console.error("[candidateResume] parse failed, storing text only:", err.message);
    return null;
  }
};

// GET /api/candidate/:id/resume
export const getCandidateResume = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id).select("resume");
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    const resume = candidate.resume || {};
    res.json({
      status: 200,
      data: { resume: resume.text ? resume : null },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch resume", error: err.message });
  }
};

// PUT /api/candidate/:id/resume  { text, fileName }
// Replaces whatever resume the candidate had — this is the "update resume" path.
export const updateCandidateResume = async (req, res) => {
  const { text, fileName } = req.body || {};
  try {
    const resumeText = typeof text === "string" ? text.trim() : "";
    if (resumeText.length < MIN_RESUME_CHARS) {
      return res.status(400).json({
        message: "We couldn't read enough text from that file. Please upload a text-based PDF or DOCX.",
      });
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Best-effort: a failed parse still leaves the candidate with their resume.
    const parsed = await parseResumeProfile(resumeText);

    candidate.resume = {
      fileName: typeof fileName === "string" ? fileName.slice(0, 200) : "",
      text: resumeText.slice(0, MAX_RESUME_CHARS),
      parsed,
      updatedAt: new Date(),
    };
    await candidate.save();

    res.json({
      status: 200,
      message: parsed ? "Resume updated" : "Resume saved (details couldn't be read automatically)",
      data: { resume: candidate.resume, user: sanitize(candidate) },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update resume", error: err.message });
  }
};
