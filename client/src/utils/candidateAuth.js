/**
 * The candidate session, or null. Candidate-only features (the AI career agent,
 * free interview prep) gate on this and send anyone without a session to
 * /candidate/login.
 */
export const getLoggedInCandidate = () => {
  try {
    const candidate = JSON.parse(localStorage.getItem("candidateInfo"));
    return candidate?._id ? candidate : null;
  } catch {
    return null;
  }
};
