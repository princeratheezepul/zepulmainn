import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  CANDIDATE_STAGES, interviewStage, canSendInterview, codingTestOf, codingTestDone, codingTestScore, initialsOf,
} from '../../dashboard/dashboardUtils';
import { interviewDone, interviewPercent } from '../dashboard/zeusModel';
import ResumeDetailsView from '../dashboard/ResumeDetailsView';

const MONO = { fontFamily: 'var(--zcc-mono)' };
const RING = 2 * Math.PI * 30; // r = 30
const authToken = () => JSON.parse(localStorage.getItem('userInfo') || 'null')?.data?.accessToken;
const viewerId = () => { try { return JSON.parse(localStorage.getItem('userInfo'))?.data?.user?._id; } catch { return undefined; } };
const DECIDED = ['shortlisted', 'rejected', 'offered', 'hired'];
const AT_CLIENT = ['shortlisted', 'offered', 'hired'];
const firstName = (n) => String(n || '').trim().split(/\s+/)[0] || 'candidate';
const cvOf = (r) => {
  const n = Number(r?.overallScore || r?.ats_score);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
};
const SORTS = [
  { key: 'cv', label: 'CV strength' },
  { key: 'coding', label: 'Coding score' },
  { key: 'newest', label: 'Newest' },
];

// Where the candidate is, in words, plus a tone for the badge.
const PIPELINE = {
  codingSent: ['Coding test sent', 'accent'],
  codingDone: ['Coding test done', 'warn'],
  interviewSent: ['Interview sent', 'role'],
  interviewInProgress: ['Interview in progress', 'role'],
  interviewExpired: ['Interview expired', 'danger'],
  interviewDone: ['Interview done', 'ok'],
};
const stageOf = (r) => {
  const st = interviewStage(r);
  if (st && !DECIDED.includes(r.status)) return PIPELINE[st];
  if (AT_CLIENT.includes(r.status)) return [r.status === 'shortlisted' ? 'Shortlisted' : r.status === 'offered' ? 'Offered' : 'Hired', 'ok'];
  if (r.status === 'rejected') return ['Rejected', 'danger'];
  return [r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : 'Submitted', 'muted'];
};
const partnerOf = (r) => {
  const by = r.submittedBy;
  if (!by || by.role !== 'partner') return '';
  return by.userId?.fullname || by.userId?.username || by.name || 'Recruitment partner';
};

const Ring = ({ t, label, value, color }) => {
  const dash = (RING * (1 - (value || 0) / 100)).toFixed(1);
  return (
    <div style={{ textAlign: 'center', padding: '16px 6px' }}>
      <span style={{ ...MONO, fontSize: 10, letterSpacing: '0.14em', color: t.faint }}>{label}</span>
      <div style={{ position: 'relative', width: 72, height: 72, margin: '8px auto 0' }}>
        <svg width="72" height="72" viewBox="0 0 72 72" role="img" aria-label={`${label} ${value ?? 'not taken'}`}>
          <circle cx="36" cy="36" r="30" fill="none" stroke={t.track} strokeWidth="7" />
          {value != null && <circle cx="36" cy="36" r="30" fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={RING.toFixed(1)} strokeDashoffset={dash} transform="rotate(-90 36 36)" style={{ transition: 'stroke-dashoffset .8s ease' }} />}
        </svg>
        <b style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: value == null ? t.faint : color }}>{value ?? '—'}</b>
      </div>
    </div>
  );
};

/**
 * Manager candidate list for one job, in the console design: stage filters,
 * search and sort on the left, and the picked candidate's card on the right
 * with everything the manager can do (send interview, shortlist, reject,
 * notes, full report, scorecard).
 */
