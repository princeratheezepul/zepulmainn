import express from "express";
import { marketplaceLogin, marketplaceRegister, talentScoutRegister, createTalentScoutByManager, getManagerTalentScouts, deleteTalentScoutByManager, marketplaceLogout, validateSession, getMarketplaceProfile, updateMarketplaceProfile, createTestUser, saveBankDetails, getMarketplaceBankDetails, deleteMarketplaceBankDetails, getAllJobs, searchJobs, toggleBookmark, getBookmarkedJobs, getJobDetails, getJobTalentScouts, addTalentScoutToJob, removeTalentScoutFromJob, pickJob, withdrawJob, saveMarketplaceResume, saveMarketplaceInterviewEvaluation, getMarketplaceCandidates, getMarketplaceResumeDetails, getPickedJobs, updateMarketplaceResume, getCandidatePipelineData, getTeamPerformanceData, createMarketplaceJobByMpUser } from "../controllers/marketplace.controller.js";
import { authenticateMarketplace } from "../middleware/marketplace.auth.middleware.js";

const router = express.Router();

// Public routes
router.post("/create-test-user", createTestUser);
router.post("/register", marketplaceRegister);
router.post("/talentscout/register", talentScoutRegister);
router.post("/login", marketplaceLogin);

// Protected routes
router.post("/create-talent-scout", authenticateMarketplace, createTalentScoutByManager);
router.post("/jobs/create", authenticateMarketplace, createMarketplaceJobByMpUser);
router.get("/talent-scouts", authenticateMarketplace, getManagerTalentScouts);
router.delete("/talent-scouts/:talentScoutId", authenticateMarketplace, deleteTalentScoutByManager);
router.post("/logout", authenticateMarketplace, marketplaceLogout);
router.get("/validate-session", authenticateMarketplace, validateSession);
router.get("/profile", authenticateMarketplace, getMarketplaceProfile);
router.put("/profile", authenticateMarketplace, updateMarketplaceProfile);
router.get("/bank-details", authenticateMarketplace, getMarketplaceBankDetails);
router.post("/bank-details", authenticateMarketplace, saveBankDetails);
router.delete("/bank-details/:bankDetailId", authenticateMarketplace, deleteMarketplaceBankDetails);
router.get("/jobs", authenticateMarketplace, getAllJobs);
router.get("/jobs/search", authenticateMarketplace, searchJobs);
router.get("/jobs/:jobId", authenticateMarketplace, getJobDetails);
router.get("/jobs/:jobId/talent-scouts", authenticateMarketplace, getJobTalentScouts);
router.post("/jobs/:jobId/talent-scouts", authenticateMarketplace, addTalentScoutToJob);
router.delete("/jobs/:jobId/talent-scouts/:talentScoutId", authenticateMarketplace, removeTalentScoutFromJob);
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
router.get("/candidate-pipeline", authenticateMarketplace, getCandidatePipelineData);
router.get("/team-performance", authenticateMarketplace, getTeamPerformanceData);

export default router;
