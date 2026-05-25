import express from "express";
import { savescorecard, getscorecard, updatescorecard, emailforanotherround, parseAIQuestions, parseTopSkills, evaluateAnswers } from "../controllers/scorecard.controller.js";
import { anyAuth } from "../middleware/anyAuth.middleware.js";
import { openAILimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/save-scorecard", anyAuth, savescorecard);
router.get("/get-scorecard", anyAuth, getscorecard);
router.patch("/update/:id", anyAuth, updatescorecard);
router.post("/reqanotherround", anyAuth, emailforanotherround);
router.post("/ai-questions", anyAuth, openAILimiter, parseAIQuestions);
router.post("/ai-skills", anyAuth, openAILimiter, parseTopSkills);
router.post("/evaluate-answers", anyAuth, openAILimiter, evaluateAnswers);

export default router;
