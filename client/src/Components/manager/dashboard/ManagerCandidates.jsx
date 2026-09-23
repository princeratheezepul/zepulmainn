import React from 'react';
import { PageHead, MetricGrid, Section, Pipeline, TableCard, StatusPill, LoadingRow } from '../../dashboard/DashboardUI';
import {
  pipelineStages,
  hasCvStrength,
  hasCodingTest,
  hasAiInterview,
  hasScorecard,
  atClientReview,
  statusTone,
} from './useManagerPlatformData';

const stageCell = (done, pending = 'Not sent') => (
  <span className={done ? 'text-[#159b65] font-bold' : 'text-[#778092]'}>{done ? 'Completed' : pending}</span>
);

const ManagerCandidates = ({ platform }) => {
  const { resumes, resumeStats, jobs, loading } = platform;

  const jobTitles = jobs.reduce((acc, job) => {
    acc[job._id] = job.jobtitle;
    return acc;
  }, {});

  return (
    <>
      <PageHead
        eyebrow="Execution"
        title="Candidate Pipeline"
        sub="Monitor candidates across automated evaluation"
      />

      <MetricGrid
        items={[
          { label: 'Candidates', value: resumes.length },
          { label: 'Reviewed', value: resumeStats.reviewedResumes, delta: `${resumeStats.reviewedPercent}%` },
          { label: 'Awaiting Review', value: resumeStats.pendingResumes },
          { label: 'With Client', value: resumes.filter(atClientReview).length },
        ]}
      />

      <Section>Live execution</Section>
      <Pipeline stages={pipelineStages(resumes)} />

      <Section>Candidate pipeline</Section>
      {loading ? (
        <LoadingRow label="Loading candidates…" />
      ) : (
        <TableCard
          title={`Candidates (${resumes.length})`}
          badge={<StatusPill tone="grey">Automated workflow</StatusPill>}
          columns={['Candidate', 'Job', 'CV Strength', 'Coding', 'AI Interview', 'Scorecard', 'Status']}
          rows={resumes.map((r) => [
            <b key="n">{r.name || 'Unnamed candidate'}</b>,
            jobTitles[r.jobId] || '—',
            hasCvStrength(r) ? (
              <span key="c" className={r.ats_score >= 78 ? 'text-[#159b65] font-bold' : 'text-[#d84c4c] font-bold'}>
                {r.ats_score}
              </span>
            ) : (
              <span key="c" className="text-[#778092]">—</span>
            ),
            stageCell(hasCodingTest(r)),
            stageCell(hasAiInterview(r), 'Pending'),
            stageCell(hasScorecard(r), '—'),
            <StatusPill key="s" tone={statusTone(r.status)}>
              {r.status || 'submitted'}
            </StatusPill>,
          ])}
          empty="No candidates have been submitted against your requirements yet."
        />
      )}
    </>
  );
};

export default ManagerCandidates;
