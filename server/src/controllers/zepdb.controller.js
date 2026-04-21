import ResumeData from "../models/resumeData.model.js";
import Scorecard from "../models/scorecard.model.js";
import Resume from "../models/resume.model.js";
import Recruiter from "../models/recruiter.model.js";
import { Job } from "../models/job.model.js";
import { determineResumeTag } from "../utils/tagHelper.js";
import { sendWhatsAppMessage } from "../utils/whatsapp.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const processZepDBQuery = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Query is required"
      });
    }

    // Step 1: Use Gemini to extract structured filters
    const extractedInfo = await extractQueryInfoWithGemini(query);

    // Step 2: Query ResumeData
    const candidates = await fetchCandidatesFromDB(extractedInfo);

    // Step 3: Format response
    const formattedCandidates = formatCandidatesForResponse(candidates);

    res.status(200).json({
      success: true,
      data: {
        query,
        extractedInfo,
        candidates: formattedCandidates,
        totalCount: formattedCandidates.length
      }
    });

  } catch (error) {
    console.error('ZepDB Query Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to process query",
      error: error.message
    });
  }
};

const extractQueryInfoWithGemini = async (userQuery) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
    You are an AI that extracts search filters from recruitment queries.
    
    Extract from this query: "${userQuery}"
    
    Return ONLY a valid JSON object (no markdown, no code fences):
    {
      "role": "extracted job role or empty string (e.g. full stack developer, data scientist)",
      "keywords": ["individual", "search", "keywords", "from", "query"],
      "minExperience": number (0 if not specified),
      "maxExperience": number (99 if not specified),  
      "skills": ["specific", "technical", "skills"],
      "location": "location or empty string"
    }
    
    Rules:
    - role: Extract the EXACT job role (e.g. "full stack developer", "frontend developer", "data scientist")
    - keywords: Break the query into individual meaningful search words (exclude common words like "with", "and", "the", "for", "me", "show", "give", "find", "get", "candidates", "resumes")
    - skills: Only specific tech skills (React, Node.js, Python, etc.)
    - experience: "3+ years" → min:3, max:99. "2-5 years" → min:2, max:5. "greater than 1 year" → min:1, max:99
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini Raw Response:', text);

    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const extracted = JSON.parse(cleanedText);

    console.log('Extracted Info:', extracted);
    return extracted;
  } catch (error) {
    console.error('Gemini API Error:', error);
    return fallbackQueryParsing(userQuery);
  }
};

const fallbackQueryParsing = (userQuery) => {
  const prompt = userQuery.toLowerCase();

  const extracted = {
    role: '',
    keywords: userQuery.split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'show', 'give', 'find', 'get', 'candidates', 'resumes', 'resume'].includes(w)),
    minExperience: 0,
    maxExperience: 99,
    skills: [],
    location: ''
  };

  // Extract role
  const roleKeywords = [
    'product manager', 'project manager', 'program manager',
    'full stack developer', 'frontend developer', 'backend developer',
    'software developer', 'software engineer', 'web developer',
    'data scientist', 'data analyst', 'data engineer',
    'devops engineer', 'qa engineer', 'ui/ux designer',
    'mobile developer', 'ios developer', 'android developer',
    'machine learning engineer', 'cloud engineer',
    'developer', 'engineer', 'designer'
  ];

  for (const keyword of roleKeywords) {
    if (prompt.includes(keyword)) {
      extracted.role = keyword;
      break;
    }
  }

  // Extract experience
  const rangeMatch = prompt.match(/(\d+)\s*-\s*(\d+)\s*(?:years?|yrs?)/i);
  if (rangeMatch) {
    extracted.minExperience = parseInt(rangeMatch[1]);
    extracted.maxExperience = parseInt(rangeMatch[2]);
  } else {
    const expMatch = prompt.match(/(\d+)\+?\s*(?:years?|yrs?)/i);
    if (expMatch) {
      extracted.minExperience = parseInt(expMatch[1]);
    }
  }

  // Extract skills
  const skillKeywords = [
    'react', 'node', 'node.js', 'python', 'java', 'javascript', 'typescript',
    'angular', 'vue', 'django', 'spring boot', 'express', 'mongodb', 'mysql',
    'postgresql', 'aws', 'docker', 'kubernetes', 'git', 'html', 'css',
    'redux', 'next.js', 'php', 'c#', 'c++', 'go', 'rust', 'flutter', 'swift'
  ];

  for (const skill of skillKeywords) {
    if (prompt.includes(skill)) {
      extracted.skills.push(skill);
    }
  }

  return extracted;
};

