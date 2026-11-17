import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { isJobOpen } from '../../dashboard/dashboardUtils';
import { idOf, plural, firstName, jobManagerName, groupByJob, placeCandidate, canPick, cvScore, LANES, ts } from './recruiterModel';

const MONO = { fontFamily: 'var(--rc-mono)' };
const API = import.meta.env.VITE_BACKEND_URL;

const token = () => {
  try { return JSON.parse(localStorage.getItem('userInfo'))?.data?.accessToken || null; } catch { return null; }
};

const sendInterview = async (resumeId) => {
  const res = await fetch(`${API}/api/resumes/${resumeId}/send-interview`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Failed (${res.status})`);
  return data;
};

const RecPipeline = ({ t, platform, selectedId, onSelectJob, onOpenCandidate }) => {
  const { jobs, resumes, loading, refresh } = platform;
  const ordered = useMemo(() => [...jobs.filter(isJobOpen), ...jobs.filter((j) => !isJobOpen(j))], [jobs]);
  const job = ordered.find((j) => idOf(j._id) === selectedId) || ordered[0];
  const manager = jobManagerName(job);

  const lanes = useMemo(() => {
    const rs = job ? groupByJob(resumes).get(idOf(job._id)) || [] : [];
    const out = Object.fromEntries(LANES.map((l) => [l.key, []]));
    rs.forEach((r) => {
      const place = placeCandidate(r, job, manager);
      out[place.lane].push({ r, ...place, pickable: canPick(r) });
    });
    // Newest movement first within each lane.
    Object.values(out).forEach((list) => list.sort((a, b) => (ts(b.r.updatedAt) || 0) - (ts(a.r.updatedAt) || 0)));
    return out;
  }, [job, resumes, manager]);

  // Default selection: everyone who passed and is waiting on an interview.
  const [picked, setPicked] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const pickableKey = lanes.done.filter((c) => c.pickable).map((c) => c.r._id).join(',');
  useEffect(() => {
    setPicked(new Set(lanes.done.filter((c) => c.pickable && c.passed).map((c) => c.r._id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?._id, pickableKey]);
  useEffect(() => setSent(null), [job?._id]);

  const toggle = (id) => setPicked((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const n = picked.size;
  const send = async () => {
    if (!n || sending) return;
    setSending(true);
    const ids = [...picked];
    const results = await Promise.allSettled(ids.map(sendInterview));
    const okCount = results.filter((x) => x.status === 'fulfilled').length;
    const failures = results.filter((x) => x.status === 'rejected');
    if (okCount) setSent(okCount);
    failures.slice(0, 3).forEach((f) => toast.error(f.reason?.message || 'Could not send an interview'));
    setSending(false);
    await refresh();
  };

  const tone = (k) => ({ faint: [t.panel2, t.faint], accent: [t.accentSoft, t.accent], role: [t.roleSoft, t.role], ok: [t.okSoft, t.ok] }[k]);
  const sendLabel = sending ? 'Sending…' : n ? `Send ${n} AI interview link${n > 1 ? 's' : ''}` : 'Pick who interviews';

  return (
    <main className="rc-main">
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16 }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ ...MONO, fontSize: 11.5, letterSpacing: '0.14em', color: t.faint }}>CANDIDATE PIPELINE</span>
          <h1 className="rc-title">{job?.jobtitle || 'Candidate pipeline'}</h1>
        </div>
        {ordered.length > 1 && (
          <div role="tablist" aria-label="Job" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {ordered.map((j) => {
              const on = idOf(j._id) === idOf(job?._id);
              return (
                <button key={j._id} type="button" role="tab" aria-selected={on} className="rc-btn" onClick={() => onSelectJob(j._id)}
                  style={{ height: 34, padding: '0 14px', borderRadius: 17, border: `1px solid ${on ? t.accent : t.line}`, background: on ? t.accentSoft : 'transparent', color: on ? t.text : t.muted, fontSize: 13.5 }}>
                  {j.jobtitle}
                </button>
              );
            })}
          </div>
        )}
        <button type="button" className="rc-btn rc-cta" onClick={send} disabled={!n || sending}
          style={{ marginLeft: 'auto', height: 44, padding: '0 18px', borderRadius: 12, background: n ? t.accent : t.accentSoft, color: n ? t.onAccent : t.accent, fontWeight: 700, fontSize: 14.5, opacity: 1 }}>
          {sendLabel}
        </button>
      </div>

      {sent != null && (
        <div className="rc-in" role="status" style={{ marginTop: 14, padding: '12px 16px', borderRadius: 12, background: t.okSoft, color: t.ok, fontSize: 14 }}>
          ✓ {plural(sent, 'AI interview link')} emailed, open for 24 hours. Each Zeus verdict goes to {firstName(manager) || 'your manager'} after the interview.
        </div>
      )}

      {!loading && !job && (
        <div style={{ marginTop: 18, padding: 20, borderRadius: 16, background: t.panel, border: `1px solid ${t.line}`, color: t.muted, fontSize: 14 }}>
          No jobs assigned yet.
        </div>
      )}

      {(loading || job) && (
        <div className="rc-lanes-wrap">
          <div className="rc-lanes">
            {LANES.map((l) => {
              const cards = lanes[l.key];
              const [tagBg, tagFg] = tone(l.tone);
              const highlight = l.key === 'done' && cards.some((c) => c.pickable);
              return (
                <section key={l.key} className="rc-lane" aria-label={l.title} style={{ borderRadius: 14, background: t.panel, border: `1px solid ${highlight ? t.role : t.line}`, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 2px 4px' }}>
                    <b style={{ fontSize: 13.5 }}>{l.title}</b>
                    <span style={{ marginLeft: 'auto', ...MONO, fontSize: 12, color: t.muted }}>{loading ? '–' : cards.length}</span>
                  </div>
                  <span style={{ alignSelf: 'flex-start', ...MONO, fontSize: 9.5, letterSpacing: '0.1em', padding: '3px 7px', borderRadius: 5, background: tagBg, color: tagFg }}>
                    {l.key === 'verdict' && manager ? `WITH ${firstName(manager).toUpperCase()}` : l.tag}
                  </span>
                  {loading && [0, 1].map((i) => <div key={i} className="rc-skel" style={{ height: 56, borderRadius: 10, background: t.panel2 }} />)}
                  {!loading && cards.map((c) => {
                    const on = c.pickable && picked.has(c.r._id);
                    const score = cvScore(c.r);
                    return (
                      <div key={c.r._id} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 10, borderRadius: 10, background: on ? t.roleSoft : t.panel2, border: `1px solid ${on ? t.role : 'transparent'}` }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {c.pickable && (
                            <input type="checkbox" checked={on} onChange={() => toggle(c.r._id)} aria-label={`Send AI interview to ${c.r.name || 'candidate'}`} style={{ width: 15, height: 15, accentColor: t.accent, cursor: 'pointer', flexShrink: 0 }} />
                          )}
                          <button type="button" className="rc-btn rc-card" onClick={() => onOpenCandidate(c.r._id)} title="Open scorecard" style={{ background: 'transparent', padding: 0, minWidth: 0, flex: 1 }}>
                            <b style={{ fontSize: 13.5, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.r.name || 'Unnamed candidate'}</b>
                          </button>
                          <span style={{ ...MONO, fontSize: 12, color: l.key === 'uploaded' ? t.faint : t.text, whiteSpace: 'nowrap' }}>{score != null ? `CV ${score}` : ''}</span>
                        </span>
                        <span style={{ fontSize: 12, color: t.muted }}>{c.note}</span>
                      </div>
                    );
                  })}
                  {!loading && !cards.length && <span style={{ fontSize: 12, color: t.faint, padding: 2 }}>Nobody here yet</span>}
                </section>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
};

export default RecPipeline;
