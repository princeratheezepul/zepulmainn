import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Card,
  PageHead,
  Section,
  StatusPill,
  Chip,
  LoadingRow,
  PrimaryButton,
  GhostButton,
} from '../../dashboard/DashboardUI';
import { API, readAuth, relativeTime } from '../../dashboard/dashboardUtils';

const companyOf = (job) => job?.company || job?.companyName || job?.managerId?.fullname || 'Zepul';

const isUrgent = (job) => Array.isArray(job?.priority) && job.priority.includes('High');

/**
 * Requirements Zepul managers have published for ProRecruiters.
 *
 * Picking one adds it to this ProRecruiter's own jobs, where recruiters are
 * assigned and the automated pipeline runs — the job itself still belongs to
 * the manager who published it. A listing stays open after a pick, so more than
 * one partner can work the same requirement.
 */
const ProRecruiterMarketplace = ({ onPicked, onOpenJobs }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    const { token } = readAuth();
    if (!token) {
      setError('No authentication token found');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/manager/marketplace/available`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not load the marketplace');
      setJobs(Array.isArray(data.jobs) ? data.jobs : []);
    } catch (err) {
      setError(err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (job, action) => {
    const { token } = readAuth();
    setBusyId(job._id);
    try {
      const res = await fetch(`${API}/api/manager/marketplace/${job._id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      toast.success(
        action === 'pick' ? 'Picked — it’s now in your jobs.' : 'Released back to the marketplace.'
      );
      await load();
      onPicked?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const available = jobs.filter((j) => !j.alreadyPicked);
  const mine = jobs.filter((j) => j.alreadyPicked);

  const card = (job) => (
    <Card key={job._id} className="p-[17px] flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <StatusPill tone={isUrgent(job) ? 'amber' : 'green'}>
          {isUrgent(job) ? 'Urgent' : 'Live'}
        </StatusPill>
        {job.cvStrengthCutoff != null && (
          <span className="text-[#024bff] font-extrabold text-[11px]">CV &ge; {job.cvStrengthCutoff}</span>
        )}
      </div>

      <h3 className="text-sm font-bold mt-3 mb-1.5">{job.jobtitle}</h3>

      <div className="text-[10px] text-[#778092] leading-[1.8]">
        {companyOf(job)}
        <br />
        {[job.type, job.location].filter(Boolean).join(' · ') || 'Location not set'}
        {job.experience ? ` · ${job.experience}+ yrs` : ''}
        <br />
        {job.openpositions || 0} openings · {job.totalApplication_number || 0} candidates
      </div>

      <div className="flex-1">
        {job.marketplace?.commissionRate != null && <Chip>{job.marketplace.commissionRate}% commission</Chip>}
        <Chip>Listed {relativeTime(job.marketplace?.listedAt)}</Chip>
        {job.pickedCount > 0 && (
          <Chip>
            {job.pickedCount} partner{job.pickedCount === 1 ? '' : 's'} working it
          </Chip>
        )}
      </div>

      {job.alreadyPicked ? (
        <div className="mt-3 flex gap-2">
          <PrimaryButton className="flex-1" onClick={onOpenJobs}>
            Open in Jobs
          </PrimaryButton>
          <GhostButton disabled={busyId === job._id} onClick={() => act(job, 'release')}>
            {busyId === job._id ? '…' : 'Release'}
          </GhostButton>
        </div>
      ) : (
        <PrimaryButton
          className="mt-3 w-full"
          disabled={busyId === job._id}
          onClick={() => act(job, 'pick')}
        >
          {busyId === job._id ? 'Picking…' : 'Pick this job'}
        </PrimaryButton>
      )}
    </Card>
  );

  return (
    <>
      <PageHead
        eyebrow="Marketplace"
        title="Zepul Marketplace"
        sub="Requirements published by Zepul managers — pick one up and it joins your jobs"
        action={<GhostButton onClick={load}>Refresh</GhostButton>}
      />

      {error && <Card className="p-[17px] text-xs text-[#d84c4c] mb-4">{error}</Card>}

      {loading ? (
        <LoadingRow label="Loading the marketplace…" />
      ) : (
        <>
          <Section>Available to pick ({available.length})</Section>
          {available.length === 0 ? (
            <Card className="p-[17px] text-xs text-[#778092]">
              Nothing available right now. New requirements appear here as Zepul managers publish them.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[13px]">
              {available.map(card)}
            </div>
          )}

          <Section>Picked by you ({mine.length})</Section>
          {mine.length === 0 ? (
            <Card className="p-[17px] text-xs text-[#778092]">
              Nothing picked yet. Anything you pick shows up in <b>Jobs</b>, where you assign
              recruiters and the pipeline runs.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[13px]">
              {mine.map(card)}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ProRecruiterMarketplace;
