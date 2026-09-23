import React from 'react';
import { PageHead, MetricGrid, Section, TableCard, StatusPill, LoadingRow, JobGrid } from './AdminUI';
import { isJobOpen, isJobUrgent, sumField, jobCompanyName, relativeTime } from './useAdminPlatformData';

const AdminPartners = ({ platform }) => {
  const { users, jobs, loading } = platform;

  const partners = users.filter((u) => u.type === 'recruiter');

  // Assignments are stored on the job, so invert the relation to count per partner.
  const assignmentsByPartner = jobs.reduce((acc, job) => {
    (job.assignedRecruiters || []).forEach((r) => {
      const id = r?._id || r;
      acc[id] = (acc[id] || 0) + 1;
    });
    return acc;
  }, {});

  const assignedJobs = jobs.filter((j) => j.assignedRecruiters?.length);
  const activePartners = partners.filter((p) => p.status !== 'disabled');

  return (
    <>
      <PageHead
        eyebrow="Partners"
        title="Recruitment Partners"
        sub="Approvals, activity, performance and payouts"
      />

      <MetricGrid
        items={[
          { label: 'Active Partners', value: activePartners.length, delta: `${partners.length} registered` },
          { label: 'Jobs Assigned', value: assignedJobs.length },
          { label: 'Candidates Submitted', value: sumField(jobs, 'totalApplication_number') },
          { label: 'Positions Closed', value: jobs.filter((j) => !isJobOpen(j)).length },
        ]}
      />

      <Section>Partner roster</Section>
      {loading ? (
        <LoadingRow label="Loading partners…" />
      ) : (
        <TableCard
          title="Recruitment partners"
          badge={<StatusPill tone="grey">40% of net pay on closure</StatusPill>}
          columns={['Partner', 'Email', 'Requirements', 'Joined', 'Status']}
          rows={partners.map((p) => [
            <b key="n">{p.fullname || p.username || '—'}</b>,
            p.email || '—',
            assignmentsByPartner[p._id] || 0,
            relativeTime(p.createdAt),
            <StatusPill key="s" tone={p.status === 'disabled' ? 'red' : 'green'}>
              {p.status === 'disabled' ? 'Disabled' : 'Active'}
            </StatusPill>,
          ])}
          empty="No recruitment partners onboarded yet."
        />
      )}

      <Section>Requirements available to partners</Section>
      <JobGrid
        jobs={jobs.filter(isJobOpen).slice(0, 6).map((job) => ({
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
          chips: ['40% net pay', 'Accept requirement'],
        }))}
        empty={loading ? 'Loading…' : 'No open requirements right now.'}
      />
    </>
  );
};

export default AdminPartners;