/**
 * Main search function. Uses a scoring/ranking approach:
 * 1. Start with broad match (any keyword in searchableText)
 * 2. Apply hard filters (experience range)
 * 3. Rank results by relevance
 */
const fetchCandidatesFromDB = async (filters) => {
  try {
    const conditions = [];

    // 1. Role matching - regex on role field and searchableText
    if (filters.role) {
      // Escape special regex characters and allow flexible spacing
      const escapedRole = filters.role.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const roleRegex = new RegExp(escapedRole.replace(/\s+/g, '\\s+'), 'i');
      conditions.push({
        $or: [
          { role: roleRegex },
          { searchableText: roleRegex },
          { 'experience.title': roleRegex }
        ]
      });
    }

    // 2. Keyword matching - each keyword should appear somewhere in the resume
    if (filters.keywords && filters.keywords.length > 0) {
      // Use $or for keywords - match ANY keyword (more flexible)
      const keywordConditions = filters.keywords
        .filter(kw => kw && kw.length > 1)
        .map(kw => {
          const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          return { searchableText: new RegExp(escaped, 'i') };
        });

      if (keywordConditions.length > 0) {
        conditions.push({ $or: keywordConditions });
      }
    }

    // 3. Experience range (hard numeric filter)
    if (filters.minExperience > 0) {
      conditions.push({ experienceYears: { $gte: filters.minExperience } });
    }
    if (filters.maxExperience && filters.maxExperience < 99) {
      conditions.push({ experienceYears: { $lte: filters.maxExperience } });
    }

    // 4. Skills matching - check searchableSkills array
    if (filters.skills && filters.skills.length > 0) {
      const lowerSkills = filters.skills.map(s => s.toLowerCase().trim());
      conditions.push({ searchableSkills: { $in: lowerSkills } });
    }

    // 5. Location
    if (filters.location) {
      const escaped = filters.location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      conditions.push({ searchableText: new RegExp(escaped, 'i') });
    }

    // Build final query
    let query = {};
    if (conditions.length > 0) {
      query.$and = conditions;
    }

    console.log('ZepDB Query:', JSON.stringify(query, (key, value) => {
      if (value instanceof RegExp) return value.toString();
      return value;
    }, 2));

    // If no conditions at all, return recent resumes
    if (conditions.length === 0) {
      const allResumes = await ResumeData.find({})
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      console.log(`ZepDB: No filters, returning ${allResumes.length} recent resumes`);
      return allResumes;
    }

    // Execute primary query
    let candidates = await ResumeData.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    console.log(`ZepDB Found ${candidates.length} candidates with strict search`);

    // If strict search returns 0 results, try a relaxed search (OR instead of AND for main conditions)
    if (candidates.length === 0 && conditions.length > 1) {
      console.log('Trying relaxed search (OR mode)...');
      const relaxedQuery = { $or: conditions };
      candidates = await ResumeData.find(relaxedQuery)
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      console.log(`ZepDB Found ${candidates.length} candidates with relaxed search`);
    }

    return candidates;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw error;
  }
};

const formatCandidatesForResponse = (candidates) => {
  return candidates.map(candidate => ({
    id: candidate._id,
    name: candidate.name || 'N/A',
    role: candidate.role || 'N/A',
    experienceYears: candidate.experienceYears || 0,
    skills: candidate.skills?.points || [],
    projects: candidate.projects || [],
    experience: candidate.experience || [],
    achievements: candidate.achievements?.points || [],
    education: candidate.education || [],
    createdAt: candidate.createdAt,
    scorecardId: candidate.scorecardId || null
  }));
};

