import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getApiUrl } from '../config/config';
import { generateZepPrepPDF } from '../utils/zepPrepGenerator';
import { getLoggedInCandidate } from '../utils/candidateAuth';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * "Get Free Interview Prep" — upload a resume plus the target job description
 * and get a tailored prep document back as a PDF.
 *
 * Shared by the ZepJobs landing page and the candidate dashboard so both stay
 * in step. Styling comes from ZepJobs.css, which the hosting page must import.
 */
const InterviewPrepPanel = ({ id, labelledBy }) => {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [prepLoading, setPrepLoading] = useState(false);

  const acceptFile = (setter) => (file) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('That file is over 10MB. Please upload a smaller one.');
      return;
    }
    setter(file);
  };

  const onDrop = (setter) => (e) => {
    e.preventDefault();
    setDragOver(null);
    acceptFile(setter)(e.dataTransfer.files?.[0]);
  };

  const onDragOver = (key) => (e) => {
    e.preventDefault();
    setDragOver(key);
  };

  const handleGeneratePrep = async () => {
    // Guard at submit time — the session can expire while the tab is open.
    if (!getLoggedInCandidate()) {
      navigate('/candidate/login');
      return;
    }

    if (!resumeFile || !jdFile) {
      toast.error('Add both your resume and the job description first.');
      return;
    }

    setPrepLoading(true);
    const pending = toast.loading('Reading your resume and the job description…');
    try {
      const form = new FormData();
      form.append('resume', resumeFile);
      form.append('jobDescription', jdFile);

      const res = await fetch(getApiUrl('/api/candidate-application/prep/from-upload'), {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.prep) {
        throw new Error(data.message || 'Failed to build your prep document');
      }

      toast.dismiss(pending);
      await generateZepPrepPDF(data.prep);
    } catch (err) {
      toast.dismiss(pending);
      toast.error(err.message || 'Failed to build your prep document');
    } finally {
      setPrepLoading(false);
    }
  };

  return (
    <div className="search-panel" role="tabpanel" id={id} aria-labelledby={labelledBy}>
      <div className="search-label">Resume + Job Description → Prep Document</div>
      <p className="prep-intro">
        Upload your resume and the job description you're targeting. Zepul AI compares the
        two and builds a tailored prep document — likely interview questions, talking points
        from your own experience, and gaps worth addressing before you walk in.
      </p>

      <div className="prep-uploads">
        <label
          className={`prep-drop${dragOver === 'resume' ? ' is-over' : ''}${resumeFile ? ' has-file' : ''}`}
          onDragOver={onDragOver('resume')}
          onDragLeave={() => setDragOver(null)}
          onDrop={onDrop(setResumeFile)}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => acceptFile(setResumeFile)(e.target.files?.[0])}
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8">
            <path d="M12 15V3m0 0-4 4m4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" strokeLinecap="round" />
          </svg>
          <span className="prep-drop-title">Upload your resume</span>
          <span className="prep-drop-sub">{resumeFile ? resumeFile.name : 'PDF or DOCX, up to 10MB'}</span>
        </label>

        <label
          className={`prep-drop${dragOver === 'jd' ? ' is-over' : ''}${jdFile ? ' has-file' : ''}`}
          onDragOver={onDragOver('jd')}
          onDragLeave={() => setDragOver(null)}
          onDrop={onDrop(setJdFile)}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={(e) => acceptFile(setJdFile)(e.target.files?.[0])}
          />
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8">
            <path d="M7 3h7l4 4v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1z" strokeLinejoin="round" />
            <path d="M9 12h6M9 16h6" strokeLinecap="round" />
          </svg>
          <span className="prep-drop-title">Add the job description</span>
          <span className="prep-drop-sub">{jdFile ? jdFile.name : 'Upload a file or paste the text'}</span>
        </label>
      </div>

      <div className="search-actions prep">
        <span className="prep-free">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          100% free
        </span>
        <button className="search-btn blue-btn" onClick={handleGeneratePrep} disabled={prepLoading}>
          {prepLoading ? 'Building your prep document…' : 'Generate My Prep Document'}
          {!prepLoading && (
            <svg viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 5.5h7M6 2.5l3 3-3 3" /></svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default InterviewPrepPanel;
