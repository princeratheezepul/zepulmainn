import { Meeting } from "../models/meeting.model.js";

export const expireStaleMeetings = async () => {
  const now = Date.now();
  const bufferMs = 30 * 60 * 1000;

  // Consider up to 120 minutes max duration to avoid unbounded math
  const maxDurationMs = 120 * 60 * 1000;

  const meetings = await Meeting.find({
    status: { $in: ["scheduled", "active"] },
  }).select("scheduledAt durationMinutes status");

  let updated = 0;

  for (const meeting of meetings) {
    const durationMs = Math.min(
      (meeting.durationMinutes || 40) * 60 * 1000,
      maxDurationMs
    );
    const expiry = new Date(meeting.scheduledAt).getTime() + durationMs + bufferMs;
    if (now > expiry) {
      meeting.status = "expired";
      await meeting.save();
      updated += 1;
    }
  }

  return updated;
};

