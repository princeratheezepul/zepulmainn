import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, ArrowLeft, Loader2, Upload } from 'lucide-react';
import BulkUploadModal from './BulkUploadModal';
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import ResumeDetailsView from './ResumeDetailsView';
import { useAuth } from '../../../context/AuthContext';
import { useApi } from '../../../hooks/useApi';
import toast from 'react-hot-toast';

GlobalWorkerOptions.workerSrc = workerUrl;

const ResumeUpload = ({ onBack, jobDetails }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { post, get } = useApi();

  // Test authentication function
  const testAuth = async () => {
    try {
      const response = await get(`${import.meta.env.VITE_BACKEND_URL}/api/recruiter/test-auth`);
      const data = await response.json();
      console.log('Auth test result:', data);
      return data;
    } catch (error) {
      console.error('Auth test failed:', error);
      return null;
    }
  };

  // Test authentication on component mount
  useEffect(() => {
    testAuth();
  }, []);

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

      const parseResponse = await post(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/parse-ai`, {
        text,
        job: jobDetails
      });

      if (!parseResponse.ok) {
        let errMessage = "AI parsing failed";
        try {
          const errData = await parseResponse.json();
          errMessage = errData.message || errMessage;
        } catch { } // ignore
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
      const saved = await saveResumeToDB(finalData, jobDetails.jobId);
      setParsedData(saved.resume); // Use the DB object with _id

      // Save structured resume data (projects, experience, achievements, skills, education)
      if (analysis.resumeContent) {
        setLoadingMessage("Saving structured resume data...");
        await saveResumeDataToDB(analysis.resumeContent);
      }

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
          console.error("Error extracting PDF text, falling back to OCR:", err);
          // Fallback to OCR can be implemented here if needed
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
      console.log('Saving resume data:', resumeData);
      console.log('JobId:', jobId);
      console.log('API URL:', `${import.meta.env.VITE_BACKEND_URL}/api/resumes/save/${jobId}`);

      // Debug: Check if user is authenticated
      const userInfo = localStorage.getItem('userInfo');
      const authToken = localStorage.getItem('authToken');
      console.log('User info from localStorage:', userInfo);
      console.log('Auth token from localStorage:', authToken);
      console.log('AuthContext user:', user);
      console.log('AuthContext isAuthenticated:', isAuthenticated);

      // Debug: Check cookies
      console.log('All cookies:', document.cookie);

      // Use useApi hook for consistent authentication
      const response = await post(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/save/${jobId}`, resumeData);

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
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Resume saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving resume:', error);
      throw new Error(`Failed to save resume data to database: ${error.message}`);
    }
  };
  const saveResumeDataToDB = async (resumeContent) => {
    try {
      console.log('Saving structured resume data:', resumeContent);
      const response = await post(`${import.meta.env.VITE_BACKEND_URL}/api/resume-data/save`, resumeContent);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to save resume data:', errorData);
        return null;
      }

      const result = await response.json();
      console.log('Resume data saved successfully:', result);
      return result;
    } catch (error) {
      console.error('Error saving resume data:', error);
      // Don't throw - this is non-critical and shouldn't block the main flow
      return null;
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
    return <ResumeDetailsView resumeData={parsedData} onBack={onBack} jobDetailsOverride={jobDetails} />;
  }

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-white p-4 overflow-x-hidden">
      <div className="flex items-center justify-between gap-4 mb-8 w-full max-w-5xl">
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
          className={`w-full max-w-3xl min-h-[320px] border-2 border-dashed rounded-xl p-8 sm:p-10 md:p-12 text-center cursor-pointer transition-all duration-300 ease-in-out flex flex-col items-center justify-center bg-gray-50 ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
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
                <button className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
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

export default ResumeUpload; 