// Phase 1 — fast: query ZepDB and flag which candidates already have scores
export const matchJobWithZepDB = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const queryString = [
      job.jobtitle,
      ...(job.skills || []),
      job.description ? job.description.slice(0, 300) : ''
    ].filter(Boolean).join(' ');

    const extractedInfo = await extractQueryInfoWithGemini(queryString);
    if (job.jobtitle) extractedInfo.role = job.jobtitle;
    if (job.skills?.length) {
      extractedInfo.skills = [...new Set([...extractedInfo.skills, ...job.skills])];
    }
    if (job.experience) extractedInfo.minExperience = parseInt(job.experience) || 0;

    const candidates = await fetchCandidatesFromDB(extractedInfo);
    const topCandidates = candidates.slice(0, 8);

    // Single query to find all existing resumes for these candidates + this job
    const existingResumes = await Resume.find({
      jobId: job._id,
      resumeDataId: { $in: topCandidates.map(c => c._id) }
    }).select('resumeDataId ats_score aiSummary aiScorecard recommendation keyStrength potentialConcern').lean();

    const existingResumeMap = {};
    existingResumes.forEach(r => {
      existingResumeMap[r.resumeDataId.toString()] = r;
    });

    // Fetch scorecards for existing resumes in one query
    const existingScorecards = await Scorecard.find({
      jobId: job._id,
      resumeId: { $in: Object.keys(existingResumeMap) }
    }).lean();

    const scorecardMap = {};
    existingScorecards.forEach(s => {
      scorecardMap[s.resumeId.toString()] = s;
    });

    const formatted = topCandidates.map(c => {
      const cid = c._id.toString();
      const existingResume = existingResumeMap[cid];
      const existingScorecard = scorecardMap[cid];

      const base = formatCandidatesForResponse([c])[0];

      if (existingResume && existingScorecard) {
        return {
          ...base,
          existing: {
            resumeId: existingResume._id,
            scorecard: {
              _id: existingScorecard._id,
              overallScore: existingResume.ats_score,
              skillScores: existingScorecard.skillScores,
              summary: existingScorecard.note,
              recommendation: existingScorecard.fitLabel || existingResume.recommendation,
              keyStrengths: existingResume.keyStrength,
              potentialConcerns: existingResume.potentialConcern,
              aiSummary: existingResume.aiSummary,
              aiScorecard: existingResume.aiScorecard
            }
          }
        };
      }
      return { ...base, existing: null };
    });

    res.status(200).json({
      success: true,
      data: { job: { title: job.jobtitle, id: job._id }, candidates: formatted }
    });
  } catch (error) {
    console.error('ZepDB Match Job Error:', error);
    res.status(500).json({ success: false, message: "Failed to search ZepDB", error: error.message });
  }
};

// Phase 2 — one candidate at a time (called in parallel from frontend)
export const scoreCandidateForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { candidateId } = req.body;
    const recruiterId = req.id;

    // Duplicate check
    const existingResume = await Resume.findOne({
      jobId,
      resumeDataId: candidateId
    }).select('_id resumeDataId ats_score aiSummary aiScorecard recommendation keyStrength potentialConcern').lean();

    if (existingResume) {
      const existingScorecard = await Scorecard.findOne({ jobId, resumeId: candidateId }).lean();
      return res.status(200).json({
        success: true,
        existing: true,
        resumeId: existingResume._id,
        scorecard: existingScorecard ? {
          _id: existingScorecard._id,
          overallScore: existingResume.ats_score,
          skillScores: existingScorecard.skillScores,
          summary: existingScorecard.note,
          recommendation: existingResume.recommendation,
          keyStrengths: existingResume.keyStrength,
          potentialConcerns: existingResume.potentialConcern,
          aiSummary: existingResume.aiSummary,
          aiScorecard: existingResume.aiScorecard
        } : null
      });
    }

    const [candidate, job, recruiter] = await Promise.all([
      ResumeData.findById(candidateId).lean(),
      Job.findById(jobId).lean(),
      Recruiter.findById(recruiterId).lean()
    ]);

    if (!candidate || !job) {
      return res.status(404).json({ success: false, message: "Candidate or job not found" });
    }

    const managerId = recruiter?.managerId || null;
    const tag = determineResumeTag(job.jobtitle, job.description);

    const analysis = await generateZepDBAnalysis(candidate, job);

    const savedResume = await Resume.create({
      jobId: job._id,
      recruiterId,
      managerId,
      tag,
      resumeDataId: candidate._id,
      name: candidate.name,
      title: candidate.role,
      skills: candidate.skills?.points || [],
      experience: `${candidate.experienceYears} years`,
      ats_score: analysis.ats_score,
      overallScore: analysis.ats_score,
      aiSummary: analysis.aiSummary,
      aiScorecard: analysis.aiScorecard,
      recommendation: analysis.recommendation,
      keyStrength: analysis.keyStrength,
      potentialConcern: analysis.potentialConcern,
      status: 'submitted',
      applicationDetails: {
        position: job.jobtitle,
        date: new Date().toLocaleDateString(),
        noticePeriod: 'N/A',
        source: 'ZepDB'
      }
    });

    await Job.findByIdAndUpdate(job._id, { $inc: { totalApplication_number: 1 } });

    const savedScorecard = await Scorecard.create({
      candidateId: candidate._id.toString(),
      resume: savedResume,
      jobId: job._id,
      resumeId: candidate._id,
      skillScores: analysis.skillScores,
      averageScore: analysis.ats_score,
      note: analysis.summary,
      submittedAt: new Date()
    });

    // Send WhatsApp notification if candidate has a phone number
    if (candidate.phone) {
      const message = `Hi ${candidate.name}, congratulations! You have been shortlisted for the role of *${job.jobtitle}*${job.company ? ` at *${job.company}*` : ''}. Our recruitment team will be in touch with you shortly.`;
      sendWhatsAppMessage(candidate.phone, message, candidate.countryCode || '91');
    }

    res.status(200).json({
      success: true,
      existing: false,
      resumeId: savedResume._id,
      scorecard: {
        _id: savedScorecard._id,
        overallScore: analysis.ats_score,
        skillScores: analysis.skillScores,
        summary: analysis.summary,
        recommendation: analysis.fitLabel,
        keyStrengths: analysis.keyStrength,
        potentialConcerns: analysis.potentialConcern,
        aiSummary: analysis.aiSummary,
        aiScorecard: analysis.aiScorecard
      }
    });
  } catch (error) {
    console.error('ZepDB Score Candidate Error:', error);
    res.status(500).json({ success: false, message: "Failed to generate scorecard", error: error.message });
  }
};

