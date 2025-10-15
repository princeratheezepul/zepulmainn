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
    isActive: {
        type: Boolean,
        default: true
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
        ref: 'MpJob'
    }],
    // Manager reference - stores ObjectId of mpUser with userRole "Manager"
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MpUser',
        default: null
    },
    // Recruiter List - stores array of mpUser ObjectIds with userRole "recruiter"
    recruiterList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MpUser'
    }],
    // Session management fields
    currentSessionId: {
        type: String,
        default: null
    },
    lastLoginAt: {
        type: Date,
        default: null
    },
    sessionExpiresAt: {
        type: Date,
        default: null
    },
    // Candidate data tracking
    candidate_data: {
        applied: {
            type: Number,
            default: 0
        },
        hired: {
            type: Number,
            default: 0
        },
        interviewed: {
            type: Number,
            default: 0
        },
        shortlisted: {
            type: Number,
            default: 0
        }
    }
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

// Method to add a recruiter to recruiterList (validates userRole)
mpuserSchema.methods.addRecruiter = async function (recruiterId) {
    const MpUser = mongoose.model('MpUser');
    const recruiter = await MpUser.findById(recruiterId);
    
    if (!recruiter) {
        throw new Error("Recruiter not found");
    }
    
    if (recruiter.userRole !== "recruiter") {
        throw new Error("User must have userRole 'recruiter' to be added to recruiterList");
    }
    
    // Check if recruiter is already in the list
    if (this.recruiterList.includes(recruiterId)) {
        return this; // Already added, no need to add again
    }
    
    this.recruiterList.push(recruiterId);
    return await this.save();
};

// Method to set manager (validates userRole)
mpuserSchema.methods.setManager = async function (managerId) {
    const MpUser = mongoose.model('MpUser');
    const manager = await MpUser.findById(managerId);
    
    if (!manager) {
        throw new Error("Manager not found");
    }
    
    if (manager.userRole !== "Manager") {
        throw new Error("User must have userRole 'Manager' to be set as manager");
    }
    
    this.manager = managerId;
    return await this.save();
};

// Method to remove a recruiter from recruiterList
mpuserSchema.methods.removeRecruiter = async function (recruiterId) {
    this.recruiterList = this.recruiterList.filter(id => id.toString() !== recruiterId.toString());
    return await this.save();
};

export const MpUser = mongoose.models.MpUser || mongoose.model('MpUser', mpuserSchema);
