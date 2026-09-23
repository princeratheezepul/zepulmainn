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

/** A score only reads as failing when the job it belongs to sets a cut-off. */
const belowCutoff = (resume, job) =>
  job?.cvStrengthCutoff != null && resume.ats_score < job.cvStrengthCutoff;

const stageCell = (done, pending = 'Not sent') => (
  <span className={done ? 'text-[#159b65] font-bold' : 'text-[#778092]'}>{done ? 'Completed' : pending}</span>
);

const ManagerCandidates = ({
  platform,
  eyebrow = 'Execution',
  title = 'Candidate Pipeline',
  sub = 'Monitor candidates across automated evaluation',
  // Scorecards view narrows the table to candidates an AI scorecard exists for.
  scorecardsOnly = false,
}) => {
  const { resumes: allResumes, resumeStats, jobs, loading } = platform;
  const resumes = scorecardsOnly ? allResumes.filter(hasScorecard) : allResumes;

  // Each job carries its own CV cut-off, so a score is judged against the job it
  // was submitted for rather than a single platform-wide threshold.
  const jobsById = jobs.reduce((acc, job) => {
    acc[job._id] = job;
    return acc;
  }, {});

  return (
    <>
      <PageHead eyebrow={eyebrow} title={title} sub={sub} />

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
            jobsById[r.jobId]?.jobtitle || r.jobId?.jobtitle || '—',
            hasCvStrength(r) ? (
              <span
                key="c"
                className={
                  belowCutoff(r, jobsById[r.jobId]) ? 'text-[#d84c4c] font-bold' : 'text-[#159b65] font-bold'
                }
              >
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
