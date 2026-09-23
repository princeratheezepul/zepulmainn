import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHead, MetricGrid, Section, Pipeline, TableCard, StatusPill, LoadingRow } from '../../dashboard/DashboardUI';
import {
  hasCvStrength,
  hasCodingTest,
  hasAiInterview,
  hasScorecard,
  sharedOnward,
  isSelected,
  pipelineStages,
  statusTone,
} from './useRecruiterPlatformData';

const stageCell = (done, pending = 'Not sent') => (
  <span className={done ? 'text-[#159b65] font-bold' : 'text-[#778092]'}>{done ? 'Completed' : pending}</span>
);

const RecruiterCandidates = ({ platform }) => {
  const navigate = useNavigate();
  const { resumes, loading } = platform;

  return (
    <>
      <PageHead
        eyebrow="Recruiter"
        title="Candidate Pipeline"
        sub="Monitor status and share shortlisted candidates with your Manager"
      />

      <MetricGrid
        items={[
          { label: 'Candidates', value: resumes.length },
          { label: 'Shared to Manager', value: resumes.filter(sharedOnward).length },
          { label: 'Scorecards Ready', value: resumes.filter(hasScorecard).length },
          { label: 'Selected', value: resumes.filter(isSelected).length },
        ]}
      />

      <Section>Current pipeline</Section>
      <Pipeline stages={pipelineStages(resumes)} />

      <Section>Candidate pipeline</Section>
      {loading ? (
        <LoadingRow label="Loading candidates…" />
      ) : (
        <TableCard
          title={`Candidates (${resumes.length})`}
          badge={<StatusPill tone="grey">Automated workflow</StatusPill>}
          columns={['Candidate', 'Job', 'CV Strength', 'Coding', 'AI Interview', 'Scorecard', 'Status', '']}
          rows={resumes.map((r) => [
            <b key="n">{r.name || 'Unnamed candidate'}</b>,
            r.jobId?.jobtitle || '—',
            hasCvStrength(r) ? (
              <span
                key="c"
                className={
                  r.jobId?.cvStrengthCutoff != null && r.ats_score < r.jobId.cvStrengthCutoff
                    ? 'text-[#d84c4c] font-bold'
                    : 'text-[#159b65] font-bold'
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
            <span
              key="a"
              className="text-[#024bff] font-bold cursor-pointer hover:underline"
              onClick={() => navigate(`/recruiter/${r._id}`)}
            >
              View
            </span>,
          ])}
          empty="You have not uploaded any candidates yet."
        />
      )}
    </>
  );
};

export default RecruiterCandidates;
