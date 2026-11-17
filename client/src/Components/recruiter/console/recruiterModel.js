/**
 * How the recruiter console reads its data.
 *
 * Everything here is derived from two lists the console already loads: the
 * jobs assigned to the recruiter (`/api/recruiter/assigned-jobs`) and the
 * resumes they uploaded (`/api/resumes/recruiter`, which carries the job and
 * the latest AI interview invite). Stage progress is not one stored column, so
 * each stage is read from the evidence it leaves on the resume.
 */
import { codingTestOf, codingTestDone, isJobOpen } from '../../dashboard/dashboardUtils';

export const DAY = 86400000;

export const idOf = (v) => String(v?._id || v || '');
export const ts = (v) => {
  const t = v ? new Date(v).getTime() : NaN;
  return Number.isNaN(t) ? null : t;
};
export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
export const firstName = (name = '') => String(name).trim().split(/\s+/)[0] || '';
export const initials = (name = '') =>
  String(name).split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'Z';

/* ---- Jobs ----------------------------------------------------------------- */

export const jobManagerName = (job) => job?.managerId?.fullname || job?.managerId?.username || '';
export const jobCompany = (job) => job?.companyId?.name || job?.company || '';
export const jobBar = (job) => {
  const raw = job?.cvStrengthCutoff;
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};
const titleCase = (s = '') => String(s).charAt(0).toUpperCase() + String(s).slice(1);
export const jobMeta = (job) => {
  const parts = [jobCompany(job), job?.location, job?.type && titleCase(job.type)].filter(Boolean);
  // "Remote · Remote" when the location and the work model say the same thing.
  return parts.filter((p, i) => parts.findIndex((q) => q.toLowerCase() === p.toLowerCase()) === i).join(' · ');
};

export const jobSalary = (job) => {
  const { min, max } = job?.salary || {};
  if (!min && !max) return '—';
  const cur = job?.intake?.ctc?.currency;
  const sym = { INR: '₹', GBP: '£', USD: '$', EUR: '€' }[cur] || (cur ? `${cur} ` : '₹');
  const fmt = (n) => Number(n).toLocaleString('en-IN');
  return min && max ? `${sym}${fmt(min)}–${fmt(max)}` : `${sym}${fmt(min || max)}`;
};

export const jobCodingTest = (job) => {
  const c = job?.intake?.codingTest;
  if (!c) return 'Standard';
  return [c.difficulty, c.durationMin ? `${c.durationMin} min` : null].filter(Boolean).join(' · ') || 'Standard';
};

const codingPassMark = (job) => {
  const n = Number(job?.intake?.codingTest?.cutoff);
  return Number.isFinite(n) ? n : 70;
};

/* ---- Resumes -------------------------------------------------------------- */

export const cvScore = (r) => {
  const n = Number(r?.overallScore ?? r?.ats_score);
  return Number.isFinite(n) ? Math.round(n) : null;
};

/** Rejected on upload because the CV fell below the job's bar. */
export const rejectedByBar = (r) =>
  r?.status === 'rejected' && /CV strength/i.test(r?.rejectFeedback || '');

export const aboveBar = (r, job) => {
  if (rejectedByBar(r)) return false;
  const score = cvScore(r);
  const bar = jobBar(job || r?.jobId);
  if (score === null) return false;
  return bar === null ? true : score >= bar;
};

const testOf = (r) => codingTestOf(r);
export const codingSent = (r) => Boolean(testOf(r)?.assessmentId);
export const codingInProgress = (r) => testOf(r)?.status === 'in_progress';
export const codingDone = (r) => codingTestDone(r);
export const codingScore = (r) => {
  const s = testOf(r)?.evaluation?.score;
  return typeof s === 'number' && Number.isFinite(s) ? Math.round(s) : null;
};
export const codingPassed = (r, job) => {
  if (!codingDone(r)) return false;
  const pass = testOf(r)?.evaluation?.pass;
  if (typeof pass === 'boolean') return pass;
  const s = codingScore(r);
  return s === null ? true : s >= codingPassMark(job || r?.jobId);
};
/** Coding test sent but not started for over 48 hours. */
export const codingStalled = (r) => {
  const t = testOf(r);
  if (!t?.assessmentId || t.status !== 'invited') return false;
  const sent = ts(t.inviteDate);
  return sent !== null && Date.now() - sent > 2 * DAY;
};

const inviteStatus = (r) => r?.interviewInvite?.status || null;
export const interviewDone = (r) =>
  Boolean(r?.interviewEvaluation?.evaluationResults?.length) || inviteStatus(r) === 'completed';
export const interviewOut = (r) => ['scheduled', 'active'].includes(inviteStatus(r));

/** Finished the coding test and waiting on the recruiter to send the interview. */
export const canPick = (r) =>
  r?.status !== 'rejected' && codingDone(r) && !interviewDone(r) && !interviewOut(r);

