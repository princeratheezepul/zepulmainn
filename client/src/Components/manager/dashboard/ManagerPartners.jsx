import React, { useCallback, useEffect, useState } from 'react';
import {
  Card,
  PageHead,
  Section,
  MetricGrid,
  TableCard,
  StatusPill,
  LoadingRow,
  GhostButton,
} from '../../dashboard/DashboardUI';
import { API, readAuth, relativeTime } from '../../dashboard/dashboardUtils';

/**
 * Every Recruitment Partner on the platform and what they have actually done
 * with the marketplace — listings picked up, candidates submitted, and how
 * those candidates fared.
 *
 * Only offered to managers who run the marketplace; the endpoint enforces the
 * same thing, since this names other people's accounts.
 */
const ManagerPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const res = await fetch(`${API}/api/manager/marketplace/partners`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not load recruitment partners');
      setPartners(Array.isArray(data.partners) ? data.partners : []);
    } catch (err) {
      setError(err.message);
      setPartners([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sum = (field) => partners.reduce((n, p) => n + (p[field] || 0), 0);
  const active = partners.filter((p) => p.jobsPicked > 0).length;

  return (
    <>
      <PageHead
        eyebrow="Partners"
        title="Recruitment Partners"
        sub="Everyone working your marketplace requirements, and what they have delivered"
        action={<GhostButton onClick={load}>Refresh</GhostButton>}
      />

      {error ? (
        <Card className="p-[17px] text-xs text-[#d84c4c]">{error}</Card>
      ) : loading ? (
        <LoadingRow label="Loading partners…" />
      ) : (
        <>
          <MetricGrid
            items={[
              { label: 'Recruitment Partners', value: partners.length, delta: `${active} working a listing` },
              { label: 'Listings Picked', value: sum('jobsPicked') },
              { label: 'Candidates Submitted', value: sum('candidatesSubmitted') },
              { label: 'Selected', value: sum('selected'), delta: `${sum('shortlisted')} shortlisted` },
            ]}
          />

          <Section>All partners</Section>
          <TableCard
            title={`Partners (${partners.length})`}
            badge={<StatusPill tone="grey">Across the marketplace</StatusPill>}
            columns={[
              'Partner',
              'Email',
              'Listings Picked',
              'Submitted',
              'Shortlisted',
              'Selected',
              'Last Submission',
              'Status',
            ]}
            rows={partners.map((p) => [
              <b key="n">{p.name}</b>,
              p.email || '—',
              p.jobsPicked,
              p.candidatesSubmitted,
              p.shortlisted,
              <span key="s" className={p.selected ? 'text-[#159b65] font-bold' : ''}>
                {p.selected}
              </span>,
              p.lastSubmittedAt ? relativeTime(p.lastSubmittedAt) : '—',
              <StatusPill key="st" tone={p.jobsPicked ? 'green' : 'grey'}>
                {p.jobsPicked ? 'Active' : 'Not started'}
              </StatusPill>,
            ])}
            empty="No recruitment partners have signed up yet."
          />
        </>
      )}
    </>
  );
};

export default ManagerPartners;
