import mongoose from "mongoose";

const testMeetSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

export const TestMeet =
    mongoose.models.TestMeet || mongoose.model("TestMeet", testMeetSchema);
