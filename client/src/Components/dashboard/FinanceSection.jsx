import React from 'react';
import { Card, PageHead, Section, TableCard, StatusPill, LoadingRow } from './DashboardUI';
import { isJobOpen, jobCompanyName } from './dashboardUtils';

/**
 * The commercial model is fixed (GST 18%, TDS 10%, partner 40% / Zepul 60% of net
 * pay) but there is no billing endpoint yet, so amounts render as "—" rather than
 * as invented revenue. Wire a billing source and the columns fill in.
 *
 * Shared by the admin and manager consoles — only the page copy differs.
 */
export const PARTNER_SHARE = 0.4;
export const GST_RATE = 0.18;
export const TDS_RATE = 0.1;

const FinanceSection = ({ jobs, loading, eyebrow, title, sub }) => {
  const closures = jobs.filter((j) => !isJobOpen(j));

  return (
    <>
      <PageHead eyebrow={eyebrow} title={title} sub={sub} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-[13px]">
        {[
          { label: 'Gross billing', note: 'Billing source not connected' },
          { label: 'Partner payout', note: `${PARTNER_SHARE * 100}% of net pay after TDS` },
          { label: 'Zepul share', note: `${100 - PARTNER_SHARE * 100}% of net pay after TDS` },
        ].map((f) => (
          <Card key={f.label} className="p-[17px]">
            <div className="text-xs text-[#778092]">{f.label}</div>
            <div className="text-[28px] font-extrabold mt-1.5">—</div>
            <div className="text-xs text-[#778092]">{f.note}</div>
          </Card>
        ))}
      </div>

      <Section>Closure finance</Section>
      {loading ? (
        <LoadingRow label="Loading closures…" />
      ) : (
        <TableCard
          title={`Closed positions (${closures.length})`}
          badge={<StatusPill tone="amber">Billing source not connected</StatusPill>}
          columns={[
            'Client / Position',
            'Openings',
            'Gross',
            `GST ${GST_RATE * 100}%`,
            `TDS ${TDS_RATE * 100}%`,
            'Net Pay After TDS',
            `Partner ${PARTNER_SHARE * 100}%`,
            `Zepul ${100 - PARTNER_SHARE * 100}%`,
          ]}
          rows={closures.map((job) => [
            <span key="j">
              <b>{jobCompanyName(job)}</b> · {job.jobtitle}
            </span>,
            job.openpositions || 0,
            '—',
            '—',
            '—',
            '—',
            '—',
            '—',
          ])}
          empty="No positions have closed yet."
        />
      )}
    </>
  );
};

export default FinanceSection;
