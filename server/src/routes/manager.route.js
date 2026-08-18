import { loginUser, logoutUser, registerUser, forgotpassword, resetpassword, changeEmail, changeEmailRequest, createJobm, getAllJobsm, updateJobm, assignedJobm, getManagerInfo, updatePassword, getManagerProfile, updateManagerProfile, createManagerByAdmin, validateSetPassword, setPassword, searchRecruitersByManager, refreshAccessToken, getMarketplaceMetrics, createMarketplaceCompany, getMarketplaceCompanies, getMarketplaceCompanyById, createMarketplaceJob, getMarketplaceJobsByCompany, getMarketplaceJobRoles, getMarketplaceJobById, getMarketplaceUserById, getManagerMarketplaceCandidates, getManagerMarketplaceResume, getAllMarketplaceJobs, createProRecruiterCompany } from '../controllers/manager.controller.js';
import { jobChat } from '../controllers/jobChat.controller.js';
import { createJobFromJD } from '../controllers/jobFromJD.controller.js';

import multer from 'multer';
import Router from 'express';
import { verifyJWT } from '../middleware/manager.auth.middleware.js';
import { verifyJWT as verifyAdminJWT } from '../middleware/admin.auth.middleware.js';
import { openAILimiter } from '../middleware/rateLimiters.js';
import { anyAuth } from '../middleware/anyAuth.middleware.js';
const router = Router();

// Job description upload for the "Upload JD" creation flow. Memory storage —
// the buffer only lives long enough to pull its text out; nothing is persisted.
const jdUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        const ok = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
        ];
        if (ok.includes(file.mimetype)) return cb(null, true);
        cb(new Error("Only PDF, DOCX or TXT files are allowed"), false);
    },
});

// Surface multer's own rejections (size/type) as JSON instead of a 500 stack.
const handleUploadErrors = (handler) => (req, res, next) =>
    handler(req, res, (err) => {
        if (!err) return next();
        const tooBig = err.code === "LIMIT_FILE_SIZE";
        return res
            .status(tooBig ? 413 : 415)
            .json({ message: tooBig ? "The file must be under 10MB." : err.message });
    });


router.route("/register").post(
    registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/forgot-password").post(forgotpassword);
router.route("/reset-password/:id/:token").post(resetpassword);

// Profile routes - these must come before the parameterized route
router.route("/profile").get(verifyJWT, getManagerProfile);
router.route("/profile").put(verifyJWT, updateManagerProfile);

router.route("/change-email-request").post(changeEmailRequest);
router.route("/change-email/:id/:token").post(changeEmail);

// Admin routes (admin authentication required)
router.route("/create-by-admin").post(verifyAdminJWT, createManagerByAdmin);

// Password set routes (public)
router.route("/validate-set-password/:id/:token").get(validateSetPassword);
router.route("/set-password/:id/:token").post(setPassword);

router.route("/create-job").post(verifyJWT, createJobm);
router.route("/job-chat").post(verifyJWT, openAILimiter, jobChat);
router.route("/job-from-jd").post(
    verifyJWT,
    openAILimiter,
    handleUploadErrors(jdUpload.single("jobDescription")),
    createJobFromJD
);
router.route("/get-jobs/:managerId").get(verifyJWT, getAllJobsm);
router.route("/job/:jobId").put(verifyJWT, updateJobm);
router.route("/assign-recruiter/:jobId").post(verifyJWT, assignedJobm);
router.route("/search-recruiters").get(searchRecruitersByManager);
router.route("/update-password").put(verifyJWT, updatePassword);
router.route("/marketplace-metrics").get(verifyJWT, getMarketplaceMetrics);
router.route("/create-marketplace-company").post(verifyJWT, createMarketplaceCompany);
router.route("/marketplace-companies").get(verifyJWT, getMarketplaceCompanies);
router.route("/marketplace-company/:companyId").get(verifyJWT, getMarketplaceCompanyById);
router.route("/marketplace-company/:companyId/jobs").get(verifyJWT, getMarketplaceJobsByCompany);
router.route("/create-marketplace-job").post(verifyJWT, createMarketplaceJob);
router.route("/marketplace-job-roles").get(verifyJWT, getMarketplaceJobRoles);
router.route("/marketplace-job/:jobId").get(verifyJWT, getMarketplaceJobById);
router.route("/marketplace-user/:userId").get(verifyJWT, getMarketplaceUserById);
router.route("/marketplace-job/:jobId/candidates").get(verifyJWT, getManagerMarketplaceCandidates);
router.route("/marketplace-resume/:resumeId").get(verifyJWT, getManagerMarketplaceResume);
router.route("/marketplace-jobs").get(verifyJWT, getAllMarketplaceJobs);
router.route("/create-prorecruiter-company").post(verifyJWT, createProRecruiterCompany);

// This route must come after all specific routes to avoid conflicts
router.route("/:managerId").get(anyAuth, getManagerInfo);

export default router;