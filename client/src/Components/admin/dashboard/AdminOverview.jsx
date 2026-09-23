import React from 'react';
import { PageHead, MetricGrid, Section, InfoGrid, TableCard, StatusPill, LoadingRow, PrimaryButton } from './AdminUI';
import { isJobOpen, isJobUrgent, sumField, formatDelta, jobCompanyName, relativeTime } from './useAdminPlatformData';

const AdminOverview = ({ platform, onNavigate }) => {
  const { counts, users, jobs, companies, candidates, loading } = platform;

  const openJobs = jobs.filter(isJobOpen);
  const closedJobs = jobs.filter((j) => !isJobOpen(j));
  const urgentJobs = jobs.filter(isJobUrgent);
  const applications = sumField(jobs, 'totalApplication_number');
  const shortlisted = sumField(jobs, 'shortlisted_number');
  const activeUsers = users.filter((u) => u.status !== 'disabled').length;

  const metrics = [
    { label: 'Total Employers', value: companies.length, delta: `${companies.length} on platform` },
    { label: 'Platform Users', value: counts.total, delta: formatDelta(counts.changes?.total) },
    { label: 'Recruitment Partners', value: counts.recruiters, delta: formatDelta(counts.changes?.recruiters) },
    { label: 'Active Jobs', value: openJobs.length, delta: `${jobs.length} total` },
    { label: 'Candidates', value: applications, delta: `${shortlisted} shortlisted` },
    { label: 'AI Interviews', value: candidates.length, delta: 'Scorecards generated' },
    { label: 'Positions Closed', value: closedJobs.length, delta: '' },
    { label: 'Managers', value: counts.managers, delta: formatDelta(counts.changes?.managers) },
  ];

  const recent = [...jobs]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  return (
    <>
      <PageHead
        eyebrow="Zepul platform"
        title="Admin control centre"
        sub="System-wide visibility across employers, partners, hiring activity, AI operations and finance"
        action={<PrimaryButton onClick={() => onNavigate('Jobs')}>Go to Jobs</PrimaryButton>}
      />

      {loading ? <LoadingRow label="Loading platform data…" /> : <MetricGrid items={metrics} />}

      <Section>Platform activity</Section>
      <InfoGrid
        items={[
          {
            title: 'User activity',
            sub: `${activeUsers} active of ${users.length} platform accounts`,
            status: activeUsers === users.length ? 'Healthy' : 'Monitor',
            tone: activeUsers === users.length ? 'green' : 'amber',
          },
          {
            title: 'AI & Automation',
            sub: `${candidates.length} candidates evaluated end to end`,
            status: candidates.length ? 'Operational' : 'Idle',
            tone: candidates.length ? 'green' : 'grey',
          },
          {
            title: 'Requirements at risk',
            sub: `${urgentJobs.length} high-priority requirements still open`,
            status: urgentJobs.length ? 'Attention' : 'Clear',
            tone: urgentJobs.length ? 'amber' : 'green',
          },
        ]}
      />

      <Section>Recent platform activity</Section>
      <TableCard
        title="Latest requirements"
        badge={<StatusPill tone="grey">Across all organizations</StatusPill>}
        columns={['Requirement', 'Organization', 'Assigned to', 'Created', 'Status']}
        rows={recent.map((job) => [
          <b key="t">{job.jobtitle}</b>,
          jobCompanyName(job),
          job.assignedRecruiters?.length
            ? `${job.assignedRecruiters.length} recruiter${job.assignedRecruiters.length > 1 ? 's' : ''}`
            : 'Unassigned',
          relativeTime(job.createdAt),
          <StatusPill key="s" tone={isJobUrgent(job) ? 'amber' : isJobOpen(job) ? 'green' : 'grey'}>
            {isJobUrgent(job) ? 'Urgent' : isJobOpen(job) ? 'Live' : 'Closed'}
          </StatusPill>,
        ])}
        empty={loading ? 'Loading…' : 'No requirements created yet.'}
      />
    </>
  );
};

export default AdminOverview;
