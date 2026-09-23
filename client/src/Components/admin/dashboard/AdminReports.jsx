import React from 'react';
import { Card, PageHead, MetricGrid, Section } from '../../dashboard/DashboardUI';
import { isJobOpen, sumField } from './useAdminPlatformData';

const AdminReports = ({ platform, onNavigate }) => {
  const { counts, jobs, companies, candidates } = platform;

  const applications = sumField(jobs, 'totalApplication_number');
  const closed = jobs.filter((j) => !isJobOpen(j)).length;
  const conversion = applications ? ((closed / applications) * 100).toFixed(1) : '0.0';

  const reports = [
    { title: 'Hiring Funnel', sub: 'Jobs → candidates → interviews → closures', go: 'Candidates' },
    { title: 'Partner Performance', sub: 'Submissions, shortlists, closures and earnings', go: 'Recruitment Partners' },
    { title: 'Employer Usage', sub: 'Organizations, jobs, candidates and AI consumption', go: 'Employers' },
  ];

  return (
    <>
      <PageHead
        eyebrow="Analytics"
        title="Reports"
        sub="Platform-wide operational and commercial reporting"
      />

      <MetricGrid
        items={[
          { label: 'Requirements Raised', value: jobs.length },
          { label: 'Positions Closed', value: closed },
          { label: 'Applications', value: applications },
          { label: 'Application → Closure', value: `${conversion}%` },
          { label: 'Employers', value: companies.length },
          { label: 'Platform Users', value: counts.total },
          { label: 'Scorecards', value: candidates.length },
          { label: 'Open Requirements', value: jobs.filter(isJobOpen).length },
        ]}
      />

      <Section>Reports</Section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[13px]">
        {reports.map((r) => (
          <Card
            key={r.title}
            className="p-[17px] cursor-pointer hover:border-[#c7d5ff] transition-colors"
            onClick={() => onNavigate(r.go)}
          >
            <b className="text-sm">{r.title}</b>
            <p className="text-xs text-[#778092] mt-1.5">{r.sub}</p>
          </Card>
        ))}
      </div>
    </>
  );
};

export default AdminReports;
