/** Helpers shared by the admin and manager dashboards. */

export const API = import.meta.env.VITE_BACKEND_URL;

export const readAuth = () => {
  try {
    const info = JSON.parse(localStorage.getItem('userInfo'));
    return {
      token: info?.data?.accessToken || null,
      userId: info?.data?.user?._id || null,
      user: info?.data?.user || null,
    };
  } catch {
    return { token: null, userId: null, user: null };
  }
};

export const getJson = async (url, token) => {
  const res = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`${url} → ${res.status}`);
  return res.json();
};

/** A job is "open" until it is closed or its hiring deadline has passed. */
export const isJobOpen = (job) => {
  if (job?.isClosed) return false;
  if (job?.hiringDeadline && new Date(job.hiringDeadline) < new Date()) return false;
  return true;
};

export const isJobUrgent = (job) =>
  isJobOpen(job) && Array.isArray(job?.priority) && job.priority.includes('High');

export const sumField = (rows, field) =>
  rows.reduce((total, row) => total + (Number(row?.[field]) || 0), 0);

export const formatDelta = (change) => {
  if (!change || !change.count) return '';
  const sign = change.count > 0 ? '+' : '';
  return `${sign}${change.count} (${sign}${change.percentage}%)`;
};

export const jobCompanyName = (job) =>
  job?.company ||
  job?.companyName ||
  job?.companyId?.name ||
  job?.managerId?.fullname ||
  job?.adminId?.fullname ||
  'Zepul';

export const relativeTime = (value) => {
  if (!value) return '—';
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return '—';
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  return new Date(value).toLocaleDateString();
};

export const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

export const initialsOf = (name, fallback = 'Zepul') =>
  (name || fallback)
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

/* ---- Automated workflow pipeline -----------------------------------------
 * Stage progress is not a single stored column: it is recorded across several
 * resume fields, so each stage is derived from the evidence it leaves behind —
 * an ATS score, a finished coding test, an evaluated interview, a transcript
 * score, and finally a status that means a human has it.
 */

export const hasCvStrength = (r) => r?.ats_score != null;

export const codingTestSent = (r) => Boolean(r?.oa?.scheduled || r?.oa?.assessmentId);

export const hasCodingTest = (r) => ['completed', 'evaluated'].includes(r?.oa?.status);

export const hasAiInterview = (r) =>
  Boolean(r?.interviewEvaluation?.evaluatedAt || r?.interviewEvaluation?.evaluationResults?.length);

export const hasScorecard = (r) => Number(r?.score || r?.totalscore || 0) > 0;

export const atClientReview = (r) => ['shortlisted', 'offered', 'hired'].includes(r?.status);

export const sharedOnward = (r) =>
  ['submitted', 'shortlisted', 'offered', 'hired'].includes(r?.status);

export const isSelected = (r) => ['offered', 'hired'].includes(r?.status);

export const pipelineStages = (resumes) => [
  { label: 'Resumes', value: resumes.length },
  { label: 'CV Strength', value: resumes.filter(hasCvStrength).length },
  { label: 'Coding Test', value: resumes.filter(hasCodingTest).length },
  { label: 'AI Interview', value: resumes.filter(hasAiInterview).length },
  { label: 'Scorecards', value: resumes.filter(hasScorecard).length },
  { label: 'Client Review', value: resumes.filter(atClientReview).length },
];

const STATUS_TONE = {
  hired: 'green',
  offered: 'green',
  shortlisted: 'green',
  rejected: 'red',
  screening: 'amber',
  scheduled: 'amber',
  submitted: 'grey',
  applied: 'grey',
};

export const statusTone = (status) => STATUS_TONE[status] || 'grey';
