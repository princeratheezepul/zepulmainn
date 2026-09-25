import React, { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Card,
  PageHead,
  Section,
  LoadingRow,
  PrimaryButton,
  GhostButton,
  StatusPill,
} from '../../dashboard/DashboardUI';
import { API, readAuth } from '../../dashboard/dashboardUtils';
import CreateJobManager from '../../recruiter/dashboard/CreateJobManager';
import CreateJobFromJD from '../../recruiter/dashboard/CreateJobFromJD';
import { isJobOpen, isJobUrgent, jobCompanyName } from './useManagerPlatformData';

const isListed = (job) => Boolean(job?.marketplace?.isListed);
const pickCount = (job) => job?.marketplace?.pickedBy?.length || 0;

const ManagerMarketplace = ({ platform, hasMarketplaceAccess, onOpenMarketplace }) => {
  const { marketplace, jobs, loading, refresh } = platform;
  // null = the marketplace itself; otherwise which creation flow is open.
  const [createMode, setCreateMode] = useState(null);
  const [busyJobId, setBusyJobId] = useState(null);

  const listed = jobs.filter(isListed);
  const publishable = jobs.filter((j) => isJobOpen(j) && !isListed(j));

  const setListing = useCallback(
    async (job, nextListed) => {
      const { token } = readAuth();
      setBusyJobId(job._id);
      try {
        const res = await fetch(`${API}/api/manager/marketplace/${job._id}/listing`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ isListed: nextListed }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not update the listing');
        toast.success(nextListed ? 'Published to the marketplace' : 'Removed from the marketplace');
        refresh();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setBusyJobId(null);
      }
    },
    [refresh]
  );

  // A job created here is published in the same request that creates it.
  const finishCreate = () => {
    setCreateMode(null);
    refresh();
    if (typeof window.refreshJobs === 'function') window.refreshJobs();
  };

  if (createMode === 'manual' || createMode === 'upload') {
    const Flow = createMode === 'manual' ? CreateJobManager : CreateJobFromJD;
    return (
      <div className="w-full min-h-screen bg-[#F7F8FA]">
        <Flow
          onBack={() => setCreateMode(null)}
          onCreated={finishCreate}
          extraPayload={{ listToMarketplace: true }}
        />
      </div>
    );
  }

  return (
    <div className="p-5 md:p-7 max-w-[1500px]">
      <PageHead
        eyebrow="Marketplace"
        title="Recruitment Partner Marketplace"
        sub="Publish Zepul-generated requirements for ProRecruiters to pick up and work"
        action={
          <div className="flex gap-2">
            {hasMarketplaceAccess && (
              <GhostButton onClick={onOpenMarketplace}>Marketplace Dashboard</GhostButton>
            )}
            <PrimaryButton onClick={() => setCreateMode('choose')}>+ Create Job</PrimaryButton>
          </div>
        }
      />

      {createMode === 'choose' && (
        <Card className="p-[17px] mb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <b className="text-sm">Create a marketplace job</b>
              <p className="text-xs text-[#778092] mt-1.5">
                It goes live for ProRecruiters straight away, and appears in your own jobs too.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCreateMode(null)}
              className="shrink-0 text-xs font-medium text-[#778092] hover:text-[#1d2430] cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[13px] mt-3">
            {[
              { mode: 'manual', title: 'Fill in the form', sub: 'Enter the role details yourself.' },
              { mode: 'upload', title: 'Upload JD', sub: 'Upload a JD and we read it into the form.' },
            ].map((o) => (
              <Card
                key={o.mode}
                className="p-[17px] cursor-pointer hover:border-[#c7d5ff] transition-colors"
                onClick={() => setCreateMode(o.mode)}
              >
                <b className="text-sm">{o.title}</b>
                <p className="text-xs text-[#778092] mt-1.5">{o.sub}</p>
              </Card>
            ))}
          </div>
          <p className="text-xs text-[#778092] mt-3">
            Prefer the AI assistant? Create the job from <b>Jobs</b>, then publish it below.
          </p>
        </Card>
      )}

      {loading ? (
        <LoadingRow label="Loading marketplace…" />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[13px]">
          {[
            { label: 'Listed Requirements', value: listed.length },
            { label: 'Picked by Partners', value: listed.filter((j) => pickCount(j) > 0).length },
            { label: 'Total Picks', value: listed.reduce((n, j) => n + pickCount(j), 0) },
            { label: 'Candidates Selected', value: marketplace.selectedCandidates },
          ].map((m) => (
            <Card key={m.label} className="p-[17px]">
              <div className="text-[10px] text-[#778092]">{m.label}</div>
              <div className="text-[22px] md:text-[25px] font-extrabold my-1.5">{m.value}</div>
            </Card>
          ))}
        </div>
      )}

      <Section>Listed on the marketplace</Section>
      {listed.length === 0 ? (
        <Card className="p-[17px] text-xs text-[#778092]">
          {loading ? 'Loading…' : 'Nothing published yet. Create a job above, or publish one of your existing jobs.'}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[13px]">
          {listed.map((job) => (
            <Card key={job._id} className="p-[17px] flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <StatusPill tone={isJobUrgent(job) ? 'amber' : 'green'}>
                  {isJobUrgent(job) ? 'Urgent' : 'Live'}
                </StatusPill>
                <StatusPill tone={pickCount(job) ? 'green' : 'grey'}>
                  {pickCount(job)} {pickCount(job) === 1 ? 'pick' : 'picks'}
                </StatusPill>
              </div>
              <h3 className="text-sm font-bold mt-3 mb-1.5">{job.jobtitle}</h3>
              <div className="text-[10px] text-[#778092] leading-[1.8] flex-1">
                {jobCompanyName(job)}
                <br />
                {job.location || 'Location not set'}
                {job.experience ? ` · ${job.experience}+ yrs` : ''}
                <br />
                {job.openpositions || 0} openings · {job.totalApplication_number || 0} candidates
              </div>
              <GhostButton
                className="mt-3 w-full"
                disabled={busyJobId === job._id}
                onClick={() => setListing(job, false)}
              >
                {busyJobId === job._id ? 'Removing…' : 'Remove from marketplace'}
              </GhostButton>
            </Card>
          ))}
        </div>
      )}

      <Section>Publish an existing job</Section>
      {publishable.length === 0 ? (
        <Card className="p-[17px] text-xs text-[#778092]">
          {loading ? 'Loading…' : 'Every open job is already on the marketplace.'}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[13px]">
          {publishable.slice(0, 9).map((job) => (
            <Card key={job._id} className="p-[17px] flex flex-col">
              <StatusPill tone={isJobUrgent(job) ? 'amber' : 'green'}>
                {isJobUrgent(job) ? 'Urgent' : 'Live'}
              </StatusPill>
              <h3 className="text-sm font-bold mt-3 mb-1.5">{job.jobtitle}</h3>
              <div className="text-[10px] text-[#778092] leading-[1.8] flex-1">
                {jobCompanyName(job)}
                <br />
                {job.location || 'Location not set'}
                <br />
                {job.openpositions || 0} openings · {job.totalApplication_number || 0} candidates
              </div>
              <PrimaryButton
                className="mt-3 w-full"
                disabled={busyJobId === job._id}
                onClick={() => setListing(job, true)}
              >
                {busyJobId === job._id ? 'Publishing…' : 'Publish to marketplace'}
              </PrimaryButton>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerMarketplace;
