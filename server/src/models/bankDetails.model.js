import mongoose, { Schema } from "mongoose";

const bankDetailsSchema = new Schema({
    accountHolderName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: Number,
        required: true
    },
    ifscCode: {
        type: String,
        required: true
    },
    bankName: {
        type: String,
        required: true
    },
    mpuserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MpUser',
        required: true
    }
}, { timestamps: true });

export const BankDetails = mongoose.models.BankDetails || mongoose.model('BankDetails', bankDetailsSchema);
