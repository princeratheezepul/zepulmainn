/**
 * Where a candidate sits in the automated pipeline, as the candidate list
 * filters see it.
 *
 * Stage membership is read from the evidence the workflow leaves behind rather
 * than from `status`, because `status` only records the human decisions
 * (submitted / shortlisted / rejected) and says nothing about whether a coding
 * test went out or an interview was evaluated.
 *
 * The client mirrors these definitions in `dashboardUtils.js` so a tab shows the
 * same rows whichever side does the filtering — change one, change both.
 */

const OA_STARTED = ["invited", "in_progress", "completed", "evaluated"];

/** A coding test has been sent, whether or not it has been finished. */
export const atCodingTest = (r) =>
  Boolean(r?.oa?.scheduled || r?.oa?.assessmentId || OA_STARTED.includes(r?.oa?.status));

/** An AI interview has been scheduled, or has already been evaluated. */
export const atAiInterview = (r) =>
  Boolean(
    r?.interviewScheduled ||
      r?.interviewEvaluation?.evaluatedAt ||
      r?.interviewEvaluation?.evaluationResults?.length
  );

/** Put in front of the client and awaiting their decision. */
export const withClient = (r) => r?.status === "submitted";

export const STAGE_PREDICATES = {
  codingTest: atCodingTest,
  aiInterview: atAiInterview,
  withClient,
  shortlisted: (r) => r?.status === "shortlisted",
  rejected: (r) => r?.status === "rejected",
};

/**
 * Mongo equivalents, so a stage can be filtered in the query rather than after
 * loading every resume for the job.
 */
export const STAGE_QUERIES = {
  codingTest: {
    $or: [
      { "oa.scheduled": true },
      { "oa.assessmentId": { $nin: [null, ""] } },
      { "oa.status": { $in: OA_STARTED } },
    ],
  },
  aiInterview: {
    $or: [
      { interviewScheduled: true },
      { "interviewEvaluation.evaluatedAt": { $ne: null } },
      { "interviewEvaluation.evaluationResults.0": { $exists: true } },
    ],
  },
  withClient: { status: "submitted" },
  shortlisted: { status: "shortlisted" },
  rejected: { status: "rejected" },
};
