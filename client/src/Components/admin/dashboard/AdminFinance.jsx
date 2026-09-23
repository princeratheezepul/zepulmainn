import React from 'react';
import { Card, PageHead, Section, TableCard, StatusPill, LoadingRow } from './AdminUI';
import { isJobOpen, jobCompanyName } from './useAdminPlatformData';

/**
 * The commercial model is fixed (GST 18%, TDS 10%, partner 40% / Zepul 60% of net
 * pay) but there is no billing endpoint yet, so amounts render as "—" rather than
 * as invented revenue. Wire a billing source and the columns fill in.
 */
const PARTNER_SHARE = 0.4;

const AdminFinance = ({ platform }) => {
  const { jobs, loading } = platform;
  const closures = jobs.filter((j) => !isJobOpen(j));

  return (
    <>
      <PageHead
        eyebrow="Finance"
        title="Platform Finance"
        sub="Revenue, GST, TDS, partner payouts and outstanding balances"
      />

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
          columns={['Client / Position', 'Openings', 'Gross', 'GST 18%', 'TDS 10%', 'Net Pay After TDS', 'Partner 40%', 'Zepul 60%']}
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

export default AdminFinance;
