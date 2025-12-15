export const validateCreateMeeting = (req, res, next) => {
  const {
    jobId,
    resumeId,
    candidateEmail,
    scheduledAt,
    durationMinutes,
    timeZone,
  } = req.body || {};

  if (!jobId || !resumeId || !candidateEmail || !scheduledAt) {
    return res
      .status(400)
      .json({ message: "jobId, resumeId, candidateEmail, scheduledAt are required" });
  }

  const emailOk =
    typeof candidateEmail === "string" && candidateEmail.includes("@");
  if (!emailOk) {
    return res.status(400).json({ message: "candidateEmail is invalid" });
  }

  const dateOk = !Number.isNaN(Date.parse(scheduledAt));
  if (!dateOk) {
    return res.status(400).json({ message: "scheduledAt must be a valid date" });
  }

  if (durationMinutes !== undefined) {
    const num = Number(durationMinutes);
    if (Number.isNaN(num) || num < 10 || num > 120) {
      return res
        .status(400)
        .json({ message: "durationMinutes must be between 10 and 120" });
    }
  }

  if (timeZone && typeof timeZone !== "string") {
    return res.status(400).json({ message: "timeZone must be a string" });
  }

  next();
};

export const validateStartMeeting = (req, res, next) => {
  const { token } = req.params || {};
  if (!token) return res.status(400).json({ message: "token is required" });
  next();
};

export const validateRescheduleMeeting = (req, res, next) => {
  const { scheduledAt, durationMinutes } = req.body || {};

  if (!scheduledAt) {
    return res.status(400).json({ message: "scheduledAt is required" });
  }

  const dateOk = !Number.isNaN(Date.parse(scheduledAt));
  if (!dateOk) {
    return res.status(400).json({ message: "scheduledAt must be a valid date" });
  }

  if (durationMinutes !== undefined) {
    const num = Number(durationMinutes);
    if (Number.isNaN(num) || num < 10 || num > 120) {
      return res
        .status(400)
        .json({ message: "durationMinutes must be between 10 and 120" });
    }
  }

  next();
};

