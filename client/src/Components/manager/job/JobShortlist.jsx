import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { initialsOf } from '../../dashboard/dashboardUtils';
import { interviewDone } from '../dashboard/zeusModel';
import { generateBlueprintPDF, buildBlueprintDocumentHtml } from '../../../utils/zepPrepGenerator';
import { AT_CLIENT, scoresOf, overallOf, firstName, experienceLabel, phoneLabel } from './candidateScores';

const MONO = { fontFamily: 'var(--zcc-mono)' };
const authToken = () => JSON.parse(localStorage.getItem('userInfo') || 'null')?.data?.accessToken;
// The sections of the Candidate Success Blueprint (blueprintDocument.controller.js).
const BLUEPRINT_SECTIONS = [
  'Congratulations', 'Company intelligence', 'Role intelligence', 'Your evaluation highlights',
  'Client interview guidance', 'Technical refresh', 'Behavioural preparation',
];

const PhoneIcon = ({ color }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M5 3h4l2 5-3 2a11 11 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z" />
  </svg>
);

const stampDate = (v) => (v ? new Date(v).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '');

/**
 * The manager's decision for one job: every interviewed candidate, ranked,
 * with a one-click shortlist that reveals their phone number (from the record,
 * or looked up on DataVertex for ZepDB candidates), and the ZepPrep blueprint
 * emailed to each shortlisted candidate. `prepOnly` shows just the prep brief.
 */
