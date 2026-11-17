/**
 * How the manager console reads the automated workflow off resume records.
 * Used by the Jobs board; the rules match the overview's (ManagerOverview.jsx),
 * so both agree on what a role is waiting for and how far it has got.
 */
import { hasCvStrength, hasScorecard, isJobUrgent } from './useManagerPlatformData';
import { atCodingTest, codingTestDone } from '../../dashboard/dashboardUtils';

export const DAY = 86400000;

export const jobKey = (value) => String(value?._id || value || '');
export const ts = (value) => {
  const t = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(t) ? null : t;
};
export const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const interviewDone = (r) => Boolean(r?.interviewEvaluation?.evaluationResults?.length);
export const decided = (r) => ['shortlisted', 'rejected', 'offered', 'hired'].includes(r?.status);
export const roleConfirmed = (r) => r?.roleConfirmation?.status === 'accepted';

/** Coding test finished, interview not yet sent or done: the manager's move. */
export const awaitingInterviewLink = (r) =>
  r?.status !== 'rejected' && codingTestDone(r) && !interviewDone(r) && !r?.interviewScheduled;

/** Interview evaluated but nobody has decided on the candidate yet. */
export const awaitingScorecardReview = (r) => interviewDone(r) && !decided(r);

/** Interview score as a percentage: `score` out of `totalscore` (10 per question). */
export const interviewPercent = (r) => {
  const score = Number(r?.score) || 0;
  const total = Number(r?.totalscore) || 0;
  if (score > 0 && total > 0) return Math.round((score / total) * 100);
  const results = r?.interviewEvaluation?.evaluationResults || [];
  if (!results.length) return null;
  const avg = results.reduce((s, q) => s + (Number(q?.score) || 0), 0) / results.length;
  return Math.round(avg * 10);
};

// Eleven steps of the automated workflow; a role's bar fills to the furthest
// step any of its candidates has reached.
export const ROLE_STAGES = [
  'Brief', 'Live', 'CVs in', 'CV strength', 'Coding test sent', 'Coding test done',
  'AI interview', 'Scorecards', 'Shortlisted', 'Offered', 'Hired',
];

export const roleStageIndex = (rs) => {
  let i = 1;
  const reach = (n, test) => { if (rs.some(test)) i = Math.max(i, n); };
  if (rs.length) i = 2;
  reach(3, hasCvStrength);
  reach(4, atCodingTest);
  reach(5, codingTestDone);
  reach(6, interviewDone);
  reach(7, hasScorecard);
  reach(8, (r) => r.status === 'shortlisted');
  reach(9, (r) => r.status === 'offered');
  reach(10, (r) => r.status === 'hired');
  return i;
};

/** Candidates grouped by the job they were submitted to. */
export const groupByJob = (resumes) => {
  const byJob = new Map();
  resumes.forEach((r) => {
    const key = jobKey(r.jobId);
    if (!byJob.has(key)) byJob.set(key, []);
    byJob.get(key).push(r);
  });
  return byJob;
};

/** What an open role is waiting on the manager for, or null if nothing. */
export const roleWaitingOn = (job, rs) => {
  if (rs.some(awaitingScorecardReview)) return 'shortlist';
  if (rs.some(awaitingInterviewLink)) return 'send interview links';
  if (!rs.length && isJobUrgent(job)) return 'add candidates';
  return null;
};
