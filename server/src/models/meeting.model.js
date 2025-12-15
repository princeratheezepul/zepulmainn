import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recruiter",
      required: true,
    },
    candidateEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 40,
      min: 10,
      max: 120,
    },
    status: {
      type: String,
      enum: ["scheduled", "active", "completed", "expired", "canceled"],
      default: "scheduled",
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    vapiAssistantId: {
      type: String,
    },
    vapiCallId: {
      type: String,
    },
    joinConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    transcript: {
      type: String,
      default: "",
    },
    recordingUrl: {
      type: String,
    },
    toolOutputs: {
      type: mongoose.Schema.Types.Mixed,
    },
    report: {
      summary: { type: String },
      recommendation: { type: String },
      risks: [{ type: String }],
      scores: { type: mongoose.Schema.Types.Mixed },
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export const Meeting =
  mongoose.models.Meeting || mongoose.model("Meeting", meetingSchema);

