import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { codingTestOf, codingTestDone, codingTestScore, initialsOf } from '../../dashboard/dashboardUtils';
import { interviewDone, interviewPercent, roleConfirmed } from '../dashboard/zeusModel';
import { useSnapshots } from './JobScorecards';

const MONO = { fontFamily: 'var(--zcc-mono)' };
const DAY = 86400000;
const API = import.meta.env.VITE_BACKEND_URL;
const authToken = () => JSON.parse(localStorage.getItem('userInfo') || 'null')?.data?.accessToken;
const sentence = (items) => (Array.isArray(items) ? items : items ? [items] : [])
  .map((s) => String(s).trim()).filter(Boolean).map((s) => (/[.!?]$/.test(s) ? s : `${s}.`)).join(' ');
const stamp = (v) => {
  const d = v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
};

/** Where the role invite stands: new, waiting, expired, accepted or declined. */
export const outreachState = (r) => {
  const rc = r?.roleConfirmation;
  if (!rc?.sentAt) return 'new';
  if (rc.status === 'accepted') return 'accepted';
  if (rc.status === 'declined') return 'declined';
  return Date.now() - new Date(rc.sentAt).getTime() > DAY ? 'expired' : 'waiting';
};

const LIVE_INVITE = ['scheduled', 'active', 'completed'];
export const codingRequiredFor = (job) => Boolean(job?.intake?.codingTest?.required);

/** May be sent the AI interview link now. */
export const canGetInterviewLink = (r, job) => {
  if (r?.status === 'rejected' || interviewDone(r) || LIVE_INVITE.includes(r?.interviewInvite?.status)) return false;
  return codingRequiredFor(job) ? codingTestDone(r) : roleConfirmed(r) || codingTestDone(r);
};

const STAGES = {
  outreach: {
    title: 'Outreach',
    sub: 'Choose who Zeus asks. Each candidate gets an email and WhatsApp asking whether they want to go ahead with this role. Links stay open for 24 hours.',
  },
  cv: {
    title: 'CV strength',
    sub: 'Candidates who said yes, with their CV strength scorecard. Open one for the full breakdown.',
  },
  coding: {
    title: 'Coding test',
    sub: 'Results of the proctored coding test, with webcam snapshots from the start and end of the test.',
  },
  'interview-links': {
    title: 'Send interview links',
    sub: 'Pick who gets the AI interview. Each candidate receives a personal link by email.',
  },
  interviews: {
    title: 'AI interview',
    sub: 'Interview results as they come in. Open a candidate for the full scorecard and transcript.',
  },
};

const Snapshots = ({ t, r }) => {
  const { loading, shots } = useSnapshots(r);
  if (loading) return <span style={{ fontSize: 12, color: t.faint }}>Loading snapshots…</span>;
  if (!shots.length) return <span style={{ fontSize: 12, color: t.faint }}>No snapshots</span>;
  const pick = shots.length > 1 ? [shots[0], shots[shots.length - 1]] : [shots[0]];
  return (
    <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {pick.map((s, i) => (
        <a key={s.url || i} href={s.url} target="_blank" rel="noreferrer" title={i ? 'End of test' : 'Start of test'}>
          <img src={s.url} alt={i ? 'Coding test snapshot, end' : 'Coding test snapshot, start'} style={{ width: 96, height: 62, objectFit: 'cover', borderRadius: 8, display: 'block' }} />
        </a>
      ))}
      {shots.length > 2 && <span style={{ alignSelf: 'center', fontSize: 12, color: t.faint }}>+{shots.length - 2} more</span>}
    </span>
  );
};

/**
 * One manager-facing step of the job's workflow, beside the rail. `stage` is
 * one of outreach, cv, coding, interview-links or interviews.
 */
