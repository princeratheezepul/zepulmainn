import React from 'react';
import { PageHead, MetricGrid, Section, TableCard, StatusPill, LoadingRow } from './AdminUI';
import { relativeTime } from './useAdminPlatformData';

const AdminEmployers = ({ platform, onNavigate }) => {
  const { companies, jobs, loading } = platform;

  const assigned = companies.filter((c) => c.isAssigned || c.assignedManagers?.length || c.assignedTo?.length);
  const jobsByCompany = jobs.reduce((acc, job) => {
    const key = job.company || job.companyName || job.companyId?.name;
    if (key) acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHead
        eyebrow="Employers"
        title="Employer Accounts"
        sub="Licenses, usage, users and billing"
      />

      <MetricGrid
        items={[
          { label: 'Total Employers', value: companies.length },
          { label: 'Assigned to a Manager', value: assigned.length },
          { label: 'Awaiting Assignment', value: companies.length - assigned.length },
          { label: 'Requirements Raised', value: jobs.length },
        ]}
      />

      <Section>Employer accounts</Section>
      {loading ? (
        <LoadingRow label="Loading employers…" />
      ) : (
        <TableCard
          title="Organizations"
          badge={
            <span
              className="text-[#024bff] font-bold text-[11px] cursor-pointer hover:underline"
              onClick={() => onNavigate('Organizations')}
            >
              Manage organizations
            </span>
          }
          columns={['Employer', 'Domain', 'Location', 'Size', 'Requirements', 'Added', 'Status']}
          rows={companies.map((c) => [
            <b key="n">{c.name}</b>,
            c.domain || c.website || '—',
            c.location || '—',
            c.employeeNumber || '—',
            jobsByCompany[c.name] || 0,
            relativeTime(c.createdAt),
            <StatusPill
              key="s"
              tone={c.isAssigned || c.assignedManagers?.length || c.assignedTo?.length ? 'green' : 'amber'}
            >
              {c.isAssigned || c.assignedManagers?.length || c.assignedTo?.length ? 'Assigned' : 'Unassigned'}
            </StatusPill>,
          ])}
          empty="No employer organizations yet."
        />
      )}
    </>
  );
};

export default AdminEmployers;