const JobShortlist = ({ t, job, jobId, title, onBack, onOpenScorecard, prepOnly = false, onChanged, onGoTo }) => {
  const [resumes, setResumes] = useState(null);
  const [busy, setBusy] = useState({}); // { [resumeId]: 'shortlist' | 'blueprint' }

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/job/${jobId}`, { headers: { Authorization: `Bearer ${authToken()}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
      .then((d) => !cancelled && setResumes(Array.isArray(d) ? d : d?.resumes || []))
      .catch(() => { if (!cancelled) { setResumes([]); toast.error('Could not load candidates'); } });
    return () => { cancelled = true; };
  }, [jobId]);

  // Interviewed and still in the running, plus anyone already shortlisted.
  const cands = useMemo(() => (resumes || [])
    .filter((r) => AT_CLIENT.includes(r.status) || (interviewDone(r) && r.status !== 'rejected'))
    .map((r) => ({ r, overall: overallOf(r), s: scoresOf(r) }))
    .sort((a, b) => (b.overall ?? -1) - (a.overall ?? -1)), [resumes]);
  const shortlisted = cands.filter((c) => AT_CLIENT.includes(c.r.status));

  const setBusyFor = (id, v) => setBusy((b) => ({ ...b, [id]: v }));
  const patchLocal = (id, fields) => setResumes((list) => list.map((x) => (x._id === id ? { ...x, ...fields } : x)));
  const [noPhone, setNoPhone] = useState({}); // looked up and none found

  // Phone on file, or fetched from DataVertex for ZepDB candidates (one credit).
  const revealPhone = async (r, { quiet = false } = {}) => {
    setBusyFor(r._id, 'phone');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${r._id}/reveal-phone`, { method: 'POST', headers: { Authorization: `Bearer ${authToken()}` } });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not fetch the phone number');
      if (data.phone) {
        patchLocal(r._id, { phone: data.phone, countryCode: data.countryCode || r.countryCode });
        if (data.source === 'vertex') toast.success(`Phone number found for ${firstName(r.name)}`);
      } else {
        setNoPhone((m) => ({ ...m, [r._id]: true }));
        if (!quiet) toast(`No phone number available for ${firstName(r.name)}`, { icon: 'ℹ️' });
      }
    } catch (err) { if (!quiet) toast.error(err.message); } finally { setBusyFor(r._id, null); }
  };

  // One-way: shortlisting also credits the recruiter, which an undo wouldn't reverse.
  const shortlist = async (r) => {
    setBusyFor(r._id, 'shortlist');
    try {
      const body = { status: 'shortlisted', shortlistedTime: new Date().toISOString() };
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${r._id}`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${authToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not shortlist');
      patchLocal(r._id, body);
      toast.success(`${firstName(r.name)} shortlisted`);
      onChanged?.();
      setBusyFor(r._id, null);
      if (!r.phone) await revealPhone({ ...r, ...body }, { quiet: true });
    } catch (err) { toast.error(err.message); setBusyFor(r._id, null); }
  };

  // Builds the blueprint on first use (cached on the resume).
  const loadBlueprint = async (r) => {
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${r._id}/blueprint`, { headers: { Authorization: `Bearer ${authToken()}` } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Could not build the blueprint');
    patchLocal(r._id, { blueprintDocument: { ...(r.blueprintDocument || {}), generatedAt: data.blueprint?.meta?.generatedAt || new Date().toISOString() } });
    return data.blueprint;
  };

  // Download a copy for the manager.
  const downloadBlueprint = async (r) => {
    setBusyFor(r._id, 'blueprint');
    try { await generateBlueprintPDF(await loadBlueprint(r)); } catch (err) { toast.error(err.message); } finally { setBusyFor(r._id, null); }
  };

  // Email the blueprint to the candidate (prepared first if needed).
  const emailBlueprint = async (r) => {
    setBusyFor(r._id, 'email');
    try {
      const bp = await loadBlueprint(r);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${r._id}/blueprint/email`, {
        method: 'POST', headers: { Authorization: `Bearer ${authToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: buildBlueprintDocumentHtml(bp) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not email the prep brief');
      setResumes((list) => list.map((x) => (x._id === r._id ? { ...x, blueprintDocument: { ...(x.blueprintDocument || {}), emailedAt: data.emailedAt, emailedTo: data.to } } : x)));
      toast.success(`Prep brief emailed to ${firstName(r.name)}`);
      onChanged?.();
    } catch (err) { toast.error(err.message); } finally { setBusyFor(r._id, null); }
  };

  const preview = shortlisted[0]?.r || cands[0]?.r;

  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <button type="button" className="zcc-btn" onClick={onBack} style={{ background: 'transparent', padding: 0, fontSize: 13.5, color: t.muted }}>← {title}</button>
          <h1 className="zcc-title" style={{ margin: '6px 0 0', fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15, fontWeight: 700, color: t.text }}>{prepOnly ? 'Prep brief' : 'Your decision'}</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14.5, color: t.muted }}>
            {prepOnly
              ? 'Email each shortlisted candidate their ZepPrep blueprint so they arrive at the final round ready.'
              : 'Zeus did the rest. Shortlist who moves to the final round. Phone numbers unlock only for them.'}
          </p>
        </div>
        <span style={{ marginLeft: 'auto', ...MONO, fontSize: 13, color: t.ok }}>{shortlisted.length} SHORTLISTED</span>
      </div>

      {!prepOnly && resumes == null && (
        <div className="zsl-grid">
          {[0, 1, 2, 3].map((i) => <div key={i} className="zcc-skel" style={{ height: 300, borderRadius: 16, background: t.track }} />)}
        </div>
      )}

      {!prepOnly && resumes != null && !cands.length && (
        <div style={{ padding: 20, borderRadius: 16, background: t.panel, border: `1px solid ${t.line}`, fontSize: 14.5, color: t.muted }}>
          Nobody to decide on yet. Candidates appear here once they finish the AI interview.
        </div>
      )}

      {!prepOnly && cands.length > 0 && (
        <div className="zsl-grid">
          {cands.map(({ r, overall, s }, i) => {
            const on = AT_CLIENT.includes(r.status);
            const phone = phoneLabel(r);
            const meta = [experienceLabel(r, true), r.location].filter(Boolean).join(' · ') || r.title || '—';
            const bars = [
              { l: 'Coding', v: s.coding, c: t.ok },
              { l: 'CV', v: s.cv, c: t.warn },
              { l: 'Interview', v: s.interview, c: t.accent },
            ];
            const isBusy = busy[r._id] === 'shortlist';
            return (
              <article key={r._id} className="zcc-in" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 16, background: t.panel, border: `1px solid ${on ? t.ok : t.line}`, animationDelay: `${Math.min(i, 8) * 0.08}s`, transition: 'border-color .3s ease' }}>
                <button type="button" className="zcc-btn" onClick={() => onOpenScorecard(r._id)} title="Open scorecard" style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', padding: 0, color: t.text, textAlign: 'left' }}>
                  <span style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.accentSoft, color: t.accent, fontWeight: 700 }}>{initialsOf(r.name, '?')}</span>
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name || 'Candidate'}</b>
                    <span style={{ fontSize: 12, color: t.faint }}>{meta}</span>
                  </span>
                </button>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <b style={{ ...MONO, fontWeight: 500, fontSize: 32 }}>{overall == null ? '—' : `${overall}%`}</b>
                  <span style={{ fontSize: 12, color: t.faint }}>overall</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {bars.map((b) => (
                    <div key={b.l} style={{ display: 'grid', gridTemplateColumns: '70px minmax(0, 1fr) 28px', alignItems: 'center', gap: 8, fontSize: 12, color: t.muted }}>
                      <span>{b.l}</span>
                      <span style={{ height: 5, borderRadius: 3, background: t.track, overflow: 'hidden' }}><i style={{ display: 'block', height: '100%', width: `${b.v || 0}%`, background: b.c }} /></span>
                      <span style={{ ...MONO, textAlign: 'right', color: b.v == null ? t.faint : t.text }}>{b.v ?? '—'}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 10, background: t.panel2, ...MONO, fontSize: 12.5, minHeight: 37 }}>
                  <PhoneIcon color={on ? t.ok : t.faint} />
                  {on ? (
                    phone
                      ? <a href={`tel:${phone.replace(/\s+/g, '')}`} className="zsl-reveal" style={{ color: t.text, textDecoration: 'none' }}>{phone}</a>
                      : busy[r._id] === 'phone'
                        ? <span style={{ color: t.muted }}>Fetching number…</span>
                        : noPhone[r._id]
                          ? <span className="zsl-reveal" style={{ color: t.muted }}>No phone number available</span>
                          : (
                            <button type="button" className="zcc-btn" onClick={() => revealPhone(r)} style={{ background: 'transparent', padding: 0, color: t.accent, ...MONO, fontSize: 12.5 }}>
                              Fetch phone number
                            </button>
                          )
                  ) : (
                    <span style={{ color: t.faint }}>•••• •••••• · locked</span>
                  )}
                </div>
                <button
                  type="button"
                  className="zcc-btn"
                  onClick={() => !on && shortlist(r)}
                  disabled={on || isBusy}
                  style={{ height: 40, borderRadius: 10, border: `1px solid ${on ? t.ok : t.accent}`, background: on ? t.ok : 'transparent', color: on ? t.onAccent : t.accent, fontWeight: 600, fontSize: 14, cursor: on ? 'default' : 'pointer', opacity: isBusy ? 0.6 : 1 }}
                >
                  {on ? '✓ Shortlisted' : isBusy ? 'Shortlisting…' : '☆ Shortlist'}
                </button>
              </article>
            );
          })}
        </div>
      )}

      {/* Prep brief */}
      <section style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'stretch', background: t.panel, border: `1px solid ${t.line}`, borderRadius: 16, padding: 18 }}>
        <div style={{ flex: '1 1 300px', minWidth: 0 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <b style={{ fontSize: 15 }}>Prep brief</b>
            <span style={{ ...MONO, fontSize: 11, color: t.faint }}>ZEPPREP · CANDIDATE SUCCESS BLUEPRINT</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, lineHeight: 1.5, color: t.muted }}>
            Zeus writes each shortlisted candidate a personal blueprint from their CV, coding test and interview, and emails it to them so they arrive at the final round ready.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {!shortlisted.length && (
              <span style={{ fontSize: 13, color: t.faint }}>
                Shortlist someone to prepare their blueprint.{' '}
                {prepOnly && onGoTo && <button type="button" className="zcc-btn" onClick={() => onGoTo('shortlist')} style={{ background: 'transparent', padding: 0, color: t.accent, fontSize: 13 }}>Go to Shortlist →</button>}
              </span>
            )}
            {shortlisted.map(({ r }) => {
              const ready = Boolean(r.blueprintDocument?.generatedAt);
              const canBuild = interviewDone(r);
              const working = busy[r._id] === 'blueprint';
              const emailing = busy[r._id] === 'email';
              const emailed = Boolean(r.blueprintDocument?.emailedAt);
              return (
                <div key={r._id} className="zcc-in" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <span style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.accentSoft, color: t.accent, fontSize: 10.5, fontWeight: 700 }}>{initialsOf(r.name, '?')}</span>
                  <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</span>
                  {canBuild ? (
                    <span style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {ready && (
                        <button type="button" className="zcc-btn" onClick={() => downloadBlueprint(r)} disabled={working || emailing} title="Download a copy"
                          style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 6, background: t.track, color: t.muted, opacity: working ? 0.6 : 1 }}>
                          {working ? 'Opening…' : '↓'}
                        </button>
                      )}
                      <button type="button" className="zcc-btn" onClick={() => emailBlueprint(r)} disabled={working || emailing}
                        title={emailed ? `Emailed to ${r.blueprintDocument.emailedTo || 'the candidate'}. Click to send again.` : 'Email the prep brief to the candidate'}
                        style={{ fontSize: 11.5, padding: '3px 8px', borderRadius: 6, background: emailed ? t.okSoft : t.accentSoft, color: emailed ? t.ok : t.accent, opacity: emailing ? 0.6 : 1 }}>
                        {emailing ? 'Sending…' : emailed ? `✓ Emailed ${stampDate(r.blueprintDocument.emailedAt)}` : '✉ Email prep brief'}
                      </button>
                    </span>
                  ) : (
                    <span style={{ marginLeft: 'auto', flexShrink: 0, fontSize: 11.5, color: t.faint }}>After the AI interview</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div aria-hidden="true" style={{ flex: '0 1 260px', minWidth: 0, background: t.dark ? '#F7F8FB' : '#FFFFFF', color: '#0B1020', borderRadius: 10, padding: '14px 16px', boxShadow: '0 16px 34px rgba(0,0,0,0.18)', border: t.dark ? 0 : `1px solid ${t.line}` }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>Zep<span style={{ color: '#1D5CFF' }}>Prep</span></span>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>{title}</div>
          <div style={{ fontSize: 10.5, color: '#6B7280' }}>{[job?.company, preview ? `prepared for ${preview.name}` : null].filter(Boolean).join(' · ')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 10, fontSize: 10.5, color: '#374151' }}>
            {BLUEPRINT_SECTIONS.map((s, i) => <span key={s}>{String(i + 1).padStart(2, '0')} · {s}</span>)}
          </div>
        </div>
      </section>
    </>
  );
};

export default JobShortlist;
