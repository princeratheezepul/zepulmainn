// State of the AI interview invite for a candidate, read from their Meeting.
//
// The manager sends the interview from the candidate list once the coding test
// is done (see sendInterviewToCandidate), so the list needs to know, per
// candidate, whether an invite is out and how it went. The Meeting is the
// source of truth for that, which also covers invites sent before the manager
// took over the step.

import { Meeting } from "../models/meeting.model.js";

const CODING_TEST_DONE = ["completed", "evaluated"];

// `oa.status` defaults to "invited" on every resume, so only completed or
// evaluated says anything: those can only be set by submitting the test.
export const codingTestDone = (resume) =>
  CODING_TEST_DONE.includes(resume?.oa?.status) || CODING_TEST_DONE.includes(resume?.avaloqOa?.status);

// A scheduled invite past its window is expired even before the hourly cleanup
// has marked it so.
const effectiveStatus = (meeting) =>
  meeting.status === "scheduled" && meeting.expiresAt && new Date(meeting.expiresAt) < new Date()
    ? "expired"
    : meeting.status;

export const summarizeInvite = (meeting) =>
  meeting
    ? { status: effectiveStatus(meeting), sentAt: meeting.createdAt, expiresAt: meeting.expiresAt || null }
    : null;

/** An invite the candidate can still use, or already has. Anything else may be sent again. */
export const isLiveInvite = (invite) => ["scheduled", "active", "completed"].includes(invite?.status);

/** The most recent invite per resume, as Map<resumeId string, summary>. */
export const latestInvitesByResume = async (resumeIds) => {
  const invites = new Map();
  if (!resumeIds?.length) return invites;

  const meetings = await Meeting.find({ resumeId: { $in: resumeIds } })
    .sort({ createdAt: -1 })
    .select("resumeId status expiresAt createdAt")
    .lean();

  for (const meeting of meetings) {
    const key = String(meeting.resumeId);
    if (!invites.has(key)) invites.set(key, summarizeInvite(meeting));
  }
  return invites;
};
