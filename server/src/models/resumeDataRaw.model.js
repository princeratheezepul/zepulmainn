import mongoose from 'mongoose';

const ResumeDataRawSchema = new mongoose.Schema(
    {
        filterResumeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ResumeData'
        }
    },
    {
        timestamps: true,
        strict: false  // allows any additional fields to be stored freely
    }
);

const ResumeDataRaw = mongoose.model('ResumeDataRaw', ResumeDataRawSchema);
export default ResumeDataRaw;
