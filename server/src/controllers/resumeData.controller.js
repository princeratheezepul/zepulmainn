import ResumeData from "../models/resumeData.model.js";
import Scorecard from "../models/scorecard.model.js";

/**
 * Build a single searchable text string from all resume content.
 * This enables MongoDB full-text search across the entire resume.
 */
const buildSearchableText = (data) => {
    const parts = [];

    if (data.name) parts.push(data.name);
    if (data.role) parts.push(data.role);

    // Projects
    if (data.projects) {
        data.projects.forEach(p => {
            if (p.title) parts.push(p.title);
            if (p.points) parts.push(...p.points);
        });
    }

    // Experience
    if (data.experience) {
        data.experience.forEach(e => {
            if (e.title) parts.push(e.title);
            if (e.company) parts.push(e.company);
            if (e.duration) parts.push(e.duration);
            if (e.points) parts.push(...e.points);
        });
    }

    // Achievements
    if (data.achievements?.points) {
        parts.push(...data.achievements.points);
    }

    // Skills
    if (data.skills?.points) {
        parts.push(...data.skills.points);
    }

    // Education
    if (data.education) {
        data.education.forEach(e => {
            if (e.institution) parts.push(e.institution);
            if (e.degree) parts.push(e.degree);
            if (e.points) parts.push(...e.points);
        });
    }

    return parts.filter(Boolean).join(' ');
};

/**
 * Build a flat lowercased array of skills for efficient $in queries.
 */
const buildSearchableSkills = (data) => {
    const skills = [];
    if (data.skills?.points) {
        data.skills.points.forEach(s => {
            if (s) skills.push(s.toLowerCase().trim());
        });
    }
    return skills;
};

// POST /api/resume-data/save
export const saveResumeData = async (req, res) => {
    try {
        console.log("Received request to save resume data:", req.body);
        const { name, role, experienceYears, projects, experience, achievements, skills, education, scorecardId } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        // Auto-compute search-optimized fields
        const searchableText = buildSearchableText(req.body);
        const searchableSkills = buildSearchableSkills(req.body);

        const resumeData = new ResumeData({
            name,
            role: role || '',
            experienceYears: experienceYears || 0,
            projects,
            experience,
            achievements,
            skills,
            education,
            searchableText,
            searchableSkills,
            scorecardId: scorecardId || undefined
        });

        const saved = await resumeData.save();
        console.log("ResumeData saved successfully:", saved._id);

        // If scorecardId is provided, update the scorecard with the resumeId
        if (scorecardId) {
            await Scorecard.findByIdAndUpdate(scorecardId, { resumeId: saved._id });
            console.log("Updated scorecard with resumeId:", saved._id);
        }

        res.status(201).json({ success: true, message: "Resume data saved successfully.", resumeData: saved });
    } catch (err) {
        console.error("Error saving resume data:", err);
        res.status(500).json({ success: false, message: "Failed to save resume data.", error: err.message });
    }
};

// GET /api/resume-data/:id
export const getResumeData = async (req, res) => {
    try {
        const resumeData = await ResumeData.findById(req.params.id).populate('scorecardId');
        if (!resumeData) {
            return res.status(404).json({ success: false, message: "Resume data not found" });
        }
        res.status(200).json(resumeData);
    } catch (err) {
        console.error("Error fetching resume data:", err);
        res.status(500).json({ success: false, message: "Failed to fetch resume data." });
    }
};
