import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Candidate from "../models/candidate.model.js";
import {
  saveCandidateResume,
  readResumeText,
  TOO_SHORT_MESSAGE,
} from "../services/candidateResume.service.js";

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

// Identity only. The resume text and its parse run to tens of thousands of
// characters, and the client keeps this object in localStorage — the resume is
// served by its own endpoint instead.
const sanitizeIdentity = (candidate) => {
  const obj = sanitize(candidate);
  if (obj.resume) {
    obj.resume = {
      fileName: obj.resume.fileName || "",
      updatedAt: obj.resume.updatedAt || null,
      hasResume: Boolean(obj.resume.text),
    };
  }
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
    const user = sanitizeIdentity(candidate);

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
    const user = sanitizeIdentity(candidate);

    res.json({
      status: 200,
      message: "Login successful",
      data: { user, accessToken },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// PUT /api/candidate/:id/profile  { fullName, phoneNumber, address, resumeText?, resumeFileName? }
export const completeCandidateProfile = async (req, res) => {
  const { id } = req.params;
  const { fullName, phoneNumber, address, resumeText, resumeFileName } = req.body;
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { fullName, phoneNumber, address },
      { new: true, runValidators: true }
    );
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // The resume is optional here so a candidate is never locked out of their
    // own profile by a file we couldn't read — but when one is sent it is stored
    // the same way as any later upload.
    let resumeSaved = false;
    if (typeof resumeText === "string" && resumeText.trim()) {
      if (!readResumeText(resumeText)) {
        return res.status(400).json({ message: TOO_SHORT_MESSAGE });
      }
      await saveCandidateResume(candidate, { text: resumeText, fileName: resumeFileName });
      resumeSaved = true;
    }

    res.json({
      status: 200,
      message: "Profile updated successfully",
      data: { user: sanitizeIdentity(candidate), resumeSaved },
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
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const { resume, parsed } = await saveCandidateResume(candidate, { text, fileName });

    res.json({
      status: 200,
      message: parsed ? "Resume updated" : "Resume saved (details couldn't be read automatically)",
      data: { resume, user: sanitizeIdentity(candidate) },
    });
  } catch (err) {
    if (err.code === "RESUME_TOO_SHORT") {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Failed to update resume", error: err.message });
  }
};
