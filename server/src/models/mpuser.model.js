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
        required: true,
        select: true
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
}, { 
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            return ret;
        }
    }
});

// Hash password before saving
mpuserSchema.pre("save", async function(next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// Compare password method
mpuserSchema.methods.isPasswordCorrect = async function (password) {
    // Check if password is provided and user has a password
    if (!password) {
        console.log("No password provided for comparison");
        return false;
    }
    
    if (!this.password) {
        console.log("User has no password stored");
        return false;
    }
    
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        console.error("Error comparing password:", error);
        return false;
    }
};

export const MpUser = mongoose.models.MpUser || mongoose.model('MpUser', mpuserSchema);
