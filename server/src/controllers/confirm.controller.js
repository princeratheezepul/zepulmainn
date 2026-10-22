import CandidateConfirmation from '../models/candidateConfirmation.model.js';
import ResumeData from '../models/resumeData.model.js';
import Resume from '../models/resume.model.js';
import { Job } from '../models/job.model.js';
import { notifyCandidateOfCodingTest } from './resume.controller.js';

// ZepDB confirmations point at a ResumeData profile; recruiter uploads only at a Resume.
const loadCandidate = async (confirmation) => {
  if (confirmation.candidateId) {
    const c = await ResumeData.findById(confirmation.candidateId).lean();
    if (c) {
      return {
        name: c.name,
        role: c.role,
        email: c.emailId,
        phone: c.phone,
        countryCode: c.countryCode,
        skills: c.skills,
        experienceYears: c.experienceYears,
      };
    }
  }
  if (!confirmation.resumeId) return null;
  const r = await Resume.findById(confirmation.resumeId).lean();
  if (!r) return null;
  return {
    name: r.name,
    role: r.title,
    email: r.email,
    phone: r.phone,
    countryCode: r.countryCode,
    skills: r.skills,
    experienceYears: parseFloat(r.experience) || null,
  };
};

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
      loadCandidate(confirmation),
      Job.findById(confirmation.jobId).lean(),
    ]);

    if (!candidate || !job) {
      return res.status(404).json({ success: false, message: 'Candidate or job not found.' });
    }

    res.status(200).json({
      success: true,
      status: confirmation.status,
      candidate,
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
    const phone = String(req.body.phone || '').replace(/\D/g, '');
    const countryCode = String(req.body.countryCode || '91').replace(/\D/g, '') || '91';

    if (!['yes', 'no'].includes(response)) {
      return res.status(400).json({ success: false, message: 'Response must be "yes" or "no".' });
    }

    if (response === 'yes' && (phone.length < 7 || phone.length > 15)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
    }

    const existing = await CandidateConfirmation.findOne({ token });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Link not found or has expired.' });
    }

    if (new Date() > existing.expiresAt) {
      return res.status(410).json({ success: false, message: 'This confirmation link has expired.' });
    }

    // Conditional on 'pending' so a double-click can't send the coding test twice.
    const status = response === 'yes' ? 'accepted' : 'declined';
    const confirmation = await CandidateConfirmation.findOneAndUpdate(
      { token, status: 'pending' },
      {
        status,
        respondedAt: new Date(),
        ...(response === 'yes' ? { phone, countryCode } : {}),
      },
      { new: true }
    );

    if (!confirmation) {
      const current = (await CandidateConfirmation.findOne({ token }).lean())?.status || existing.status;
      return res.status(409).json({
        success: false,
        message: `You have already responded: ${current}.`,
        status: current,
      });
    }

    if (confirmation.nextStep === 'codingTest' && confirmation.resumeId) {
      await Resume.findByIdAndUpdate(confirmation.resumeId, {
        'roleConfirmation.status': status,
        'roleConfirmation.respondedAt': confirmation.respondedAt,
        ...(response === 'yes' ? { phone, countryCode } : {}),
      });
      // Fire-and-forget: AI question generation takes ~30-90s.
      if (response === 'yes') notifyCandidateOfCodingTest(confirmation.resumeId);
    }

    res.status(200).json({
      success: true,
      status: confirmation.status,
      message: response === 'yes'
        ? confirmation.nextStep === 'codingTest'
          ? 'Great! Your interest has been confirmed. Your coding test link will arrive by email shortly.'
          : 'Great! Your interest has been confirmed. Our team will reach out to you shortly.'
        : 'Thank you for letting us know. We will keep your profile for future opportunities.',
    });
  } catch (error) {
    console.error('Confirmation submit error:', error);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};