/** Interview score as a percentage: `score` out of `totalscore` (10 per question). */
export const verdictPercent = (r) => {
  const score = Number(r?.score) || 0;
  const total = Number(r?.totalscore) || 0;
  if (score > 0 && total > 0) return Math.round((score / total) * 100);
  const results = r?.interviewEvaluation?.evaluationResults || [];
  if (!results.length) return null;
  return Math.round((results.reduce((s, q) => s + (Number(q?.score) || 0), 0) / results.length) * 10);
};

export const relTime = (t) => {
  if (t == null) return '';
  const d = new Date(t);
  const now = new Date();
  const mins = Math.round((now - d) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (d.toDateString() === now.toDateString()) return `today ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'yesterday';
  if (now - d < 6 * DAY) return d.toLocaleDateString('en-GB', { weekday: 'short' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const feedLabel = (t) => {
  const d = new Date(t);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  const y = new Date(now); y.setDate(now.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  if (now - d < 6 * DAY) return d.toLocaleDateString('en-GB', { weekday: 'short' });
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

/* ---- Pipeline lanes -------------------------------------------------------- */

export const LANES = [
  { key: 'uploaded', title: 'Uploaded', tag: 'BELOW THE BAR', tone: 'faint' },
  { key: 'sent', title: 'Coding test sent', tag: 'ZEUS · AUTOMATIC', tone: 'accent' },
  { key: 'taking', title: 'Taking the test', tag: 'ZEUS', tone: 'accent' },
  { key: 'done', title: 'Coding done', tag: 'YOUR MOVE', tone: 'role' },
  { key: 'interview', title: 'AI interview', tag: 'ZEUS', tone: 'accent' },
  { key: 'verdict', title: 'Zeus verdict', tag: 'WITH MANAGER', tone: 'ok' },
];

/** The lane a candidate sits in, plus the one-line note under their name. */
export const placeCandidate = (r, job, managerName) => {
  const bar = jobBar(job);
  if (interviewDone(r)) {
    const pct = verdictPercent(r);
    return { lane: 'verdict', note: `${pct != null ? `Verdict ${pct}` : 'Verdict ready'}${managerName ? ` · with ${firstName(managerName)}` : ''}` };
  }
  if (interviewOut(r)) {
    const active = r.interviewInvite?.status === 'active';
    return { lane: 'interview', note: active ? 'Interview in progress' : `Interview link sent ${relTime(ts(r.interviewInvite?.sentAt))}`.trim() };
  }
  if (codingDone(r)) {
    const s = codingScore(r);
    const passed = codingPassed(r, job);
    const expired = r.interviewInvite?.status === 'expired';
    const base = passed ? `Passed${s != null ? ` · ${s}` : ''}` : `Didn't pass${s != null ? ` · ${s}` : ''}`;
    return { lane: 'done', note: expired ? `${base} · interview link expired` : base, passed };
  }
  if (codingInProgress(r)) return { lane: 'taking', note: 'Taking the test now' };
  if (codingSent(r)) {
    return {
      lane: 'sent',
      note: codingStalled(r) ? 'No start after 48 h' : `Test link sent ${relTime(ts(testOf(r)?.inviteDate))}`.trim(),
    };
  }
  if (r.roleConfirmation?.status === 'pending' && r.status !== 'rejected') {
    return { lane: 'sent', note: 'Asked to confirm the role' };
  }
  if (rejectedByBar(r)) return { lane: 'uploaded', note: bar != null ? `Below bar ${bar}` : 'Below the bar' };
  if (r.roleConfirmation?.status === 'declined') return { lane: 'uploaded', note: 'Declined the role' };
  if (r.status === 'rejected') return { lane: 'uploaded', note: 'Rejected' };
  return { lane: 'uploaded', note: `Uploaded ${relTime(ts(r.createdAt))}`.trim() };
};

/* ---- Per-job summary ------------------------------------------------------- */

export const groupByJob = (resumes) => {
  const map = new Map();
  resumes.forEach((r) => {
    const k = idOf(r.jobId);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(r);
  });
  return map;
};

// Six steps of the recruiter's view of a job, used by "Your jobs at a glance".
export const GLANCE_STAGES = ['Uploaded', 'Above bar', 'Coding sent', 'Coding passed', 'AI interview', 'Verdict'];

export const summarizeJob = (job, rs = []) => {
  const uploads = rs.length;
  const above = rs.filter((r) => aboveBar(r, job)).length;
  const passed = rs.filter((r) => codingPassed(r, job)).length;
  const pick = rs.filter(canPick).length;
  const stalled = rs.filter(codingStalled).length;
  let stage = 0;
  if (above) stage = 1;
  if (rs.some(codingSent)) stage = 2;
  if (passed) stage = 3;
  if (rs.some((r) => interviewOut(r) || interviewDone(r))) stage = 4;
  if (rs.some(interviewDone)) stage = 5;
  return { uploads, above, passed, pick, stalled, stage, open: isJobOpen(job) };
};
