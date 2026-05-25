// Authorization helper for resource ownership checks.
// Centralized here so handlers don't reinvent the same rule and drift.

const toId = (v) => (v ? v.toString() : null);

// Returns true if the authenticated principal in `req` may access the given Resume document.
// Rules:
//   - admin / accountmanager: full access (org-wide privileged roles)
//   - manager: resume.managerId === req.id
//   - recruiter: resume.recruiterId === req.id
//   - anything else: deny
export const canAccessResume = (req, resume) => {
  if (!req || !resume) return false;
  if (req.role === "admin" || req.role === "accountmanager") return true;

  const principalId = toId(req.id || req.user?._id);
  if (!principalId) return false;

  if (req.role === "manager") {
    return toId(resume.managerId) === principalId;
  }
  if (req.role === "recruiter") {
    return toId(resume.recruiterId) === principalId;
  }
  return false;
};

// Returns true if the principal may access a ResumeData document (which references the parent Resume by id).
// Falls back to recruiter/manager ownership recorded on the ResumeData itself.
export const canAccessResumeData = (req, resumeData) => {
  if (!req || !resumeData) return false;
  if (req.role === "admin" || req.role === "accountmanager") return true;

  const principalId = toId(req.id || req.user?._id);
  if (!principalId) return false;

  if (req.role === "manager") {
    return toId(resumeData.managerId) === principalId;
  }
  if (req.role === "recruiter") {
    return toId(resumeData.recruiterId) === principalId || toId(resumeData.userId) === principalId;
  }
  return false;
};