// Generates a comprehensive AI analysis from structured ResumeData against a job
const generateZepDBAnalysis = async (candidate, job) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const candidateJson = JSON.stringify({
    name: candidate.name,
    role: candidate.role,
    experienceYears: candidate.experienceYears,
    skills: candidate.skills?.points || [],
    experience: (candidate.experience || []).map(e => ({
      title: e.title, company: e.company, duration: e.duration,
      points: (e.points || []).slice(0, 3)
    })),
    projects: (candidate.projects || []).map(p => ({
      title: p.title, points: (p.points || []).slice(0, 2)
    })),
    education: candidate.education || [],
    achievements: candidate.achievements?.points || []
  });

  const prompt = `You are an expert AI recruiter. Evaluate this candidate against the job and return ONLY raw JSON (no markdown, no code fences).

JOB:
Title: ${job.jobtitle}
Description: ${(job.description || '').slice(0, 500)}
Required Skills: ${(job.skills || []).join(', ')}
Experience Required: ${job.experience || 'Not specified'} years

CANDIDATE:
${candidateJson}

Return this exact JSON shape:
{
  "ats_score": <integer 0-100, overall fit score>,
  "fitLabel": "<one of: Strong Fit, Good Fit, Moderate Fit, Weak Fit>",
  "summary": "<2-3 sentence assessment of candidate fit for this job>",
  "recommendation": "<short decisive phrase e.g. Recommended for next round>",
  "keyStrength": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "potentialConcern": ["<concern 1>", "<concern 2>"],
  "skillScores": [
    { "skill": "<required skill name>", "score": <integer 0-100> }
  ],
  "aiSummary": {
    "technicalExperience": "<1-2 sentences on technical background>",
    "projectExperience": "<1-2 sentences on project work>",
    "education": "<1-2 sentences on education>",
    "keyAchievements": "<1-2 sentences on achievements>",
    "skillMatch": "<1-2 sentences on skill alignment with this job>",
    "competitiveFit": "<1-2 sentences on market competitiveness for this role>",
    "consistencyCheck": "<1-2 sentences on career consistency>"
  },
  "aiScorecard": {
    "technicalSkillMatch": <integer 0-100>,
    "competitiveFit": <integer 0-100>,
    "consistencyCheck": <integer 0-100>,
    "teamLeadership": <integer 0-100>
  }
}

Rules:
- skillScores: Score each of the job's required skills (max 6). Base score on evidence found in candidate data.
- ats_score: Holistic score — skill match, experience depth, project relevance. Conservative: 80+ only for strong matches.
- All text fields must contain meaningful content, not placeholders.`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text();
  const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned);
};

// Get ZepDB statistics
export const getZepDBStats = async (req, res) => {
  try {
    const totalCount = await ResumeData.countDocuments({});

    const roleBreakdown = await ResumeData.aggregate([
      { $match: { role: { $ne: '' } } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        roles: roleBreakdown
      }
    });

  } catch (error) {
    console.error('ZepDB Stats Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get statistics",
      error: error.message
    });
  }
};
