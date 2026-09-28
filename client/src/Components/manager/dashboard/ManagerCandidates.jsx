import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { PageHead, MetricGrid, Section, Pipeline, TableCard, StatusPill, LoadingRow } from '../../dashboard/DashboardUI';
import MarketplacePicksDrawer from './MarketplacePicksDrawer';
import { readAuth } from '../../dashboard/dashboardUtils';
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
  backTo = '/manager/dashboard?tab=Candidates',
  jobBasePath = '/manager/jobs',
}) => {
  const navigate = useNavigate();
  const [picksFor, setPicksFor] = useState(null);
  const { resumes, resumeStats, jobs, loading } = platform;
  const viewerId = readAuth().userId;

  // Each job carries its own CV cut-off, so a score is judged against the job it
  // was submitted for rather than a single platform-wide threshold.
  const jobsById = jobs.reduce((acc, job) => {
    acc[job._id] = job;
    return acc;
  }, {});

  // Who picked a listing is the publishing manager's to see, so the control only
  // appears on listings this viewer owns.
  const canSeePicks = (job) =>
    Boolean(job?.marketplace?.isListed) &&
    String(job?.managerId?._id || job?.managerId || '') === String(viewerId || '');

  const jobCell = (job) => {
    if (!job) return <span className="text-[#778092]">—</span>;
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          title={`Open ${job.jobtitle}`}
          onClick={() => navigate(`${jobBasePath}/${job._id}`, { state: { from: backTo } })}
          className="text-left text-[#024bff] font-bold hover:underline cursor-pointer"
        >
          {job.jobtitle}
        </button>
        {canSeePicks(job) && (
          <button
            type="button"
            title="See who picked this job"
            aria-label={`See who picked ${job.jobtitle}`}
            onClick={() => setPicksFor(job)}
            className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-[#778092] hover:text-[#024bff] border border-[#e7ebf2] rounded px-1.5 py-0.5 transition-colors cursor-pointer"
          >
            <Users size={11} />
            {job.marketplace?.pickedBy?.length || 0}
          </button>
        )}
      </span>
    );
  };

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
      <Pipeline stages={pipelineStages(resumes, { exclude: ['cvStrength', 'scorecards', 'clientReview'] })} />

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
            jobCell(jobsById[r.jobId] || (typeof r.jobId === 'object' ? r.jobId : null)),
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

      {picksFor && <MarketplacePicksDrawer job={picksFor} onClose={() => setPicksFor(null)} />}
    </>
  );
};

export default ManagerCandidates;
