/**
 * AI interview length. Each job sets its own (job.intake.interview.durationMin),
 * every candidate on that job gets the same, and no interview runs past 45 minutes.
 */
export const MIN_INTERVIEW_MINUTES = 5;
export const MAX_INTERVIEW_MINUTES = 45;
export const DEFAULT_INTERVIEW_MINUTES = 10;

/** Keep any minutes value inside the allowed range. */
export const capInterviewMinutes = (minutes) => {
  const n = Math.round(Number(minutes));
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_INTERVIEW_MINUTES;
  return Math.min(MAX_INTERVIEW_MINUTES, Math.max(MIN_INTERVIEW_MINUTES, n));
};

/** The interview length a job's candidates get. */
export const interviewMinutesFor = (job) => capInterviewMinutes(job?.intake?.interview?.durationMin ?? DEFAULT_INTERVIEW_MINUTES);
