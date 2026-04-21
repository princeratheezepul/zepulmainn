import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, ArrowLeft, Loader2, Upload } from 'lucide-react';
import BulkUploadModal from '../recruiter/dashboard/BulkUploadModal';
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerUrl from "pdfjs-dist/build/pdf.worker.mjs?url";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import ResumeDetailsView from '../recruiter/dashboard/ResumeDetailsView';
import { useMarketplaceAuth } from '../../context/MarketplaceAuthContext';
import { useApi } from '../../hooks/useApi';
import toast from 'react-hot-toast';

GlobalWorkerOptions.workerSrc = workerUrl;

const MarketplaceResumeUpload = ({ onBack, jobDetails }) => {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [parsedData, setParsedData] = useState(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const { user, isAuthenticated, apiCall } = useMarketplaceAuth();
  const { post } = useApi();

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

    } catch (error) {
      console.error("Error processing resume:", error);
      toast.error(error.message || "Failed to process the resume.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  }, [jobDetails, post]);

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
      // Use marketplace API call method
      const response = await apiCall(`${import.meta.env.VITE_BACKEND_URL}/api/marketplace/resumes/save/${jobId}`, {
        method: 'POST',
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to save resume data';

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          const errorText = await response.text();
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.data; // Return the data field from ApiResponse
    } catch (error) {
      console.error('Error saving marketplace resume:', error);
      throw new Error(`Failed to save resume data to database: ${error.message}`);
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
    return <ResumeDetailsView resumeData={parsedData} onBack={onBack} isMarketplace={true} marketplaceJobDetails={jobDetails} onResumeUpdate={() => { }} />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4" style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
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
          className={`w-full max-w-4xl min-h-[320px] border-2 border-dashed rounded-xl p-8 sm:p-10 md:p-12 text-center cursor-pointer transition-all duration-300 ease-in-out flex flex-col items-center justify-center bg-white ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
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
