import React from 'react';
import { PageHead, MetricGrid, Section, Pipeline, LoadingRow, PrimaryButton, GhostButton } from '../../dashboard/DashboardUI';
import {
  isJobOpen,
  sumField,
  hasCodingTest,
  hasAiInterview,
  hasScorecard,
  atClientReview,
  pipelineStages,
} from '../../manager/dashboard/useManagerPlatformData';

const ProRecruiterOverview = ({ platform, onNavigate, hasMarketplaceAccess, onOpenMarketplace, canCreateJob }) => {
  const { jobs, resumes, recruiters, loading } = platform;

  const openJobs = jobs.filter(isJobOpen);
  const shortlisted = resumes.filter((r) => r.status === 'shortlisted').length;
  const selected = resumes.filter((r) => ['offered', 'hired'].includes(r.status)).length;

  const metrics = [
    { label: 'Active Jobs', value: openJobs.length, delta: `${jobs.length} total` },
    { label: 'Candidates', value: resumes.length, delta: `${sumField(jobs, 'totalApplication_number')} applications` },
    { label: 'Coding Tests', value: resumes.filter(hasCodingTest).length },
    { label: 'AI Interviews', value: resumes.filter(hasAiInterview).length },
    { label: 'Scorecards Ready', value: resumes.filter(hasScorecard).length },
    { label: 'Shortlisted', value: shortlisted },
    { label: 'Selected', value: selected },
    { label: 'Positions Closed', value: jobs.filter((j) => !isJobOpen(j)).length },
  ];

  return (
    <>
      <PageHead
        eyebrow="Employer"
        title="Hiring dashboard"
        sub={`Zep Pro Recruiter · ${recruiters.length} recruiter${recruiters.length === 1 ? '' : 's'} on your licence`}
        action={
          <div className="flex gap-2">
            {hasMarketplaceAccess && (
              <GhostButton onClick={onOpenMarketplace}>Marketplace Dashboard</GhostButton>
            )}
            {canCreateJob ? (
              <PrimaryButton onClick={() => onNavigate('Jobs')}>+ Create Job</PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => onNavigate('Marketplace')}>Browse Marketplace</PrimaryButton>
            )}
          </div>
        }
      />

      {loading ? <LoadingRow label="Loading your hiring…" /> : <MetricGrid items={metrics} />}

      <Section>Candidate flow</Section>
      <Pipeline stages={pipelineStages(resumes)} />

      <Section>Awaiting your decision</Section>
      <MetricGrid
        items={[
          { label: 'Scorecards to review', value: resumes.filter((r) => hasScorecard(r) && !atClientReview(r)).length },
          { label: 'Shortlisted', value: shortlisted },
          { label: 'Rejected', value: resumes.filter((r) => r.status === 'rejected').length },
          { label: 'Openings', value: sumField(jobs, 'openpositions') },
        ]}
      />
    </>
  );
};

export default ProRecruiterOverview;
