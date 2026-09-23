import React from 'react';
import { PageHead, MetricGrid, Section, JobGrid, LoadingRow, PrimaryButton } from '../../dashboard/DashboardUI';
import { isJobOpen, isJobUrgent, jobCompanyName } from './useManagerPlatformData';

const ManagerMarketplace = ({ platform, hasMarketplaceAccess, onOpenMarketplace }) => {
  const { marketplace, marketplaceJobs, jobs, loading } = platform;

  // Requirements the manager owns that are candidates for distribution.
  const distributable = jobs.filter(isJobOpen);

  return (
    <>
      <PageHead
        eyebrow="Marketplace"
        title="Recruitment Partner Marketplace"
        sub="Distribute Zepul-generated requirements to collaborated partners"
        action={
          hasMarketplaceAccess ? (
            <PrimaryButton onClick={onOpenMarketplace}>Open Marketplace Dashboard</PrimaryButton>
          ) : null
        }
      />

      {loading ? (
        <LoadingRow label="Loading marketplace…" />
      ) : (
        <MetricGrid
          items={[
            { label: 'Jobs in Marketplace', value: marketplace.totalJobs },
            { label: 'Active Listings', value: marketplace.activeJobs },
            { label: 'Candidates Selected', value: marketplace.selectedCandidates },
            { label: 'Candidates Rejected', value: marketplace.rejectedCandidates },
          ]}
        />
      )}

      <Section>Listed in the marketplace</Section>
      <JobGrid
        jobs={marketplaceJobs.slice(0, 9).map((job) => ({
          id: job._id,
          title: job.jobtitle || job.title,
          company: jobCompanyName(job),
          location: job.location || 'Location not set',
          experience: job.experience ? `${job.experience}+ yrs` : '',
          openings: job.openpositions || 0,
          candidates: job.mpSelectedCandidates || job.totalApplication_number || 0,
          cutoff: job.cvStrengthCutoff,
          status: isJobOpen(job) ? 'Live' : 'Closed',
          statusTone: isJobOpen(job) ? 'green' : 'grey',
          chips: ['40% net pay', 'Partner visible'],
        }))}
        empty={loading ? 'Loading…' : 'Nothing listed in the marketplace yet.'}
      />

      <Section>Your requirements available to distribute</Section>
      <JobGrid
        jobs={distributable.slice(0, 6).map((job) => ({
          id: job._id,
          title: job.jobtitle,
          company: jobCompanyName(job),
          location: job.location || 'Location not set',
          experience: job.experience ? `${job.experience}+ yrs` : '',
          openings: job.openpositions || 0,
          candidates: job.totalApplication_number || 0,
          cutoff: job.cvStrengthCutoff,
          status: isJobUrgent(job) ? 'Urgent' : 'Live',
          statusTone: isJobUrgent(job) ? 'amber' : 'green',
          chips: ['Distribute to partners'],
        }))}
        empty={loading ? 'Loading…' : 'No open requirements to distribute.'}
      />
    </>
  );
};

export default ManagerMarketplace;
