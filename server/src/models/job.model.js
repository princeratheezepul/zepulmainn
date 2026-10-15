import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    jobtitle: {
      type: String,
      required: true,
      // unique: true,
    },
    description: {
      type: String,
    },
    location: {
      type: String,
    },
    type: {
      type: String,
      enum: ['remote', 'onsite','hybrid'],
    },
    employmentType: {
      type: String,
      default: 'Full-time'
    },
    salary: {
      min: { type: Number },
      max: { type: Number }
    },
    keyResponsibilities: {
      type: [String],
      default: []
    },
    preferredQualifications: {
      type: [String],
      default: []
    },
    openpositions: {
      type: Number,
    },
    skills: {
      type: [String], 
    },
    experience: {
      type: Number,
    },
    // Minimum CV match score (0-100) a candidate must reach for this role.
    // null means no cutoff has been set for the job.
    cvStrengthCutoff: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    // Zeus job intake brief: the structured fields captured by the AI intake
    // (chat). Core fields that already exist on the job (title, skills,
    // location, salary, ...) stay where they are; this holds the rest, plus
    // where each value came from so defaults can be told apart from answers.
    intake: {
      seniority: { type: String, enum: ['Junior', 'Mid', 'Senior', 'Lead', 'Manager', 'Director', null], default: null },
      experienceMax: { type: Number, default: null },
      niceToHaveSkills: { type: [String], default: [] },
      successAt12m: { type: [String], default: [] },
      domain: {
        level: { type: String, enum: ['Required', 'Preferred', 'Not needed'], default: 'Not needed' },
        tags: { type: [String], default: [] },
      },
      workModel: {
        hybridDays: { type: Number, min: 1, max: 5, default: null },
        radiusKm: { type: Number, default: 40 },
        relocation: { type: Boolean, default: false },
      },
      ctc: {
        currency: { type: String, default: null },
        stretch: { type: Number, default: null },
        variablePct: { type: Number, min: 0, max: 100, default: null },
      },
      noticeMaxDays: { type: Number, min: 0, max: 180, default: 60 },
      latestJoiningDate: { type: Date, default: null },
      workAuth: {
        sponsorship: { type: Boolean, default: false },
        authorisedIn: { type: [String], default: [] },
      },
      contractMonths: { type: Number, default: null },
      shortlistSize: { type: Number, min: 1, max: 20, default: 5 },
      shortlistDue: { type: Date, default: null },
      codingTest: {
        required: { type: Boolean, default: false },
        stack: { type: [String], default: [] },
        difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
        durationMin: { type: Number, min: 20, max: 120, default: 45 },
        cutoff: { type: Number, min: 0, max: 100, default: 70 },
      },
      interview: {
        focus: { type: [String], default: [] },
        mustAsk: { type: [String], default: [] },
        dealBreakers: { type: String, default: '' },
      },
      conditional: {
        confidential: { type: Boolean, default: false },
        targetCompanies: { type: [String], default: [] },
        excludedCompanies: { type: [String], default: [] },
        certifications: { type: [String], default: [] },
        languages: { type: [String], default: [] },
        conditions: { type: String, default: '' },
        timezoneOverlapHours: { type: Number, min: 0, max: 8, default: null },
        timezone: { type: String, default: '' },
        reportingTo: { type: String, default: '' },
        teamSize: { type: Number, default: null },
        whyJoin: { type: String, maxlength: 300, default: '' },
      },
      // field name -> 'employer' | 'extracted' | 'default'
      provenance: { type: Map, of: String, default: {} },
    },
    priority: {
      type: [String],
      enum: ['Low', 'Medium', 'High'],
      default: []
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
    totalApplication_number: {
      type: Number,
      default: 0,
    },
    shortlisted_number: {
      type: Number,
      default: 0,
    },
    interviewed_number: {
      type: Number,
      default: 0,
    },
    "2ndround_interviewed_number": {
      type: Number,
      default: 0,
    },
    isAssigned:{
      type: Boolean,
      default: false,
    },
    assignedTo:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ] ,
    assignedRecruiters:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Recruiter",
      },
    ],
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
    },
    company: {
      type: String,
    },
    managerId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    accountManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive:{
      type:Boolean,
      default:true,
    },
    hiringDeadline: {
      type: Date,
    },
    internalNotes: {
      type: String,
      default: ""
    },
    total_interview_rounds: {
      type: Number,
      default: 1
    },
    commissionPercent: {
      type: Number,
      default: 8
    },
    resumeAnalysisPoints: {
      type: [String],
      default: []
    },
    isMPJob: {
      type: Boolean,
      default: false
    },
    // Created by an Employer Manager, and therefore theirs alone — excluded from
    // every cross-manager listing and from the marketplace. Platform admins still
    // see it, as they see everything.
    isEmployerPrivate: {
      type: Boolean,
      default: false,
    },
    // Created by a License Partner (manager User), and therefore worked only by
    // that partner's recruiters and hidden from Zepul's listings and the
    // marketplace. Null for Zepul's own jobs.
    licensePartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Published by a Zepul manager to the ProRecruiter marketplace. A listed job
    // is still an ordinary job owned by its manager — listing only makes it
    // visible to ProRecruiters, who can pick it up and work it themselves.
    marketplace: {
      isListed: { type: Boolean, default: false },
      listedAt: { type: Date, default: null },
      listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      // Share of the placement fee offered to whoever fills the role.
      commissionRate: { type: Number, default: null },
      // A listing stays open after a pick, so more than one ProRecruiter can
      // work the same requirement.
      pickedBy: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        pickedAt: { type: Date, default: Date.now },
      }],
    },

    mpSelectedCandidates:{
      type: Number,
      default: 0
    },
    mpRejectedCandidates:{
      type: Number,
      default: 0
    }
  },

  { timestamps: true }
);

export const Job = mongoose.model("Job", JobSchema);
