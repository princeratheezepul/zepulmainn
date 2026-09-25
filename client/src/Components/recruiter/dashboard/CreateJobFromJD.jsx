import React, { useState } from 'react';
import toast from 'react-hot-toast';
import CreateJobManager from './CreateJobManager.jsx';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ACCEPTED = '.pdf,.docx,.txt';

/**
 * "Upload JD" job creation. The document is sent to the server, which pulls its
 * text out and has OpenAI structure it into job fields. Those fields are then
 * dropped into the normal create-job form so the manager can check the parse
 * before the job is actually created.
 */
const CreateJobFromJD = ({ onBack, onCreated, extraPayload }) => {
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [parsed, setParsed] = useState(null);

  const acceptFile = (candidate) => {
    if (!candidate) return;
    if (candidate.size > MAX_UPLOAD_BYTES) {
      toast.error('That file is over 10MB. Please upload a smaller one.');
      return;
    }
    setFile(candidate);
  };

  const handleRead = async () => {
    if (!file) {
      toast.error('Please choose a job description file first.');
      return;
    }

    setIsReading(true);
    const pending = toast.loading('Reading your job description…');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.data?.accessToken;
      if (!token) {
        throw new Error('No authentication token found');
      }

      const form = new FormData();
      form.append('jobDescription', file);

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/job-from-jd`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.job) {
        throw new Error(data.message || 'Could not read that job description');
      }

      toast.dismiss(pending);
      toast.success('Job description read — please review the details.');
      setParsed(data.job);
    } catch (err) {
      toast.dismiss(pending);
      toast.error(err.message || 'Could not read that job description');
    } finally {
      setIsReading(false);
    }
  };

  // Parsed — hand off to the normal form, pre-filled, for a final check.
  if (parsed) {
    return (
      <CreateJobManager
        initialValues={parsed}
        onBack={() => setParsed(null)}
        onCreated={onCreated}
        extraPayload={extraPayload}
      />
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      <div className="flex items-center px-8 pt-8">
        <button
          type="button"
          onClick={onBack}
          className="mr-4 text-2xl text-gray-500 hover:text-blue-600 font-bold"
          aria-label="Back"
        >
          ←
        </button>
        <div className="text-3xl font-bold">Upload JD</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Upload your job description
          </h2>
          <p className="text-gray-500 mb-8">
            We'll read the document and turn it into a job posting for you. You'll get a
            chance to review everything before it goes live.
          </p>

          <label
            className={`flex flex-col items-center justify-center gap-3 w-full px-6 py-12 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-50'
                : file
                  ? 'border-blue-400 bg-blue-50/50'
                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/40'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              acceptFile(e.dataTransfer.files?.[0]);
            }}
          >
            <input
              type="file"
              accept={ACCEPTED}
              className="hidden"
              onChange={(e) => acceptFile(e.target.files?.[0])}
            />
            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15V3m0 0-4 4m4-4 4 4" />
              <path strokeLinecap="round" d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
            </svg>
            <span className="text-base font-semibold text-gray-900">
              {file ? file.name : 'Drop your JD here, or click to browse'}
            </span>
            <span className="text-sm text-gray-500">PDF, DOCX or TXT, up to 10MB</span>
          </label>

          <button
            type="button"
            onClick={handleRead}
            disabled={!file || isReading}
            className="mt-8 w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
          >
            {isReading ? 'Reading your job description…' : 'Read & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateJobFromJD;
