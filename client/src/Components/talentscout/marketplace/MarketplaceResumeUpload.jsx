import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, ArrowLeft, Loader2, Upload } from 'lucide-react';
import BulkUploadModal from '../../recruiter/dashboard/BulkUploadModal';
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import ResumeDetailsView from '../../recruiter/dashboard/ResumeDetailsView';
import { useMarketplaceAuth } from '../../../context/MarketplaceAuthContext';
import toast from 'react-hot-toast';

GlobalWorkerOptions.workerSrc = workerUrl;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);

const MarketplaceResumeUpload = ({ onBack, jobDetails }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  
  const { user, isAuthenticated, apiCall } = useMarketplaceAuth();

  // Set body background to match page background when component mounts
  useEffect(() => {
    document.body.style.backgroundColor = '#f9fafb';
    return () => {
      // Reset body background when component unmounts
      document.body.style.backgroundColor = '';
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setLoadingMessage("Processing file...");

    try {
      let text = "";
      const fileType = file.type;

      if (fileType === "application/pdf") {
        setLoadingMessage("Extracting text from PDF...");
        text = await extractTextFromPDF(file);
      } else if (fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileType === "application/msword") {
        setLoadingMessage("Extracting text from Word document...");
        text = await extractTextFromWord(file);
      } else if (fileType.startsWith("image/")) {
        setLoadingMessage("Performing OCR on image...");
        text = await extractTextFromImage(file);
      } else {
        throw new Error("Unsupported file type. Please upload PDF, Word document, or image files.");
      }

      if (!text.trim()) {
        throw new Error("No text could be extracted from the file.");
      }

      setLoadingMessage("Analyzing resume with AI...");
      const analysis = await analyzeResume(text, jobDetails);

      setLoadingMessage("Getting ATS score...");
      const atsResult = await fetchATSScore(text);

      const finalData = { 
        ...analysis, 
        overallScore: Math.round(atsResult.ats_score),
        ats_score: atsResult.ats_score,
        ats_reason: atsResult.ats_reason,
        ats_breakdown: atsResult.ats_breakdown
      };

      setLoadingMessage("Saving details...");
      const saved = await saveResumeToDB(finalData, jobDetails.jobId);
      setParsedData(saved.resume); // Use the DB object with _id

    } catch (error) {
      console.error("Error processing resume:", error);
      toast.error(error.message || "Failed to process the resume.");
      alert(error.message || "Failed to process the resume.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }, [jobDetails]);

  const extractTextFromPDF = async (file) => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async () => {
        try {
          const typedArray = new Uint8Array(fileReader.result);
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map((item) => item.str).join(" ");
          }
          resolve(fullText);
        } catch (error) {
          reject(error);
        }
      };
      fileReader.onerror = reject;
      fileReader.readAsArrayBuffer(file);
    });
  };

  const extractTextFromWord = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const extractTextFromImage = async (file) => {
    const { data: { text } } = await Tesseract.recognize(file, 'eng');
    return text;
  };

  const saveResumeToDB = async (resumeData, jobId) => {
    try {
      console.log('Saving marketplace resume data:', resumeData);
      console.log('JobId:', jobId);
      console.log('API URL:', `${import.meta.env.VITE_BACKEND_URL}/api/marketplace/resumes/save/${jobId}`);
      
      // Use marketplace API call method
      const response = await apiCall(`${import.meta.env.VITE_BACKEND_URL}/api/marketplace/resumes/save/${jobId}`, {
        method: 'POST',
        body: JSON.stringify(resumeData),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        let errorMessage = 'Failed to save resume data';
        
        try {
          const errorData = await response.json();
          console.error('Server error response:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON (like HTML error page), get the text
          const errorText = await response.text();
          console.error('Non-JSON error response:', errorText);
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Marketplace resume saved successfully:', result);
      return result.data; // Return the data field from ApiResponse
    } catch (error) {
      console.error('Error saving marketplace resume:', error);
      throw new Error(`Failed to save resume data to database: ${error.message}`);
    }
  };

  const fetchATSScore = async (resumeText) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
      You are a strict, realistic ATS evaluator. Calculate ATS score out of 100 using weighted criteria below. BE CONSERVATIVE with scoring - most resumes should score 60-80, with only exceptional candidates scoring 85+.

      Criteria, weights, and STRICT scoring guidelines:
      {
        "Skill Match (Contextual)": 30 // 0-30 points
        // 25-30: Perfect skill alignment (90%+ match)
        // 20-24: Strong match (70-89% skills present)
        // 15-19: Moderate match (50-69% skills present)
        // 10-14: Basic match (30-49% skills present)
        // 0-9: Poor/no match (<30% skills present)

        "Experience Relevance & Depth": 25 // 0-25 points
        // 22-25: Highly relevant exp, exceeds requirements
        // 18-21: Relevant exp, meets requirements well
        // 14-17: Somewhat relevant, meets basic requirements
        // 10-13: Limited relevance, below requirements
        // 0-9: Irrelevant or insufficient experience

        "Project & Achievement Validation": 15 // 0-15 points
        // 13-15: Quantified achievements, impressive projects
        // 10-12: Some quantified results, good projects
        // 7-9: Basic project mentions, few metrics
        // 4-6: Vague projects, no quantification
        // 0-3: No meaningful projects/achievements

        "Consistency Check": 15 // 0-15 points
        // 13-15: Stable career, logical progression
        // 10-12: Mostly stable, 1-2 short tenures
        // 7-9: Some job hopping, gaps explained
        // 4-6: Frequent job changes, some gaps
        // 0-3: Major inconsistencies, many gaps

        "AI-Generated Resume Detection": 5 // 0-5 points (PENALTY category)
        // 5: Clearly human-written, authentic
        // 3-4: Mostly authentic, some templated sections
        // 1-2: Heavily templated, possibly AI-generated
        // 0: Obviously AI-generated or completely generic

        "Resume Quality Score": 5 // 0-5 points
        // 5: Excellent formatting, clear, professional
        // 3-4: Good formatting, mostly clear
        // 1-2: Poor formatting, unclear sections
        // 0: Very poor quality, hard to read

        "Interview & Behavioral Prediction": 5 // 0-5 points
        // 5: Strong communication indicators, leadership
        // 3-4: Good indicators of soft skills
        // 1-2: Basic indicators present
        // 0: Poor communication indicators

        "Competitive Fit & Market Standing": 5 // 0-5 points
        // 5: Top 10% candidate for this role
        // 3-4: Top 25% candidate
        // 1-2: Average candidate
        // 0: Below average candidate
      }

      CRITICAL SCORING RULES:
      - NO component should exceed its maximum weight
      - Most candidates should score 60-75 total (industry average)
      - Only truly exceptional candidates score 85+
      - Scores of 90+ should be EXTREMELY rare (top 2% of candidates)
      - Be harsh on missing information, generic content, and poor formatting
      - Heavily penalize mismatched experience levels and skill gaps

      Return ONLY a JSON object like this (no markdown, no code formatting):
      {
        "Skill Match (Contextual)": {"score": number, "reason": string},
        "Experience Relevance & Depth": {"score": number, "reason": string},
        "Project & Achievement Validation": {"score": number, "reason": string},
        "AI-Generated Resume Detection": {"score": number, "reason": string},
        "Consistency Check": {"score": number, "reason": string},
        "Resume Quality Score": {"score": number, "reason": string},
        "Interview & Behavioral Prediction": {"score": number, "reason": string},
        "Competitive Fit & Market Standing": {"score": number, "reason": string},
        "ats_score": number, // sum of above, max 100
        "reason": string // 1-2 lines summary of the main factors for the total score
      }

      Job Details:
      Title: ${jobDetails.jobtitle}
      Company: ${jobDetails.company}
      Location: ${jobDetails.location}
      Employment Type: ${jobDetails.employmentType}
      Experience: ${jobDetails.experience}
      Salary: ${jobDetails.salary}
      Posted: ${jobDetails.posted}
      Description: ${jobDetails.description}
      Responsibilities: ${(jobDetails.responsibilities || []).join(", ")}
      Required Skills: ${(jobDetails.requiredSkills || []).join(", ")}
      Preferred Qualifications: ${(jobDetails.preferredQualifications || []).join(", ")}

      Resume Text:
      ${resumeText}
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiText = await response.text();
      const cleanedText = aiText.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleanedText);

      return {
        ats_score: parsed.ats_score,
        ats_reason: parsed.reason,
        ats_breakdown: {
          skill_match: parsed["Skill Match (Contextual)"],
          experience_relevance: parsed["Experience Relevance & Depth"],
          project_achievement: parsed["Project & Achievement Validation"],
          ai_generated_detection: parsed["AI-Generated Resume Detection"],
          consistency_check: parsed["Consistency Check"],
          resume_quality: parsed["Resume Quality Score"],
          interview_prediction: parsed["Interview & Behavioral Prediction"],
          competitive_fit: parsed["Competitive Fit & Market Standing"],
        }
      };
    } catch (err) {
      console.error("Error retrieving ATS score:", err);
      throw new Error("Error retrieving ATS score.");
    }
  };

  const analyzeResume = async (resumeText, job) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an expert AI recruiter analyzing a resume for a specific job.
      Job Details:
      - Title: ${job.jobtitle}
      - Description: ${job.description}
      - Required Skills: ${(job.requiredSkills || []).join(", ")}

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
        }
      }

      IMPORTANT: For the new fields in aiSummary:
      - skillMatch: Analyze the candidate's technical skills against the job requirements and provide a clear assessment
      - competitiveFit: Evaluate their market position and competitiveness for this specific role
      - consistencyCheck: Assess their career stability, progression, and professional development patterns
      
      Make sure all fields in aiSummary contain meaningful, detailed content that provides valuable insights for the recruiter.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanedText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false,
    disabled: loading
  });

  if (parsedData) {
    return <ResumeDetailsView resumeData={parsedData} onBack={onBack} isMarketplace={true} marketplaceJobDetails={jobDetails} onResumeUpdate={() => {}} />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4" style={{backgroundColor: '#f9fafb', minHeight: '100vh'}}>
      <div className="flex items-center justify-between gap-4 mb-8 w-full max-w-6xl">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-800" disabled={loading}>
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={() => setShowBulkUpload(true)}
          className="bg-blue-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-900 transition-colors flex items-center gap-2"
          disabled={loading}
        >
          <Upload size={16} />
          Bulk Upload
        </button>
      </div>
      <div className="flex-grow w-full flex items-center justify-center">
        <div
          {...getRootProps()}
          className={`w-full max-w-4xl min-h-[320px] border-2 border-dashed rounded-xl p-8 sm:p-10 md:p-12 text-center cursor-pointer transition-all duration-300 ease-in-out flex flex-col items-center justify-center bg-white ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          } ${loading ? 'cursor-wait' : ''}`}
        >
          <input {...getInputProps()} />
          {
            loading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <p className="text-lg font-semibold text-gray-800 mt-4">Processing...</p>
                <p className="text-sm text-gray-500 mt-1">{loadingMessage}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-xl font-semibold text-gray-800">Select your file or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">PDF or DOCX files accepted</p>
                <button className="rounded-full mt-6 inline-block bg-blue-600 text-white px-6 py-2 font-semibold hover:bg-blue-700 transition-colors">
                  Browse
                </button>
              </div>
            )
          }
        </div>
      </div>
      
      {showBulkUpload && (
        <BulkUploadModal 
          onClose={() => setShowBulkUpload(false)}
          jobDetails={jobDetails}
        />
      )}
    </div>
  );
};

export default MarketplaceResumeUpload;
