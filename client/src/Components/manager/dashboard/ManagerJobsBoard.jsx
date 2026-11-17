import React, { useMemo, useState } from 'react';
import { isJobOpen, jobCompanyName, hasCvStrength, atClientReview } from './useManagerPlatformData';
import { atCodingTest, codingTestDone } from '../../dashboard/dashboardUtils';
import { useControlCentreTheme } from './controlCentreTheme';
import {
  ts, plural, groupByJob, jobKey, interviewDone, roleConfirmed,
  awaitingScorecardReview, awaitingInterviewLink, roleStageIndex, roleWaitingOn, ROLE_STAGES,
} from './zeusModel';
import './ManagerOverview.css';

const MONO = { fontFamily: 'var(--zcc-mono)' };
const NUM_LABELS = ['Matched', 'Confirmed', 'Tested', 'Interviewed'];
const fmt = (n) => (n ? n.toLocaleString('en-GB') : '—');
const WORK_MODE = { remote: 'Remote', onsite: 'On-site', hybrid: 'Hybrid' };

/** One line on what the role is doing now, in the board's voice. */
const describe = (job, rs, waiting) => {
  if (!isJobOpen(job)) return { text: rs.length ? `Closed · ${plural(rs.length, 'candidate')}` : 'Closed', tone: 'faint' };
  if (waiting === 'shortlist') {
    return { text: `Needs you · Shortlist from ${plural(rs.filter(awaitingScorecardReview).length, 'scorecard')}`, tone: 'warn' };
  }
  if (waiting === 'send interview links') {
    return { text: `Needs you · Send interview links to ${plural(rs.filter(awaitingInterviewLink).length, 'candidate')}`, tone: 'warn' };
  }
  if (waiting === 'add candidates') return { text: 'Needs you · Add candidates to this urgent role', tone: 'warn' };
  const count = (test) => rs.filter(test).length;
  if (!rs.length) return { text: 'Zeus · Sourcing candidates', tone: 'ok' };
  if (count((r) => !hasCvStrength(r))) return { text: `Zeus · Scoring ${plural(count((r) => !hasCvStrength(r)), 'CV')}`, tone: 'ok' };
  if (count((r) => r.interviewScheduled && !interviewDone(r))) {
    return { text: `Zeus · ${plural(count((r) => r.interviewScheduled && !interviewDone(r)), 'AI interview')} running`, tone: 'ok' };
  }
  if (count((r) => atCodingTest(r) && !codingTestDone(r))) {
    return { text: `Zeus · ${plural(count((r) => atCodingTest(r) && !codingTestDone(r)), 'coding test')} in progress`, tone: 'ok' };
  }
  if (count(atClientReview)) return { text: `Zeus · ${plural(count(atClientReview), 'candidate')} with client`, tone: 'ok' };
  return { text: `Zeus · ${plural(rs.length, 'candidate')} in pipeline`, tone: 'ok' };
};

/**
 * Manager Jobs, console design: filter pills, a "brief Zeus" call to action and
 * a card per role with its funnel counts and workflow progress. Reads the jobs
 * and candidates the dashboard already loaded.
 */
