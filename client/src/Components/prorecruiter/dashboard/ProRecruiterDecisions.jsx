import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, PageHead, Section, StatusPill, LoadingRow, PrimaryButton, GhostButton } from '../../dashboard/DashboardUI';
import { API, readAuth } from '../../dashboard/dashboardUtils';
import { hasScorecard, statusTone } from '../../manager/dashboard/useManagerPlatformData';

/**
 * The final hiring call on candidates the automated workflow has produced a
 * scorecard for. "Take forward" and "Do not proceed" write the resume status —
 * the same endpoint the pipeline elsewhere reads from.
 */
const DECISIONS = {
  forward: { status: 'shortlisted', label: 'taken forward' },
  reject: { status: 'rejected', label: 'marked as not proceeding' },
};

const ProRecruiterDecisions = ({ platform }) => {
  const { resumes, jobs, loading, refresh } = platform;
  const [pending, setPending] = useState(null);

  const jobTitles = jobs.reduce((acc, job) => {
    acc[job._id] = job.jobtitle;
    return acc;
  }, {});

  // Decided candidates drop out of the queue; everything with a scorecard and no
  // decision yet is waiting on the manager.
  const awaiting = resumes.filter(
    (r) => hasScorecard(r) && !['shortlisted', 'rejected', 'offered', 'hired'].includes(r.status)
  );
  const decided = resumes.filter((r) => ['shortlisted', 'rejected', 'offered', 'hired'].includes(r.status));

  const decide = async (resume, kind) => {
    const { status, label } = DECISIONS[kind];
    const { token } = readAuth();
    setPending(`${resume._id}:${kind}`);
    try {
      const res = await fetch(`${API}/api/manager/resumes/${resume._id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Could not save the decision');
      toast.success(`${resume.name || 'Candidate'} ${label}.`);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <PageHead
        eyebrow="Final decision"
        title="Hiring Decisions"
        sub="You make the final hiring call on decision-ready candidates"
      />

      {loading ? (
        <LoadingRow label="Loading decisions…" />
      ) : awaiting.length === 0 ? (
        <Card className="p-[17px] text-xs text-[#778092]">
          No candidates are waiting on a decision. Scorecard-ready candidates appear here.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[13px]">
          {awaiting.map((r) => (
            <Card key={r._id} className="p-[17px] flex flex-col">
              <b className="text-sm">{r.name || 'Unnamed candidate'}</b>
              <p className="text-xs text-[#778092] mt-1.5">
                Scorecard ready · {jobTitles[r.jobId] || r.jobId?.jobtitle || 'Requirement'}
              </p>
              <div className="text-[28px] font-extrabold text-[#159b65] my-2">
                {r.ats_score ?? r.score ?? r.totalscore ?? '—'}
              </div>
              <div className="flex gap-2 mt-auto">
                <PrimaryButton
                  disabled={pending !== null}
                  onClick={() => decide(r, 'forward')}
                >
                  {pending === `${r._id}:forward` ? 'Saving…' : 'Take Forward'}
                </PrimaryButton>
                <GhostButton disabled={pending !== null} onClick={() => decide(r, 'reject')}>
                  {pending === `${r._id}:reject` ? 'Saving…' : 'Do Not Proceed'}
                </GhostButton>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Section>Already decided ({decided.length})</Section>
      {decided.length === 0 ? (
        <Card className="p-[17px] text-xs text-[#778092]">No decisions recorded yet.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[13px]">
          {decided.map((r) => (
            <Card key={r._id} className="p-[17px]">
              <div className="flex items-start justify-between gap-2">
                <b className="text-sm">{r.name || 'Unnamed candidate'}</b>
                <StatusPill tone={statusTone(r.status)}>{r.status}</StatusPill>
              </div>
              <p className="text-xs text-[#778092] mt-1.5">
                {jobTitles[r.jobId] || r.jobId?.jobtitle || 'Requirement'}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};

export default ProRecruiterDecisions;
