import express from "express";
import { saveResumeData, getResumeData } from "../controllers/resumeData.controller.js";

const router = express.Router();

router.post("/save", saveResumeData);
router.get("/:id", getResumeData);

export default router;
