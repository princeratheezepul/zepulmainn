import React, { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useManagerPlatformData, isJobOpen, jobCompanyName } from '../dashboard/useManagerPlatformData';
import { initialsOf } from '../../dashboard/dashboardUtils';

const MONO = { fontFamily: 'var(--zcc-mono)' };
const AVATAR = ['#7C5CFF', '#E2463B', '#0EA5A4', '#D97706', '#2563EB', '#DB2777', '#059669'];
const WORK_MODE = { remote: 'Remote', onsite: 'On-site', hybrid: 'Hybrid' };
const idOf = (v) => String(v?._id || v || '');
const authToken = () => JSON.parse(localStorage.getItem('userInfo') || 'null')?.data?.accessToken;
const colorFor = (id) => AVATAR[[...String(id)].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR.length];
const nameOf = (r) => r?.fullname || r?.name || r?.email || 'Recruiter';

/**
 * Assign jobs to recruiters (the manager console's Team tab). Every open job with its recruiters, how many
 * profiles they've uploaded, and where it stands; assign one job inline or
 * several at once from the bar. Saves through PUT /api/manager/job/:jobId,
 * which also updates each recruiter's assigned jobs.
 */
const JobAssignRecruiters = ({ t, focusJobId = null, onBack = null, onOpenJob }) => {
  const platform = useManagerPlatformData();
  const { jobs, recruiters, resumes, loading } = platform;
  const [assigned, setAssigned] = useState({}); // jobId -> [recruiterId]
  const [selected, setSelected] = useState(() => new Set(focusJobId ? [String(focusJobId)] : []));
  const [bulk, setBulk] = useState('');
  const [saving, setSaving] = useState({}); // jobId -> true
  const [done, setDone] = useState('');
  const focusRef = useRef(null);

  // Seed from the loaded jobs; later edits live here.
  useEffect(() => {
    if (loading) return;
    setAssigned(Object.fromEntries(jobs.map((j) => [idOf(j._id), (j.assignedRecruiters || []).map(idOf).filter(Boolean)])));
  }, [loading, jobs]);

  useEffect(() => {
    if (!loading && focusRef.current) focusRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [loading]);

  const activeRecruiters = useMemo(() => recruiters.filter((r) => r.status !== 'inactive'), [recruiters]);
  const recruiterById = useMemo(() => new Map(recruiters.map((r) => [idOf(r._id), r])), [recruiters]);
  useEffect(() => { if (!bulk && activeRecruiters[0]) setBulk(idOf(activeRecruiters[0]._id)); }, [activeRecruiters, bulk]);

  // Open jobs, with the one we came from first; closed jobs aren't staffed.
  const rows = useMemo(() => {
    const uploads = new Map();
    resumes.forEach((r) => {
      if (!r.recruiterId) return;
      const k = idOf(r.jobId);
      uploads.set(k, (uploads.get(k) || 0) + 1);
    });
    return jobs
      .filter((j) => isJobOpen(j) || idOf(j._id) === String(focusJobId))
      .sort((a, b) => (idOf(b._id) === String(focusJobId)) - (idOf(a._id) === String(focusJobId)) || new Date(b.createdAt) - new Date(a.createdAt))
      .map((j) => ({ job: j, id: idOf(j._id), up: uploads.get(idOf(j._id)) || 0 }));
  }, [jobs, resumes, focusJobId]);

  const save = async (jobId, next) => {
    const prev = assigned[jobId] || [];
    setAssigned((a) => ({ ...a, [jobId]: next }));
    setSaving((s) => ({ ...s, [jobId]: true }));
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/job/${jobId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedRecruiters: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Could not update recruiters');
      return true;
    } catch (err) {
      setAssigned((a) => ({ ...a, [jobId]: prev }));
      toast.error(err.message);
      return false;
    } finally {
      setSaving((s) => ({ ...s, [jobId]: false }));
    }
  };

  const addTo = async (row, recruiterId) => {
    if (!recruiterId) return;
    const cur = assigned[row.id] || [];
    if (cur.includes(recruiterId)) return;
    const ok = await save(row.id, [...cur, recruiterId]);
    if (ok) setDone(`${row.job.jobtitle} assigned to ${nameOf(recruiterById.get(recruiterId))}.`);
  };
  const removeFrom = (row, recruiterId) => save(row.id, (assigned[row.id] || []).filter((x) => x !== recruiterId));

  const applyBulk = async () => {
    if (!selected.size || !bulk) return;
    const targets = rows.filter((r) => selected.has(r.id) && !(assigned[r.id] || []).includes(bulk));
    const results = await Promise.all(targets.map((r) => save(r.id, [...(assigned[r.id] || []), bulk])));
    const okCount = results.filter(Boolean).length + (selected.size - targets.length);
    setSelected(new Set());
    if (okCount) setDone(`${okCount} job${okCount === 1 ? '' : 's'} assigned to ${nameOf(recruiterById.get(bulk))}.`);
  };

  const toggle = (id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const selN = selected.size;
  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const flow = [
    ['1 · YOU', 'Create the job by talking, chatting, filling the form or uploading a JD.', t.warn],
    ['2 · YOU', 'Assign it to a recruiter here. They see it in their assigned jobs straight away.', t.warn],
    ['3 · RECRUITER', 'Uploads profiles. Zeus scores every CV instantly; candidates above your bar get the coding test once they confirm.', t.role],
    ['4 · ZEUS', 'Runs the AI interview when you send the link, and writes each scorecard minutes later.', t.ok],
  ];
  const selectStyle = { height: 36, padding: '0 10px', borderRadius: 9, border: `1px solid ${t.line}`, background: t.panel2, color: t.text, font: 'inherit', fontSize: 13.5 };

  return (
    <div className="zcc" style={{ color: t.text, background: `${t.glow}, ${t.bg}` }}>
      <main style={{ maxWidth: 1360, margin: '0 auto', padding: '26px 24px 0' }}>
        {onBack && <button type="button" className="zcc-btn" onClick={onBack} style={{ background: 'transparent', padding: 0, fontSize: 13, color: t.muted }}>← Back to job</button>}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 16, marginTop: onBack ? 8 : 0 }}>
          <div style={{ minWidth: 0 }}>
            <span style={{ ...MONO, fontSize: 11.5, letterSpacing: '0.14em', color: t.faint }}>TEAM · RECRUITERS</span>
            <h1 className="zcc-title" style={{ margin: '8px 0 0', fontSize: 34, letterSpacing: '-0.03em', lineHeight: 1.1, fontWeight: 700, color: t.text }}>Assign jobs to recruiters</h1>
            <p style={{ margin: '6px 0 0', fontSize: 14.5, color: t.muted }}>Each recruiter sees only their jobs, and uploads the profiles Zeus screens.</p>
          </div>
          <div className="zar-bulk" style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, padding: '8px 10px 8px 14px', borderRadius: 12, background: t.panel, border: `1px solid ${selN ? t.accent : t.line}` }}>
            <span style={{ fontSize: 13.5, color: t.muted }}>{selN} selected · assign to</span>
            <select aria-label="Recruiter for selected jobs" value={bulk} onChange={(e) => setBulk(e.target.value)} disabled={!activeRecruiters.length} style={selectStyle}>
              {!activeRecruiters.length && <option value="">No recruiters yet</option>}
              {activeRecruiters.map((r) => <option key={r._id} value={idOf(r._id)}>{nameOf(r)}</option>)}
            </select>
            <button type="button" className="zcc-btn" onClick={applyBulk} disabled={!selN || !bulk}
              style={{ height: 36, padding: '0 16px', borderRadius: 9, background: selN && bulk ? t.accent : t.accentSoft, color: selN && bulk ? t.onAccent : t.muted, fontWeight: 700, fontSize: 13.5, cursor: selN && bulk ? 'pointer' : 'default' }}>
              Assign
            </button>
          </div>
        </div>

        {done && (
          <div className="zcc-in" role="status" style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: t.okSoft, color: t.ok, fontSize: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ flex: 1 }}>✓ {done} They'll see it in their jobs straight away and can start uploading profiles.</span>
            <button type="button" className="zcc-btn" onClick={() => setDone('')} aria-label="Dismiss" style={{ background: 'transparent', color: t.ok, padding: 0, fontSize: 16, lineHeight: 1 }}>×</button>
          </div>
        )}

        {!loading && !recruiters.length && (
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: t.warnSoft, color: t.warn, fontSize: 14 }}>
            You haven't added any recruiters yet. Add them from the Recruiters section, then assign jobs here.
          </div>
        )}

        <section style={{ marginTop: 18, borderRadius: 16, background: t.panel, border: `1px solid ${t.line}`, overflow: 'hidden' }}>
          <div className="zar-row zar-head" style={{ ...MONO, fontSize: 10.5, letterSpacing: '0.1em', color: t.faint, padding: '12px 18px' }}>
            <input type="checkbox" aria-label="Select all jobs" checked={allSelected} onChange={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)))} style={{ width: 17, height: 17, accentColor: t.accent }} />
            <span>JOB</span><span>PROFILES</span><span>RECRUITER</span><span style={{ textAlign: 'right' }}>STATUS</span>
          </div>

          {loading && [0, 1, 2, 3].map((i) => (
            <div key={i} style={{ padding: '14px 18px', borderTop: `1px solid ${t.line}` }}><div className="zcc-skel" style={{ height: 34, borderRadius: 8, background: t.track }} /></div>
          ))}
          {!loading && !rows.length && <div style={{ padding: '16px 18px', borderTop: `1px solid ${t.line}`, fontSize: 14, color: t.muted }}>No open jobs to assign.</div>}

          {!loading && rows.map((row) => {
            const j = row.job;
            const ids = assigned[row.id] || [];
            const sel = selected.has(row.id);
            const focus = row.id === String(focusJobId);
            const open = isJobOpen(j);
            const status = !open ? ['CLOSED', t.track, t.faint]
              : !ids.length ? ['NEEDS A RECRUITER', t.warnSoft, t.warn]
                : row.up ? ['SCREENING', t.okSoft, t.ok] : ['WAITING FOR PROFILES', t.accentSoft, t.accent];
            const available = activeRecruiters.filter((r) => !ids.includes(idOf(r._id)));
            const meta = [jobCompanyName(j), j.location, WORK_MODE[j.type]].filter(Boolean).join(' · ');
            return (
              <div key={row.id} ref={focus ? focusRef : null} className="zar-row" style={{ padding: '14px 18px', borderTop: `1px solid ${t.line}`, background: sel ? t.accentSoft : 'transparent', boxShadow: focus ? `inset 3px 0 0 ${t.accent}` : 'none', opacity: saving[row.id] ? 0.7 : 1, transition: 'background .2s ease' }}>
                <input type="checkbox" aria-label={`Select ${j.jobtitle}`} checked={sel} onChange={() => toggle(row.id)} style={{ width: 17, height: 17, accentColor: t.accent }} />
                <button type="button" className="zcc-btn" onClick={() => onOpenJob(row.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, background: 'transparent', padding: 0, color: t.text, textAlign: 'left' }}>
                  <span style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, background: t.accentSoft, color: t.accent, flex: 'none' }}>{(j.jobtitle || '?').trim()[0]?.toUpperCase()}</span>
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.jobtitle || 'Untitled role'}{focus && <span style={{ marginLeft: 8, ...MONO, fontSize: 10, color: t.accent }}>THIS JOB</span>}</b>
                    <span style={{ display: 'block', fontSize: 12.5, color: t.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta || '—'}</span>
                  </span>
                </button>
                <span className="zar-profiles" style={{ fontSize: 13, color: t.muted }}>
                  <b style={{ display: 'block', ...MONO, fontWeight: 500, fontSize: 15, color: t.text }}>{row.up}</b>uploaded by recruiters
                </span>
                <div className="zar-recruiter" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
                  {ids.map((rid) => {
                    const r = recruiterById.get(rid);
                    return (
                      <span key={rid} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 34, padding: '0 6px 0 4px', borderRadius: 17, border: `1px solid ${t.line}`, background: t.panel2, fontSize: 13, maxWidth: '100%' }}>
                        <span style={{ width: 26, height: 26, borderRadius: '50%', background: colorFor(rid), color: '#FFFFFF', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>{initialsOf(nameOf(r), '?')}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r ? nameOf(r) : 'Former recruiter'}</span>
                        <button type="button" className="zcc-btn" onClick={() => removeFrom(row, rid)} disabled={saving[row.id]} aria-label={`Unassign ${nameOf(r)}`} style={{ background: 'transparent', color: t.faint, padding: '0 4px', fontSize: 15, lineHeight: 1 }}>×</button>
                      </span>
                    );
                  })}
                  {available.length > 0 && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, height: ids.length ? 34 : 40, flex: ids.length ? '0 0 auto' : '1 1 auto', padding: '0 10px', borderRadius: 10, border: `1px solid ${ids.length ? t.line : t.warn}`, background: t.panel2 }}>
                      {!ids.length && <span style={{ width: 26, height: 26, borderRadius: '50%', background: t.track, color: t.muted, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>?</span>}
                      <select aria-label={`Add a recruiter to ${j.jobtitle}`} value="" onChange={(e) => addTo(row, e.target.value)} disabled={saving[row.id]}
                        style={{ flex: 1, minWidth: 0, height: 32, border: 0, background: 'transparent', color: ids.length ? t.accent : t.text, font: 'inherit', fontSize: 13.5, cursor: 'pointer', padding: 0 }}>
                        <option value="">{ids.length ? '+ Add' : 'Choose a recruiter'}</option>
                        {available.map((r) => <option key={r._id} value={idOf(r._id)}>{nameOf(r)}</option>)}
                      </select>
                    </label>
                  )}
                </div>
                <span style={{ justifySelf: 'end', ...MONO, fontSize: 10.5, letterSpacing: '0.08em', padding: '5px 9px', borderRadius: 6, background: status[1], color: status[2], whiteSpace: 'nowrap' }}>{status[0]}</span>
              </div>
            );
          })}
        </section>

        <section style={{ marginTop: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {flow.map(([k, text, c]) => (
            <div key={k} style={{ padding: '14px 16px', borderRadius: 14, background: t.panel, border: `1px solid ${t.line}` }}>
              <span style={{ ...MONO, fontSize: 10.5, letterSpacing: '0.12em', color: c }}>{k}</span>
              <p style={{ margin: '6px 0 0', fontSize: 13.5, lineHeight: 1.5, color: t.muted }}>{text}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default JobAssignRecruiters;
