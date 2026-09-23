import React from 'react';

/**
 * Shared primitives for the Zepul admin console.
 *
 * The tokens below mirror the approved dashboard design:
 *   ink #1d2430 · muted #778092 · page #f6f8fb · line #e7ebf2
 *   nav #0e1728 · brand #024bff · green #159b65 · amber #d88a00 · red #d84c4c
 */

export const Card = ({ className = '', children, ...rest }) => (
  <div
    className={`bg-white border border-[#e7ebf2] rounded-[13px] shadow-[0_7px_25px_#1020400d] ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export const Section = ({ children }) => (
  <div className="text-sm font-extrabold mt-7 mb-3">{children}</div>
);

export const PageHead = ({ eyebrow, title, sub, action }) => (
  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
    <div>
      <div className="text-[10px] uppercase tracking-[0.1em] text-[#024bff] font-extrabold">{eyebrow}</div>
      <div className="text-[22px] md:text-[28px] font-extrabold tracking-[-0.7px] my-1">{title}</div>
      <div className="text-xs text-[#778092]">{sub}</div>
    </div>
    {action}
  </div>
);

const TONES = {
  green: 'bg-[#eaf8f1] text-[#159b65]',
  amber: 'bg-[#fff5df] text-[#d88a00]',
  red: 'bg-[#fff0f0] text-[#d84c4c]',
  grey: 'bg-[#f0f2f5] text-[#667085]',
};

export const StatusPill = ({ tone = 'grey', children }) => (
  <span className={`inline-block rounded-full px-[7px] py-1 text-[9px] font-extrabold ${TONES[tone] || TONES.grey}`}>
    {children}
  </span>
);

export const Chip = ({ children }) => (
  <span className="inline-block bg-[#eff3ff] text-[#4564c5] px-[7px] py-[5px] rounded-[5px] text-[9px] mt-2 mr-1">
    {children}
  </span>
);

export const PrimaryButton = ({ className = '', children, ...rest }) => (
  <button
    className={`border-0 bg-[#024bff] text-white px-[14px] py-[9px] rounded-lg font-bold text-xs cursor-pointer hover:bg-[#0140dd] transition-colors ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const GhostButton = ({ className = '', children, ...rest }) => (
  <button
    className={`bg-white text-[#1d2430] border border-[#e7ebf2] px-[14px] py-[9px] rounded-lg font-bold text-xs cursor-pointer hover:bg-[#f6f8fb] transition-colors ${className}`}
    {...rest}
  >
    {children}
  </button>
);

/** `items` — [{ label, value, delta, deltaTone }] */
export const MetricGrid = ({ items }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-[13px]">
    {items.map((m) => (
      <Card key={m.label} className="p-[17px]">
        <div className="text-[10px] text-[#778092]">{m.label}</div>
        <div className="text-[22px] md:text-[25px] font-extrabold my-1.5">{m.value}</div>
        <div className={`text-[10px] ${m.deltaTone === 'red' ? 'text-[#d84c4c]' : 'text-[#159b65]'}`}>
          {m.delta || ''}&nbsp;
        </div>
      </Card>
    ))}
  </div>
);

/** `columns` — string[]; `rows` — ReactNode[][] */
export const TableCard = ({ title, badge, columns, rows, empty = 'Nothing to show yet.' }) => (
  <Card className="p-0 overflow-hidden">
    {(title || badge) && (
      <div className="p-4 border-b border-[#e7ebf2] flex items-center justify-between gap-3">
        <b className="text-sm">{title}</b>
        {badge}
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c}
                className="text-left px-4 py-3 border-b border-[#e7ebf2] text-[9px] uppercase font-bold text-[#8991a0] bg-[#fbfcfd]"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-[11px] text-[#778092]">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="hover:bg-[#fbfcfd] transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="text-left px-4 py-3 border-b border-[#e7ebf2] text-[11px]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </Card>
);

/** Three-up informational tiles used under "Platform activity" / "Service health". */
export const InfoGrid = ({ items }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-[13px]">
    {items.map((i) => (
      <Card key={i.title} className="p-[17px]">
        <b className="text-sm">{i.title}</b>
        <p className="text-xs text-[#778092] mt-1.5 mb-2">{i.sub}</p>
        {i.status && <StatusPill tone={i.tone}>{i.status}</StatusPill>}
      </Card>
    ))}
  </div>
);

/** `stages` — [{ label, value }] */
export const Pipeline = ({ stages }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
    {stages.map((s) => (
      <div key={s.label} className="bg-[#fafbfd] border border-[#e7ebf2] rounded-[9px] p-3">
        <b className="text-[19px]">{s.value}</b>
        <span className="block text-[#778092] text-[10px] mt-0.5">{s.label}</span>
      </div>
    ))}
  </div>
);

/**
 * `jobs` — [{ id, title, company, location, experience, openings, candidates,
 *             cutoff, status, statusTone, chips, onClick }]
 */
export const JobGrid = ({ jobs, empty = 'No requirements to show.' }) => {
  if (!jobs.length) {
    return <Card className="p-[17px] text-xs text-[#778092]">{empty}</Card>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[13px]">
      {jobs.map((j) => (
        <Card
          key={j.id}
          className={`p-[17px] ${j.onClick ? 'cursor-pointer hover:border-[#c7d5ff] transition-colors' : ''}`}
          onClick={j.onClick}
        >
          <div className="flex items-start justify-between gap-2">
            <StatusPill tone={j.statusTone}>{j.status}</StatusPill>
            {j.cutoff != null && (
              <span className="text-[#024bff] font-extrabold text-[11px]">CV &ge; {j.cutoff}</span>
            )}
          </div>
          <h3 className="text-sm font-bold mt-3 mb-1.5">{j.title}</h3>
          <div className="text-[10px] text-[#778092] leading-[1.8]">
            {j.company}
            <br />
            {j.location}
            {j.experience ? ` · ${j.experience}` : ''}
            <br />
            {j.openings} openings · {j.candidates} candidates
          </div>
          <div>
            {(j.chips || []).map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export const LoadingRow = ({ label = 'Loading…' }) => (
  <div className="flex items-center gap-3 py-10 justify-center text-xs text-[#778092]">
    <span className="h-4 w-4 rounded-full border-2 border-[#e7ebf2] border-t-[#024bff] animate-spin" />
    {label}
  </div>
);
