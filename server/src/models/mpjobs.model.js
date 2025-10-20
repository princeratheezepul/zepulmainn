import mongoose from "mongoose";

const mpJobSchema = new mongoose.Schema({
    // Basic Job Information
    jobTitle: {
        type: String,
        required: true,
        trim: true
    },
    companyName: {
        type: String,
        trim: true,
        default: ''
    },
    jobDescription: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    jobType: {
        type: String,
        enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance', 'Remote', 'Hybrid', 'On-site', 'Flexible'],
        required: true
    },
    experience: {
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 10
        }
    },
    salary: {
        min: {
            type: Number
        },
        max: {
            type: Number
        }
    },
    skills: [{
        type: String,
        trim: true
    }],
    
    // Job Status
    status: {
        type: String,
        enum: ['active', 'closed', 'paused'],
        default: 'active'
    },
    isClosed: {
        type: Boolean,
        default: false
    },
    
    // Marketplace specific fields
    mpSelectedCandidates: {
        type: Number,
        default: 0
    },
    mpRejectedCandidates: {
        type: Number,
        default: 0
    },
    
    // Creator Information
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'creatorModel',
        required: true
    },
    creatorModel: {
        type: String,
        enum: ['User', 'MpUser'],
        default: 'User',
        required: true
    },
    createdByMPUser: {
        type: Boolean,
        default: false
    },
    
    // Marketplace Companies
    mpCompanies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MpCompany'
    }],
    
    // License Partners
    licensePartners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MpUser'
    }],
    
    // Talent Scouts - array of MpUser ObjectIds with userRole "recruiter"
    talentScouts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MpUser'
    }],
    
    // Track when jobs are picked (for statistics)
    pickHistory: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MpUser'
        },
        pickedAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Candidate List
    candidateList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume'
    }],
    
    // Additional Fields
    hiringDeadline: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    internalNotes: {
        type: String,
        trim: true
    },
    
    // Statistics
    totalApplications: {
        type: Number,
        default: 0
    },
    totalInterviews: {
        type: Number,
        default: 0
    },
    totalHires: {
        type: Number,
        default: 0
    },
    
    // Commission Rate
    commissionRate: {
        type: Number,
        default: 0
    },
    
    // Statistics
    pickedNumber: {
        type: Number,
        default: 0
    },
    redFlagCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Method to add a talent scout to the job (validates userRole)
mpJobSchema.methods.addTalentScout = async function (talentScoutId) {
    const MpUser = mongoose.model('MpUser');
    const talentScout = await MpUser.findById(talentScoutId);
    
    if (!talentScout) {
        throw new Error("Talent scout not found");
    }
    
    if (talentScout.userRole !== "recruiter") {
        throw new Error("User must have userRole 'recruiter' to be added as a talent scout");
    }
    
    // Check if talent scout is already in the list
    if (this.talentScouts.some(id => id.toString() === talentScoutId.toString())) {
        return this; // Already added, no need to add again
    }
    
    this.talentScouts.push(talentScoutId);
    return await this.save();
};

// Method to remove a talent scout from the job
mpJobSchema.methods.removeTalentScout = async function (talentScoutId) {
    this.talentScouts = this.talentScouts.filter(id => id.toString() !== talentScoutId.toString());
    return await this.save();
};

// Index for better query performance
mpJobSchema.index({ creatorId: 1 });
mpJobSchema.index({ status: 1 });
mpJobSchema.index({ location: 1 });
mpJobSchema.index({ jobType: 1 });
mpJobSchema.index({ isClosed: 1 });

export const MpJob = mongoose.model("MpJob", mpJobSchema);
