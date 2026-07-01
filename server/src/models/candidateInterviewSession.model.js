import mongoose from "mongoose";

const candidateInterviewSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "analyzed"],
      default: "pending",
    },
    vapiAssistantId: { type: String },
    vapiCallId: { type: String },
    joinConfig: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    transcript: {
      type: String,
      default: "",
    },
    recordingUrl: { type: String },
    // Structured profile extracted from the transcript
    analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Matched jobs: [{ jobId, score, reasons: [] }]
    matchedJobs: {
      type: [
        {
          jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job" },
          score: { type: Number, default: 0 },
          reasons: { type: [String], default: [] },
        },
      ],
      default: [],
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

export const CandidateInterviewSession =
  mongoose.models.CandidateInterviewSession ||
  mongoose.model("CandidateInterviewSession", candidateInterviewSessionSchema);
