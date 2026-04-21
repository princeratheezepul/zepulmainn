import Scorecard from "../models/scorecard.model.js";
import ResumeData from "../models/resumeData.model.js";
import nodemailer from "nodemailer";
import { generateTextWithRetry } from "./bulkUpload.controller.js";

export const savescorecard = async (req, res) => {
  try {
    console.log("recieved", req.body);
    const {
      candidateId,
      resume,
      answers,
      averageScore,
      skillScores,
      evaluatedAnswers,
      jobId,
      resumeDataId
    } = req.body;

    const scorecard = new Scorecard({
      candidateId,
      resume,
      answers,
      averageScore,
      skillScores,
      evaluatedAnswers,
      jobId,
      resumeId: resumeDataId || undefined,
      submittedAt: new Date()
    });

    await scorecard.save();

    // If resumeDataId is provided, update the ResumeData with the scorecardId
    if (resumeDataId) {
      await ResumeData.findByIdAndUpdate(resumeDataId, { scorecardId: scorecard._id });
      console.log("Linked ResumeData", resumeDataId, "with Scorecard", scorecard._id);
    }

    res.status(200).json({ success: true, message: "Scorecard saved successfully.", scorecardId: scorecard._id });
  } catch (err) {
    console.error("Error saving scorecard:", err);
    res.status(500).json({ success: false, message: "Failed to save scorecard." });
  }
}

export const getscorecard = async (req, res) => {
  try {
    const scorecards = await Scorecard.find();
    res.status(200).json(scorecards);
  } catch (err) {
    console.error("Error fetching scorecards:", err);
    res.status(500).json({ success: false, message: "Failed to fetch scorecards." });
  }
}

export const updatescorecard = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Find the scorecard by ID and update fields passed in request body
    const updatedScorecard = await Scorecard.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedScorecard) {
      return res.status(404).json({ message: 'Scorecard not found' });
    }

    res.json({
      message: 'Scorecard updated successfully',
      scorecard: updatedScorecard,
    });
  } catch (err) {
    console.error('Error updating scorecard:', err);
    res.status(500).json({ message: 'Server error while updating scorecard' });
  }
}

const sendAnotherRoundEmail = async (toEmail, managerName,) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  if (!toEmail || typeof toEmail !== "string" || !toEmail.includes("@")) {
    throw new Error(`Invalid recipient email: ${toEmail}`);
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Request for another round of interview',
    html: `
      <p>Hello,</p>
      <p>You have been requested for another round of interview by manager <strong>${managerName}</strong>.</p>
      <p>Please login to your account using your credentials.</p>
    `,
  };
  console.log(mailOptions)
  await transporter.sendMail(mailOptions);
};

export const emailforanotherround = async (req, res) => {
  const { toEmail, managerName } = req.body;

  try {
    await sendAnotherRoundEmail(toEmail, managerName);
    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: 'Failed to send email', error: error.message });
  }
};

export const parseAIQuestions = async (req, res) => {
  const { skills, promptPayload } = req.body;
  if (!skills && !promptPayload) return res.status(400).json({ success: false, message: "Skills or custom prompt payload required" });

  try {
    const prompt = promptPayload || `Generate five unique and realistic interview questions for the job role: Full Stack Developer, considering the following skills: ${skills.join(",")}.\nMake the questions relevant to real-world tasks and challenges.`;
    const text = await generateTextWithRetry(prompt, "gemini-1.5-flash");

    // Attempt to parse JSON if the custom AI payload requests it
    if (promptPayload && text.includes('[') && text.includes(']')) {
      try {
        const cleanedText = text.replace(/```json|```/g, "").trim();
        const parsedQuestions = JSON.parse(cleanedText);
        return res.status(200).json({ questions: parsedQuestions });
      } catch (err) {
        console.warn("Could not parse AI JSON output", err);
      }
    }

    const rawLines = text.split("\n").filter(line => line.trim() !== "");
    const parsedQuestions = rawLines.map(line => line.replace(/^\d+\.\s*/, "")).filter(q => q.length > 0);
    res.status(200).json({ questions: parsedQuestions });
  } catch (error) {
    console.error("Error generating AI questions:", error);
    res.status(500).json({ success: false, message: "Failed to generate AI questions" });
  }
};

