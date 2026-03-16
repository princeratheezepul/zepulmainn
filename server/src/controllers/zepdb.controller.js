import ResumeData from "../models/resumeData.model.js";
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
