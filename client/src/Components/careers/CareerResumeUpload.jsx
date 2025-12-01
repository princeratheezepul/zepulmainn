import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, ArrowLeft, Loader2 } from 'lucide-react';
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mammoth from "mammoth";
import ResumeDetailsView from '../recruiter/dashboard/ResumeDetailsView';
import toast from 'react-hot-toast';

GlobalWorkerOptions.workerSrc = workerUrl;

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);

const CareerResumeUpload = ({ onBack, jobDetails }) => {
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [parsedData, setParsedData] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setLoading(true);
        setLoadingMessage("Extracting text from resume...");

        try {
            let text = "";
            if (file.type === "application/pdf") {
                text = await extractTextFromPDF(file);
            } else if (file.name.endsWith(".docx") || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                text = await extractTextFromDocx(file);
            } else {
                toast.error("Unsupported file format. Please upload a PDF or DOCX file.");
                throw new Error("Unsupported file format. Please upload a PDF or DOCX file.");
            }

            setLoadingMessage("Analyzing resume with AI...");
            const analysis = await analyzeResume(text, jobDetails);

            setLoadingMessage("Calculating ATS Score...");
            let atsResult;
            try {
                atsResult = await fetchATSScore(text);
            } catch (atsError) {
                toast.error(atsError.message || "Failed to calculate ATS score.");
                throw atsError;
            }

            const finalData = {
                ...analysis,
                overallScore: Math.round(atsResult.ats_score),
                ats_score: atsResult.ats_score,
                ats_reason: atsResult.ats_reason,
                ats_breakdown: atsResult.ats_breakdown
            };

            setLoadingMessage("Submitting application...");
            const saved = await saveResumeToDB(finalData, jobDetails._id);
            setParsedData(saved.resume);
            toast.success("Application submitted successfully!");

        } catch (error) {
            console.error("Error processing resume:", error);
            toast.error(error.message || "Failed to process the resume.");
        } finally {
            setLoading(false);
            setLoadingMessage("");
        }
    }, [jobDetails]);

    const extractTextFromPDF = async (file) => {
        const fileReader = new FileReader();
        return new Promise((resolve, reject) => {
            fileReader.onload = async function () {
                const typedarray = new Uint8Array(this.result);
                try {
                    const pdf = await pdfjsLib.getDocument({ data: typedarray }).promise;
                    let fullText = "";
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const content = await page.getTextContent();
                        fullText += content.items.map((item) => item.str).join(" ");
                    }
                    resolve(fullText);
                } catch (err) {
                    console.error("Error extracting PDF text:", err);
                    reject("Failed to read PDF.");
                }
            };
            fileReader.readAsArrayBuffer(file);
        });
    };

    const extractTextFromDocx = async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
    };

    const saveResumeToDB = async (resumeData, jobId) => {
        try {
            console.log('Saving career resume data:', resumeData);
            console.log('JobId:', jobId);
            const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/marketplace/public/jobs/${jobId}/apply`;
            console.log('API URL:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resumeData),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Failed to submit application';

                try {
                    const errorData = await response.json();
                    console.error('Server error response:', errorData);
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    const errorText = await response.text();
                    console.error('Non-JSON error response:', errorText);
                    errorMessage = `Server error (${response.status}): ${response.statusText}`;
                }

                throw new Error(errorMessage);
            }

            const result = await response.json();
            console.log('Career resume saved successfully:', result);
            return result.data;
        } catch (error) {
            console.error('Error saving career resume:', error);
            throw new Error(`Failed to submit application: ${error.message}`);
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
        "Experience Relevance & Depth": 25 // 0-25 points
        "Project & Achievement Validation": 15 // 0-15 points
        "Consistency Check": 15 // 0-15 points
        "AI-Generated Resume Detection": 5 // 0-5 points (PENALTY category)
        "Resume Quality Score": 5 // 0-5 points
        "Interview & Behavioral Prediction": 5 // 0-5 points
        "Competitive Fit & Market Standing": 5 // 0-5 points
      }

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
        "ats_score": number,
        "reason": string
      }

      Job Details:
      Title: ${jobDetails.title}
      Company: ${jobDetails.company}
      Location: ${jobDetails.location}
      Type: ${jobDetails.type}
      Experience: ${jobDetails.experience}
      Salary: ${jobDetails.salary}
      Description: ${jobDetails.description}
      Required Skills: ${(jobDetails.skills || []).join(", ")}

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
      - Title: ${job.title}
      - Description: ${job.description}
      - Required Skills: ${(job.skills || []).join(", ")}

      Resume Text:
      ---
      ${resumeText}
      ---

      Based on the job details and resume text, provide a detailed analysis in a pure JSON format. Do not include any markdown, code blocks, or explanations. The JSON object should have the following structure:
      {
        "name": "Full Name",
        "title": "Professional Title",
        "skills": ["Top 10 most relevant technical skills"],
        "email": "contact@email.com",
        "phone": "+1234567890",
        "experience": "Total years of experience as a string",
        "location": "City, Country",
        "aiSummary": {
          "technicalExperience": "A 1-2 sentence summary of their technical background.",
          "projectExperience": "A 1-2 sentence summary of their project work.",
          "education": "A 1-2 sentence summary of their educational qualifications.",
          "keyAchievements": "A 1-2 sentence summary of their achievements.",
          "skillMatch": "A 1-2 sentence analysis of skill alignment.",
          "competitiveFit": "A 1-2 sentence assessment of competitive position.",
          "consistencyCheck": "A 1-2 sentence evaluation of career consistency."
        },
        "aiScorecard": {
          "technicalSkillMatch": number,
          "competitiveFit": number,
          "consistencyCheck": number,
          "teamLeadership": number
        },
        "recommendation": "A short, decisive recommendation",
        "keyStrength": ["2-3 key strengths"],
        "potentialConcern": ["2-3 potential concerns"],
        "about": "A brief 'About' section",
        "applicationDetails": {
            "position": "${job.title}",
            "date": "${new Date().toLocaleDateString()}",
            "noticePeriod": "Extract from resume if available, otherwise 'N/A'",
            "source": "Career Website"
        }
      }
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
        return <ResumeDetailsView resumeData={parsedData} onBack={onBack} isCareer={true} jobDetailsOverride={jobDetails} />;
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4 mb-8 w-full max-w-5xl">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-800 flex items-center gap-2" disabled={loading}>
                    <ArrowLeft size={24} />
                    <span className="text-sm font-medium">Back to Job</span>
                </button>
            </div>
            <div className="flex-grow w-full flex items-center justify-center">
                <div
                    {...getRootProps()}
                    className={`w-full max-w-3xl min-h-[320px] border-2 border-dashed rounded-xl p-8 sm:p-10 md:p-12 text-center cursor-pointer transition-all duration-300 ease-in-out flex flex-col items-center justify-center bg-white ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
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
                                <p className="text-xl font-semibold text-gray-800">Select your resume or drag and drop</p>
                                <p className="text-sm text-gray-500 mt-1">PDF or DOCX files accepted</p>
                                <button className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                                    Browse Files
                                </button>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default CareerResumeUpload;
