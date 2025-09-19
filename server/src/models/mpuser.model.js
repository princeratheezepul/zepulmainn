import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcryptjs';

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
    password: {
        type: String,
        required: true
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

// Hash password before saving
mpuserSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// Compare password method
mpuserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

export const MpUser = mongoose.models.MpUser || mongoose.model('MpUser', mpuserSchema);
