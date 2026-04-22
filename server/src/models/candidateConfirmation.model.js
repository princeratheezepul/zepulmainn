import mongoose from 'mongoose';

const CandidateConfirmationSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResumeData', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume' },
  scorecardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scorecard' },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// MongoDB TTL index — auto-deletes documents after expiresAt
CandidateConfirmationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const CandidateConfirmation = mongoose.model('CandidateConfirmation', CandidateConfirmationSchema);
export default CandidateConfirmation;