const JobCandidates = ({ t, jobId, title, selectedId, onSelect, onBack, onScorecard, onSource }) => {
  const [resumes, setResumes] = useState(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('cv');
  const [busy, setBusy] = useState('');
  const [full, setFull] = useState(false);
  // The full report opens at its top, not at the scroll position of the card.
  useEffect(() => { if (full) window.scrollTo({ top: 0 }); }, [full]);
  const [note, setNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/job/${jobId}`, { headers: { Authorization: `Bearer ${authToken()}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
      .then((d) => !cancelled && setResumes(Array.isArray(d) ? d : d?.resumes || []))
      .catch(() => { if (!cancelled) { setResumes([]); toast.error('Could not load candidates'); } });
    return () => { cancelled = true; };
  }, [jobId]);

  const all = resumes || [];
  const counts = Object.fromEntries(CANDIDATE_STAGES.map((s) => [s.key, all.filter(s.matches).length]));
  const stage = CANDIDATE_STAGES.find((s) => s.key === filter) || CANDIDATE_STAGES[0];
  const showPartner = all.some((r) => partnerOf(r));

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = all.filter(stage.matches).filter((r) => !q || [r.name, r.email, r.title, r.location].some((v) => String(v || '').toLowerCase().includes(q)));
    const key = { cv: cvOf, coding: codingTestScore }[sort];
    return [...list].sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      const av = key(a); const bv = key(b);
      if (av == null && bv == null) return new Date(b.createdAt) - new Date(a.createdAt);
      if (av == null) return 1;
      if (bv == null) return -1;
      return bv - av;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumes, filter, query, sort]);

  const current = visible.find((r) => String(r._id) === String(selectedId)) || visible[0] || null;

  useEffect(() => { setNote(current?.addedNotes || ''); }, [current?._id]);

  const patchLocal = (id, fields) => setResumes((list) => list.map((r) => (r._id === id ? { ...r, ...fields } : r)));

  const setStatus = async (status) => {
    setBusy(status);
    try {
      const body = status === 'shortlisted' ? { status, shortlistedTime: new Date().toISOString() } : { status };
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${current._id}`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${authToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not update the candidate');
      patchLocal(current._id, body);
      toast.success(status === 'shortlisted' ? `${firstName(current.name)} shortlisted` : 'Marked as not a fit');
    } catch (err) { toast.error(err.message); } finally { setBusy(''); }
  };

  // The server checks the candidate is ready and hasn't been sent one already.
  const sendInterview = async () => {
    setBusy('interview');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${current._id}/send-interview`, {
        method: 'POST', headers: { Authorization: `Bearer ${authToken()}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok || res.status === 409) patchLocal(current._id, { interviewInvite: data.interviewInvite });
      if (!res.ok) throw new Error(data.message || 'Failed to send interview');
      toast.success(data.message || 'Interview sent');
    } catch (err) { toast.error(err.message); } finally { setBusy(''); }
  };

  const saveNote = async () => {
    setNoteSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${current._id}`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${authToken()}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ addedNotes: note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to save note');
      patchLocal(current._id, { addedNotes: note });
      toast.success('Note saved');
    } catch (err) { toast.error(err.message); } finally { setNoteSaving(false); }
  };

  if (full && current) {
    return (
      <div style={{ borderRadius: 16, overflow: 'hidden' }}>
        <ResumeDetailsView resumeData={current} onBack={() => setFull(false)} />
      </div>
    );
  }

  const tone = { accent: [t.accentSoft, t.accent], warn: [t.warnSoft, t.warn], ok: [t.okSoft, t.ok], danger: [t.warnSoft, t.danger], role: [t.roleSoft, t.role], muted: [t.track, t.muted] };
  const btn = { height: 40, padding: '0 14px', borderRadius: 10, border: `1px solid ${t.line}`, background: t.panel, color: t.text, fontSize: 14 };
  const scored = all.filter(interviewDone).length;

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <button type="button" className="zcc-btn" onClick={onBack} style={{ background: 'transparent', padding: 0, fontSize: 13.5, color: t.muted }}>← {title}</button>
          <h1 className="zcc-title" style={{ margin: '6px 0 0', fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15, fontWeight: 700, color: t.text }}>Candidates</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14.5, color: t.muted }}>
            {resumes == null ? 'Loading…' : `${all.length} in the pipeline for ${title}`}
          </p>
        </div>
        <span className="zjp-actions" style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {onSource && <button type="button" className="zcc-btn" onClick={onSource} style={btn}>⟲ Source more</button>}
          {scored > 0 && (
            <button type="button" className="zcc-btn" onClick={() => onScorecard()} style={{ ...btn, border: 0, background: t.accent, color: t.onAccent, fontWeight: 600 }}>
              {scored} scorecard{scored === 1 ? '' : 's'} →
            </button>
          )}
        </span>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <div role="tablist" aria-label="Filter candidates" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {CANDIDATE_STAGES.map((s) => {
            const sel = filter === s.key;
            return (
              <button key={s.key} type="button" role="tab" aria-selected={sel} className="zcc-btn" onClick={() => setFilter(s.key)}
                style={{ height: 34, padding: '0 14px', borderRadius: 17, border: `1px solid ${sel ? t.accent : t.line}`, background: sel ? t.accentSoft : 'transparent', color: sel ? t.text : t.muted, fontSize: 13.5 }}>
                {s.label} ({resumes == null ? '…' : counts[s.key]})
              </button>
            );
          })}
        </div>
        <span style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }} className="zcd-tools">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, height: 36, width: 220, maxWidth: '100%', padding: '0 12px', borderRadius: 10, border: `1px solid ${t.line}`, background: t.panel, color: t.faint, fontSize: 13.5 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <input type="search" aria-label="Search candidates" placeholder="Search name, email…" value={query} onChange={(e) => setQuery(e.target.value)}
              style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', font: 'inherit', color: t.text, height: 'auto', padding: 0 }} />
          </label>
          <select aria-label="Sort candidates" value={sort} onChange={(e) => setSort(e.target.value)}
            style={{ height: 36, padding: '0 10px', borderRadius: 10, border: `1px solid ${t.line}`, background: t.panel, color: t.text, font: 'inherit', fontSize: 13.5 }}>
            {SORTS.map((s) => <option key={s.key} value={s.key}>Sort: {s.label}</option>)}
          </select>
        </span>
      </div>

      {resumes == null ? (
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="zcc-skel" style={{ flex: '1 1 300px', maxWidth: 380, height: 360, borderRadius: 14, background: t.track }} />
          <div className="zcc-skel" style={{ flex: '2 1 420px', height: 480, borderRadius: 18, background: t.track }} />
        </div>
      ) : !visible.length ? (
        <div style={{ padding: 20, borderRadius: 16, background: t.panel, border: `1px solid ${t.line}`, fontSize: 14.5, color: t.muted }}>
          {all.length ? 'No candidates match this filter.' : 'No candidates yet.'}
          {!all.length && onSource && <> <button type="button" className="zcc-btn" onClick={onSource} style={{ background: 'transparent', padding: 0, color: t.accent, fontWeight: 600 }}>Source from ZepDB →</button></>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
          {/* List */}
          <nav aria-label="Candidates" className="zcd-list" style={{ background: t.panel, border: `1px solid ${t.line}` }}>
            {visible.map((r) => {
              const sel = r._id === current._id;
              const [label, tn] = stageOf(r);
              const cv = cvOf(r);
              return (
                <button key={r._id} type="button" className="zcc-btn zcd-row" onClick={() => onSelect(r._id)} aria-current={sel ? 'true' : undefined}
                  style={{ background: sel ? t.accentSoft : 'transparent', borderLeft: `3px solid ${sel ? t.accent : 'transparent'}`, borderBottom: `1px solid ${t.line}`, color: t.text }}>
                  <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.accentSoft, color: t.accent, fontSize: 12, fontWeight: 700 }}>{initialsOf(r.name, '?')}</span>
                  <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <b style={{ display: 'block', fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name || 'Candidate'}</b>
                    <span style={{ display: 'inline-block', marginTop: 3, fontSize: 11, padding: '2px 7px', borderRadius: 5, background: tone[tn][0], color: tone[tn][1] }}>{label}</span>
                  </span>
                  <span style={{ textAlign: 'right', flexShrink: 0 }}>
                    <b style={{ display: 'block', ...MONO, fontWeight: 500, fontSize: 14 }}>{cv == null ? '—' : cv}</b>
                    <span style={{ fontSize: 10.5, color: t.faint }}>CV</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Selected candidate */}
          <CandidateCard
            t={t}
            r={current}
            tone={tone}
            btn={btn}
            busy={busy}
            showPartner={showPartner}
            canInterview={canSendInterview(current) && (!current.jobId?.managerId || !viewerId() || String(current.jobId.managerId) === String(viewerId()))}
            note={note}
            setNote={setNote}
            noteSaving={noteSaving}
            onSaveNote={saveNote}
            onStatus={setStatus}
            onInterview={sendInterview}
            onFull={() => setFull(true)}
            onScorecard={() => onScorecard(current._id)}
          />
        </div>
      )}
    </>
  );
};

const CandidateCard = ({ t, r, tone, btn, busy, showPartner, canInterview, note, setNote, noteSaving, onSaveNote, onStatus, onInterview, onFull, onScorecard }) => {
  const [label, tn] = stageOf(r);
  const test = codingTestOf(r);
  const coding = codingTestScore(r);
  const passed = test?.evaluation?.pass;
  const done = interviewDone(r);
  const decided = DECIDED.includes(r.status);
  const revealed = AT_CLIENT.includes(r.status);
  const exp = String(r.experience || '').trim();
  const meta = [r.title, exp ? (/^\d+(\.\d+)?$/.test(exp) ? `${exp} years` : exp) : null, r.location].filter(Boolean).join(' · ');
  const phone = r.phone ? (revealed ? `${r.countryCode ? `+${r.countryCode} ` : ''}${r.phone}` : '•••• •••••• (revealed on shortlist)') : null;
  const applied = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
  const partner = partnerOf(r);
  const codingLine = coding != null
    ? `${coding}/100 · ${passed === true ? 'passed' : passed === false ? 'below pass mark' : 'scored'}`
    : codingTestDone(r) ? 'Submitted · score pending' : test ? 'Sent · not taken yet' : 'Not sent';

  return (
    <article key={r._id} className="zcc-in" style={{ flex: '2 1 420px', minWidth: 0, background: t.panel, border: `1px solid ${t.line}`, borderRadius: 18, overflow: 'hidden' }}>
      <header style={{ background: t.dark ? '#050810' : t.text, color: '#FFFFFF', padding: '20px 22px', display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
        <span style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.12)', fontSize: 20, fontWeight: 700 }}>{initialsOf(r.name, '?')}</span>
        <div style={{ minWidth: 0, flex: '1 1 200px' }}>
          <b style={{ display: 'block', fontSize: 20 }}>{r.name || 'Candidate'}</b>
          {meta && <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{meta}</span>}
          {(r.email || phone) && <div style={{ ...MONO, fontSize: 11.5, color: 'rgba(255,255,255,0.65)', marginTop: 6, wordBreak: 'break-word' }}>{[r.email, phone].filter(Boolean).join(' · ')}</div>}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, padding: '5px 10px', borderRadius: 6, background: tone[tn][0], color: tone[tn][1] === t.muted ? '#FFFFFF' : tone[tn][1] }}>{label}</span>
      </header>

      <div className="zsc-rings" style={{ borderBottom: `1px solid ${t.line}` }}>
        <div style={{ borderRight: `1px solid ${t.line}` }}><Ring t={t} label="CV STRENGTH" value={cvOf(r)} color={t.warn} /></div>
        <div style={{ borderRight: `1px solid ${t.line}` }}><Ring t={t} label="CODING" value={coding} color={t.ok} /></div>
        <div><Ring t={t} label="INTERVIEW" value={interviewPercent(r)} color={t.accent} /></div>
      </div>

      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Facts */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8 }}>
          {[
            ['Applied', applied || '—'],
            ['Coding test', codingLine],
            ['AI interview', done ? 'Done' : label.startsWith('Interview') ? label.replace('Interview ', '') : 'Not sent'],
            ...(showPartner ? [['Submitted by', partner || 'You']] : []),
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '10px 12px', borderRadius: 10, background: t.panel2 }}>
              <span style={{ display: 'block', fontSize: 11.5, color: t.faint }}>{k}</span>
              <b style={{ fontSize: 13.5, fontWeight: 600 }}>{v}</b>
            </div>
          ))}
        </div>

        {r.keyStrength?.length > 0 && (
          <div style={{ padding: 12, borderRadius: 12, background: t.okSoft }}>
            <b style={{ ...MONO, fontSize: 10.5, letterSpacing: '0.14em', color: t.ok }}>STRENGTHS</b>
            <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.5 }}>{r.keyStrength.slice(0, 3).join(' · ')}</p>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {canInterview && (
            <button type="button" className="zcc-btn" onClick={onInterview} disabled={!!busy} style={{ ...btn, border: 0, background: t.accent, color: t.onAccent, fontWeight: 600, opacity: busy === 'interview' ? 0.6 : 1 }}>
              {busy === 'interview' ? 'Sending…' : interviewStage(r) === 'interviewExpired' ? '↻ Send interview again' : '➤ Send AI interview'}
            </button>
          )}
          {done && <button type="button" className="zcc-btn" onClick={onScorecard} style={{ ...btn, border: `1px solid ${t.accent}`, color: t.accent, fontWeight: 600 }}>Open scorecard →</button>}
          {!decided && (
            <>
              <button type="button" className="zcc-btn" onClick={() => onStatus('shortlisted')} disabled={!!busy} style={{ ...btn, color: t.ok, fontWeight: 600, opacity: busy === 'shortlisted' ? 0.6 : 1 }}>☆ Shortlist</button>
              <button type="button" className="zcc-btn" onClick={() => onStatus('rejected')} disabled={!!busy} style={{ ...btn, color: t.muted, opacity: busy === 'rejected' ? 0.6 : 1 }}>Not a fit</button>
            </>
          )}
          <button type="button" className="zcc-btn" onClick={onFull} style={{ ...btn, marginLeft: 'auto' }}>Full report</button>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor={`note-${r._id}`} style={{ ...MONO, fontSize: 10.5, letterSpacing: '0.14em', color: t.faint }}>YOUR NOTES</label>
          <textarea id={`note-${r._id}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Only your team sees these."
            style={{ display: 'block', width: '100%', minHeight: 84, marginTop: 6, padding: 12, borderRadius: 10, border: `1px solid ${t.line}`, background: t.panel2, color: t.text, font: 'inherit', fontSize: 13.5, resize: 'vertical' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="zcc-btn" onClick={onSaveNote} disabled={noteSaving || note === (r.addedNotes || '')}
              style={{ ...btn, height: 34, fontSize: 13, opacity: noteSaving || note === (r.addedNotes || '') ? 0.5 : 1 }}>
              {noteSaving ? 'Saving…' : 'Save note'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default JobCandidates;