const ManagerJobsBoard = ({ platform, canCreateJob = true, onCreate, onOpenJob }) => {
  const [, t] = useControlCentreTheme();
  const [filter, setFilter] = useState('all');
  const { jobs, resumes, loading } = platform;

  const cards = useMemo(() => {
    const byJob = groupByJob(resumes);
    return [...jobs]
      .sort((a, b) => (ts(b.createdAt) || 0) - (ts(a.createdAt) || 0))
      .map((job) => {
        const rs = byJob.get(jobKey(job._id)) || [];
        const open = isJobOpen(job);
        const waiting = open ? roleWaitingOn(job, rs) : null;
        const kind = !open ? 'closed' : waiting ? 'needs' : 'running';
        return {
          job,
          kind,
          stage: roleStageIndex(rs),
          now: describe(job, rs, waiting),
          meta: [jobCompanyName(job), job.location, WORK_MODE[job.type]].filter(Boolean).join(' · '),
          nums: [rs.length, rs.filter(roleConfirmed).length, rs.filter(codingTestDone).length, rs.filter(interviewDone).length],
        };
      });
  }, [jobs, resumes]);

  const counts = {
    all: cards.length,
    needs: cards.filter((c) => c.kind === 'needs').length,
    running: cards.filter((c) => c.kind === 'running').length,
    closed: cards.filter((c) => c.kind === 'closed').length,
  };
  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'needs', label: 'Needs you' },
    { key: 'running', label: 'Running' },
    { key: 'closed', label: 'Closed' },
  ];
  // Roles that need the manager float to the top of "All".
  const order = { needs: 0, running: 1, closed: 2 };
  const shown = (filter === 'all' ? [...cards].sort((a, b) => order[a.kind] - order[b.kind]) : cards.filter((c) => c.kind === filter));

  const tag = {
    needs: { label: 'NEEDS YOU', bg: t.warnSoft, fg: t.warn },
    running: { label: 'RUNNING', bg: t.okSoft, fg: t.ok },
    closed: { label: 'CLOSED', bg: t.track, fg: t.faint },
  };
  const toneColor = { warn: t.warn, ok: t.ok, faint: t.faint };
  const skeleton = (h, w = '100%') => <div className="zcc-skel" style={{ height: h, width: w, borderRadius: 8, background: t.track }} />;

  return (
    <div className="zcc" style={{ color: t.text, background: `${t.glow}, ${t.bg}` }}>
      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '26px 24px 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16 }}>
          <div>
            <span style={{ ...MONO, fontSize: 11.5, letterSpacing: '0.14em', color: t.faint }}>REQUIREMENTS</span>
            <h1 className="zcc-title" style={{ margin: '8px 0 0', fontSize: 34, letterSpacing: '-0.03em', lineHeight: 1.1, fontWeight: 700, color: t.text }}>Jobs</h1>
          </div>
          <div role="tablist" aria-label="Filter jobs" className="zcc-jobtabs" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginLeft: 24 }}>
            {tabs.map((tb) => {
              const sel = filter === tb.key;
              return (
                <button
                  key={tb.key}
                  type="button"
                  role="tab"
                  aria-selected={sel}
                  onClick={() => setFilter(tb.key)}
                  className="zcc-btn"
                  style={{ height: 34, padding: '0 14px', borderRadius: 17, border: `1px solid ${sel ? t.accent : t.line}`, background: sel ? t.accentSoft : 'transparent', color: sel ? t.text : t.muted, fontSize: 13.5 }}
                >
                  {tb.label} ({loading ? '…' : counts[tb.key]})
                </button>
              );
            })}
          </div>
          {canCreateJob && (
            <button
              type="button"
              className="zcc-btn zcc-cta"
              onClick={onCreate}
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10, height: 46, padding: '0 20px', borderRadius: 12, background: t.accent, color: t.onAccent, fontWeight: 600, fontSize: 15 }}
            >
              <span className="zcc-orb" style={{ width: 16, height: 16, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #FFFFFF, ${t.orbB})` }} />
              New role · brief Zeus
            </button>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16, marginTop: 24 }}>
          {loading && [0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18, borderRadius: 16, background: t.panel, border: `1px solid ${t.line}` }}>
              {skeleton(36, '70%')}{skeleton(48)}{skeleton(6)}{skeleton(14, '60%')}
            </div>
          ))}

          {!loading && !shown.length && (
            <div style={{ gridColumn: '1 / -1', padding: 18, borderRadius: 16, background: t.panel, border: `1px solid ${t.line}`, fontSize: 14, color: t.muted }}>
              {filter === 'needs' ? 'No roles are waiting on you.'
                : filter === 'running' ? 'No roles running right now.'
                  : filter === 'closed' ? 'No closed roles.'
                    : canCreateJob ? 'No roles yet. Brief Zeus to start one.' : 'No roles yet.'}
            </div>
          )}

          {!loading && shown.map((c, i) => {
            const tg = tag[c.kind];
            const accentNow = c.kind === 'needs' ? t.warn : t.ok;
            return (
              <button
                key={c.job._id}
                type="button"
                className="zcc-card zcc-in"
                onClick={() => onOpenJob(c.job)}
                style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 18, borderRadius: 16, background: t.panel, border: `1px solid ${t.line}`, color: t.text, animationDelay: `${0.05 + Math.min(i, 12) * 0.08}s` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, background: t.accentSoft, color: t.accent }}>
                    {(c.job.jobtitle || '?').trim()[0]?.toUpperCase()}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.job.jobtitle || 'Untitled role'}</b>
                    <span style={{ display: 'block', fontSize: 12.5, color: t.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.meta || '—'}</span>
                  </span>
                  <span style={{ marginLeft: 'auto', flexShrink: 0, ...MONO, fontSize: 10.5, letterSpacing: '0.08em', padding: '4px 8px', borderRadius: 6, background: tg.bg, color: tg.fg }}>{tg.label}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6, width: '100%' }}>
                  {NUM_LABELS.map((l, k) => (
                    <div key={l} style={{ padding: 8, borderRadius: 8, background: t.panel2 }}>
                      <b style={{ display: 'block', ...MONO, fontWeight: 500, fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>{fmt(c.nums[k])}</b>
                      <span style={{ fontSize: 11, color: t.faint }}>{l}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{ display: 'flex', gap: 3, width: '100%' }}
                  role="img"
                  aria-label={`Stage ${c.stage + 1} of ${ROLE_STAGES.length}: ${ROLE_STAGES[c.stage]}`}
                  title={ROLE_STAGES[c.stage]}
                >
                  {ROLE_STAGES.map((s, k) => (
                    <i
                      key={s}
                      style={{ flex: 1, height: 6, borderRadius: 3, display: 'block', background: k < c.stage ? t.accent : k === c.stage ? (c.kind === 'closed' ? t.faint : accentNow) : t.track }}
                    />
                  ))}
                </div>

                <span style={{ fontSize: 13, color: toneColor[c.now.tone] }}>{c.now.text}</span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ManagerJobsBoard;
