import express from "express";
import { marketplaceLogin, marketplaceRegister, getMarketplaceProfile, updateMarketplaceProfile, createTestUser, saveBankDetails, getMarketplaceBankDetails, deleteMarketplaceBankDetails, getAllJobs, searchJobs, toggleBookmark, getBookmarkedJobs, getJobDetails, pickJob, withdrawJob, saveMarketplaceResume, saveMarketplaceInterviewEvaluation, getMarketplaceCandidates, getMarketplaceResumeDetails, getPickedJobs, updateMarketplaceResume } from "../controllers/marketplace.controller.js";
import { authenticateMarketplace } from "../middleware/marketplace.auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/create-test-user", createTestUser);
router.post("/register", marketplaceRegister);
router.post("/login", marketplaceLogin);

// Protected routes
router.get("/profile", authenticateMarketplace, getMarketplaceProfile);
router.put("/profile", authenticateMarketplace, updateMarketplaceProfile);
router.get("/bank-details", authenticateMarketplace, getMarketplaceBankDetails);
router.post("/bank-details", authenticateMarketplace, saveBankDetails);
router.delete("/bank-details/:bankDetailId", authenticateMarketplace, deleteMarketplaceBankDetails);
router.get("/jobs", authenticateMarketplace, getAllJobs);
router.get("/jobs/search", authenticateMarketplace, searchJobs);
router.get("/jobs/:jobId", authenticateMarketplace, getJobDetails);
router.get("/bookmarked-jobs", authenticateMarketplace, getBookmarkedJobs);
router.get("/picked-jobs", authenticateMarketplace, getPickedJobs);
router.post("/bookmark", authenticateMarketplace, toggleBookmark);
router.post("/pick-job", authenticateMarketplace, pickJob);
router.post("/withdraw-job", authenticateMarketplace, withdrawJob);
router.post("/resumes/save/:jobId", authenticateMarketplace, saveMarketplaceResume);
router.post("/resumes/:resumeId/save-interview-evaluation", authenticateMarketplace, saveMarketplaceInterviewEvaluation);
router.get("/jobs/:jobId/candidates", authenticateMarketplace, getMarketplaceCandidates);
router.get("/resumes/:resumeId", authenticateMarketplace, getMarketplaceResumeDetails);
router.patch("/resumes/:resumeId", authenticateMarketplace, updateMarketplaceResume);

export default router;
