import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const DB_URL = process.env.DB_URL;

const ResumeSchema = new mongoose.Schema({}, { strict: false });
const Resume = mongoose.model('Resume', ResumeSchema, 'resumes');

async function updateScore() {
    await mongoose.connect(DB_URL);
    console.log('Connected to MongoDB');

    const jobId = '69a0175129e5dfc1d6153f1e';
    const candidateName = 'SAI PAVAN MIRYALA';
    const newScore = 83;

    // Find the candidate by name (case-insensitive) and jobId
    const query = {
        jobId: new mongoose.Types.ObjectId(jobId),
        name: { $regex: new RegExp(candidateName, 'i') }
    };

    const candidates = await Resume.find(query);
    console.log(`Found ${candidates.length} candidate(s) matching "${candidateName}" for job ${jobId}`);

    if (candidates.length === 0) {
        // Try broader search
        const allForJob = await Resume.find({ jobId: new mongoose.Types.ObjectId(jobId) }, { name: 1, score: 1, totalscore: 1 });
        console.log('All candidates for this job:');
        allForJob.forEach(c => console.log(` - ${c.name}: score=${c.score}, totalscore=${c.totalscore}`));
    } else {
        for (const candidate of candidates) {
            console.log(`Updating: ${candidate.name}, current score=${candidate.score}, totalscore=${candidate.totalscore}`);
            await Resume.findByIdAndUpdate(candidate._id, {
                $set: { score: newScore, totalscore: newScore }
            });
            console.log(`Updated ${candidate.name} to score=${newScore}, totalscore=${newScore}`);
        }
    }

    await mongoose.disconnect();
    console.log('Done.');
}

updateScore().catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
});
