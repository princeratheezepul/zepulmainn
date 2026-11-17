import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  isJobOpen,
  isJobUrgent,
  jobCompanyName,
  greeting,
  hasCvStrength,
  hasScorecard,
  atClientReview,
  sumField,
  hasAiInterview,
} from './useManagerPlatformData';
import { atCodingTest, codingTestDone, codingTestOf } from '../../dashboard/dashboardUtils';
import { useControlCentreTheme } from './controlCentreTheme';
import './ManagerOverview.css';

/* ---- Derivations from the resume / job records --------------------------- */

const DAY = 86400000;
const SPARK_DAYS = 12;
const MONO = { fontFamily: 'var(--zcc-mono)' };

const jobKey = (value) => String(value?._id || value || '');
const ts = (value) => {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? null : t;
};
const interviewDone = (r) => Boolean(r?.interviewEvaluation?.evaluationResults?.length);
const decided = (r) => ['shortlisted', 'rejected', 'offered', 'hired'].includes(r?.status);

/** Coding test finished, interview not yet sent or done: the manager's move. */
const awaitingInterviewLink = (r) =>
  r?.status !== 'rejected' && codingTestDone(r) && !interviewDone(r) && !r?.interviewScheduled;

/** Interview evaluated but nobody has decided on the candidate yet. */
const awaitingScorecardReview = (r) => interviewDone(r) && !decided(r);

/** Interview score as a percentage: `score` out of `totalscore` (10 per question). */
const interviewPercent = (r) => {
  const score = Number(r?.score) || 0;
  const total = Number(r?.totalscore) || 0;
  if (score > 0 && total > 0) return Math.round((score / total) * 100);
  const results = r?.interviewEvaluation?.evaluationResults || [];
  if (!results.length) return null;
  const avg = results.reduce((s, q) => s + (Number(q?.score) || 0), 0) / results.length;
  return Math.round(avg * 10);
};

// Eleven steps of the automated workflow; a role's bar fills to the furthest
// step any of its candidates has reached.
const ROLE_STAGES = [
  'Brief', 'Live', 'CVs in', 'CV strength', 'Coding test sent', 'Coding test done',
  'AI interview', 'Scorecards', 'Shortlisted', 'Offered', 'Hired',
];

const roleStageIndex = (rs) => {
  let i = 1;
  const reach = (n, test) => { if (rs.some(test)) i = Math.max(i, n); };
  if (rs.length) i = 2;
  reach(3, hasCvStrength);
  reach(4, atCodingTest);
  reach(5, codingTestDone);
  reach(6, interviewDone);
  reach(7, hasScorecard);
  reach(8, (r) => r.status === 'shortlisted');
  reach(9, (r) => r.status === 'offered');
  reach(10, (r) => r.status === 'hired');
  return i;
};

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

const feedTime = (t) => {
  const d = new Date(t);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const ease = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);

/* ---- Component ----------------------------------------------------------- */

