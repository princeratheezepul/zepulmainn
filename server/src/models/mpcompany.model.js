import mongoose from "mongoose";

const mpCompanySchema = new mongoose.Schema({
    // Basic Company Information
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    companyEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    industry: {
        type: String,
        required: true,
        trim: true
    },
    companySize: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    headquartersLocation: {
        type: String,
        required: true,
        trim: true
    },
    websiteUrl: {
        type: String,
        required: true,
        trim: true
    },
    companyDescription: {
        type: String,
        required: true,
        trim: true
    },
    
    // Hiring Information
    hiringDomains: {
        type: String,
        required: true,
        trim: true
    },
    preferredJobTypes: {
        type: String,
        required: true,
        trim: true
    },
    hiringLocations: {
        type: String,
        required: true,
        trim: true
    },
    packageRange: {
        type: String,
        required: true,
        trim: true
    },
    
    // Creator Information
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Marketplace Jobs
    mpJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MpJob'
    }],
    
    // Additional Fields for Future Use
    logoUrl: {
        type: String,
        trim: true
    },
    contactPhone: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    
    // Statistics
    totalJobsPosted: {
        type: Number,
        default: 0
    },
    activeJobs: {
        type: Number,
        default: 0
    },
    totalHires: {
        type: Number,
        default: 0
    },
    
    // Candidate Statistics
    pickedNumber: {
        type: Number,
        default: 0
    },
    candidatesCount: {
        type: Number,
        default: 0
    },
    selectedCandidatesCount: {
        type: Number,
        default: 0
    },
    rejectedCandidatesCount: {
        type: Number,
        default: 0
    },
    redFlagCount: {
        type: Number,
        default: 0
    },
    
    // Additional Notes
    internalNotes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for better query performance
mpCompanySchema.index({ creatorId: 1 });
mpCompanySchema.index({ industry: 1 });
mpCompanySchema.index({ location: 1 });
mpCompanySchema.index({ status: 1 });

export const MpCompany = mongoose.model("MpCompany", mpCompanySchema);
