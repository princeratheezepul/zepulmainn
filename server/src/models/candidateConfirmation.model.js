import mongoose from 'mongoose';

const CandidateConfirmationSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  // Set for ZepDB submissions; recruiter uploads have only a resumeId.
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResumeData' },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  scorecardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scorecard' },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  // What accepting kicks off. 'codingTest' sends the coding assessment for resumeId.
  nextStep: { type: String, enum: ['none', 'codingTest'], default: 'none' },
  phone: String,
  countryCode: String,
  respondedAt: Date,
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// MongoDB TTL index — auto-deletes documents after expiresAt
CandidateConfirmationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CandidateConfirmation = mongoose.model('CandidateConfirmation', CandidateConfirmationSchema);
export default CandidateConfirmation;
