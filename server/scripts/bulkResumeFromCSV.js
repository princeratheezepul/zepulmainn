/**
 * Bulk Resume Upload from CSV
 * 
 * Reads Google Drive/Docs resume links from a CSV file,
 * downloads each resume, processes through AI pipeline,
 * and saves Resume + ResumeData entries to MongoDB.
 * 
 * Usage: node scripts/bulkResumeFromCSV.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';
import { GoogleGenerativeAI } from '@google/generative-ai';
import mammoth from 'mammoth';
import axios from 'axios';
import { google } from 'googleapis';

// Models
import Resume from '../src/models/resume.model.js';
import { Job } from '../src/models/job.model.js';
import ResumeData from '../src/models/resumeData.model.js';
import { determineResumeTag } from '../src/utils/tagHelper.js';

const __filename_local = fileURLToPath(import.meta.url);
const __dirname_local = dirname(__filename_local);
const require = createRequire(import.meta.url);

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const JOB_ID = '695e3fe9ce602ec0fc2e36ab';
const CSV_PATH = path.join(__dirname_local, '../Copy of Resume Links - Sheet1.csv');
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not set in .env');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ─────────────────────────────────────────────
// Google Drive API (optional)
// ─────────────────────────────────────────────
let drive = null;
try {
    const googleCredentials = process.env.GOOGLE_CREDENTIALS;
    if (googleCredentials) {
        const credentials = JSON.parse(googleCredentials);
        drive = google.drive({
            version: 'v3',
            auth: new google.auth.GoogleAuth({
                credentials,
                scopes: ['https://www.googleapis.com/auth/drive.readonly'],
            }),
        });
        console.log('✅ Google Drive API initialized');
    } else {
        const credentialsPath = path.join(__dirname_local, '../google-credentials.json');
        if (fs.existsSync(credentialsPath)) {
            drive = google.drive({
                version: 'v3',
                auth: new google.auth.GoogleAuth({
                    keyFile: credentialsPath,
                    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
                }),
            });
            console.log('✅ Google Drive API initialized from file');
        } else {
            console.log('⚠️  No Google Drive credentials — using direct download fallback');
        }
    }
} catch (err) {
    console.log('⚠️  Google Drive API init failed:', err.message);
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/** Extract file ID from Google Drive or Docs URL */
const extractFileIdFromLink = (link) => {
    const driveMatch = link.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (driveMatch) return driveMatch[1];
    const docsMatch = link.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    if (docsMatch) return docsMatch[1];
    return null;
};

/** Check if URL is a valid resume link (Drive file or Google Doc) */
const isResumeUrl = (url) => {
    return url.includes('/file/d/') || url.includes('/document/d/');
};

/** Check if buffer contains HTML instead of actual file content */
const isHtmlContent = (buffer) => {
    const sample = buffer.slice(0, 1000).toString('utf-8').toLowerCase();
    return sample.includes('<html') || sample.includes('<!doctype html');
};

