import CandidateConfirmation from '../models/candidateConfirmation.model.js';
import ResumeData from '../models/resumeData.model.js';
import { Job } from '../models/job.model.js';

export const getConfirmationDetails = async (req, res) => {
  try {
    const { token } = req.params;

    const confirmation = await CandidateConfirmation.findOne({ token });

    if (!confirmation) {
      return res.status(404).json({ success: false, message: 'Link not found or has expired.' });
    }

    if (new Date() > confirmation.expiresAt) {
      return res.status(410).json({ success: false, message: 'This confirmation link has expired.' });
    }

    const [candidate, job] = await Promise.all([
      ResumeData.findById(confirmation.candidateId).lean(),
      Job.findById(confirmation.jobId).lean(),
    ]);

    if (!candidate || !job) {
      return res.status(404).json({ success: false, message: 'Candidate or job not found.' });
    }

    res.status(200).json({
      success: true,
      status: confirmation.status,
      candidate: {
        name: candidate.name,
        role: candidate.role,
        email: candidate.emailId,
        phone: candidate.phone,
        countryCode: candidate.countryCode,
        skills: candidate.skills,
        experienceYears: candidate.experienceYears,
      },
      job: {
        title: job.jobtitle,
        company: job.company,
        location: job.location,
        type: job.type,
        employmentType: job.employmentType,
        salary: job.salary,
        experience: job.experience,
        description: job.description,
        keyResponsibilities: job.keyResponsibilities,
        preferredQualifications: job.preferredQualifications,
        skills: job.skills,
        hiringDeadline: job.hiringDeadline,
      },
    });
  } catch (error) {
    console.error('Confirmation fetch error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};

export const submitConfirmationResponse = async (req, res) => {
  try {
    const { token } = req.params;
    const { response } = req.body; // 'yes' or 'no'

    if (!['yes', 'no'].includes(response)) {
      return res.status(400).json({ success: false, message: 'Response must be "yes" or "no".' });
    }

    const confirmation = await CandidateConfirmation.findOne({ token });

    if (!confirmation) {
      return res.status(404).json({ success: false, message: 'Link not found or has expired.' });
    }

    if (new Date() > confirmation.expiresAt) {
      return res.status(410).json({ success: false, message: 'This confirmation link has expired.' });
    }

    if (confirmation.status !== 'pending') {
      return res.status(409).json({
        success: false,
        message: `You have already responded: ${confirmation.status}.`,
        status: confirmation.status,
      });
    }

    confirmation.status = response === 'yes' ? 'accepted' : 'declined';
    await confirmation.save();

    res.status(200).json({
      success: true,
      status: confirmation.status,
      message: response === 'yes'
        ? 'Great! Your interest has been confirmed. Our team will reach out to you shortly.'
        : 'Thank you for letting us know. We will keep your profile for future opportunities.',
    });
  } catch (error) {
    console.error('Confirmation submit error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};
