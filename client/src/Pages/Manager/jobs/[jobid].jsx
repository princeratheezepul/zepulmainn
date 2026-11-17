import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ZepDBBulkSubmit from '../../../Components/recruiter/dashboard/ZepDBBulkSubmit';
import EditJobFields from '../../../Components/manager/dashboard/EditJobFields';
import { jobToEditForm, editFormToPayload, validateEditForm } from '../../../utils/jobEditForm';
import toast from 'react-hot-toast';
import ManagerThemeShell from '../../../Components/manager/dashboard/ManagerThemeShell';
import { useControlCentreTheme, THEMES } from '../../../Components/manager/dashboard/controlCentreTheme';
import JobRail from '../../../Components/manager/job/JobRail';
import JobSourcing from '../../../Components/manager/job/JobSourcing';
import JobScorecards from '../../../Components/manager/job/JobScorecards';
import JobCandidates from '../../../Components/manager/job/JobCandidates';
import JobShortlist from '../../../Components/manager/job/JobShortlist';
import JobAssignRecruiters from '../../../Components/manager/job/JobAssignRecruiters';
import JobPipelineStage from '../../../Components/manager/job/JobPipelineStage';
import { jobSteps, currentStep, STEP_PATHS } from '../../../Components/manager/job/jobProgress';
import '../../../Components/manager/dashboard/ManagerOverview.css';
import '../../../Components/manager/job/JobPage.css';

const MONO = { fontFamily: 'var(--zcc-mono)' };
const AUTO_START_SECONDS = 45;
const WORK_MODE = { remote: 'Remote', onsite: 'On-site', hybrid: 'Hybrid' };
const CURRENCY = { INR: '₹', GBP: '£', USD: '$', EUR: '€' };
const BRIEF_VIA = { chat: 'by chat', voice: 'by voice', upload: 'from an uploaded JD', manual: 'by form' };

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
const authToken = () => JSON.parse(localStorage.getItem('userInfo') || 'null')?.data?.accessToken;
const listOf = (v) => (Array.isArray(v) ? v : v ? [v] : []).map((x) => String(x).trim()).filter(Boolean);

// The JD "paper" stays light on every theme, like a printed draft.
const paperFor = (t) => (t.dark ? { paper: t.bg === '#111417' ? '#F6F8F7' : '#F7F8FB', ink: t.bg === '#111417' ? '#111417' : '#0B1020' } : { paper: '#FFFFFF', ink: t.text });

