import React, { useState } from 'react';
import { Card, PageHead, Section, StatusPill, LoadingRow, PrimaryButton, GhostButton } from '../../dashboard/DashboardUI';
import ResumeUpload from './ResumeUpload';
import { isJobOpen, isJobUrgent } from './useRecruiterPlatformData';

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

/**
 * ResumeUpload's AI parse step matches the resume against the job, and saves
 * against `jobId`, so the selected assigned job is reshaped into the same object
 * the job detail page passes in.
 */
const toJobDetails = (job) => ({
  jobId: job._id,
  _id: job._id,
  jobtitle: cap(job.jobtitle),
  company: job.company,
  location: [cap(job.type), cap(job.location)].filter(Boolean).join(' - '),
  employmentType: cap(job.employmentType),
  experience: job.experience ? `${job.experience}+ years` : '',
  description: job.description,
  responsibilities: job.keyResponsibilities || [],
  requiredSkills: job.skills || [],
  preferredQualifications: job.preferredQualifications || [],
  cvStrengthCutoff: job.cvStrengthCutoff,
  resumeAnalysisPoints: job.resumeAnalysisPoints || [],
});

const RecruiterUpload = ({ platform }) => {
  const { jobs, loading, refresh } = platform;
  const [selectedId, setSelectedId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const openJobs = jobs.filter(isJobOpen);
  const selected = jobs.find((j) => j._id === selectedId) || null;

  if (uploading && selected) {
    return (
      <ResumeUpload
        onBack={() => {
          setUploading(false);
          refresh();
        }}
        jobDetails={toJobDetails(selected)}
      />
    );
  }

  return (
    <div className="p-5 md:p-7 max-w-[1500px]">
      <PageHead
        eyebrow="Candidate intake"
        title="Upload Candidates"
        sub="Upload resumes against an assigned job"
        action={
          <PrimaryButton disabled={!selected} onClick={() => selected && setUploading(true)}>
            + Upload Resumes
          </PrimaryButton>
        }
      />

      <Card className="p-[17px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[13px]">
          <div>
            <b className="text-sm">Selected job</b>
            <p className="text-xs text-[#778092] mt-1.5">
              {selected ? selected.jobtitle : 'Pick an assigned job below'}
            </p>
          </div>
          <div>
            <b className="text-sm">CV Strength cut-off</b>
            <p className="text-[#024bff] font-extrabold text-lg mt-1">
              {selected?.cvStrengthCutoff ?? '—'}
            </p>
          </div>
          <div>
            <b className="text-sm">Accepted files</b>
            <p className="text-xs text-[#778092] mt-1.5">PDF / DOCX</p>
          </div>
        </div>
      </Card>

      <Section>Choose an assigned job</Section>
      {loading ? (
        <LoadingRow label="Loading assigned jobs…" />
      ) : openJobs.length === 0 ? (
        <Card className="p-[17px] text-xs text-[#778092]">
          No open jobs are assigned to you. Your manager assigns the requirements you upload against.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[13px]">
          {openJobs.map((job) => {
            const active = job._id === selectedId;
            return (
              <Card
                key={job._id}
                onClick={() => setSelectedId(job._id)}
                className={`p-[17px] cursor-pointer transition-colors ${
                  active ? 'border-[#024bff] bg-[#f8faff]' : 'hover:border-[#c7d5ff]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <StatusPill tone={isJobUrgent(job) ? 'amber' : 'green'}>
                    {isJobUrgent(job) ? 'Urgent' : 'Live'}
                  </StatusPill>
                  {job.cvStrengthCutoff != null && (
                    <span className="text-[#024bff] font-extrabold text-[11px]">
                      CV &ge; {job.cvStrengthCutoff}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold mt-3 mb-1.5">{job.jobtitle}</h3>
                <div className="text-[10px] text-[#778092] leading-[1.8]">
                  {job.company || 'Zepul'}
                  <br />
                  {[cap(job.type), cap(job.location)].filter(Boolean).join(' · ') || 'Location not set'}
                  <br />
                  {job.openpositions || 1} opening{(job.openpositions || 1) !== 1 ? 's' : ''} ·{' '}
                  {job.totalApplication_number || 0} candidates
                </div>
                {active && (
                  <GhostButton
                    className="mt-3 w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploading(true);
                    }}
                  >
                    Upload against this job
                  </GhostButton>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RecruiterUpload;
