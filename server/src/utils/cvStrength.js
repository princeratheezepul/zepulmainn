// CV strength screening.
//
// A job can carry a `cvStrengthCutoff` (0-100). When it does, a submitted
// resume whose CV strength falls below that cutoff is rejected on the spot and
// the downstream pipeline (assessment generation, candidate emails, WhatsApp)
// never starts for it.

// "CV strength" is the resume's overall AI match score for the job. Resume docs
// store it as `overallScore`, rounded from the raw `ats_score`; fall back
// through both so partially-populated records still screen correctly.
export const getCvStrength = (source) => {
  if (!source || typeof source !== "object") return null;
  const raw = source.overallScore ?? source.ats_score;
  const num = Number(raw);
  return Number.isFinite(num) ? num : null;
};

/**
 * Decide whether a submission clears the job's CV strength cutoff.
 *
 * Fails open on purpose: if the job has no cutoff, or the resume carries no
 * usable score (AI scoring failed, legacy record), the submission proceeds as
 * normal. A candidate should never be auto-rejected because something upstream
 * did not produce a number.
 *
 * @returns {{screened: boolean, belowCutoff: boolean, score: number|null, cutoff: number|null}}
 */
export const screenCvStrength = (job, resumeLike) => {
  // Careful: Number(null) is 0, and the Job schema defaults cvStrengthCutoff to
  // null. Reject the empty values explicitly so "no cutoff set" never becomes
  // "cutoff of 0". A real 0 cutoff stays valid.
  const rawCutoff = job?.cvStrengthCutoff;
  const cutoff =
    rawCutoff === null || rawCutoff === undefined || rawCutoff === ""
      ? null
      : Number(rawCutoff);
  const score = getCvStrength(resumeLike);

  if (cutoff === null || !Number.isFinite(cutoff) || score === null) {
    return {
      screened: false,
      belowCutoff: false,
      score,
      cutoff: Number.isFinite(cutoff) ? cutoff : null,
    };
  }

  return { screened: true, belowCutoff: score < cutoff, score, cutoff };
};

export const cutoffRejectionFeedback = (score, cutoff) =>
  `Automatically rejected: CV strength ${Math.round(score)}% is below this job's cutoff of ${cutoff}%.`;

// Fields applied to a Resume doc when it fails the cutoff. Kept in one place so
// the single-upload and bulk-upload paths mark rejections identically.
export const cutoffRejectionFields = (score, cutoff) => ({
  status: "rejected",
  isRejected: true,
  isApproved: false,
  rejectFeedback: cutoffRejectionFeedback(score, cutoff),
});
