import mongoose from "mongoose";

const jobDescriptionSessionSchema = new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        recruiterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Recruiter",
        },
        // Manager (User) who started the session, when it came from a logged-in
        // dashboard. Only these sessions are turned into a job automatically.
        managerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        // Job created from this session's transcript.
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            default: null,
        },
        status: {
            type: String,
            enum: ["pending", "active", "completed"],
            default: "pending",
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
        meta: {
            type: mongoose.Schema.Types.Mixed,
        },
    },
    { timestamps: true }
);

export const JobDescriptionSession =
    mongoose.models.JobDescriptionSession ||
    mongoose.model("JobDescriptionSession", jobDescriptionSessionSchema);
