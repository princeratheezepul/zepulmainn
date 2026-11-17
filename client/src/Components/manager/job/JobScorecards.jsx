import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { codingTestOf, hasScorecard, initialsOf } from '../../dashboard/dashboardUtils';
import { interviewDone } from '../dashboard/zeusModel';
import { AT_CLIENT, scoresOf, overallOf, firstName } from './candidateScores';
import { generateScorecardPDF } from '../../../utils/pdfGenerator';
import ResumeDetailsView from '../dashboard/ResumeDetailsView';

const MONO = { fontFamily: 'var(--zcc-mono)' };
const RING = 2 * Math.PI * 40; // r = 40
const authToken = () => JSON.parse(localStorage.getItem('userInfo') || 'null')?.data?.accessToken;
const ease = (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
const verdictOf = (score, t) => {
  if (score == null) return { label: 'Awaiting interview', bg: 'rgba(255,255,255,0.14)', fg: '#FFFFFF' };
  if (score >= 85) return { label: 'Recommended · advance', bg: 'rgba(61,220,151,0.18)', fg: '#6BF0B5' };
  if (score >= 70) return { label: 'Good candidate', bg: 'rgba(79,134,255,0.22)', fg: '#A9C4FF' };
  if (score >= 50) return { label: 'Consider with caution', bg: 'rgba(245,184,61,0.2)', fg: '#FFD27A' };
  return { label: 'Not recommended', bg: 'rgba(255,122,122,0.2)', fg: '#FF9C9C' };
};
const sentence = (items) => (items || []).map((s) => String(s).trim()).filter(Boolean).map((s) => (/[.!?]$/.test(s) ? s : `${s}.`)).join(' ');

/** Coding-test webcam snapshots (presigned), first and last shown. */
export const useSnapshots = (r) => {
  const test = codingTestOf(r);
  const id = test?.assessmentId;
  const [state, setState] = useState({ loading: false, shots: [], consent: null });
  useEffect(() => {
    if (!id) { setState({ loading: false, shots: [], consent: null }); return undefined; }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/assessment/${id}/screenshots`, { headers: { Authorization: `Bearer ${authToken()}` }, credentials: 'include' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
      .then((d) => !cancelled && setState({ loading: false, shots: Array.isArray(d.screenshots) ? d.screenshots : [], consent: d.consent || null }))
      .catch(() => !cancelled && setState({ loading: false, shots: [], consent: null }));
    return () => { cancelled = true; };
  }, [id]);
  return state;
};

/**
 * Scorecards for one job: every candidate with an interview result, ranked,
 * and the selected candidate's scorecard: coding, CV strength and interview
 * scores, strengths and what to probe, the interview summary and proctoring.
 */
const JobScorecards = ({ t, jobId, title, selectedId, onSelect, onBack, onCandidates }) => {
  const [resumes, setResumes] = useState(null);
  const [busy, setBusy] = useState('');
  const [full, setFull] = useState(false);
  // The full report opens at its top, not at the scroll position of the card.
  useEffect(() => { if (full) window.scrollTo({ top: 0 }); }, [full]);
  const [p, setP] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/job/${jobId}`, { headers: { Authorization: `Bearer ${authToken()}` } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.status))))
      .then((d) => !cancelled && setResumes(Array.isArray(d) ? d : d?.resumes || []))
      .catch(() => !cancelled && setResumes([]));
    return () => { cancelled = true; };
  }, [jobId]);

  // Every candidate on the job, so any one can be opened from anywhere. Those
  // with an interview result come first, then each group by overall score.
  const ranked = useMemo(() => (resumes || [])
    .map((r) => ({ r, overall: overallOf(r), scored: interviewDone(r) || hasScorecard(r) }))
    .sort((a, b) => (b.scored - a.scored) || ((b.overall ?? -1) - (a.overall ?? -1))), [resumes]);

  const current = ranked.find((x) => String(x.r._id) === String(selectedId))?.r || ranked[0]?.r || null;
  const shots = useSnapshots(current);

  // Rings count up each time a scorecard opens.
  useEffect(() => {
    if (!current) return undefined;
    setP(0);
    let raf;
    const t0 = performance.now();
    const tick = (now) => {
      const next = Math.min(1, (now - t0) / 1600);
      setP(next);
      if (next < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [current?._id]);

  const setStatus = async (status) => {
    if (!current) return;
    setBusy(status);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/resumes/${current._id}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${authToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(status === 'shortlisted' ? { status, shortlistedTime: new Date().toISOString() } : { status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not update the candidate');
      setResumes((list) => list.map((r) => (r._id === current._id ? { ...r, status } : r)));
      toast.success(status === 'shortlisted' ? `${firstName(current.name)} shortlisted` : 'Marked as not a fit');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  };

  const downloadPdf = async () => {
    if (!current) return;
    setBusy('pdf');
    try { await generateScorecardPDF(current, current.addedNotes || ''); } catch (err) { toast.error('Could not create the PDF'); console.error(err); } finally { setBusy(''); }
  };

  const share = async () => {
    if (!current) return;
    const url = new URL(window.location.href);
    url.searchParams.set('c', current._id);
    const link = url.toString();
    try {
      if (navigator.share) await navigator.share({ title: `${current.name} · ${title} scorecard`, url: link });
      else { await navigator.clipboard.writeText(link); toast.success('Link copied'); }
    } catch { /* share sheet dismissed */ }
  };

  const btn = { height: 40, padding: '0 14px', borderRadius: 10, border: `1px solid ${t.line}`, background: t.panel, color: t.text, fontSize: 14 };

  if (full && current) {
    return (
      <div style={{ borderRadius: 16, overflow: 'hidden' }}>
        <ResumeDetailsView resumeData={current} onBack={() => setFull(false)} />
      </div>
    );
  }

  const header = (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <button type="button" className="zcc-btn" onClick={onBack} style={{ background: 'transparent', padding: 0, fontSize: 13.5, color: t.muted }}>← {title}</button>
        <h1 className="zcc-title" style={{ margin: '6px 0 0', fontSize: 28, letterSpacing: '-0.02em', lineHeight: 1.15, fontWeight: 700, color: t.text }}>Scorecards</h1>
      </div>
      {current && (
        <span className="zjp-actions" style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button type="button" className="zcc-btn" onClick={downloadPdf} disabled={busy === 'pdf'} style={{ ...btn, opacity: busy === 'pdf' ? 0.6 : 1 }}>{busy === 'pdf' ? 'Preparing…' : '↓ Download PDF'}</button>
          <button type="button" className="zcc-btn" onClick={share} style={btn}>Share</button>
          {AT_CLIENT.includes(current.status) ? (
            <span style={{ ...btn, display: 'inline-flex', alignItems: 'center', background: t.okSoft, color: t.ok, border: `1px solid ${t.ok}55`, fontWeight: 600 }}>✓ Shortlisted</span>
          ) : current.status === 'rejected' ? (
            <span style={{ ...btn, display: 'inline-flex', alignItems: 'center', color: t.muted }}>Not a fit</span>
          ) : (
            <>
              <button type="button" className="zcc-btn" onClick={() => setStatus('rejected')} disabled={!!busy} style={{ ...btn, color: t.muted }}>Not a fit</button>
              <button type="button" className="zcc-btn" onClick={() => setStatus('shortlisted')} disabled={!!busy} style={{ ...btn, border: 0, background: t.accent, color: t.onAccent, fontWeight: 600, opacity: busy === 'shortlisted' ? 0.6 : 1 }}>
                {busy === 'shortlisted' ? 'Shortlisting…' : `☆ Shortlist ${firstName(current.name)}`}
              </button>
            </>
          )}
        </span>
      )}
    </div>
  );

  if (resumes == null) {
    return (
      <>
        {header}
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="zcc-skel" style={{ flex: '1 1 200px', maxWidth: 240, height: 260, borderRadius: 12, background: t.track }} />
          <div className="zcc-skel" style={{ flex: '4 1 520px', height: 520, borderRadius: 18, background: t.track }} />
        </div>
      </>
    );
  }

  if (!current) {
    return (
      <>
        {header}
        <div style={{ padding: 20, borderRadius: 16, background: t.panel, border: `1px solid ${t.line}`, fontSize: 14.5, color: t.muted }}>
          No candidates on this job yet.{' '}
          <button type="button" className="zcc-btn" onClick={onCandidates} style={{ background: 'transparent', padding: 0, color: t.accent, fontWeight: 600 }}>See all candidates →</button>
        </div>
      </>
    );
  }

  const s = scoresOf(current);
  const overall = overallOf(current);
  // No verdict on the CV alone: it waits for the interview.
  const verdict = verdictOf(s.interview == null ? null : overall, t);
  const test = codingTestOf(current);
  const evalc = test?.evaluation || {};
  const answered = (test?.submissions || []).length;
  const asked = (test?.questions || []).length;
  const language = test?.submissions?.find((x) => x.language)?.language;
  const proctored = shots.shots.length > 0 || test?.proctoring?.consent === 'granted';
  const summary = current.interviewEvaluation?.aiInterviewSummary?.length
    ? current.interviewEvaluation.aiInterviewSummary
    : (current.interviewEvaluation?.evaluationResults || []).map((x) => x.summary).filter(Boolean).slice(0, 4);
  const role = current.title || current.applicationDetails?.position;
  // `experience` is free text ("7", "7 years", "5+ yrs").
  const exp = String(current.experience || '').trim();
  const years = exp ? (/^\d+(\.\d+)?$/.test(exp) ? `${exp} years` : exp) : null;
  const meta = [role, years, current.location].filter(Boolean).join(' · ');
  const revealed = AT_CLIENT.includes(current.status);
  const phone = current.phone ? (revealed ? `${current.countryCode ? `+${current.countryCode} ` : ''}${current.phone}` : '•••• •••••• (revealed on shortlist)') : null;
  const rings = [
    { label: 'CODING', v: s.coding, c: t.ok },
    { label: 'CV STRENGTH', v: s.cv, c: t.warn },
    { label: 'INTERVIEW', v: s.interview, c: t.accent },
  ].map((g, i) => {
    const k = ease(p * 1.3 - i * 0.12);
    return { ...g, shown: g.v == null ? '—' : Math.round(g.v * k), dash: (RING * (1 - ((g.v || 0) / 100) * k)).toFixed(1) };
  });
  const firstShot = shots.shots[0];
  const lastShot = shots.shots.length > 1 ? shots.shots[shots.shots.length - 1] : null;
  const shotTime = (x) => (x?.capturedAt ? new Date(x.capturedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : '');

  return (
    <>
      {header}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <nav aria-label="Scorecards" className="zsc-list">
          {ranked.map(({ r, overall: o }) => {
            const sel = r._id === current._id;
            return (
              <button
                key={r._id}
                type="button"
                className="zcc-btn"
                onClick={() => onSelect(r._id)}
                aria-current={sel ? 'true' : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, borderRadius: 12, textAlign: 'left', background: sel ? t.accentSoft : t.panel, border: `1px solid ${sel ? t.accent : t.line}`, color: t.text }}
              >
                <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.accentSoft, color: t.accent, fontSize: 12, fontWeight: 700 }}>{initialsOf(r.name, '?')}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name || 'Candidate'}</span>
                {AT_CLIENT.includes(r.status) && <span title="Shortlisted" style={{ color: t.ok, fontSize: 12 }}>★</span>}
                <b style={{ ...MONO, fontWeight: 500, fontSize: 13 }}>{o == null ? '—' : `${o}%`}</b>
              </button>
            );
          })}
        </nav>

        <article style={{ flex: '4 1 520px', minWidth: 0, background: t.panel, border: `1px solid ${t.line}`, borderRadius: 18, overflow: 'hidden' }}>
          <header style={{ background: t.dark ? '#050810' : t.text, color: '#FFFFFF', padding: '22px 24px', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
            <span style={{ width: 64, height: 64, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.12)', fontSize: 22, fontWeight: 700 }}>{initialsOf(current.name, '?')}</span>
            <div style={{ minWidth: 0 }}>
              <b style={{ display: 'block', fontSize: 22 }}>{current.name || 'Candidate'}</b>
              {meta && <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.75)' }}>{meta}</span>}
              {(current.email || phone) && (
                <div style={{ ...MONO, fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 6, wordBreak: 'break-word' }}>
                  {[current.email, phone].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
            <span style={{ marginLeft: 'auto', fontSize: 12.5, fontWeight: 600, padding: '5px 10px', borderRadius: 6, background: verdict.bg, color: verdict.fg }}>{verdict.label}</span>
          </header>

          <div className="zsc-rings" style={{ borderBottom: `1px solid ${t.line}` }}>
            {rings.map((g) => (
              <div key={g.label} style={{ textAlign: 'center', padding: '20px 8px', borderRight: `1px solid ${t.line}` }}>
                <span style={{ ...MONO, fontSize: 10.5, letterSpacing: '0.16em', color: t.faint }}>{g.label}</span>
                <div style={{ position: 'relative', width: 96, height: 96, margin: '10px auto 0' }}>
                  <svg width="96" height="96" viewBox="0 0 96 96" role="img" aria-label={`${g.label} ${g.v ?? 'not taken'}`}>
                    <circle cx="48" cy="48" r="40" fill="none" stroke={t.track} strokeWidth="8" />
                    {g.v != null && <circle cx="48" cy="48" r="40" fill="none" stroke={g.c} strokeWidth="8" strokeLinecap="round" strokeDasharray={RING.toFixed(1)} strokeDashoffset={g.dash} transform="rotate(-90 48 48)" />}
                  </svg>
                  <b style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: g.v == null ? t.faint : g.c }}>{g.shown}</b>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(current.keyStrength?.length > 0 || current.potentialConcern?.length > 0) && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                {current.keyStrength?.length > 0 && (
                  <div className="zcc-in" style={{ padding: 14, borderRadius: 12, background: t.okSoft }}>
                    <b style={{ ...MONO, fontSize: 10.5, letterSpacing: '0.14em', color: t.ok }}>STRENGTHS</b>
                    <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.5 }}>{sentence(current.keyStrength)}</p>
                  </div>
                )}
                {current.potentialConcern?.length > 0 && (
                  <div className="zcc-in" style={{ padding: 14, borderRadius: 12, background: t.warnSoft, animationDelay: '.1s' }}>
                    <b style={{ ...MONO, fontSize: 10.5, letterSpacing: '0.14em', color: t.warn }}>PROBE IN FINAL ROUND</b>
                    <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.5 }}>{sentence(current.potentialConcern)}</p>
                  </div>
                )}
              </div>
            )}

            {test && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 14, borderRadius: 12, background: t.panel2 }}>
                <b style={{ fontSize: 30, color: evalc.pass ? t.ok : s.coding != null ? t.warn : t.faint, flexShrink: 0 }}>
                  {asked ? `${answered}/${asked}` : s.coding != null ? s.coding : '—'}
                </b>
                <span style={{ fontSize: 13.5, color: t.muted }}>
                  <b style={{ color: t.text }}>Coding:</b>{' '}
                  {s.coding == null
                    ? 'test not evaluated yet.'
                    : `${evalc.pass ? 'passed' : 'did not pass'}${asked ? `, ${answered} of ${asked} answered` : ''}${language ? ` in ${language === 'javascript' ? 'JavaScript' : language.toUpperCase() === 'SQL' ? 'SQL' : language}` : ''}, ${s.coding}/100${proctored ? ', proctored' : ''}.`}
                  {evalc.feedback && <span style={{ display: 'block', marginTop: 4 }}>{evalc.feedback}</span>}
                </span>
              </div>
            )}

            {summary.length > 0 && (
              <div>
                <b style={{ ...MONO, fontSize: 10.5, letterSpacing: '0.14em', color: t.faint }}>INTERVIEW SUMMARY</b>
                <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6, color: t.muted }}>
                  {summary.map((x, i) => <li key={i}>{x}</li>)}
                </ul>
              </div>
            )}

            {firstShot && (
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, padding: 14, borderRadius: 12, border: `1px solid ${t.line}` }}>
                <figure style={{ margin: 0, textAlign: 'center' }}>
                  <a href={firstShot.url} target="_blank" rel="noreferrer"><img src={firstShot.url} alt="Coding test snapshot, start" style={{ width: 120, height: 78, objectFit: 'cover', borderRadius: 8, display: 'block' }} /></a>
                  <figcaption style={{ ...MONO, fontSize: 10, color: t.faint, marginTop: 4 }}>CODING TEST · {shotTime(firstShot)}</figcaption>
                </figure>
                <div style={{ flex: 1, minWidth: 120, textAlign: 'center', ...MONO, fontSize: 11.5, color: t.ok }}>
                  <div style={{ height: 1, background: t.ok, opacity: 0.5, marginBottom: 8 }} />
                  PROCTORED · {shots.shots.length} SNAPSHOT{shots.shots.length === 1 ? '' : 'S'}
                </div>
                {lastShot && (
                  <figure style={{ margin: 0, textAlign: 'center' }}>
                    <a href={lastShot.url} target="_blank" rel="noreferrer"><img src={lastShot.url} alt="Coding test snapshot, end" style={{ width: 120, height: 78, objectFit: 'cover', borderRadius: 8, display: 'block' }} /></a>
                    <figcaption style={{ ...MONO, fontSize: 10, color: t.faint, marginTop: 4 }}>CODING TEST · {shotTime(lastShot)}</figcaption>
                  </figure>
                )}
              </div>
            )}

            <button type="button" className="zcc-btn" onClick={() => setFull(true)} style={{ alignSelf: 'flex-start', background: 'transparent', padding: 0, fontSize: 13.5, color: t.accent, fontWeight: 600 }}>
              Full report · notes, CV breakdown, transcript →
            </button>
          </div>
        </article>
      </div>
    </>
  );
};

export default JobScorecards;