/** Try to extract Google Drive virus-scan confirmation token from HTML */
const extractConfirmToken = (htmlBuffer) => {
    const html = htmlBuffer.toString('utf-8');
    // Look for the confirm token in the download warning page
    const match = html.match(/confirm=([0-9A-Za-z_-]+)/) ||
        html.match(/id="uc-download-link"[^>]*href="[^"]*confirm=([^&"]+)/) ||
        html.match(/name="uuid" value="([^"]+)"/);
    return match ? match[1] : null;
};

/** Download file from Google Drive/Docs URL */
const downloadFromGoogleUrl = async (url) => {
    const fileId = extractFileIdFromLink(url);
    if (!fileId) throw new Error('Cannot extract file ID from URL');

    const isDoc = url.includes('/document/');
    const axiosConfig = {
        responseType: 'arraybuffer',
        maxRedirects: 10,
        timeout: 60000,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': '*/*',
        },
    };

    // 1. Try Google Drive API if available
    if (drive) {
        try {
            let response;
            if (isDoc) {
                // For Google Docs, use export
                response = await drive.files.export(
                    { fileId, mimeType: 'application/pdf' },
                    { responseType: 'stream' }
                );
            } else {
                response = await drive.files.get(
                    { fileId, alt: 'media' },
                    { responseType: 'stream' }
                );
            }
            const chunks = [];
            const buf = await new Promise((resolve, reject) => {
                response.data.on('data', chunk => chunks.push(chunk));
                response.data.on('end', () => resolve(Buffer.concat(chunks)));
                response.data.on('error', reject);
            });
            if (!isHtmlContent(buf)) {
                console.log(`  ✅ Downloaded ${buf.length} bytes via Drive API`);
                return buf;
            }
            console.log('  ⚠️  Drive API returned HTML, trying fallback...');
        } catch (driveError) {
            console.log(`  ⚠️  Drive API error: ${driveError.message}, trying fallback...`);
        }
    }

    // 2. Build list of download URLs to try
    const downloadUrls = [];

    if (isDoc) {
        // Google Docs: export as PDF or DOCX
        downloadUrls.push(`https://docs.google.com/document/d/${fileId}/export?format=pdf`);
        downloadUrls.push(`https://docs.google.com/document/d/${fileId}/export?format=docx`);
    }

    // Google Drive direct download URLs (multiple strategies)
    downloadUrls.push(`https://drive.usercontent.google.com/download?id=${fileId}&export=download&authuser=0&confirm=t`);
    downloadUrls.push(`https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`);
    downloadUrls.push(`https://drive.google.com/uc?export=download&id=${fileId}`);

    for (const downloadUrl of downloadUrls) {
        try {
            console.log(`  Trying: ${downloadUrl.substring(0, 75)}...`);
            const response = await axios.get(downloadUrl, axiosConfig);

            if (!response.data || response.data.length === 0) continue;

            const buf = Buffer.from(response.data);

            // Check if we got actual file content
            if (!isHtmlContent(buf)) {
                console.log(`  ✅ Downloaded ${buf.length} bytes`);
                return buf;
            }

            // If HTML, try to extract virus-scan confirmation token and retry
            const token = extractConfirmToken(buf);
            if (token) {
                console.log(`  🔑 Found confirmation token, retrying...`);
                const confirmUrl = `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=${token}`;
                try {
                    const confirmResponse = await axios.get(confirmUrl, axiosConfig);
                    if (confirmResponse.data && confirmResponse.data.length > 0) {
                        const confirmBuf = Buffer.from(confirmResponse.data);
                        if (!isHtmlContent(confirmBuf)) {
                            console.log(`  ✅ Downloaded ${confirmBuf.length} bytes (after confirmation)`);
                            return confirmBuf;
                        }
                    }
                } catch (confirmErr) {
                    console.log(`  ❌ Confirmation retry failed: ${confirmErr.message}`);
                }
            }

            console.log(`  ⚠️  Got HTML response (login/permission page), trying next URL...`);
        } catch (urlError) {
            console.log(`  ❌ Failed: ${urlError.message}`);
        }
    }

    throw new Error(
        'All download methods failed. The file is likely PRIVATE (not shared as "Anyone with the link").\n' +
        '   💡 FIX: Open Google Drive → Right-click file → Share → Change to "Anyone with the link" → Viewer'
    );
};

/** Extract text from PDF buffer */
const extractTextFromPDF = async (buffer) => {
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
    const uint8Array = new Uint8Array(buffer);
    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;
    let fullText = '';
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();
        fullText += content.items.map(item => item.str).join(' ') + ' ';
    }
    if (fullText.trim().length === 0) throw new Error('PDF contains no readable text');
    return fullText.trim();
};

/** Extract text from DOCX buffer */
const extractTextFromDocx = async (buffer) => {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
};

/** Analyze resume with Gemini AI — same prompt as bulkUpload.controller.js + resumeContent */
const analyzeResume = async (resumeText, job) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
    You are an expert AI recruiter analyzing a resume for a specific job.
    Job Details:
    - Title: ${job.jobtitle}
    - Description: ${job.description}
    - Required Skills: ${job.skills?.join(', ') || ''}

    Resume Text:
    ---
    ${resumeText}
    ---

    Based on the job details and resume text, provide a detailed analysis in a pure JSON format. Do not include any markdown, code blocks, or explanations. The JSON object should have the following structure:
    {
      "name": "Full Name",
      "title": "Professional Title (e.g., Senior Frontend Developer)",
      "skills": ["Top 10 most relevant technical skills from the resume"],
      "email": "contact@email.com",
      "phone": "+1234567890",
      "experience": "Total years of experience as a string (e.g., '5 years')",
      "location": "City, Country",
      "aiSummary": {
        "technicalExperience": "A 1-2 sentence summary of their technical background.",
        "projectExperience": "A 1-2 sentence summary of their project work and accomplishments.",
        "education": "A 1-2 sentence summary of their educational qualifications.",
        "keyAchievements": "A 1-2 sentence summary of their most impressive achievements.",
        "skillMatch": "A 1-2 sentence analysis of how well the candidate's technical skills, tools, and technologies align with the specific job requirements and responsibilities.",
        "competitiveFit": "A 1-2 sentence assessment of the candidate's competitive position in the market for this role, considering their experience level, achievements, and market demand.",
        "consistencyCheck": "A 1-2 sentence evaluation of the candidate's career consistency, job stability, progression patterns, and professional growth trajectory."
      },
      "aiScorecard": {
        "technicalSkillMatch": "Number (0-100) representing how well their skills match the job requirements.",
        "competitiveFit": "Number (0-100) representing the candidate's competitive position in the market for this role.",
        "consistencyCheck": "Number (0-100) representing the candidate's career consistency, job stability, and progression patterns.",
        "teamLeadership": "Number (0-100) based on any management or leadership roles, and mentorship experience mentioned."
      },
      "recommendation": "A short, decisive recommendation (e.g., 'Recommended for next round', 'Strong contender', 'Consider with caution').",
      "keyStrength": ["A bullet point list of 2-3 key strengths for this specific role."],
      "potentialConcern": ["A bullet point list of 2-3 potential concerns or areas to probe in an interview. IMPORTANT: Do NOT include any concerns related to experience level, years of experience, or experience gaps. Focus only on technical skills, communication, cultural fit, or other non-experience related concerns."],
      "about": "A brief 'About' section copied or summarized from the resume.",
      "applicationDetails": {
          "position": "${job.jobtitle}",
          "date": "${new Date().toLocaleDateString()}",
          "noticePeriod": "Extract from resume if available, otherwise 'N/A'",
          "source": "Website"
      },
      "resumeContent": {
        "name": "Full Name (same as above)",
        "role": "Primary professional role/title",
        "experienceYears": "Total years of professional experience as a NUMBER (e.g., 2, 5, 0.5). Use 0 if unclear.",
        "projects": [
          { "title": "Project Title", "points": ["Bullet point 1", "Bullet point 2"] }
        ],
        "experience": [
          { "title": "Job Title", "company": "Company Name", "duration": "Duration string", "points": ["Bullet point 1", "Bullet point 2"] }
        ],
        "achievements": { "points": ["Achievement 1", "Achievement 2"] },
        "skills": { "points": ["Skill 1", "Skill 2", "Skill 3"] },
        "education": [
          { "institution": "University Name", "degree": "Degree Name", "points": ["Detail 1"] }
        ]
      }
    }

    IMPORTANT:
    - For the resumeContent field: Extract ALL projects, experience entries, achievements, skills, and education EXACTLY as they appear in the resume. Preserve original wording.
    - Make sure all fields in aiSummary contain meaningful, detailed content.
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let cleanedText = text.replace(/```json|```/g, '').trim();
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    }

    try {
        return JSON.parse(cleanedText);
    } catch (parseError) {
        console.error('  ❌ JSON parse error for analysis:', parseError.message);
        return {
            name: 'Unknown', title: 'Not specified', skills: [], email: 'Not found',
            phone: 'Not found', experience: 'Not specified', location: 'Not specified',
            aiSummary: {}, aiScorecard: { technicalSkillMatch: 0, competitiveFit: 0, consistencyCheck: 0, teamLeadership: 0 },
            recommendation: 'Review manually', keyStrength: [], potentialConcern: [],
            about: '', applicationDetails: { position: job.jobtitle, date: new Date().toLocaleDateString(), noticePeriod: 'N/A', source: 'CSV Script' },
            resumeContent: null
        };
    }
};

