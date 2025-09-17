import mongoose, { Schema } from "mongoose";

const mpTransactionsSchema = new Schema({
    activity: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'received', 'deducted', 'withdrawn'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    mpuserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MpUser',
        required: true
    }
}, { timestamps: true });

export const MpTransactions = mongoose.models.MpTransactions || mongoose.model('MpTransactions', mpTransactionsSchema);
