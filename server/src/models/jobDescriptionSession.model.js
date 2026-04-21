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
