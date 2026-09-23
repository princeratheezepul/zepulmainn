import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHead, MetricGrid, Section, TableCard, StatusPill, LoadingRow } from '../../dashboard/DashboardUI';
import { sumField } from './useAdminPlatformData';

const AdminCandidatesPanel = ({ platform }) => {
  const navigate = useNavigate();
  const { candidates, jobs, loading } = platform;

  const applications = sumField(jobs, 'totalApplication_number');
  const shortlisted = sumField(jobs, 'shortlisted_number');
  const interviewed = sumField(jobs, 'interviewed_number');

  return (
    <>
      <PageHead
        eyebrow="Platform"
        title="All Candidates"
        sub="Monitor candidate processing across the platform"
      />

      <MetricGrid
        items={[
          { label: 'Applications', value: applications },
          { label: 'Scorecards Generated', value: candidates.length },
          { label: 'Shortlisted', value: shortlisted },
          { label: 'Interviewed', value: interviewed },
        ]}
      />

      <Section>Candidate pipeline</Section>
      {loading ? (
        <LoadingRow label="Loading candidates…" />
      ) : (
        <TableCard
          title="Evaluated candidates"
          badge={<StatusPill tone="grey">Automated workflow</StatusPill>}
          columns={['Candidate', 'Email', 'Location', 'Scorecard', 'Action']}
          rows={candidates.map((c) => [
            <b key="n">{c.name || 'Unnamed candidate'}</b>,
            c.email || '—',
            c.location || '—',
            <StatusPill key="s" tone="green">Ready</StatusPill>,
            <span
              key="a"
              className="text-[#024bff] font-bold cursor-pointer hover:underline"
              onClick={() => navigate(`/admin/candidates/${c.resumeId}`)}
            >
              View scorecard
            </span>,
          ])}
          empty="No candidates have completed evaluation yet."
        />
      )}
    </>
  );
};

export default AdminCandidatesPanel;
