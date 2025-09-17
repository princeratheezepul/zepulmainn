import {loginUser, logoutUser, registerUser,forgotpassword,resetpassword,changeEmail,changeEmailRequest,createJobm,getAllJobsm,updateJobm,assignedJobm,getManagerInfo,updatePassword,getManagerProfile,updateManagerProfile,createManagerByAdmin,validateSetPassword,setPassword,searchRecruitersByManager,refreshAccessToken,getMarketplaceMetrics,createMarketplaceCompany,getMarketplaceCompanies,getMarketplaceCompanyById,createMarketplaceJob,getMarketplaceJobsByCompany,getMarketplaceJobRoles,getMarketplaceJobById,getMarketplaceUserById,getManagerMarketplaceCandidates,getManagerMarketplaceResume,getAllMarketplaceJobs} from '../controllers/manager.controller.js';

import Router from 'express';
import { verifyJWT } from '../middleware/manager.auth.middleware.js';
import { verifyJWT as verifyAdminJWT } from '../middleware/admin.auth.middleware.js';
const router=Router();


router.route("/register").post(
    registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser);
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

router.route("/create-job").post(verifyJWT,createJobm);
router.route("/get-jobs/:managerId").get(verifyJWT, getAllJobsm);
router.route("/job/:jobId").put(verifyJWT, updateJobm);
router.route("/assign-recruiter/:jobId").post(verifyJWT, assignedJobm);
router.route("/search-recruiters").get(searchRecruitersByManager);
router.route("/update-password").put(verifyJWT,updatePassword);
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

// This route must come after all specific routes to avoid conflicts
router.route("/:managerId").get(getManagerInfo);

export default router;