/** Calculate ATS Score — same prompt as bulkUpload.controller.js */
const calculateATSScore = async (resumeText, job) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
    You are a strict, realistic ATS evaluator. Calculate ATS score out of 100 using weighted criteria below. BE CONSERVATIVE with scoring.

    Criteria, weights, and STRICT scoring guidelines:
    {
      "Skill Match (Contextual)": 30,
      "Experience Relevance & Depth": 25,
      "Project & Achievement Validation": 15,
      "Consistency Check": 15,
      "AI-Generated Resume Detection": 5,
      "Resume Quality Score": 5,
      "Interview & Behavioral Prediction": 5,
      "Competitive Fit & Market Standing": 5
    }

    CRITICAL: Most candidates should score 60-75. Only exceptional candidates 85+.

    Return ONLY a JSON object (no markdown):
    {
      "Skill Match (Contextual)": {"score": number, "reason": string},
      "Experience Relevance & Depth": {"score": number, "reason": string},
      "Project & Achievement Validation": {"score": number, "reason": string},
      "AI-Generated Resume Detection": {"score": number, "reason": string},
      "Consistency Check": {"score": number, "reason": string},
      "Resume Quality Score": {"score": number, "reason": string},
      "Interview & Behavioral Prediction": {"score": number, "reason": string},
      "Competitive Fit & Market Standing": {"score": number, "reason": string},
      "ats_score": number,
      "reason": string
    }

    Job Details:
    Title: ${job.jobtitle}
    Company: ${job.company || ''}
    Description: ${job.description}
    Required Skills: ${(job.skills || []).join(', ')}

    Resume Text:
    ${resumeText}
  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiText = response.text();

    let cleanedText = aiText.replace(/```json|```/g, '').trim();
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1);
    }

    try {
        const parsed = JSON.parse(cleanedText);
        return {
            ats_score: parsed.ats_score || 50,
            ats_reason: parsed.reason || 'ATS score calculated with limited data',
            ats_breakdown: {
                skill_match: parsed['Skill Match (Contextual)'] || { score: 15, reason: 'Default' },
                experience_relevance: parsed['Experience Relevance & Depth'] || { score: 12, reason: 'Default' },
                project_achievement: parsed['Project & Achievement Validation'] || { score: 7, reason: 'Default' },
                ai_generated_detection: parsed['AI-Generated Resume Detection'] || { score: 3, reason: 'Default' },
                consistency_check: parsed['Consistency Check'] || { score: 7, reason: 'Default' },
                resume_quality: parsed['Resume Quality Score'] || { score: 3, reason: 'Default' },
                interview_prediction: parsed['Interview & Behavioral Prediction'] || { score: 2, reason: 'Default' },
                competitive_fit: parsed['Competitive Fit & Market Standing'] || { score: 1, reason: 'Default' },
            },
        };
    } catch {
        console.error('  ❌ ATS JSON parse error');
        return {
            ats_score: 50,
            ats_reason: 'Parsing error — manual review recommended.',
            ats_breakdown: {
                skill_match: { score: 15, reason: 'Parsing error' },
                experience_relevance: { score: 12, reason: 'Parsing error' },
                project_achievement: { score: 7, reason: 'Parsing error' },
                ai_generated_detection: { score: 3, reason: 'Parsing error' },
                consistency_check: { score: 7, reason: 'Parsing error' },
                resume_quality: { score: 3, reason: 'Parsing error' },
                interview_prediction: { score: 2, reason: 'Parsing error' },
                competitive_fit: { score: 1, reason: 'Parsing error' },
            },
        };
    }
};

