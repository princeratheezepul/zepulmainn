import React, { useMemo } from 'react';
import { greeting, isJobOpen } from '../../dashboard/dashboardUtils';
import {
  DAY, ts, idOf, plural, firstName, jobManagerName, jobCompany, jobBar, groupByJob, summarizeJob,
  GLANCE_STAGES, aboveBar, codingDone, codingPassed, codingSent, interviewDone, feedLabel,
} from './recruiterModel';

const MONO = { fontFamily: 'var(--rc-mono)' };

const listNames = (names) => {
  const u = [...new Set(names.filter(Boolean))];
  if (u.length <= 1) return u[0] || '';
  if (u.length === 2) return `${u[0]} and ${u[1]}`;
  return `${u[0]} and ${u.length - 1} others`;
};

const RecOverview = ({ t, platform, userName, onGo }) => {
  const { jobs, resumes, loading } = platform;

  const v = useMemo(() => {
    const byJob = groupByJob(resumes);
    const jobById = new Map(jobs.map((j) => [idOf(j._id), j]));
    const openJobs = jobs.filter(isJobOpen);
    const managers = listNames(jobs.map(jobManagerName));
    const companies = listNames(jobs.map(jobCompany));
    const now = Date.now();
    const week = (r, at) => { const x = at(r); return x != null && now - x < 7 * DAY; };
    const jobOf = (r) => jobById.get(idOf(r.jobId)) || r.jobId;

    const above = resumes.filter((r) => aboveBar(r, jobOf(r)));
    const done = resumes.filter(codingDone);
    const waiting = resumes.filter((r) => codingSent(r) && !codingDone(r));
    const interviews = resumes.filter(interviewDone);
    const kpis = [
      { l: 'Jobs assigned', v: jobs.length, s: managers ? `by ${managers}` : `${openJobs.length} open`, c: t.text },
      { l: 'Profiles uploaded', v: resumes.length, s: `+${resumes.filter((r) => week(r, (x) => ts(x.createdAt))).length} this week`, c: t.text },
      { l: 'Above CV bar', v: above.length, s: resumes.length ? `${Math.round((above.length / resumes.length) * 100)}% of uploads` : 'no uploads yet', c: t.text },
      { l: 'Coding tests done', v: done.length, s: `${waiting.length} waiting`, c: t.text },
      { l: 'AI interviews', v: interviews.length, s: `${interviews.filter((r) => week(r, (x) => ts(x.interviewEvaluation?.evaluatedAt) ?? ts(x.updatedAt))).length} this week`, c: t.role },
      { l: 'Zeus verdicts', v: interviews.length, s: managers ? `with ${firstName(managers)}` : 'with your manager', c: t.ok },
    ];

    // Things only the recruiter can move: interviews to send, jobs short of
    // profiles, coding tests nobody has started.
    const todo = [];
    openJobs.forEach((job) => {
      const s = summarizeJob(job, byJob.get(idOf(job._id)) || []);
      if (s.pick) todo.push({ rank: 0, w: s.pick, key: `p-${job._id}`, title: 'Pick who gets an AI interview', job, sub: `${plural(s.pick, 'candidate')} finished the coding test`, cta: 'Pick now', go: () => onGo('pipeline', job._id), c: t.accent, bBg: t.accent, bFg: t.onAccent });
      if (!s.uploads) todo.push({ rank: 1, w: 0, key: `u-${job._id}`, title: 'Upload profiles', job, sub: 'no profiles uploaded yet', cta: 'Upload', go: () => onGo('jobs', job._id), c: t.warn, bBg: t.warnSoft, bFg: t.warn });
      else if (s.above < 3) todo.push({ rank: 1, w: s.uploads, key: `u-${job._id}`, title: 'Upload more profiles', job, sub: `only ${s.above} of ${s.uploads} cleared the CV bar`, cta: 'Upload', go: () => onGo('jobs', job._id), c: t.warn, bBg: t.warnSoft, bFg: t.warn });
      if (s.stalled) todo.push({ rank: 2, w: s.stalled, key: `s-${job._id}`, title: `${plural(s.stalled, 'coding test')} not started`, job, sub: 'sent over 48 h ago', cta: 'View', go: () => onGo('pipeline', job._id), c: t.faint, bBg: t.panel2, bFg: t.text });
    });
    todo.sort((a, b) => a.rank - b.rank || b.w - a.w);

    // What happened on the recruiter's candidates, grouped per job per day.
    const groups = new Map();
    const add = (kind, job, time, extra = {}) => {
      if (time == null || now - time > 14 * DAY) return;
      const key = `${kind}|${idOf(job?._id)}|${new Date(time).toDateString()}`;
      const g = groups.get(key) || { kind, job, time, n: 0, ok: 0 };
      g.n += 1;
      if (extra.ok) g.ok += 1;
      g.time = Math.max(g.time, time);
      groups.set(key, g);
    };
    resumes.forEach((r) => {
      const job = jobOf(r);
      add('cv', job, ts(r.createdAt), { ok: aboveBar(r, job) });
      if (codingDone(r)) add('code', job, ts(r.oa?.completionDate || r.avaloqOa?.completionDate) ?? ts(r.updatedAt), { ok: codingPassed(r, job) });
      if (interviewDone(r)) add('int', job, ts(r.interviewEvaluation?.evaluatedAt) ?? ts(r.updatedAt));
    });
    const say = (g) => {
      const bar = jobBar(g.job);
      if (g.kind === 'cv') return `scored ${plural(g.n, 'new CV')}; ${g.ok} cleared ${bar != null ? bar : 'the bar'}.`;
      if (g.kind === 'code') return `${plural(g.n, 'coding test')} in, ${g.ok} passed.`;
      return `${plural(g.n, 'AI interview')} done; verdicts sent to ${firstName(jobManagerName(g.job)) || 'your manager'}.`;
    };
    const feed = [...groups.values()].sort((a, b) => b.time - a.time).slice(0, 6)
      .map((g) => ({ key: `${g.kind}-${idOf(g.job?._id)}-${g.time}`, w: feedLabel(g.time), job: g.job?.jobtitle || 'A job', s: say(g) }));

    const glance = [...openJobs, ...jobs.filter((j) => !isJobOpen(j))].slice(0, 6).map((job) => {
      const s = summarizeJob(job, byJob.get(idOf(job._id)) || []);
      const bar = jobBar(job);
      return { job, m: [jobCompany(job), bar != null ? `CV bar ${bar}` : null, s.open ? null : 'closed'].filter(Boolean).join(' · '), s };
    });

    return { kpis, todo, feed, glance, managers, companies, openJobs };
  }, [jobs, resumes, t, onGo]);

  const panel = { borderRadius: 16, background: t.panel, border: `1px solid ${t.line}` };
  const skel = (h, w = '100%') => <div className="rc-skel" style={{ height: h, width: w, borderRadius: 8, background: t.track }} />;
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '').toUpperCase();

  return (
    <main className="rc-main">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ ...MONO, fontSize: 11.5, letterSpacing: '0.14em', color: t.faint }}>OVERVIEW · {today}</span>
          <h1 className="rc-title">{greeting()}{userName ? `, ${firstName(userName)}` : ''}</h1>
          <p style={{ marginTop: 6, fontSize: 14.5, color: t.muted }}>
            {loading ? 'Loading your jobs…' : jobs.length
              ? `${plural(jobs.length, 'job')} assigned to you${v.managers ? ` by ${v.managers}` : ''}${v.companies ? ` · ${v.companies}` : ''}. Zeus screens everything you upload.`
              : 'No jobs assigned yet. Your manager assigns the requirements you work on.'}
          </p>
        </div>
        <button type="button" className="rc-btn rc-cta" onClick={() => onGo('jobs')} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, height: 46, padding: '0 20px', borderRadius: 12, background: t.accent, color: t.onAccent, fontWeight: 600, fontSize: 15 }}>
          ↑ Upload profiles
        </button>
      </div>

      <div className="rc-kpis">
        {v.kpis.map((k, i) => (
          <div key={k.l} className="rc-in" style={{ ...panel, borderRadius: 14, padding: 16, animationDelay: `${i * 0.05}s` }}>
            <span style={{ fontSize: 12.5, color: t.faint }}>{k.l}</span>
            {loading ? <div style={{ margin: '10px 0' }}>{skel(26, '50%')}</div> : (
              <b style={{ display: 'block', marginTop: 6, ...MONO, fontWeight: 500, fontSize: 28, color: k.c }}>{k.v}</b>
            )}
            <span style={{ fontSize: 12, color: t.muted }}>{loading ? ' ' : k.s}</span>
          </div>
        ))}
      </div>

      <div className="rc-two">
        <section style={{ ...panel, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <b style={{ fontSize: 16 }}>Needs you</b>
            <span style={{ marginLeft: 'auto', fontSize: 12.5, color: t.faint }}>Everything else, Zeus has</span>
          </div>
          {loading && [0, 1, 2].map((i) => <div key={i} style={{ padding: '14px 18px', borderTop: `1px solid ${t.line}` }}>{skel(18)}</div>)}
          {!loading && !v.todo.length && (
            <div style={{ padding: '14px 18px', borderTop: `1px solid ${t.line}`, fontSize: 14, color: t.muted }}>You're all caught up.</div>
          )}
          {!loading && v.todo.slice(0, 5).map((x) => (
            <button key={x.key} type="button" className="rc-todo" onClick={x.go} style={{ borderTopColor: t.line }}>
              <i style={{ alignSelf: 'stretch', borderRadius: 2, background: x.c, display: 'block' }} />
              <span style={{ minWidth: 0 }}>
                <b style={{ display: 'block', fontSize: 15 }}>{x.title}</b>
                <span style={{ fontSize: 13, color: t.muted }}>{x.job.jobtitle} · {x.sub}</span>
              </span>
              <span style={{ height: 34, padding: '0 14px', borderRadius: 10, background: x.bBg, color: x.bFg, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap' }}>{x.cta}</span>
            </button>
          ))}
        </section>

        <section style={{ ...panel, padding: '16px 18px' }}>
          <b style={{ fontSize: 16 }}>What Zeus did recently</b>
          <ol style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column' }}>
            {loading && [0, 1, 2].map((i) => <li key={i} style={{ padding: '10px 0', borderTop: `1px solid ${t.line}` }}>{skel(14)}</li>)}
            {!loading && !v.feed.length && <li style={{ padding: '10px 0', borderTop: `1px solid ${t.line}`, fontSize: 13.5, color: t.muted }}>Nothing yet. Upload profiles and Zeus gets to work.</li>}
            {!loading && v.feed.map((f) => (
              <li key={f.key} style={{ display: 'grid', gridTemplateColumns: '74px minmax(0, 1fr)', gap: 12, padding: '10px 0', borderTop: `1px solid ${t.line}`, fontSize: 13.5, lineHeight: 1.45 }}>
                <span style={{ ...MONO, fontSize: 11, color: t.faint, paddingTop: 2 }}>{f.w}</span>
                <span><b style={{ fontWeight: 600 }}>{f.job}</b> <span style={{ color: t.muted }}>{f.s}</span></span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section style={{ ...panel, marginTop: 18, padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <b style={{ fontSize: 16 }}>Your jobs at a glance</b>
          <button type="button" className="rc-btn" onClick={() => onGo('jobs')} style={{ marginLeft: 'auto', fontSize: 13, color: t.accent, fontWeight: 600, background: 'transparent' }}>All assigned jobs →</button>
        </div>
        {loading && <div style={{ marginTop: 12 }}>{skel(18)}</div>}
        {!loading && !v.glance.length && <p style={{ marginTop: 12, fontSize: 14, color: t.muted }}>No jobs assigned yet.</p>}
        {!loading && v.glance.map(({ job, m, s }) => (
          <button key={job._id} type="button" className="rc-glance" onClick={() => onGo('jobs', job._id)} style={{ borderTopColor: t.line, marginTop: 8 }}>
            <span style={{ minWidth: 0 }}>
              <b style={{ fontSize: 15 }}>{job.jobtitle}</b>
              <span style={{ display: 'block', fontSize: 12.5, color: t.faint }}>{m || '—'}</span>
            </span>
            <span style={{ display: 'flex', gap: 3 }} role="img" aria-label={`Reached: ${GLANCE_STAGES[s.stage]}`} title={GLANCE_STAGES[s.stage]}>
              {GLANCE_STAGES.map((g, i) => (
                <i key={g} style={{ flex: 1, height: 8, borderRadius: 4, display: 'block', background: i < s.stage ? t.accent : i === s.stage ? t.warn : t.track }} />
              ))}
            </span>
            <span style={{ textAlign: 'right', ...MONO, fontSize: 12, color: t.muted }} title="Uploaded · above bar · passed coding">
              {s.uploads} · {s.above} · {s.passed}
            </span>
          </button>
        ))}
      </section>
    </main>
  );
};

export default RecOverview;