const JobPipelineStage = ({ t, stage, job, jobId, title, onBack, onOpenScorecard, onEditJob, onChanged, onGoTo }) => {
  const spec = STAGES[stage];
  const [resumes, setResumes] = useState(null);
  const [picked, setPicked] = useState(() => new Set());
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(null); // expanded row (coding snapshots)
  const codingRequired = codingRequiredFor(job);

  const load = useCallback(() => {
    fetch(`${API}/api/manager/resumes/job/${jobId}`, { headers: { Authorization: `Bearer ${authToken()}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
      .then((d) => setResumes(Array.isArray(d) ? d : d?.resumes || []))
      .catch(() => { setResumes([]); toast.error('Could not load candidates'); });
  }, [jobId]);
  useEffect(() => { load(); setPicked(new Set()); setOpen(null); }, [load, stage]);

  const live = useMemo(() => (resumes || []).filter((r) => r.status !== 'rejected'), [resumes]);

  // Rows for this stage, each { r, selectable, chip, detail }.
  const view = useMemo(() => {
    const chip = (label, tone) => ({ label, tone });
    if (stage === 'outreach') {
      const STATE = {
        new: chip('Not contacted', 'muted'), waiting: chip('Waiting', 'accent'), expired: chip('Link expired', 'muted'),
        accepted: chip('Interested', 'ok'), declined: chip('Not now', 'danger'),
      };
      const order = { new: 0, expired: 1, waiting: 2, accepted: 3, declined: 4 };
      const rows = live.map((r) => {
        const s = outreachState(r);
        const cv = r.ats_score != null ? `CV ${Math.round(r.ats_score)}` : null;
        const when = s === 'new' ? null : s === 'accepted' || s === 'declined' ? `replied ${stamp(r.roleConfirmation.respondedAt)}` : `sent ${stamp(r.roleConfirmation.sentAt)}`;
        return { r, s, selectable: s === 'new' || s === 'expired', chip: STATE[s], detail: [cv, r.title, when].filter(Boolean).join(' · ') };
      }).sort((a, b) => order[a.s] - order[b.s] || (b.r.ats_score ?? -1) - (a.r.ats_score ?? -1));
      const count = (k) => rows.filter((x) => x.s === k).length;
      return {
        rows,
        stats: [
          { l: 'Not contacted', v: count('new') }, { l: 'Waiting', v: count('waiting') },
          { l: 'Interested', v: count('accepted'), c: t.ok }, { l: 'Not now', v: count('declined'), c: t.danger }, { l: 'Expired', v: count('expired') },
        ],
        action: (n) => `Send invite to ${n} candidate${n === 1 ? '' : 's'}`,
        empty: 'No candidates yet. Source candidates first, then choose who to reach out to.',
      };
    }

    const accepted = live.filter((r) => roleConfirmed(r) || codingTestOf(r) || interviewDone(r));

    if (stage === 'cv') {
      const rows = accepted
        .map((r) => {
          const score = r.ats_score != null ? Math.round(r.ats_score) : null;
          const tone = score == null ? 'muted' : score >= 80 ? 'ok' : score >= 60 ? 'accent' : 'danger';
          return { r, score, chip: chip(score == null ? 'Scoring…' : `CV ${score}`, tone), detail: [r.title, r.recommendation].filter(Boolean).join(' · '), note: sentence(r.keyStrength) };
        })
        .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      const waiting = live.filter((r) => outreachState(r) === 'waiting').length;
      return {
        rows,
        stats: [{ l: 'Said yes', v: rows.length, c: t.ok }, { l: 'Waiting to reply', v: waiting }, { l: 'Average CV', v: rows.length ? Math.round(rows.reduce((s, x) => s + (x.score || 0), 0) / rows.length) : '—' }],
        empty: waiting ? `No one has said yes yet. ${waiting} invite${waiting === 1 ? ' is' : 's are'} waiting for a reply.` : 'No one has said yes yet. Send invites from Outreach.',
      };
    }

    if (stage === 'coding') {
      if (!codingRequired) return { rows: [], notRequired: true };
      const STATUS = { invited: chip('Sent', 'accent'), in_progress: chip('In progress', 'accent'), completed: chip('Submitted · scoring', 'accent') };
      const rows = accepted.map((r) => {
        const test = codingTestOf(r);
        const score = codingTestScore(r);
        const cutoff = job?.intake?.codingTest?.cutoff;
        let c;
        if (!test) c = chip('Being prepared', 'muted');
        else if (score != null) c = chip(`${score}%`, cutoff != null && score < cutoff ? 'danger' : 'ok');
        else c = STATUS[test.status] || chip('Sent', 'accent');
        const when = test?.completionDate ? `finished ${stamp(test.completionDate)}` : test?.inviteDate ? `sent ${stamp(test.inviteDate)}` : null;
        return { r, score, test, chip: c, detail: [when, test?.evaluation?.feedback ? String(test.evaluation.feedback).slice(0, 140) : null].filter(Boolean).join(' · '), expandable: Boolean(test?.assessmentId) };
      }).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      const done = rows.filter((x) => codingTestDone(x.r)).length;
      return {
        rows,
        stats: [{ l: 'Sent', v: rows.filter((x) => x.test).length }, { l: 'Finished', v: done, c: t.ok }, { l: 'Cut-off', v: job?.intake?.codingTest?.cutoff != null ? `${job.intake.codingTest.cutoff}%` : '—' }],
        empty: 'No coding tests yet. The test is emailed automatically when a candidate says yes.',
      };
    }

    if (stage === 'interview-links') {
      const INVITE = { scheduled: chip('Link sent', 'accent'), active: chip('Interviewing now', 'accent'), completed: chip('Interview done', 'ok'), expired: chip('Link expired', 'muted'), cancelled: chip('Cancelled', 'muted') };
      const rows = accepted.map((r) => {
        const can = canGetInterviewLink(r, job);
        const inv = r.interviewInvite?.status;
        let c;
        if (interviewDone(r)) c = INVITE.completed;
        else if (can) c = inv === 'expired' ? chip('Expired · resend', 'warn') : chip('Ready', 'warn');
        else if (inv) c = INVITE[inv] || chip(inv, 'muted');
        else c = chip(codingRequired ? 'Coding test pending' : 'Waiting', 'muted');
        const score = codingTestScore(r);
        const detail = [r.ats_score != null ? `CV ${Math.round(r.ats_score)}` : null, codingRequired && score != null ? `Coding ${score}%` : null, r.interviewInvite?.sentAt ? `link sent ${stamp(r.interviewInvite.sentAt)}` : null].filter(Boolean).join(' · ');
        return { r, selectable: can, chip: c, detail, rank: can ? 0 : inv ? 1 : 2 };
      }).sort((a, b) => a.rank - b.rank || (codingTestScore(b.r) ?? b.r.ats_score ?? -1) - (codingTestScore(a.r) ?? a.r.ats_score ?? -1));
      return {
        rows,
        stats: [{ l: 'Ready for a link', v: rows.filter((x) => x.selectable).length, c: t.warn }, { l: 'Links out', v: rows.filter((x) => ['scheduled', 'active'].includes(x.r.interviewInvite?.status)).length }, { l: 'Interviewed', v: rows.filter((x) => interviewDone(x.r)).length, c: t.ok }],
        action: (n) => `Send interview link to ${n} candidate${n === 1 ? '' : 's'}`,
        empty: codingRequired ? 'No one has finished the coding test yet.' : 'No one has said yes yet. Send invites from Outreach.',
      };
    }

    // interviews
    const rows = live
      .filter((r) => interviewDone(r) || r.interviewInvite || r.interviewScheduled)
      .map((r) => {
        const pct = interviewPercent(r);
        const inv = r.interviewInvite?.status;
        let c;
        if (interviewDone(r)) c = chip(pct == null ? 'Done' : `${pct}%`, pct == null ? 'ok' : pct >= 70 ? 'ok' : pct >= 50 ? 'accent' : 'danger');
        else if (inv === 'active') c = chip('In progress', 'accent');
        else if (inv === 'expired') c = chip('Link expired', 'muted');
        else c = chip('Not started', 'muted');
        const summary = r.interviewEvaluation?.aiInterviewSummary;
        return { r, pct, chip: c, detail: interviewDone(r) ? `${r.interviewEvaluation.evaluationResults.length} questions answered` : inv === 'scheduled' ? `link sent ${stamp(r.interviewInvite.sentAt)}` : '', note: interviewDone(r) ? sentence((summary || []).slice(0, 2)) : '' };
      })
      .sort((a, b) => (b.pct ?? -1) - (a.pct ?? -1));
    return {
      rows,
      stats: [{ l: 'Interviewed', v: rows.filter((x) => interviewDone(x.r)).length, c: t.ok }, { l: 'Not finished', v: rows.filter((x) => !interviewDone(x.r)).length }],
      empty: 'No interviews yet. Send links from the previous step.',
    };
  }, [stage, live, job, codingRequired, t]);

  const selectable = view.rows.filter((x) => x.selectable);
  const toggle = (id) => setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allPicked = selectable.length > 0 && selectable.every((x) => picked.has(x.r._id));
  const pickAll = () => setPicked(allPicked ? new Set() : new Set(selectable.map((x) => x.r._id)));
  const chosen = selectable.filter((x) => picked.has(x.r._id)).map((x) => x.r);

  const send = async () => {
    if (!chosen.length) return;
    setSending(true);
    try {
      if (stage === 'outreach') {
        const res = await fetch(`${API}/api/manager/resumes/job/${jobId}/outreach`, {
          method: 'POST', headers: { Authorization: `Bearer ${authToken()}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeIds: chosen.map((r) => r._id) }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not send the invites');
        const failed = (data.results || []).filter((x) => !x.sent);
        if (data.sent) toast.success(`Invite sent to ${data.sent} candidate${data.sent === 1 ? '' : 's'}`);
        if (failed.length) {
          const name = (id) => chosen.find((r) => String(r._id) === String(id))?.name || 'A candidate';
          toast.error(failed.slice(0, 3).map((f) => `${name(f.resumeId)}: ${f.reason}`).join('\n'));
        }
      } else {
        let ok = 0;
        const errors = [];
        for (const r of chosen) {
          // eslint-disable-next-line no-await-in-loop
          const res = await fetch(`${API}/api/manager/resumes/${r._id}/send-interview`, { method: 'POST', headers: { Authorization: `Bearer ${authToken()}` } });
          // eslint-disable-next-line no-await-in-loop
          const data = await res.json().catch(() => ({}));
          if (res.ok) ok += 1; else errors.push(`${r.name || 'Candidate'}: ${data.message || 'failed'}`);
        }
        if (ok) toast.success(`Interview link sent to ${ok} candidate${ok === 1 ? '' : 's'}`);
        if (errors.length) toast.error(errors.slice(0, 3).join('\n'));
      }
      setPicked(new Set());
      load();
      onChanged?.();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  };

  const toneColor = { ok: t.ok, danger: t.danger, accent: t.accent, warn: t.warn, muted: t.muted };
  const toneBg = { ok: t.okSoft, danger: t.warnSoft, accent: t.accentSoft, warn: t.warnSoft, muted: t.track };
  const panel = { background: t.panel, border: `1px solid ${t.line}`, borderRadius: 16 };

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ minWidth: 0, flex: '1 1 320px' }}>
          <button type="button" className="zcc-btn" onClick={onBack} style={{ background: 'transparent', padding: 0, fontSize: 13.5, color: t.muted }}>← {title}</button>
          <h1 className="zcc-title" style={{ margin: '6px 0 0', fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15, fontWeight: 700, color: t.text }}>{spec.title}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14.5, color: t.muted, maxWidth: 680 }}>{spec.sub}</p>
        </div>
      </div>

      {view.notRequired ? (
        <section style={{ ...panel, padding: 20 }}>
          <b style={{ fontSize: 15 }}>No coding test for this job</b>
          <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.55, color: t.muted }}>
            Candidates who say yes go straight to the AI interview step. Turn on “Coding test required” in Edit job if you want one.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
            <button type="button" className="zcc-btn" onClick={onEditJob} style={{ height: 38, padding: '0 14px', borderRadius: 10, border: `1px solid ${t.accent}`, background: 'transparent', color: t.accent, fontWeight: 600 }}>✎ Edit job</button>
            <button type="button" className="zcc-btn" onClick={() => onGoTo?.('interview-links')} style={{ height: 38, padding: '0 14px', borderRadius: 10, background: t.accent, color: t.onAccent, fontWeight: 600 }}>Send interview links →</button>
          </div>
        </section>
      ) : (
        <>
          {view.stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
              {view.stats.map((s) => (
                <div key={s.l} style={{ ...panel, padding: '12px 14px' }}>
                  <span style={{ fontSize: 12, color: t.faint }}>{s.l}</span>
                  <b style={{ display: 'block', ...MONO, fontWeight: 500, fontSize: 22, marginTop: 2, color: s.c || t.text }}>{resumes == null ? '…' : s.v}</b>
                </div>
              ))}
            </div>
          )}

          <section style={{ ...panel, padding: 0, overflow: 'hidden' }}>
            {view.action && selectable.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: `1px solid ${t.line}`, background: t.panel2 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: t.muted, cursor: 'pointer' }}>
                  <input type="checkbox" checked={allPicked} onChange={pickAll} style={{ accentColor: t.accent, width: 16, height: 16 }} />
                  Select all ({selectable.length})
                </label>
                <button
                  type="button"
                  className="zcc-btn"
                  disabled={!chosen.length || sending}
                  onClick={send}
                  style={{ marginLeft: 'auto', height: 38, padding: '0 16px', borderRadius: 10, background: chosen.length ? t.accent : t.track, color: chosen.length ? t.onAccent : t.faint, fontWeight: 600, fontSize: 13.5, opacity: sending ? 0.6 : 1 }}
                >
                  {sending ? 'Sending…' : chosen.length ? view.action(chosen.length) : 'Select candidates'}
                </button>
              </div>
            )}

            {resumes == null && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16 }}>
                {[0, 1, 2].map((i) => <div key={i} className="zcc-skel" style={{ height: 52, borderRadius: 10, background: t.track }} />)}
              </div>
            )}
            {resumes != null && !view.rows.length && (
              <p style={{ margin: 0, padding: 18, fontSize: 14, color: t.muted }}>{view.empty}</p>
            )}

            {view.rows.map((x) => {
              const r = x.r;
              const isOpen = open === r._id;
              return (
                <div key={r._id} style={{ borderBottom: `1px solid ${t.line}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                    {view.action && (
                      <input
                        type="checkbox"
                        aria-label={`Select ${r.name || 'candidate'}`}
                        disabled={!x.selectable}
                        checked={picked.has(r._id)}
                        onChange={() => toggle(r._id)}
                        style={{ accentColor: t.accent, width: 16, height: 16, flexShrink: 0, visibility: x.selectable ? 'visible' : 'hidden' }}
                      />
                    )}
                    <button
                      type="button"
                      className="zcc-btn"
                      onClick={() => (x.expandable ? setOpen(isOpen ? null : r._id) : onOpenScorecard(r._id))}
                      style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', padding: 0, color: t.text, textAlign: 'left' }}
                      title={x.expandable ? 'Show snapshots' : 'Open scorecard'}
                    >
                      <span style={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.accentSoft, color: t.accent, fontSize: 12, fontWeight: 700 }}>{initialsOf(r.name, '?')}</span>
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <b style={{ display: 'block', fontSize: 14.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name || 'Candidate'}</b>
                        <span style={{ display: 'block', fontSize: 12.5, color: t.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.detail || '—'}</span>
                        {x.note && <span style={{ fontSize: 12.5, color: t.muted, marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{x.note}</span>}
                      </span>
                    </button>
                    <span style={{ flexShrink: 0, ...MONO, fontSize: 11.5, padding: '4px 9px', borderRadius: 6, background: toneBg[x.chip.tone], color: toneColor[x.chip.tone] }}>{x.chip.label}</span>
                    {stage !== 'outreach' && (
                      <button type="button" className="zcc-btn" onClick={() => onOpenScorecard(r._id)} title="Open scorecard" style={{ flexShrink: 0, background: 'transparent', color: t.accent, fontSize: 13, padding: 0 }}>Scorecard →</button>
                    )}
                  </div>
                  {isOpen && (
                    <div className="zcc-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, padding: '0 16px 14px 64px', fontSize: 13, color: t.muted }}>
                      <div style={{ flex: '1 1 260px', minWidth: 0 }}>
                        {x.test?.evaluation?.feedback ? <p style={{ margin: 0, lineHeight: 1.55 }}>{x.test.evaluation.feedback}</p> : <p style={{ margin: 0 }}>No feedback yet.</p>}
                      </div>
                      <Snapshots t={t} r={r} />
                    </div>
                  )}
                </div>
              );
            })}
          </section>
        </>
      )}
    </>
  );
};

export default JobPipelineStage;
