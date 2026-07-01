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
  },
  { timestamps: true }
);

export default mongoose.model('Candidate', candidateSchema);