const ManagerJobDetailPage = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [jobData, setJobData] = useState(null);
  const { jobid: jobId } = useParams();
  const [resumes, setResumes] = useState([]);
  // The candidate list lives at /manager/jobs/:jobid/candidates so it can be
  // linked to directly (e.g. from the applicants count on a job card).
  const showSavedResumes = /\/candidates\/?$/.test(location.pathname);
  // Sourcing & outreach lives at /…/jobs/:jobid/sourcing, beside the same rail.
  const showSourcing = /\/sourcing\/?$/.test(location.pathname);
  // Scorecards live at /…/jobs/:jobid/scorecards (?c=<resumeId> picks one).
  const showScorecards = /\/scorecards\/?$/.test(location.pathname);
  const showShortlist = /\/(shortlist|prep)\/?$/.test(location.pathname);
  const showPrep = /\/prep\/?$/.test(location.pathname);
  // Manager-driven steps: /outreach, /cv, /coding, /interview-links, /interviews.
  const pipelineStage = (location.pathname.match(/\/(outreach|cv|coding|interview-links|interviews)\/?$/) || [])[1] || null;
  const showAssign = /\/assign\/?$/.test(location.pathname);

  // This page is mounted under both consoles. Everything it links to is built
  // from whichever one the URL says we are in, rather than from navigation
  // state, which a refresh or an intermediate hop would drop.
  const consoleBase = ['/prorecruiter', '/employermanager'].find((base) =>
    location.pathname.startsWith(base)
  ) || '/manager';
  const backToJobs = `${consoleBase}/dashboard?tab=Jobs`;
  const backTarget = location.state?.from || backToJobs;
  const jobPath = `${consoleBase}/jobs/${jobId}`;
  const candidatesPath = `${jobPath}/candidates`;
  const sourcingPath = `${jobPath}/sourcing`;
  const scorecardsPath = `${jobPath}/scorecards`;
  const shortlistPath = `${jobPath}/shortlist`;
  const assignPath = `${jobPath}/assign`;

  // ProRecruiter keeps its light look; the manager consoles follow the chosen theme.
  const [, chosen] = useControlCentreTheme();
  const t = consoleBase === '/prorecruiter' ? THEMES.daylight : chosen;
  const { paper, ink } = paperFor(t);

  // null | 'confirm' | 'auto'. Arriving with state.startSourcing (from the
  // just-created banner) opens it straight away.
  const [sourcingMode, setSourcingMode] = useState(location.state?.startSourcing || null);
  const [editForm, setEditForm] = useState(null); // non-null while the edit drawer is open
  const [editSaving, setEditSaving] = useState(false);

  // Just created (the create flows navigate here with state.justCreated): Zeus
  // starts sourcing after a countdown unless the manager edits or cancels.
  const justCreated = location.state?.justCreated || null;
  const [countdown, setCountdown] = useState(justCreated ? AUTO_START_SECONDS : null);
  const [estimate, setEstimate] = useState(null);
  const autoFiredRef = useRef(false);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      if (!response.ok) throw new Error('Failed to fetch job data');
      const data = await response.json();
      setJobData(data.job);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchResumes = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/job/${jobId}`, {
        headers: { Authorization: `Bearer ${authToken()}` },
      });
      if (!response.ok) return;
      const data = await response.json();
      setResumes(Array.isArray(data) ? data : []);
    } catch {
      setResumes([]);
    }
  };

  useEffect(() => {
    if (jobId) {
      fetchJob();
      fetchResumes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  // The credit cost is shown on the banner before anything auto-starts.
  useEffect(() => {
    if (!justCreated) return;
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/manager/zepdb/sourcing/estimate`, {
      headers: { Authorization: `Bearer ${authToken()}` },
    })
      .then((r) => r.json())
      .then((d) => d?.success && setEstimate(d.data))
      .catch(() => {});
  }, [justCreated]);

  // Forget "just created" so a refresh or Back doesn't offer to source again.
  const clearJustCreated = () => {
    setCountdown(null);
    navigate(location.pathname, { replace: true, state: { from: location.state?.from } });
  };

  // Starting from the banner moves to Sourcing & outreach and runs the search
  // there. Replace, so Back/refresh can't trigger it again.
  const startSourcingHere = () => {
    autoFiredRef.current = true;
    setCountdown(null);
    setSourcingMode('auto');
    navigate(sourcingPath, { replace: true, state: { from: location.state?.from, startSourcing: 'auto' } });
  };
  useEffect(() => {
    const mode = location.state?.startSourcing;
    if (!mode) return;
    setSourcingMode((m) => m || mode);
    navigate(location.pathname, { replace: true, state: { from: location.state?.from } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state?.startSourcing]);

  const notEnoughCredits = estimate && estimate.enoughCredits === false;
  const paused = Boolean(editForm) || Boolean(sourcingMode) || notEnoughCredits || loading;

  useEffect(() => {
    if (countdown == null || paused) return undefined;
    if (countdown <= 0) {
      if (!autoFiredRef.current) startSourcingHere();
      return undefined;
    }
    const id = setTimeout(() => setCountdown((s) => (s == null ? s : s - 1)), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, paused]);

  const startNow = startSourcingHere;

  const openEdit = () => setEditForm(jobToEditForm(jobData));
  const closeEdit = () => setEditForm(null);

  const saveEdit = async (thenSource) => {
    const problems = validateEditForm(editForm);
    if (problems.length) { toast.error(problems[0]); return; }
    setEditSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/jobs/updatejob/${jobData._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${authToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormToPayload(editForm)),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update job');
      toast.success('Job updated');
      (data.warnings || []).forEach((w) => toast(w, { icon: '⚠️' }));
      setJobData(data.job);
      setEditForm(null);
      if (thenSource) {
        // Saving from the just-created banner counts as starting it.
        if (countdown != null) { autoFiredRef.current = true; clearJustCreated(); }
        setSourcingMode('confirm');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const step = useMemo(() => currentStep(resumes, jobData), [resumes, jobData]);
  const steps = useMemo(() => jobSteps(jobData), [jobData]);

  // Assign jobs to recruiters (same screen as the Team tab), this job first.
  if (showAssign) {
    return (
      <JobAssignRecruiters
        t={t}
        focusJobId={jobId}
        onBack={() => { fetchJob(); navigate(jobPath, { state: location.state?.backTo ? { from: location.state.backTo } : undefined }); }}
        onOpenJob={(id) => navigate(`${consoleBase}/jobs/${id}`)}
      />
    );
  }

  if (loading && !jobData) {
    return (
      <div className="zcc" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: `${t.glow}, ${t.bg}` }}>
        <div className="zcc-skel" style={{ width: 48, height: 48, borderRadius: '50%', background: t.track }} />
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="zcc" style={{ color: t.text, background: `${t.glow}, ${t.bg}` }}>
        <div className="zjp-wrap">
          <main className="zjp-main">
            <button type="button" className="zcc-btn" onClick={() => navigate(backTarget)} style={{ alignSelf: 'flex-start', background: 'transparent', color: t.muted, fontSize: 13.5, padding: 0 }}>← Back</button>
            <p style={{ fontSize: 15, color: t.muted }}>This job couldn't be loaded. It may have been removed, or you may not have access to it.</p>
          </main>
        </div>
      </div>
    );
  }

  const job = jobData;
  const title = cap(job.jobtitle) || 'Untitled role';
  const sym = CURRENCY[job.intake?.ctc?.currency] || '₹';
  const money = (n) => `${sym}${Number(n).toLocaleString(sym === '₹' ? 'en-IN' : 'en-GB')}`;
  const salary = job.salary?.min || job.salary?.max
    ? [job.salary?.min, job.salary?.max].filter((v) => v != null && v !== '').map(money).join('–')
    : null;
  const experience = job.experience != null && job.experience !== '' ? `${job.experience}+ years` : null;
  const chips = [
    job.company,
    [job.location, WORK_MODE[job.type]].filter(Boolean).join(' · ') || null,
    cap(job.employmentType) || null,
    experience,
    salary,
  ].filter(Boolean);

  const jd = [
    { h: 'ABOUT THE ROLE', para: String(job.description || '').split(/\n+/).map((s) => s.trim()).filter(Boolean) },
    { h: 'WHAT YOU’LL DO', items: listOf(job.keyResponsibilities) },
    { h: 'WHAT YOU’LL BRING', items: [...(experience ? [`${experience} of relevant experience.`] : []), ...listOf(job.skills)] },
    { h: 'NICE TO HAVE', items: [...listOf(job.preferredQualifications), ...listOf(job.intake?.niceToHaveSkills)] },
  ].filter((s) => (s.para || s.items).length);

  // What happens next: the four steps from the current one.
  const upcoming = steps.map((s, i) => ({ ...s, n: i + 1 })).slice(step - 1, step + 3);
  const nextHeading = upcoming[0]?.who === 'YOU' ? 'Next up' : 'Zeus will now';

  const created = job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null;
  const via = BRIEF_VIA[justCreated] || (/AI Job Assistant/i.test(job.internalNotes || '') ? 'by chat' : null);
  const sourced = resumes.length;
  const log = [
    { text: ['/ brief', created, via].filter(Boolean).join(' · '), c: t.faint },
    { text: `/ jd · ${jd.length ? 'drafted' : 'empty'} · ${jd.length} section${jd.length === 1 ? '' : 's'}`, c: t.muted },
    { text: `/ candidates · ${sourced} in pipeline`, c: t.muted },
    {
      text: sourcingMode ? '/ sourcing · running' : sourced ? `/ sourcing · ${sourced} found` : countdown != null ? '/ sourcing · queued' : '/ sourcing · not started',
      c: t.accent,
    },
  ];

  const goToStage = (key) => navigate(`${jobPath}/${key}`, { state: { from: jobPath } });
  const onStep = (n) => {
    if (n <= 1) return;
    if (n === 2) openEdit();
    else if (STEP_PATHS[n]) goToStage(STEP_PATHS[n]);
  };
  const herePath = location.pathname;

  const btnOutline = (accent) => ({
    height: 42, padding: '0 16px', borderRadius: 10, border: `1px solid ${accent ? t.accent : t.line}`, background: t.panel,
    color: accent ? t.accent : t.text, fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8,
  });
  const mm = Math.floor((countdown || 0) / 60);
  const ss = String((countdown || 0) % 60).padStart(2, '0');

  return (
    <div className="zcc" style={{ color: t.text, background: `${t.glow}, ${t.bg}` }}>
      <div className="zjp-wrap">
        <main className="zjp-main">
          {pipelineStage ? (
            <JobPipelineStage
              t={t}
              stage={pipelineStage}
              job={job}
              jobId={jobId}
              title={title}
              onBack={() => navigate(jobPath)}
              onOpenScorecard={(id) => navigate(`${scorecardsPath}?c=${id}`, { state: { from: herePath } })}
              onEditJob={openEdit}
              onChanged={fetchResumes}
              onGoTo={goToStage}
            />
          ) : showShortlist ? (
            <JobShortlist
              t={t}
              job={job}
              jobId={jobId}
              title={title}
              prepOnly={showPrep}
              onBack={() => navigate(jobPath)}
              onChanged={fetchResumes}
              onGoTo={goToStage}
              onOpenScorecard={(id) => navigate(`${scorecardsPath}?c=${id}`, { state: { from: herePath } })}
            />
          ) : showSavedResumes ? (
            <JobCandidates
              t={t}
              jobId={jobId}
              title={title}
              selectedId={new URLSearchParams(location.search).get('c')}
              onSelect={(id) => navigate(`${candidatesPath}?c=${id}`, { replace: true, state: location.state })}
              onBack={() => navigate(location.state?.from || jobPath)}
              onScorecard={(id) => navigate(id ? `${scorecardsPath}?c=${id}` : scorecardsPath, { state: { from: candidatesPath } })}
              onSource={() => setSourcingMode('confirm')}
            />
          ) : showScorecards ? (
            <JobScorecards
              t={t}
              jobId={jobId}
              title={title}
              selectedId={new URLSearchParams(location.search).get('c')}
              onSelect={(id) => navigate(`${scorecardsPath}?c=${id}`, { replace: true, state: location.state })}
              onBack={() => navigate(location.state?.from || jobPath)}
              onCandidates={() => navigate(candidatesPath, { state: { from: scorecardsPath } })}
            />
          ) : showSourcing ? (
            <JobSourcing
              t={t}
              job={job}
              title={title}
              resumes={resumes}
              sourcingNow={Boolean(sourcingMode)}
              onBack={() => navigate(jobPath, { state: { from: location.state?.from } })}
              onRunSearch={() => setSourcingMode('confirm')}
              onOpenCandidates={() => navigate(candidatesPath, { state: { from: sourcingPath } })}
              onOpenOutreach={() => goToStage('outreach')}
            />
          ) : (
          <>
          {/* Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <button type="button" className="zcc-btn" onClick={() => navigate(backTarget)} style={{ background: 'transparent', padding: 0, fontSize: 13.5, color: t.muted }}>
                ← {backTarget.includes('tab=Jobs') ? 'Jobs' : 'Back'}
              </button>
              <h1 className="zcc-title" style={{ margin: '6px 0 0', fontSize: 30, letterSpacing: '-0.02em', lineHeight: 1.15, fontWeight: 700, color: t.text }}>{title}</h1>
              {chips.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {chips.map((c) => (
                    <span key={c} style={{ height: 28, padding: '0 12px', borderRadius: 14, display: 'inline-flex', alignItems: 'center', background: t.panel, border: `1px solid ${t.line}`, fontSize: 13, color: t.muted }}>{c}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="zjp-actions" style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button type="button" className="zcc-btn" onClick={() => navigate(assignPath, { state: { backTo: location.state?.from } })} style={btnOutline(false)} title="Choose which recruiters work on this job">
                👤 {job.assignedRecruiters?.length ? `${job.assignedRecruiters.length} recruiter${job.assignedRecruiters.length === 1 ? '' : 's'}` : 'Assign recruiter'}
              </button>
              <button type="button" className="zcc-btn" onClick={openEdit} style={btnOutline(true)}>✎ Edit job</button>
              <button type="button" className="zcc-btn" onClick={() => setSourcingMode('confirm')} style={btnOutline(false)} title="Source matching candidates from ZepDB and add them to this job">
                ⟲ {sourced ? 'Re-run sourcing from ZepDB' : 'Run sourcing from ZepDB'}
              </button>
              <button type="button" className="zcc-btn" onClick={() => navigate(candidatesPath, { state: { from: `${consoleBase}/jobs/${jobId}` } })} style={{ ...btnOutline(false), background: t.accent, color: t.onAccent, border: `1px solid ${t.accent}` }}>
                {sourced} candidate{sourced === 1 ? '' : 's'} →
              </button>
            </div>
          </div>

          {/* Just created: auto-start sourcing */}
          {countdown != null && (
            <div className="zcc-in" role="status" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 14, background: t.accentSoft, border: `1px solid ${t.accent}` }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: t.accent, flexShrink: 0 }} />
              <span style={{ fontSize: 14.5, flex: '1 1 320px' }}>
                <b>{justCreated === 'chat' || justCreated === 'voice' ? 'Job created from your conversation.' : 'Job created.'}</b>{' '}
                <span style={{ color: t.muted }}>
                  {notEnoughCredits
                    ? `Not enough sourcing credits to start automatically (${estimate.creditsRemaining ?? 0} left).`
                    : `No changes? Zeus starts sourcing from ZepDB automatically${estimate?.maxCredits ? `, using up to ${estimate.maxCredits} credits` : ''}.`}
                </span>
              </span>
              {!notEnoughCredits && (
                <span style={{ ...MONO, fontSize: 13, color: t.accent }}>
                  {paused ? 'paused' : `auto-start in ${mm}:${ss}`}
                </span>
              )}
              <button type="button" className="zcc-btn" onClick={clearJustCreated} style={{ height: 36, padding: '0 12px', borderRadius: 9, background: 'transparent', color: t.muted, fontSize: 13.5 }}>
                Not now
              </button>
              {!notEnoughCredits && (
                <button type="button" className="zcc-btn" onClick={startNow} style={{ height: 36, padding: '0 14px', borderRadius: 9, background: t.accent, color: t.onAccent, fontWeight: 600, fontSize: 13.5 }}>
                  Start now
                </button>
              )}
            </div>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
            {/* Job description */}
            <article className="zjp-article zjp-jd" style={{ flex: '3 1 460px', minWidth: 0, background: paper, color: ink, borderRadius: 16, padding: '30px 34px', boxShadow: '0 30px 60px rgba(0,0,0,0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ ...MONO, fontSize: 11, letterSpacing: '0.14em', color: '#6B7280' }}>JOB DESCRIPTION · DRAFTED BY ZEUS</span>
                <button type="button" className="zcc-btn" onClick={openEdit} style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#1D5CFF', background: '#E8EEFF', padding: '4px 10px', borderRadius: 6 }}>
                  Editable draft
                </button>
              </div>
              <h2 style={{ margin: '14px 0 0', fontSize: 24, color: ink }}>{title}</h2>
              {!jd.length && (
                <p style={{ marginTop: 18, fontSize: 14.5, color: '#374151' }}>
                  No description yet. <button type="button" className="zcc-btn" onClick={openEdit} style={{ background: 'transparent', padding: 0, color: '#1D5CFF', fontWeight: 600 }}>Add one</button>
                </p>
              )}
              {jd.map((s, i) => (
                <div key={s.h} className="zcc-in" style={{ marginTop: 18, animationDelay: `${0.1 + i * 0.15}s` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#1D4ED8' }}>{s.h}</div>
                  {s.para
                    ? s.para.map((p, k) => <p key={k} style={{ fontSize: 14.5, lineHeight: 1.6, color: '#374151' }}>{p}</p>)
                    : (
                      <ul style={{ fontSize: 14.5, lineHeight: 1.6, color: '#374151' }}>
                        {s.items.map((it, k) => <li key={k}>{it}</li>)}
                      </ul>
                    )}
                </div>
              ))}
            </article>

            <section style={{ flex: '2 1 280px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: t.panel, border: `1px solid ${t.line}`, borderRadius: 16, padding: 18 }}>
                <b style={{ fontSize: 14 }}>{upcoming.length ? nextHeading : 'All steps done'}</b>
                {upcoming.length ? (
                  <ol style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
                    {upcoming.map((n) => (
                      <li key={n.n} style={{ display: 'flex', gap: 10 }}>
                        <span style={{ flex: 'none', width: 22, height: 22, borderRadius: 6, background: n.who === 'YOU' ? t.warnSoft : t.track, color: n.who === 'YOU' ? t.warn : t.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', ...MONO, fontSize: 11 }}>
                          {String(n.n).padStart(2, '0')}
                        </span>
                        <span><b>{n.next[0]}</b> <span style={{ color: t.muted }}>{n.next[1]}</span></span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p style={{ marginTop: 8, fontSize: 13.5, color: t.muted }}>The prep brief has gone out for this role.</p>
                )}
              </div>
              <div style={{ background: t.panel, border: `1px solid ${t.line}`, borderRadius: 16, padding: 18, ...MONO, fontSize: 12, lineHeight: 1.9 }}>
                {log.map((l) => <div key={l.text} style={{ color: l.c }}>{l.text}</div>)}
              </div>
            </section>
          </div>
          </>
          )}
        </main>

        <div className="zjp-rail">
          <JobRail t={t} title={title} steps={steps} current={step} onStep={onStep} />
        </div>
      </div>

      {/* Edit drawer */}
      {editForm && (
        <>
          <div onClick={closeEdit} style={{ position: 'fixed', inset: 0, background: 'rgba(5,8,16,0.45)', zIndex: 40 }} />
          <aside className="zjp-slide" role="dialog" aria-modal="true" aria-label="Edit job" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 560, maxWidth: '100%', background: t.panel, borderLeft: `1px solid ${t.line}`, zIndex: 41, display: 'flex', flexDirection: 'column', color: t.text }}>
            <div style={{ padding: '26px 26px 14px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <b style={{ fontSize: 20 }}>Edit job</b>
                <p style={{ margin: '4px 0 0', fontSize: 13.5, color: t.muted }}>Change anything. Zeus keeps the pipeline in sync.</p>
              </div>
              <button type="button" className="zcc-btn" onClick={closeEdit} aria-label="Close" style={{ marginLeft: 'auto', background: 'transparent', color: t.muted, fontSize: 22, lineHeight: 1 }}>×</button>
            </div>
            <form
              className="zjp-drawer-fields"
              onSubmit={(e) => { e.preventDefault(); saveEdit(false); }}
              style={{ flex: 1, overflowY: 'auto', padding: '0 26px 20px' }}
            >
              <EditJobFields form={editForm} setForm={setEditForm} />
            </form>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '16px 26px', borderTop: `1px solid ${t.line}` }}>
              <button type="button" className="zcc-btn" onClick={closeEdit} style={{ flex: '1 1 100px', height: 44, borderRadius: 10, border: `1px solid ${t.line}`, background: 'transparent', color: t.text, fontWeight: 600 }}>Cancel</button>
              <button type="button" className="zcc-btn" disabled={editSaving} onClick={() => saveEdit(false)} style={{ flex: '1 1 100px', height: 44, borderRadius: 10, border: `1px solid ${t.accent}`, background: 'transparent', color: t.accent, fontWeight: 600, opacity: editSaving ? 0.6 : 1 }}>Save</button>
              <button type="button" className="zcc-btn" disabled={editSaving} onClick={() => saveEdit(true)} style={{ flex: '2 1 180px', height: 44, borderRadius: 10, border: 0, background: t.accent, color: t.onAccent, fontWeight: 600, opacity: editSaving ? 0.6 : 1 }}>
                {editSaving ? 'Saving…' : 'Save & re-run sourcing'}
              </button>
            </div>
          </aside>
        </>
      )}

      {sourcingMode && (
        <ZepDBBulkSubmit
          sourcing
          autoStart={sourcingMode === 'auto'}
          apiBase="/api/manager/zepdb"
          jobId={jobId}
          jobTitle={title}
          onClose={() => setSourcingMode(null)}
          onComplete={() => {
            // Newly submitted candidates should show up right away.
            fetchJob();
            fetchResumes();
          }}
          // Next step after sourcing: choose who Zeus reaches out to.
          viewLabel="Choose who to reach out to"
          onViewCandidates={() => {
            setSourcingMode(null);
            goToStage('outreach');
          }}
        />
      )}
    </div>
  );
};

const ThemedManagerJobDetailPage = () => (
  <ManagerThemeShell nav="Jobs">
    <ManagerJobDetailPage />
  </ManagerThemeShell>
);

export default ThemedManagerJobDetailPage;
