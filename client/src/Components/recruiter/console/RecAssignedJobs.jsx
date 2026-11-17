import React, { useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { isJobOpen } from '../../dashboard/dashboardUtils';
import {
  idOf, plural, jobMeta, jobBar, jobSalary, jobCodingTest, jobManagerName, groupByJob, summarizeJob,
} from './recruiterModel';
import { ACCEPTED, uploadResume } from './uploadResume';

const MONO = { fontFamily: 'var(--rc-mono)' };
const STEP = { queued: 'Waiting…', reading: 'Reading the CV…', scoring: 'Zeus is scoring…', saving: 'Saving…' };
const CONCURRENCY = 2;

const RecAssignedJobs = ({ t, platform, selectedId, onSelectJob, onGo }) => {
  const navigate = useNavigate();
  const { jobs, resumes, loading, refresh } = platform;
  const [rows, setRows] = useState([]); // upload results for the current job
  const [busy, setBusy] = useState(false);

  const ordered = useMemo(() => [...jobs.filter(isJobOpen), ...jobs.filter((j) => !isJobOpen(j))], [jobs]);
  const byJob = useMemo(() => groupByJob(resumes), [resumes]);
  const job = ordered.find((j) => idOf(j._id) === selectedId) || ordered[0];

  const pick = (j) => {
    if (busy) return;
    setRows([]);
    onSelectJob(j._id);
  };

  const patch = (i, data) => setRows((prev) => prev.map((r, k) => (k === i ? { ...r, ...data } : r)));

  const onDrop = async (files) => {
    if (!job || !files.length || busy) return;
    const start = rows.length;
    const target = job;
    setRows((prev) => [...prev, ...files.map((f) => ({ file: f.name, name: f.name, step: 'queued' }))]);
    setBusy(true);
    let next = 0;
    const worker = async () => {
      while (next < files.length) {
        const i = next++;
        try {
          const res = await uploadResume(files[i], target, (step) => patch(start + i, { step }));
          patch(start + i, { step: 'done', ...res });
        } catch (err) {
          patch(start + i, { step: 'error', error: err.message || 'Upload failed' });
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, files.length) }, worker));
    setBusy(false);
    refresh();
  };

  const closed = job ? !isJobOpen(job) : true;
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    multiple: true,
    noClick: true,
    disabled: !job || closed || busy,
  });

  const panel = { borderRadius: 16, background: t.panel, border: `1px solid ${t.line}` };
  const finished = rows.filter((r) => r.step === 'done');
  const cleared = finished.filter((r) => !r.belowBar);
  const failed = rows.filter((r) => r.step === 'error');

  if (!loading && !jobs.length) {
    return (
      <main className="rc-main">
        <Header t={t} />
        <div style={{ ...panel, padding: 20, marginTop: 22, fontSize: 14, color: t.muted }}>
          No jobs are assigned to you yet. Your manager assigns the requirements you work on.
        </div>
      </main>
    );
  }

  const s = job ? summarizeJob(job, byJob.get(idOf(job._id)) || []) : null;
  const facts = job ? [
    ['CV BAR', jobBar(job) ?? 'Not set'],
    ['SALARY', jobSalary(job)],
    ['CODING TEST', jobCodingTest(job)],
    ['EXPERIENCE', job.experience ? `${job.experience}+ years` : '—'],
  ] : [];

  return (
    <main className="rc-main">
      <Header t={t} />
      <div className="rc-jobs">
        <div className="rc-joblist" role="listbox" aria-label="Assigned jobs">
          {loading && [0, 1, 2].map((i) => <div key={i} className="rc-skel" style={{ ...panel, height: 150 }} />)}
          {!loading && ordered.map((j) => {
            const on = job && idOf(j._id) === idOf(job._id);
            const js = summarizeJob(j, byJob.get(idOf(j._id)) || []);
            const now = !js.open ? ['Closed', t.faint]
              : js.pick ? ['Pick who gets an AI interview', t.accent]
              : js.stalled ? [`${plural(js.stalled, 'coding test')} not started`, t.muted]
              : !js.uploads ? ['No profiles yet', t.warn]
              : js.above < 3 ? ['Needs more profiles', t.warn]
              : [`${plural(js.uploads, 'profile')} uploaded`, t.muted];
            return (
              <button
                key={j._id}
                type="button"
                role="option"
                aria-selected={on}
                className="rc-btn"
                onClick={() => pick(j)}
                style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, borderRadius: 16, background: t.panel, border: `1px solid ${on ? t.accent : t.line}`, color: t.text, textAlign: 'left', boxShadow: on ? `0 0 0 3px ${t.accentSoft}` : 'none' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                  <span style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, background: t.accentSoft, color: t.accent }}>
                    {(j.jobtitle || '?').charAt(0).toUpperCase()}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: 15.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.jobtitle}</b>
                    <span style={{ display: 'block', fontSize: 12.5, color: t.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{jobMeta(j) || '—'}</span>
                  </span>
                </span>
                <span style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, width: '100%' }}>
                  {[['Uploaded', js.uploads], ['Above bar', js.above], ['Passed coding', js.passed]].map(([l, n]) => (
                    <span key={l} style={{ padding: 8, borderRadius: 8, background: t.panel2 }}>
                      <b style={{ display: 'block', ...MONO, fontWeight: 500, fontSize: 16 }}>{n}</b>
                      <span style={{ fontSize: 11, color: t.faint }}>{l}</span>
                    </span>
                  ))}
                </span>
                <span style={{ fontSize: 12.5, color: now[1] }}>{now[0]}</span>
              </button>
            );
          })}
        </div>

        {job && (
          <section key={job._id} className="rc-in" style={{ ...panel, padding: '20px 22px', minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <b style={{ fontSize: 22, letterSpacing: '-0.02em' }}>{job.jobtitle}</b>
                <div style={{ fontSize: 13.5, color: t.muted, marginTop: 4 }}>
                  {[jobMeta(job), jobManagerName(job) && `opened by ${jobManagerName(job)}`, job.createdAt && `on ${new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`].filter(Boolean).join(' · ')}
                </div>
              </div>
              <span style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="rc-btn" onClick={() => navigate(`/recruiter/jobs/${job._id}`)} style={{ height: 38, padding: '0 14px', borderRadius: 10, border: `1px solid ${t.line}`, background: 'transparent', color: t.muted, fontSize: 13.5 }}>
                  Full details
                </button>
                <button type="button" className="rc-btn" onClick={() => onGo('pipeline', job._id)} style={{ height: 38, padding: '0 14px', borderRadius: 10, border: `1px solid ${t.line}`, background: 'transparent', color: t.text, fontSize: 13.5, fontWeight: 600 }}>
                  See pipeline →
                </button>
              </span>
            </div>

            <div className="rc-facts">
              {facts.map(([k, val]) => (
                <div key={k} style={{ padding: '10px 12px', borderRadius: 10, background: t.panel2 }}>
                  <span style={{ ...MONO, fontSize: 10, letterSpacing: '0.1em', color: t.faint }}>{k}</span>
                  <div style={{ marginTop: 4, fontSize: 13.5 }}>{val}</div>
                </div>
              ))}
            </div>
            {!!job.skills?.length && (
              <div style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.55, color: t.muted }}>
                <b style={{ color: t.text }}>Must-haves:</b> {job.skills.join(', ')}{job.experience ? `, ${job.experience}+ years` : ''}
              </div>
            )}

            <div
              {...getRootProps()}
              className="rc-drop"
              onClick={closed || busy ? undefined : open}
              style={{ marginTop: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 150, borderRadius: 14, border: `1.5px dashed ${isDragActive ? t.accent : t.role}`, background: isDragActive ? t.accentSoft : t.roleSoft, textAlign: 'center', padding: 18, opacity: closed ? 0.6 : 1 }}
            >
              <input {...getInputProps()} aria-label={`Upload CVs for ${job.jobtitle}`} />
              <b style={{ fontSize: 16 }}>{closed ? 'This job is closed' : isDragActive ? 'Drop to upload' : `Drop CVs for ${job.jobtitle}`}</b>
              <span style={{ fontSize: 13, color: t.muted }}>
                {closed ? 'Closed jobs no longer take profiles.' : 'PDF or DOCX, one or many at a time. Zeus scores each against the CV bar.'}
              </span>
              {!closed && (
                <button type="button" className="rc-btn" disabled={busy} onClick={(e) => { e.stopPropagation(); open(); }} style={{ marginTop: 6, height: 40, padding: '0 18px', borderRadius: 10, background: t.accent, color: t.onAccent, fontWeight: 700, fontSize: 14 }}>
                  {busy ? `Uploading ${finished.length + failed.length}/${rows.length}…` : rows.length ? 'Upload more' : 'Choose files'}
                </button>
              )}
            </div>

            {rows.length > 0 && (
              <div className="rc-in" style={{ marginTop: 14, borderRadius: 12, border: `1px solid ${t.line}`, overflow: 'hidden' }} aria-live="polite">
                {!busy && finished.length > 0 && (
                  <div style={{ padding: '10px 14px', background: t.okSoft, color: t.ok, fontSize: 13.5 }}>
                    ✓ {plural(finished.length, 'CV')} scored · {cleared.length} cleared the bar
                    {cleared.length ? ' and were asked to confirm the role; the coding test goes out once they accept' : ''}
                    {failed.length ? ` · ${failed.length} couldn't be read` : ''}
                  </div>
                )}
                {rows.map((r, i) => {
                  const done = r.step === 'done';
                  const ok = done && !r.belowBar;
                  const statusText = r.step === 'error' ? r.error : done ? (ok ? 'Asked to confirm · test follows' : 'Below the bar') : STEP[r.step];
                  const statusColor = r.step === 'error' ? t.danger : done ? (ok ? t.accent : t.faint) : t.muted;
                  return (
                    <div key={`${r.file}-${i}`} className="rc-uprow" style={{ borderTop: i || (!busy && finished.length) ? `1px solid ${t.line}` : 0 }}>
                      <span style={{ minWidth: 0 }}>
                        <b style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</b>
                        <span style={{ display: 'block', fontSize: 12, color: t.faint, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.detail || r.file}</span>
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, ...MONO, fontSize: 12.5 }}>
                        <span style={{ flex: 1, height: 5, borderRadius: 3, background: t.track, overflow: 'hidden', display: 'block' }}>
                          <i className={done ? '' : r.step === 'error' ? '' : 'rc-skel'} style={{ display: 'block', height: '100%', width: done ? `${Math.max(0, Math.min(100, r.score))}%` : r.step === 'error' ? '0%' : '35%', background: done ? (ok ? t.accent : t.faint) : t.muted }} />
                        </span>
                        {done ? r.score : '—'}
                      </span>
                      <span style={{ fontSize: 12.5, color: statusColor }}>{statusText}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {s && (
              <p style={{ marginTop: 14, fontSize: 12.5, color: t.faint }}>
                So far on this job: {plural(s.uploads, 'profile')} uploaded, {s.above} above the bar, {s.passed} passed coding.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
};

const Header = ({ t }) => (
  <div>
    <span style={{ ...MONO, fontSize: 11.5, letterSpacing: '0.14em', color: t.faint }}>ASSIGNED TO YOU</span>
    <h1 className="rc-title">Assigned jobs</h1>
    <p style={{ marginTop: 6, fontSize: 14.5, color: t.muted }}>
      Upload profiles to any job. Zeus scores each CV instantly; anyone above the bar is asked to confirm the role, then gets the coding test.
    </p>
  </div>
);

export default RecAssignedJobs;
