import React from 'react';
import { PageHead, MetricGrid, Section, Pipeline, LoadingRow, PrimaryButton } from '../../dashboard/DashboardUI';
import {
  isJobOpen,
  hasCvStrength,
  codingTestSent,
  hasAiInterview,
  hasScorecard,
  sharedOnward,
  isSelected,
  pipelineStages,
} from './useRecruiterPlatformData';

const RecruiterOverview = ({ platform, onNavigate }) => {
  const { jobs, resumes, loading } = platform;

  const metrics = [
    { label: 'Assigned Jobs', value: jobs.length, delta: `${jobs.filter(isJobOpen).length} open` },
    { label: 'Candidates Uploaded', value: resumes.length },
    { label: 'CV Strength', value: resumes.filter(hasCvStrength).length },
    { label: 'Coding Tests Sent', value: resumes.filter(codingTestSent).length },
    { label: 'AI Interviews', value: resumes.filter(hasAiInterview).length },
    { label: 'Scorecards', value: resumes.filter(hasScorecard).length },
    { label: 'Shared to Manager', value: resumes.filter(sharedOnward).length },
    { label: 'Selected', value: resumes.filter(isSelected).length },
  ];

  return (
    <>
      <PageHead
        eyebrow="Recruiter"
        title="Candidate operations"
        sub="Upload resumes for assigned jobs and monitor the automated pipeline"
        action={<PrimaryButton onClick={() => onNavigate('Upload Candidates')}>+ Upload Resumes</PrimaryButton>}
      />

      {loading ? <LoadingRow label="Loading your work…" /> : <MetricGrid items={metrics} />}

      <Section>Current pipeline</Section>
      <Pipeline stages={pipelineStages(resumes)} />
    </>
  );
};

export default RecruiterOverview;
