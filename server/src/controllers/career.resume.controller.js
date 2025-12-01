// @desc Save resume from public career page (no authentication required)
export const savePublicCareerResume = async (req, res) => {
    try {
        console.log("Received request to save career resume with jobId:", req.params.jobId);
        console.log("Resume data keys:", Object.keys(req.body));

        const resumeData = req.body;
        const { jobId } = req.params;

        if (!jobId) {
            return res.status(400).json(
                new ApiResponse(400, null, "JobId is required")
            );
        }

        // Validate if jobId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json(
                new ApiResponse(400, null, "Invalid jobId format")
            );
        }

        // Fetch job details to determine tag (use MpJob for marketplace/career jobs)
        const job = await MpJob.findById(jobId);
        if (!job) {
            return res.status(404).json(
                new ApiResponse(404, null, "Job not found")
            );
        }

        // Determine tag based on job title and description
        const tag = determineResumeTag(job.jobTitle, job.jobDescription);
        console.log("Determined tag:", tag);

        // Create resume object for career application
        const resumeObject = {
            jobId,
            tag,
            isCareer: true, // Mark as career page application
            isMarketplace: true, // Mark as marketplace job
            ...resumeData,
        };

        console.log("Career resume object to save");

        const newResume = new Resume(resumeObject);

        console.log("Creating new career resume document");

        let saved;
        try {
            saved = await newResume.save();
            console.log("Career resume saved successfully:", saved._id);
        } catch (saveError) {
            console.error("Error saving resume to database:", saveError);
            if (saveError.name === 'ValidationError') {
                console.error("Validation errors:", saveError.errors);
                return res.status(400).json(
                    new ApiResponse(400, null, `Validation error: ${saveError.message}`)
                );
            }
            throw saveError;
        }

        // Increment totalApplications for the MpJob
        await MpJob.findByIdAndUpdate(jobId, { $inc: { totalApplications: 1 } });

        // Add resume to job's candidateList (for MpJob)
        try {
            const mpJob = await MpJob.findById(jobId);
            if (mpJob) {
                const resumeObjectId = new mongoose.Types.ObjectId(saved._id);
                if (!mpJob.candidateList.some(id => id.toString() === resumeObjectId.toString())) {
                    mpJob.candidateList.push(resumeObjectId);
                    await mpJob.save();
                    console.log("Resume added to MpJob candidateList");
                } else {
                    console.log("Resume already exists in candidateList");
                }
            }
        } catch (mpJobError) {
            console.error("Error updating MpJob candidateList:", mpJobError);
            // Don't fail the request if this fails, just log the error
        }

        // Increment candidatesCount for the company (first company in mpCompanies array)
        try {
            const mpJob = await MpJob.findById(jobId);
            if (mpJob && mpJob.mpCompanies && mpJob.mpCompanies.length > 0) {
                const companyId = mpJob.mpCompanies[0];
                const company = await MpCompany.findById(companyId);
                if (company) {
                    company.candidatesCount = (company.candidatesCount || 0) + 1;
                    await company.save();
                    console.log("Company candidatesCount incremented for company:", companyId);
                }
            }
        } catch (companyError) {
            console.error("Error updating MpCompany candidatesCount:", companyError);
            // Don't fail the request if this fails, just log the error
        }

        res.status(201).json(
            new ApiResponse(201, { resume: saved }, "Application submitted successfully")
        );
    } catch (err) {
        console.error("Error saving career resume:", err);
        res.status(500).json(
            new ApiResponse(500, null, "Failed to submit application")
        );
    }
};
