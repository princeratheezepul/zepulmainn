import mongoose, { Schema } from "mongoose";

const mpuserSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    DOB: {
        type: Date,
        required: true
    },
    emailid: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        required: true
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    pendingEarnings: {
        type: Number,
        default: 0
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MpTransactions'
    }],
    accountDetails: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BankDetails'
    }],
    bookmarkedJobs: [{
        type: String
    }],
    pickedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MpJob'
    }],
    myJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }]
}, { timestamps: true });

export const MpUser = mongoose.models.MpUser || mongoose.model('MpUser', mpuserSchema);
