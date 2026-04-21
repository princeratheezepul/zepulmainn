import express from "express";
import { savescorecard, getscorecard, updatescorecard, emailforanotherround, parseAIQuestions, parseTopSkills, evaluateAnswers } from "../controllers/scorecard.controller.js";

const router = express.Router();

router.post("/save-scorecard", savescorecard);
router.get("/get-scorecard", getscorecard);
router.patch("/update/:id", updatescorecard);
router.post("/reqanotherround", emailforanotherround);
router.post("/ai-questions", parseAIQuestions);
router.post("/ai-skills", parseTopSkills);
router.post("/evaluate-answers", evaluateAnswers);

export default router;
