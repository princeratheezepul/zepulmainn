import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, ArrowLeft, Loader2 } from 'lucide-react';
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import mammoth from "mammoth";
import ResumeDetailsView from '../recruiter/dashboard/ResumeDetailsView';
import toast from 'react-hot-toast';

GlobalWorkerOptions.workerSrc = workerUrl;

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

            setLoadingMessage("Analyzing resume with AI on server...");

            const parseResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/parse-ai`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    job: jobDetails
                })
            });

            if (!parseResponse.ok) {
                let errMessage = "AI parsing failed";
                try {
                    const errData = await parseResponse.json();
                    errMessage = errData.message || errMessage;
                } catch { }
                throw new Error(`Failed to analyze resume: ${errMessage}`);
            }

            const { analysis, atsResult } = await parseResponse.json();

            const finalData = {
                ...analysis,
                overallScore: Math.round(atsResult.ats_score),
                ats_score: atsResult.ats_score,
                ats_reason: atsResult.ats_reason,
                ats_breakdown: atsResult.ats_breakdown
            };

            setLoadingMessage("Saving details...");
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
            const apiUrl = `${import.meta.env.VITE_BACKEND_URL}/api/marketplace/public/jobs/${jobId}/apply`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(resumeData),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to submit application';
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (parseError) {
                    errorMessage = `Server error (${response.status}): ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error saving career resume:', error);
            throw new Error(`Failed to submit application: ${error.message}`);
        }
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