/** Build searchable text for ResumeData */
const buildSearchableText = (data) => {
    const parts = [];
    if (data.name) parts.push(data.name);
    if (data.role) parts.push(data.role);
    if (data.projects) data.projects.forEach(p => { if (p.title) parts.push(p.title); if (p.points) parts.push(...p.points); });
    if (data.experience) data.experience.forEach(e => { if (e.title) parts.push(e.title); if (e.company) parts.push(e.company); if (e.duration) parts.push(e.duration); if (e.points) parts.push(...e.points); });
    if (data.achievements?.points) parts.push(...data.achievements.points);
    if (data.skills?.points) parts.push(...data.skills.points);
    if (data.education) data.education.forEach(e => { if (e.institution) parts.push(e.institution); if (e.degree) parts.push(e.degree); if (e.points) parts.push(...e.points); });
    return parts.filter(Boolean).join(' ');
};

/** Build searchable skills for ResumeData */
const buildSearchableSkills = (data) => {
    const skills = [];
    if (data.skills?.points) data.skills.points.forEach(s => { if (s) skills.push(s.toLowerCase().trim()); });
    return skills;
};

// ─────────────────────────────────────────────
// Process a single resume (from buffer)
// ─────────────────────────────────────────────
async function processResumeFromBuffer(buffer, label, url, job) {
    // Step 1: Extract text
    console.log('   📝 Extracting text...');
    let text;
    const isDoc = url ? url.includes('/document/') : false;
    try {
        text = await extractTextFromPDF(buffer);
    } catch {
        text = await extractTextFromDocx(buffer);
    }
    console.log(`   ✅ Extracted ${text.length} characters`);

    // Step 2: Analyze with AI
    console.log('   🤖 Analyzing resume with AI...');
    const analysis = await analyzeResume(text, job);
    console.log(`   ✅ Analysis complete — Name: ${analysis.name}`);

    // Step 3: Calculate ATS Score
    console.log('   📊 Calculating ATS score...');
    const atsResult = await calculateATSScore(text, job);
    console.log(`   ✅ ATS Score: ${atsResult.ats_score}`);

    // Step 4: Save ResumeData (structured resume content)
    let resumeDataId = null;
    if (analysis.resumeContent) {
        console.log('   💾 Saving ResumeData...');
        const rc = analysis.resumeContent;
        const resumeData = new ResumeData({
            name: rc.name || analysis.name || 'Unknown',
            role: rc.role || '',
            experienceYears: rc.experienceYears || 0,
            projects: rc.projects || [],
            experience: rc.experience || [],
            achievements: rc.achievements || { points: [] },
            skills: rc.skills || { points: [] },
            education: rc.education || [],
            searchableText: buildSearchableText(rc),
            searchableSkills: buildSearchableSkills(rc),
        });
        const savedResumeData = await resumeData.save();
        resumeDataId = savedResumeData._id;
        console.log(`   ✅ ResumeData saved: ${resumeDataId}`);
    }

    // Step 5: Save Resume
    console.log('   💾 Saving Resume...');
    const tag = determineResumeTag(job.jobtitle, job.description);
    const resumeObject = {
        jobId: job._id,
        tag,
        ...analysis,
        overallScore: Math.round(atsResult.ats_score),
        ats_score: atsResult.ats_score,
        ats_reason: atsResult.ats_reason,
        ats_breakdown: atsResult.ats_breakdown,
        raw_text: text,
        resumeDataId: resumeDataId || undefined,
    };

    // Remove resumeContent from the Resume doc (it's stored in ResumeData)
    delete resumeObject.resumeContent;

    const newResume = new Resume(resumeObject);
    const savedResume = await newResume.save();

    // Increment totalApplication_number
    await Job.findByIdAndUpdate(job._id, { $inc: { totalApplication_number: 1 } });

    console.log(`   ✅ Resume saved: ${savedResume._id}`);
    console.log(`   🎉 SUCCESS — ${analysis.name} | ATS: ${atsResult.ats_score}\n`);
    return savedResume;
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
async function main() {
    console.log('═══════════════════════════════════════════');
    console.log('  BULK RESUME UPLOAD FROM CSV');
    console.log('═══════════════════════════════════════════\n');

    // 1. Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ MongoDB connected\n');

    // 2. Load job
    console.log(`📋 Loading job ${JOB_ID}...`);
    const job = await Job.findById(JOB_ID);
    if (!job) {
        console.error('❌ Job not found!');
        process.exit(1);
    }
    console.log(`✅ Job: "${job.jobtitle}"\n`);

    // Check for local resumes folder first
    const resumesDir = path.join(__dirname_local, '../resumes');
    const hasLocalFiles = fs.existsSync(resumesDir) &&
        fs.readdirSync(resumesDir).some(f => f.endsWith('.pdf') || f.endsWith('.docx'));

    if (hasLocalFiles) {
        // ───── LOCAL FILES MODE ─────
        console.log('📂 Found local resumes in /resumes/ folder — processing local files\n');

        const files = fs.readdirSync(resumesDir)
            .filter(f => f.endsWith('.pdf') || f.endsWith('.docx'));

        console.log(`📥 Processing ${files.length} local resume files...\n`);

        const results = { success: 0, failed: 0 };

        for (let i = 0; i < files.length; i++) {
            const fileName = files[i];
            console.log(`───────────────────────────────────────────`);
            console.log(`📄 Resume ${i + 1}/${files.length}: ${fileName}`);

            try {
                const filePath = path.join(resumesDir, fileName);
                const buffer = fs.readFileSync(filePath);
                await processResumeFromBuffer(buffer, fileName, null, job);
                results.success++;
            } catch (error) {
                console.error(`   ❌ FAILED: ${error.message}\n`);
                results.failed++;
            }
        }

        console.log('═══════════════════════════════════════════');
        console.log('  RESULTS');
        console.log('═══════════════════════════════════════════');
        console.log(`  ✅ Successful: ${results.success}`);
        console.log(`  ❌ Failed:     ${results.failed}`);
        console.log(`  📊 Total:      ${files.length}`);
        console.log('═══════════════════════════════════════════\n');

    } else {
        // ───── GOOGLE DRIVE URL MODE ─────
        console.log(`📄 Reading CSV: ${CSV_PATH}`);
        const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
        const urls = csvContent
            .split('\n')
            .map(line => line.trim().replace(/\r/g, ''))
            .filter(line => line.length > 0);

        console.log(`   Found ${urls.length} URLs total\n`);

        // Filter to only resume URLs (Drive files + Google Docs)
        const resumeUrls = urls.filter(isResumeUrl);
        const skippedUrls = urls.filter(url => !isResumeUrl(url));

        if (skippedUrls.length > 0) {
            console.log(`⚠️  Skipping ${skippedUrls.length} non-resume URLs:`);
            skippedUrls.forEach(url => console.log(`   - ${url.substring(0, 80)}...`));
            console.log();
        }

        console.log(`📥 Processing ${resumeUrls.length} resume URLs...\n`);

        const results = { success: 0, failed: 0 };

        for (let i = 0; i < resumeUrls.length; i++) {
            const url = resumeUrls[i];
            console.log(`───────────────────────────────────────────`);
            console.log(`📄 Resume ${i + 1}/${resumeUrls.length}`);
            console.log(`   URL: ${url.substring(0, 80)}...`);

            try {
                // Download
                console.log('   ⬇️  Downloading...');
                const buffer = await downloadFromGoogleUrl(url);
                await processResumeFromBuffer(buffer, `resume_${i + 1}`, url, job);
                results.success++;
            } catch (error) {
                console.error(`   ❌ FAILED: ${error.message}\n`);
                results.failed++;
            }
        }

        console.log('═══════════════════════════════════════════');
        console.log('  RESULTS');
        console.log('═══════════════════════════════════════════');
        console.log(`  ✅ Successful: ${results.success}`);
        console.log(`  ❌ Failed:     ${results.failed}`);
        console.log(`  ⚠️  Skipped:   ${skippedUrls.length}`);
        console.log(`  📊 Total:      ${urls.length}`);
        console.log('═══════════════════════════════════════════\n');

        // If all failed, suggest local folder mode
        if (results.success === 0 && results.failed > 0) {
            console.log('💡 TIP: All downloads failed (files are likely private).');
            console.log('   You can manually download the resumes and place them in:');
            console.log(`   📂 ${resumesDir}/`);
            console.log('   Then re-run this script — it will process local files automatically.\n');
        }
    }

    await mongoose.disconnect();
    console.log('📡 MongoDB disconnected. Done!');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
