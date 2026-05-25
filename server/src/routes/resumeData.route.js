import express from "express";
import { saveResumeData, getResumeData } from "../controllers/resumeData.controller.js";
import { anyAuth } from "../middleware/anyAuth.middleware.js";

const router = express.Router();

router.post("/save", anyAuth, saveResumeData);
router.get("/:id", anyAuth, getResumeData);

export default router;
