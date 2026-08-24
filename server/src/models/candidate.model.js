import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      default: '',
    },
    resumeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResumeDataRaw',
    },
    address: {
      type: String,
      default: '',
    },
    // The candidate's own resume, mapped to their profile and managed from the
    // candidate dashboard. Uploading again replaces what's here. `parsed` is the
    // AI reading of `text` and may be null if the parse was unavailable.
    resume: {
      fileName: { type: String, default: '' },
      text: { type: String, default: '' },
      parsed: { type: mongoose.Schema.Types.Mixed, default: null },
      updatedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Candidate', candidateSchema);