export const parseTopSkills = async (req, res) => {
  const { resume } = req.body;

  if (!resume) return res.status(400).json({ success: false, message: "Resume required" });

  try {
    const prompt = `
Extract the top 5 most relevant technical skills from the following resume data for the job role "Full Stack Developer".
Respond with a comma - separated list only:
Resume Data:
${JSON.stringify(resume)}
  `;
    const text = await generateTextWithRetry(prompt, "gemini-1.5-flash");

    const skillsArray = text.split(",").map(skill => skill.trim()).filter(skill => skill);
    res.status(200).json({ skills: skillsArray.slice(0, 5) });
  } catch (error) {
    console.error("Error fetching top skills:", error);
    res.status(500).json({ success: false, message: "Failed to extract skills" });
  }
};

export const evaluateAnswers = async (req, res) => {
  const { answers, skillsArray } = req.body;

  try {
    const evaluatedAnswers = await Promise.all(answers.map(async (answer, index) => {
      if (!answer || answer.length < 10) return { type: null, scores: [], total: 0 };

      const evalPrompt = `
      You are an interviewer assessing a candidate for the Full Stack Developer role.
      Evaluate the following response and provide a JSON output with:
  - type: either "technical", "practical", or "challenge"
    - scores: if the question is technical, provide a score for each skill in the format: terminology used: 20 % , process explained: 30 %, tool usage accuracy: 30 % and logical flow: 20 % ...... else if the question is practical, provide a score for each skill in the format: problem solution clarity: 40 % , relevance to job context: 30 %, outcome and results shared: 30 % ...... else if the question is challenge, provide a score for each skill in the format: depth of explaination: 40 % , real world applicability: 30 %, confidence in response : 30 %
      - total: weighted average score

  Response:
  "${answer}"`;

      const evalText = await generateTextWithRetry(evalPrompt, "gemini-1.5-flash");

      try {
        const cleanedEvalText = evalText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanedEvalText);
        if (parsed && parsed.type && parsed.scores && parsed.total !== undefined) {
          return parsed;
        } else {
          return { type: null, scores: [], total: 0 };
        }
      } catch (parseErr) {
        return { type: null, scores: [], total: 0 };
      }
    }));

    const skillScorePrompt = `
    Given the following top skills: ${skillsArray.join(", ")}

    Based on this candidate's answers:
    ${answers.map((a, i) => `Q${i + 1}: ${a}`).join("\\n\\n")}

    Evaluate each skill on a scale of 0 to 100 and respond with a JSON array like based on the previous answers given by the candidate:
    [
      { "skill": "JavaScript", "score": 0 },
      ...
    ]`;

    const skillScoreText = await generateTextWithRetry(skillScorePrompt, "gemini-1.5-flash");

    let finalSkillScores = [];
    try {
      let cleanedSkillScoreText = skillScoreText.replace(/```json|```/g, '').trim();
      const jsonStart = cleanedSkillScoreText.indexOf('[');
      const jsonEnd = cleanedSkillScoreText.lastIndexOf(']');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        cleanedSkillScoreText = cleanedSkillScoreText.substring(jsonStart, jsonEnd + 1);
      }

      const parsedSkillScores = JSON.parse(cleanedSkillScoreText);

      if (Array.isArray(parsedSkillScores) && parsedSkillScores.every(item => item.skill && typeof item.score === 'number')) {
        finalSkillScores = skillsArray.map(skill => {
          const match = parsedSkillScores.find(item => item.skill.toLowerCase() === skill.toLowerCase());
          return { skill, score: match ? match.score : 0 };
        });
      }
    } catch (err) {
      console.warn("Skill score parsing failed, returning empty.");
    }

    res.status(200).json({ evaluatedAnswers, skillScores: finalSkillScores });
  } catch (error) {
    console.error("Error evaluating answers:", error);
    res.status(500).json({ success: false, message: "Failed to evaluate answers" });
  }
};
