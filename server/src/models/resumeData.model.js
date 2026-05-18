import mongoose from 'mongoose';

const ResumeDataSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        // Extracted role/title for fast matching
        role: {
            type: String,
            default: ''
        },

        // Numeric experience for range queries
        experienceYears: {
            type: Number,
            default: 0
        },

        projects: [
            {
                title: String,
                points: [String]
            }
        ],

        experience: [
            {
                title: String,
                company: String,
                duration: String,
                points: [String]
            }
        ],

        achievements: {
            points: [String]
        },

        skills: {
            points: [String]
        },

        education: [
            {
                institution: String,
                degree: String,
                points: [String]
            }
        ],

        // Search-optimized fields (auto-computed on save)
        searchableText: {
            type: String,
            default: ''
        },

        searchableSkills: {
            type: [String],
            default: []
        },

        phone: {
            type: String,
            default: ''
        },

        countryCode: {
            type: String,
            default: '91'
        },

        emailId: {
            type: String,
            default: ''
        },

        rawResume: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ResumeDataRaw'
        },

        scorecardId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Scorecard'
        }
    },
    { timestamps: true }
);

// Regular indexes for common query patterns
ResumeDataSchema.index({ searchableSkills: 1 });
ResumeDataSchema.index({ experienceYears: 1 });
ResumeDataSchema.index({ role: 1 });
ResumeDataSchema.index({ name: 1 });
ResumeDataSchema.index({ createdAt: -1 });

const ResumeData = mongoose.model('ResumeData', ResumeDataSchema);
export default ResumeData;
