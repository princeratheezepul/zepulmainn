/** Headline scores for a candidate, shared by the Scorecards and Shortlist pages. */
import { codingTestScore } from '../../dashboard/dashboardUtils';
import { interviewPercent } from '../dashboard/zeusModel';

export const AT_CLIENT = ['shortlisted', 'offered', 'hired'];

/** Coding, CV strength and interview, each 0-100 or null when not taken yet. */
export const scoresOf = (r) => ({
  coding: codingTestScore(r),
  cv: r?.ats_score != null ? Math.round(r.ats_score) : null,
  interview: interviewPercent(r),
});

/** Average of whichever of the three scores exist, or null. */
export const overallOf = (r) => {
  const vals = Object.values(scoresOf(r)).filter((v) => v != null);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
};

export const firstName = (n) => String(n || '').trim().split(/\s+/)[0] || 'candidate';

/** `experience` is free text ("7", "7 years", "5+ yrs"). */
export const experienceLabel = (r, short = false) => {
  const exp = String(r?.experience || '').trim();
  if (!exp) return null;
  return /^\d+(\.\d+)?$/.test(exp) ? `${exp} ${short ? 'yrs' : 'years'}` : exp;
};

/** Phone as shown to the manager: hidden until the candidate is shortlisted. */
export const phoneLabel = (r) => {
  if (!r?.phone) return null;
  if (!AT_CLIENT.includes(r.status)) return null;
  return `${r.countryCode ? `+${r.countryCode} ` : ''}${r.phone}`;
};