const ManagerOverview = ({ platform, managerName, onNavigate, onBriefZeus, consoleBase = '/manager', employerManager = false }) => {
  const navigate = useNavigate();
  const { jobs, resumes, loading } = platform;
  const [, t] = useControlCentreTheme();
  const [p, setP] = useState(0);
  const [ask, setAsk] = useState('');

  // Count-up once data arrives.
  useEffect(() => {
    if (loading) return undefined;
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const next = Math.min(1, (now - t0) / 1800);
      setP(next);
      if (next < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loading]);

  const view = useMemo(() => {
    const byJob = new Map();
    resumes.forEach((r) => {
      const key = jobKey(r.jobId);
      if (!byJob.has(key)) byJob.set(key, []);
      byJob.get(key).push(r);
    });
    const jobById = new Map(jobs.map((j) => [jobKey(j._id), j]));
    const openJobs = jobs.filter(isJobOpen);
    const candidatesPath = (job) => `${consoleBase}/jobs/${job._id}/candidates`;
    const jobPath = (job) => `${consoleBase}/jobs/${job._id}`;

    // Decisions: things only the manager can unblock, most valuable first.
    const decisions = [];
    const waiting = new Map(); // jobId -> what the role is waiting on
    openJobs.forEach((job) => {
      const rs = byJob.get(jobKey(job._id)) || [];
      const review = rs.filter(awaitingScorecardReview);
      const links = rs.filter(awaitingInterviewLink);
      if (review.length) {
        const lead = [...review].sort((a, b) => (interviewPercent(b) ?? -1) - (interviewPercent(a) ?? -1))[0];
        const pct = interviewPercent(lead);
        decisions.push({
          rank: 0, weight: review.length, job, key: `sc-${job._id}`,
          title: `Review ${plural(review.length, 'scorecard')}`,
          sub: `AI interviews done.${lead?.name ? ` ${lead.name}${pct != null ? ` leads at ${pct}%` : ' is ready'}.` : ''}`,
          cta: 'Open scorecards', to: `${consoleBase}/jobs/${job._id}/scorecards`,
        });
        waiting.set(jobKey(job._id), 'shortlist');
      }
      if (links.length) {
        decisions.push({
          rank: 1, weight: links.length, job, key: `ln-${job._id}`,
          title: 'Send AI interview links',
          sub: `${plural(links.length, 'candidate')} passed the coding test. Pick who goes to interview.`,
          cta: 'Choose candidates', to: candidatesPath(job),
        });
        if (!waiting.has(jobKey(job._id))) waiting.set(jobKey(job._id), 'send interview links');
      }
      if (!rs.length && isJobUrgent(job)) {
        decisions.push({
          rank: 2, weight: 0, job, key: `src-${job._id}`,
          title: 'Add candidates to an urgent role',
          sub: 'Marked high priority with nobody in the pipeline yet.',
          cta: 'Open role', to: jobPath(job),
        });
        if (!waiting.has(jobKey(job._id))) waiting.set(jobKey(job._id), 'add candidates');
      }
    });
    decisions.sort((a, b) => a.rank - b.rank || b.weight - a.weight);

    // KPIs with a 12-day daily sparkline.
    const now = Date.now();
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const dayIndex = (time) => {
      if (time == null) return -1;
      const diff = Math.floor((startOfToday.getTime() + DAY - 1 - time) / DAY);
      return SPARK_DAYS - 1 - diff;
    };
    const kpiDefs = [
      { label: 'CVs scored', test: hasCvStrength, at: (r) => ts(r.createdAt) },
      { label: 'Coding tests', test: codingTestDone, at: (r) => ts(codingTestOf(r)?.completionDate) ?? ts(r.updatedAt) },
      { label: 'AI interviews', test: interviewDone, at: (r) => ts(r.interviewEvaluation?.evaluatedAt) ?? ts(r.updatedAt) },
      { label: 'Scorecards', test: hasScorecard, at: (r) => ts(r.updatedAt) },
    ];
    const kpis = kpiDefs.map((k) => {
      const hits = resumes.filter(k.test);
      const days = Array(SPARK_DAYS).fill(0);
      let week = 0;
      hits.forEach((r) => {
        const time = k.at(r);
        const i = dayIndex(time);
        if (i >= 0 && i < SPARK_DAYS) days[i] += 1;
        if (time != null && now - time < 7 * DAY) week += 1;
      });
      return { label: k.label, total: hits.length, week, days, max: Math.max(1, ...days) };
    });

    // Active roles: those waiting on the manager first, then newest.
    const roles = [...openJobs]
      .sort((a, b) => {
        const w = Number(waiting.has(jobKey(b._id))) - Number(waiting.has(jobKey(a._id)));
        return w || (ts(b.createdAt) || 0) - (ts(a.createdAt) || 0);
      })
      .slice(0, 6)
      .map((job) => {
        const rs = byJob.get(jobKey(job._id)) || [];
        const stage = roleStageIndex(rs);
        const wait = waiting.get(jobKey(job._id));
        let status;
        if (wait) status = `Waiting for you · ${wait}`;
        else if (!rs.length) status = 'Zeus is sourcing candidates';
        else if (rs.some((r) => !hasCvStrength(r))) status = `Zeus is scoring ${plural(rs.filter((r) => !hasCvStrength(r)).length, 'CV')}`;
        else if (rs.some((r) => atCodingTest(r) && !codingTestDone(r))) status = `${plural(rs.filter((r) => atCodingTest(r) && !codingTestDone(r)).length, 'coding test')} in progress`;
        else if (rs.some(atClientReview)) status = `${plural(rs.filter(atClientReview).length, 'candidate')} with client`;
        else status = `${plural(rs.length, 'candidate')} in pipeline`;
        return {
          job,
          title: job.jobtitle || 'Untitled role',
          meta: [jobCompanyName(job), job.location].filter(Boolean).join(' · '),
          stage,
          waiting: Boolean(wait),
          now: status,
          count: rs.length,
        };
      });

    // Activity feed: workflow events grouped per role, per kind, per day.
    const groups = new Map();
    // Candidates with an interview result have a scorecard; the rest open in the list.
    const scored = (r) => interviewDone(r) || hasScorecard(r);
    const add = (kind, job, time, r) => {
      if (time == null) return;
      const day = new Date(time).toDateString();
      const key = `${kind}|${jobKey(job?._id)}|${day}`;
      const g = groups.get(key) || { kind, job, time, count: 0, name: r?.name, resume: r, allScored: true };
      g.count += 1;
      g.time = Math.max(g.time, time);
      if (r && !scored(r)) g.allScored = false;
      groups.set(key, g);
    };
    jobs.forEach((job) => add('job', job, ts(job.createdAt)));
    resumes.forEach((r) => {
      const job = jobById.get(jobKey(r.jobId));
      add('cv', job, ts(r.createdAt), r);
      if (codingTestDone(r)) add('coding', job, ts(codingTestOf(r)?.completionDate), r);
      if (interviewDone(r)) add('interview', job, ts(r.interviewEvaluation?.evaluatedAt), r);
      if (r.status === 'shortlisted') add('shortlist', job, ts(r.updatedAt), r);
      if (r.status === 'hired') add('hired', job, ts(r.updatedAt), r);
    });
    const describe = (g) => {
      const one = g.count === 1;
      switch (g.kind) {
        case 'job': return 'Role went live';
        case 'cv': return `${plural(g.count, 'CV')} added`;
        case 'coding': return one ? `${g.name || 'A candidate'} finished the coding test` : `${g.count} finished coding tests`;
        case 'interview': return one ? `Interviewed ${g.name || 'a candidate'}` : `${g.count} AI interviews done`;
        case 'shortlist': return one ? `Shortlisted ${g.name || 'a candidate'}` : `${g.count} shortlisted`;
        case 'hired': return one ? `Hired ${g.name || 'a candidate'}` : `${g.count} hired`;
        default: return '';
      }
    };
    // Where a feed line leads: one candidate opens their scorecard (or their card
    // in the list before they have one); several open the job's scorecards or list.
    const feedTarget = (g) => {
      if (!g.job) return null;
      const base = `${consoleBase}/jobs/${g.job._id}`;
      if (g.kind === 'job') return base;
      const page = g.allScored ? 'scorecards' : 'candidates';
      return g.count === 1 && g.resume?._id ? `${base}/${page}?c=${g.resume._id}` : `${base}/${page}`;
    };
    const feed = [...groups.values()]
      .sort((a, b) => b.time - a.time)
      .slice(0, 8)
      .map((g, i) => ({
        key: `${g.kind}-${jobKey(g.job?._id)}-${g.time}`,
        time: feedTime(g.time),
        what: describe(g),
        role: g.job?.jobtitle || '',
        to: feedTarget(g),
        delay: `${0.2 + i * 0.08}s`,
      }));

    return { openJobs, decisions, kpis, roles, feed };
  }, [jobs, resumes, consoleBase]);

  const { openJobs, decisions, kpis, roles, feed } = view;

  // Business overview tiles (from the earlier overview page).
  const { resumeStats = {} } = platform;
  const closedJobs = jobs.filter((j) => !isJobOpen(j));
  const metrics = [
    { label: 'Active Jobs', value: openJobs.length, delta: `${jobs.length} total` },
    // Employer Managers keep their own openings count here.
    ...(employerManager ? [{ label: 'Open Positions', value: sumField(openJobs, 'openpositions') }] : []),
    { label: 'Positions Closed', value: closedJobs.length },
    { label: 'Candidates in Pipeline', value: resumes.length, delta: `${resumeStats.pendingResumes || 0} awaiting review` },
    { label: 'Interviews', value: resumes.filter(hasAiInterview).length },
  ];
  const today = new Date()
    .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    .replace(',', '')
    .toUpperCase();

  // Pages opened from here send Back to the overview, not the Jobs tab.
  const open = (to) => navigate(to, { state: { from: `${consoleBase}/dashboard` } });

  const submitAsk = (e) => {
    e.preventDefault();
    onBriefZeus?.(ask.trim());
  };

  const orb = (size) => ({
    width: size, height: size, borderRadius: '50%',
    background: `radial-gradient(circle at 35% 30%, ${t.orbA}, ${t.orbB} 55%, ${t.orbC})`,
  });
  const panel = { background: t.panel, border: `1px solid ${t.line}`, borderRadius: 16 };
  const eyebrow = { ...MONO, fontSize: 11, letterSpacing: '0.12em', color: t.faint };
  const skeleton = (h, w = '100%') => (
    <div className="zcc-skel" style={{ height: h, width: w, borderRadius: 8, background: t.track }} />
  );

  return (
    <div className="zcc" style={{ color: t.text, background: `${t.glow}, ${t.bg}` }}>
      <div className="zcc-wrap">
        <main className="zcc-main">
          {/* Greeting */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ ...MONO, fontSize: 11.5, letterSpacing: '0.14em', color: t.faint }}>
                  CONTROL CENTRE · {today}
                </span>
              </div>
              <h1 className="zcc-title" style={{ marginTop: 8, fontSize: 36, letterSpacing: '-0.03em', lineHeight: 1.1, fontWeight: 700, color: t.text }}>
                {greeting()}{managerName ? `, ${managerName}` : ''}.
              </h1>
              <p style={{ marginTop: 6, fontSize: 16, color: t.muted }}>
                {loading ? (
                  'Checking in with Zeus…'
                ) : (
                  <>
                    Zeus is running {plural(openJobs.length, 'role')}.{' '}
                    {decisions.length ? (
                      <><b style={{ color: t.warn }}>{plural(decisions.length, 'decision')}</b> {decisions.length === 1 ? 'needs' : 'need'} you.</>
                    ) : (
                      <span style={{ color: t.ok }}>Nothing needs you right now.</span>
                    )}
                  </>
                )}
              </p>
            </div>
            <button
              type="button"
              className="zcc-btn zcc-cta"
              onClick={() => onBriefZeus?.()}
              style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 10, height: 46, padding: '0 20px', borderRadius: 12, background: t.accent, color: t.onAccent, fontWeight: 600, fontSize: 15 }}
            >
              <span className="zcc-orb" style={{ width: 16, height: 16, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, #FFFFFF, ${t.orbB})` }} />
              New role · brief Zeus
            </button>
          </div>

          {/* Decisions */}
          <section aria-label="Decisions for you" className="zcc-decisions">
            {loading
              ? [0, 1, 2].map((i) => (
                  <div key={i} style={{ ...panel, padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {skeleton(10, '50%')}{skeleton(20, '80%')}{skeleton(14)}
                  </div>
                ))
              : decisions.slice(0, 3).map((d, i) => (
                  <button
                    key={d.key}
                    type="button"
                    className="zcc-card zcc-in"
                    onClick={() => open(d.to)}
                    style={{ ...panel, borderTop: `3px solid ${t.warn}`, padding: 18, display: 'flex', flexDirection: 'column', gap: 10, color: t.text, animationDelay: `${0.1 + i * 0.12}s` }}
                  >
                    <span style={{ ...MONO, fontSize: 10.5, letterSpacing: '0.12em', color: t.warn, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                      Needs you · {d.job.jobtitle || 'Role'}
                    </span>
                    <b style={{ fontSize: 18, lineHeight: 1.25 }}>{d.title}</b>
                    <span style={{ fontSize: 13.5, color: t.muted }}>{d.sub}</span>
                    <span style={{ marginTop: 'auto', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', height: 34, padding: '0 14px', borderRadius: 9, background: t.accentSoft, color: t.accent, fontWeight: 600, fontSize: 13.5 }}>
                      {d.cta} →
                    </span>
                  </button>
                ))}
            {!loading && !decisions.length && (
              <div className="zcc-in" style={{ ...panel, borderTop: `3px solid ${t.ok}`, padding: 18, gridColumn: '1 / -1' }}>
                <span style={{ ...MONO, fontSize: 10.5, letterSpacing: '0.12em', color: t.ok }}>ALL CLEAR</span>
                <b style={{ display: 'block', fontSize: 18, marginTop: 8 }}>No decisions waiting on you.</b>
                <span style={{ fontSize: 13.5, color: t.muted }}>Zeus will flag scorecards and interview links here as they come in.</span>
              </div>
            )}
          </section>

          {/* Overview */}
          <section style={{ ...panel, padding: '18px 20px' }}>
            <b style={{ fontSize: 15 }}>Overview</b>
            <div className="zcc-kpis">
              {metrics.map((m) => (
                <div key={m.label} style={{ padding: '14px 16px', borderRadius: 12, background: t.panel2, border: `1px solid ${t.line}` }}>
                  <span style={{ fontSize: 12.5, color: t.muted }}>{m.label}</span>
                  {loading ? (
                    <div style={{ marginTop: 10 }}>{skeleton(28, '60%')}</div>
                  ) : (
                    <b style={{ display: 'block', ...MONO, fontWeight: 500, fontSize: 28, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
                      {Number(m.value || 0).toLocaleString('en-GB')}
                    </b>
                  )}
                  {m.delta && <span style={{ fontSize: 12, color: t.faint }}>{loading ? ' ' : m.delta}</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Live execution */}
          <section style={{ ...panel, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <b style={{ fontSize: 15 }}>Live execution</b>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, ...MONO, fontSize: 10.5, letterSpacing: '0.1em', color: t.ok }}>
                <i className="zcc-blink" style={{ width: 7, height: 7, borderRadius: '50%', background: t.ok, display: 'block' }} />
                ZEUS AT WORK
              </span>
              <span style={{ marginLeft: 'auto', ...MONO, fontSize: 11, color: t.faint }}>LAST {SPARK_DAYS} DAYS</span>
            </div>
            <div className="zcc-kpis">
              {kpis.map((k, i) => (
                <div key={k.label} style={{ padding: '14px 16px', borderRadius: 12, background: t.panel2, border: `1px solid ${t.line}` }}>
                  <span style={{ fontSize: 12.5, color: t.muted }}>{k.label}</span>
                  {loading ? (
                    <div style={{ marginTop: 10 }}>{skeleton(28, '60%')}</div>
                  ) : (
                    <b style={{ display: 'block', ...MONO, fontWeight: 500, fontSize: 28, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
                      {Math.round(k.total * ease(p * 1.2 - i * 0.1)).toLocaleString('en-GB')}
                    </b>
                  )}
                  <span style={{ fontSize: 12, color: k.week ? t.ok : t.faint }}>
                    {loading ? ' ' : k.week ? `+${k.week} this week` : 'none this week'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 30, marginTop: 10 }} aria-hidden="true">
                    {k.days.map((v, j) => (
                      <i
                        key={j}
                        style={{
                          flex: 1, borderRadius: 2, display: 'block',
                          height: `${(8 + (v / k.max) * 92 * ease(p * 1.6 - j * 0.05)).toFixed(0)}%`,
                          background: j === SPARK_DAYS - 1 ? t.accent : v ? t.accentSoft : t.track,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Active roles */}
          <section style={{ ...panel, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <b style={{ fontSize: 15 }}>Active roles</b>
              <button type="button" className="zcc-btn" onClick={() => onNavigate('Jobs')} style={{ marginLeft: 'auto', background: 'transparent', fontSize: 13.5, color: t.accent }}>
                All jobs →
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 8 }}>
              {loading &&
                [0, 1, 2].map((i) => (
                  <div key={i} style={{ padding: '14px 0', borderTop: `1px solid ${t.line}` }}>{skeleton(18)}</div>
                ))}
              {!loading && !roles.length && (
                <p style={{ padding: '14px 0', borderTop: `1px solid ${t.line}`, fontSize: 14, color: t.muted }}>
                  No open roles yet. Brief Zeus to start one.
                </p>
              )}
              {!loading &&
                roles.map((r) => (
                  <button
                    key={r.job._id}
                    type="button"
                    className="zcc-row"
                    onClick={() => open(`${consoleBase}/jobs/${r.job._id}`)}
                    style={{ borderTop: `1px solid ${t.line}` }}
                  >
                    <span style={{ minWidth: 0 }}>
                      <b style={{ display: 'block', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</b>
                      <span style={{ display: 'block', fontSize: 12.5, color: t.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.meta || '—'}
                      </span>
                    </span>
                    <span
                      style={{ display: 'flex', gap: 3 }}
                      role="img"
                      aria-label={`Stage ${r.stage + 1} of ${ROLE_STAGES.length}: ${ROLE_STAGES[r.stage]}`}
                      title={`${ROLE_STAGES[r.stage]} · ${plural(r.count, 'candidate')}`}
                    >
                      {ROLE_STAGES.map((s, i) => (
                        <i
                          key={s}
                          style={{
                            flex: 1, height: 8, borderRadius: 3, display: 'block',
                            background: i < r.stage ? t.accent : i === r.stage ? (r.waiting ? t.warn : t.ok) : t.track,
                          }}
                        />
                      ))}
                    </span>
                    <span style={{ fontSize: 13, color: r.waiting ? t.warn : t.ok }}>{r.now}</span>
                  </button>
                ))}
            </div>
          </section>
        </main>

        {/* Zeus activity */}
        <aside className="zcc-aside" style={{ ...panel, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span className="zcc-orb" style={orb(26)} />
            <b style={{ fontSize: 15 }}>Zeus</b>
            <span style={{ fontSize: 12.5, color: t.muted }}>autonomous hiring partner</span>
          </div>
          <div style={{ ...eyebrow, marginTop: 18 }}>RECENT ACTIVITY</div>
          <ol style={{ listStyle: 'none', margin: '10px 0 0', padding: 0, display: 'flex', flexDirection: 'column' }}>
            {loading &&
              [0, 1, 2, 3].map((i) => (
                <li key={i} style={{ padding: '9px 0', borderTop: `1px solid ${t.line}` }}>{skeleton(14)}</li>
              ))}
            {!loading && !feed.length && (
              <li style={{ padding: '9px 0', borderTop: `1px solid ${t.line}`, fontSize: 13, color: t.muted }}>
                No activity yet.
              </li>
            )}
            {!loading &&
              feed.map((f) => (
                <li
                  key={f.key}
                  className="zcc-in"
                  style={{ display: 'grid', gridTemplateColumns: '50px minmax(0, 1fr)', gap: 10, padding: '9px 0', borderTop: `1px solid ${t.line}`, fontSize: 13, lineHeight: 1.4, animationDelay: f.delay, cursor: f.to ? 'pointer' : 'default' }}
                  onClick={f.to ? () => open(f.to) : undefined}
                >
                  <span style={{ ...MONO, fontSize: 11, color: t.faint, paddingTop: 2 }}>{f.time}</span>
                  <span>
                    <b style={{ color: t.text, fontWeight: 600 }}>{f.what}</b>{' '}
                    <span style={{ color: t.muted }}>{f.role}</span>
                  </span>
                </li>
              ))}
          </ol>
          <form
            onSubmit={submitAsk}
            style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, height: 42, padding: '0 12px', borderRadius: 10, border: `1px solid ${t.line}`, background: t.panel2, fontSize: 13 }}
          >
            <input
              type="text"
              aria-label="Brief Zeus on a new role"
              placeholder="Tell Zeus about a new role…"
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', font: 'inherit', color: t.text }}
            />
            <button type="submit" className="zcc-btn" aria-label="Open Zeus" style={{ background: 'transparent', padding: 0, display: 'grid', placeItems: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.faint} strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
};

export default ManagerOverview;
