import { GoogleGenerativeAI } from "@google/generative-ai";
import Resume from "../models/resume.model.js";
import { Job } from "../models/job.model.js";
import crypto from 'crypto';
import nodemailer from "nodemailer";
import { executeJava } from "../services/codeExecution.service.js";

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API);

const sendAssessmentEmail = async (toEmail, candidateName, assessmentLink, jobTitle) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  if (!toEmail || typeof toEmail !== "string" || !toEmail.includes("@")) {
    console.error(`Invalid recipient email: ${toEmail}`);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: `Coding Assessment Invitation for ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Coding Assessment Invitation</h2>
        <p>Dear ${candidateName},</p>
        <p>You have been invited to take a coding assessment for the <strong>${jobTitle}</strong> position.</p>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p>Please click the link below to start the assessment:</p>
          <a href="${assessmentLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Assessment</a>
          <p style="margin-top: 10px; font-size: 12px; color: #64748b;">Or copy this link: ${assessmentLink}</p>
        </div>
        <p>The assessment is designed to take approximately 30-45 minutes.</p>
        <p>Best regards,<br>Recruitment Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// @desc Generate a coding assessment based on job description
export const generateAssessment = async (req, res) => {
  try {
    const { resumeId } = req.body;

    const resume = await Resume.findById(resumeId).populate('jobId');
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const job = resume.jobId;

    let questionData;

    // Try AI generation first with timeout
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const prompt = `
Generate 3 DISTINCT coding problems suitable for a ${job.jobtitle} role.

Job Description: ${job.description || 'General software development position'}
Required Skills: ${job.requiredSkills ? job.requiredSkills.join(", ") : 'Programming, Problem Solving'}

The problems should:
1. Be algorithmic function challenges (NOT full web applications or APIs)
2. Be relevant to the job role but solvable as pure functions
3. Be strictly in **JavaScript**
4. Vary in difficulty (Easy, Medium, Medium/Hard)

Return ONLY a valid JSON array of objects in this EXACT format (no markdown, no code blocks):
[
  {
    "title": "Problem Title",
    "description": "Detailed problem description. Use \\n for line breaks.",
    "difficulty": "Easy",
    "constraints": "Time and space constraints",
    "functionName": "nameOfFunctionToCall",
    "examples": [
      {
        "input": [arg1, arg2], // Array of arguments to pass to function
        "output": "Expected return value",
        "explanation": "Why this output is correct"
      }
    ]
  },
  ...
]
      `.trim();

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 25000))
      ]);

      const response = await result.response;
      const text = response.text();
      const cleanedText = text.replace(/```json|```/g, "").trim();
      questionData = JSON.parse(cleanedText);

      if (!Array.isArray(questionData)) {
        questionData = [questionData]; // Handle case where AI returns single object
      }

      console.log("✓ AI generated questions:", questionData.length);
    } catch (aiError) {
      console.log("AI generation failed, using fallback:", aiError.message);

      // Fallback to a role-appropriate default questions
      const roleKeywords = job.jobtitle.toLowerCase();

      if (roleKeywords.includes('frontend') || roleKeywords.includes('react') || roleKeywords.includes('ui')) {
        questionData = [
          {
            title: "Component State Management",
            description: "Implement a function `manageTodos` that manages a list of todos. The function takes the current list and an action object.\n\nAction types:\n- 'ADD': { type: 'ADD', payload: { id, text } }\n- 'REMOVE': { type: 'REMOVE', payload: id }\n- 'TOGGLE': { type: 'TOGGLE', payload: id }\n\nReturn the updated list.",
            difficulty: "Medium",
            constraints: "Should handle edge cases like duplicate IDs, empty text, etc.",
            functionName: "manageTodos",
            examples: [
              {
                input: [[], { type: 'ADD', payload: { id: 1, text: 'Learn React' } }],
                output: [{ id: 1, text: 'Learn React', completed: false }],
                explanation: "Adds the new todo to empty list"
              }
            ]
          },
          {
            title: "Flatten Array",
            description: "Implement a function `flatten` that takes a nested array and returns a flat array with all elements.",
            difficulty: "Easy",
            constraints: "Depth can be arbitrary.",
            functionName: "flatten",
            examples: [
              {
                input: [[1, [2, [3, 4], 5]]],
                output: [1, 2, 3, 4, 5],
                explanation: "Flattens nested arrays"
              }
            ]
          },
          {
            title: "Debounce Function",
            description: "Implement a debounce function that limits the rate at which a function can fire.",
            difficulty: "Medium",
            constraints: "Must handle 'this' context and arguments correctly.",
            functionName: "debounce",
            examples: [] // Hard to test with simple input/output, might need custom eval logic or skip
          }
        ];
      } else {
        // Default fallback
        questionData = [
          {
            title: "Two Sum",
            description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
            difficulty: "Easy",
            constraints: "Only one valid answer exists.",
            functionName: "twoSum",
            examples: [
              {
                input: [[2, 7, 11, 15], 9],
                output: [0, 1],
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
              }
            ]
          },
          {
            title: "Valid Palindrome",
            description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\nGiven a string s, return true if it is a palindrome, or false otherwise.",
            difficulty: "Easy",
            constraints: "1 <= s.length <= 2 * 10^5",
            functionName: "isPalindrome",
            examples: [
              {
                input: ["A man, a plan, a canal: Panama"],
                output: true,
                explanation: "amanaplanacanalpanama is a palindrome."
              }
            ]
          },
          {
            title: "Longest Substring Without Repeating Characters",
            description: "Given a string s, find the length of the longest substring without repeating characters.",
            difficulty: "Medium",
            constraints: "0 <= s.length <= 5 * 10^4",
            functionName: "lengthOfLongestSubstring",
            examples: [
              {
                input: ["abcabcbb"],
                output: 3,
                explanation: "The answer is 'abc', with the length of 3."
              }
            ]
          }
        ];
      }
    }

    // Generate a unique assessment ID
    const assessmentId = crypto.randomBytes(16).toString('hex');

    // Update Resume with the generated question
    await Resume.findByIdAndUpdate(
      resumeId,
      {
        oa: {
          scheduled: true,
          assessmentId: assessmentId,
          status: 'invited',
          inviteDate: new Date(),
          questions: questionData
        }
      },
      { new: true }
    );

    const assessmentLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/assessment/${assessmentId}`;

    // Send email to candidate
    if (resume.email) {
      try {
        await sendAssessmentEmail(
          resume.email,
          resume.name,
          assessmentLink,
          job.jobtitle
        );
      } catch (emailError) {
        console.error("Failed to send assessment email:", emailError);
      }
    }

    res.status(200).json({
      message: "Assessment generated successfully",
      assessmentId: assessmentId,
      link: `/assessment/${assessmentId}`,
      questions: questionData
    });

  } catch (error) {
    console.error("Error generating assessment:", error);
    res.status(500).json({ message: "Failed to generate assessment", error: error.message });
  }
};

// @desc Get assessment details (for candidate)
export const getAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    const resume = await Resume.findOne({ "oa.assessmentId": assessmentId });

    if (!resume) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    if (resume.oa.status === 'completed' || resume.oa.status === 'evaluated') {
      return res.status(400).json({ message: "Assessment already completed" });
    }

    res.status(200).json({
      candidateName: resume.name,
      questions: resume.oa.questions
    });

  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({ message: "Failed to fetch assessment" });
  }
};

// @desc Submit assessment solution
export const submitAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const { submissions } = req.body; // Expecting array of { questionIndex, code, language }

    const resume = await Resume.findOne({ "oa.assessmentId": assessmentId });
    if (!resume) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Update status to completed
    await Resume.findOneAndUpdate(
      { "oa.assessmentId": assessmentId },
      {
        "oa.status": "completed",
        "oa.completionDate": new Date(),
        "oa.submissions": submissions.map(s => ({
          ...s,
          submittedAt: new Date()
        }))
      }
    );

    // Trigger AI Evaluation (Async)
    evaluateSubmission(resume._id, submissions, resume.oa.questions);

    res.status(200).json({ message: "Assessment submitted successfully" });

  } catch (error) {
    console.error("Error submitting assessment:", error);
    res.status(500).json({ message: "Failed to submit assessment" });
  }
};

// @desc Run code (Test execution)
export const runCode = async (req, res) => {
  try {
    const { code, language, questionIndex } = req.body;
    const { assessmentId } = req.params;

    const resume = await Resume.findOne({ "oa.assessmentId": assessmentId });
    if (!resume) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const question = resume.oa.questions[questionIndex];
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (language === 'java') {
      const result = await executeJava(code, question.examples, question.functionName);
      return res.status(200).json(result);
    }

    // Fallback for JS (still client-side for now, or we could move it here too)
    // For now, if frontend sends JS here, we can just return a message saying "Run locally"
    // or implement JS execution via Piston too.
    // Let's assume frontend handles JS locally for now as per plan.
    return res.status(400).json({ message: "Language not supported for backend execution" });

  } catch (error) {
    console.error("Error running code:", error);
    res.status(500).json({ message: "Failed to run code", error: error.message });
  }
};

// @desc AI Evaluation Logic (Internal Helper)
const evaluateSubmission = async (resumeId, submissions, questions) => {
  try {
    console.log("Starting evaluation for resume:", resumeId);

    let totalScore = 0;
    let totalPassedTests = 0;
    let totalTests = 0;
    let feedbackParts = [];

    // Evaluate each question
    // Evaluate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      const submission = submissions.find(s => s.questionIndex === i);
      const code = submission ? submission.code : "";
      const language = submission ? submission.language : "javascript";

      console.log(`Evaluating Question ${i + 1}: ${question.title}, Language: ${language}`);

      // Step 1: Check for meaningful implementation
      const codeWithoutComments = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
      const hasActualCode = codeWithoutComments.length > 5; // Relaxed check

      if (!hasActualCode) {
        console.log(`Question ${i + 1}: Code too short.`);
        feedbackParts.push(`Question ${i + 1}: No meaningful solution provided.`);
        continue;
      }

      // Step 2: Execute tests
      let passedTests = 0;
      const examples = question.examples || [];

      if (language === 'java') {
        const result = await executeJava(code, examples, question.functionName);
        passedTests = result.results.filter(r => r.passed).length;
      } else {
        // JavaScript Evaluation
        for (let j = 0; j < examples.length; j++) {
          const example = examples[j];
          try {
            console.log(`Test Case ${j + 1} Input:`, JSON.stringify(example.input));

            let args;
            if (Array.isArray(example.input)) {
              args = example.input;
            } else if (typeof example.input === 'string') {
              try {
                // Try JSON parsing first
                if (example.input.trim().startsWith('[')) {
                  args = JSON.parse(example.input);
                } else {
                  args = JSON.parse(`[${example.input}]`);
                }
              } catch (e) {
                console.log("JSON parse failed, trying regex fallback for input:", example.input);
                // Fallback regex
                const inputMatch = example.input.match(/\[([^\]]+)\].*?(\d+)/);
                if (inputMatch) {
                  const numsStr = inputMatch[1];
                  const target = parseInt(inputMatch[2]);
                  const nums = numsStr.split(',').map(n => parseInt(n.trim()));
                  args = [nums, target];
                }
              }
            }

            if (!args) {
              console.log("Could not parse args, using empty array");
              args = [];
            }
            if (!Array.isArray(args)) args = [args];

            const argsString = args.map(arg => JSON.stringify(arg)).join(', ');
            console.log(`Args String: ${argsString}`);

            const testCode = `
                    ${code}
                    
                    (() => {
                        try {
                           if (typeof ${question.functionName} !== 'function') {
                               return "ERROR: Function '${question.functionName}' not found";
                           }
                           const result = ${question.functionName}(${argsString});
                           return result;
                        } catch (e) {
                           return "ERROR: " + e.message;
                        }
                    })()
                  `;

            let actualOutput;
            try {
              actualOutput = eval(testCode);
            } catch (e) {
              actualOutput = "ERROR: Eval failed: " + e.message;
            }

            const expectedOutput = example.output;

            console.log("Actual:", JSON.stringify(actualOutput));
            console.log("Expected:", JSON.stringify(expectedOutput));

            // Comparison
            const passed = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput) &&
              !(typeof actualOutput === 'string' && actualOutput.startsWith("ERROR"));

            if (passed) passedTests++;
            else console.log("Test FAILED");

          } catch (error) {
            console.error("Test execution loop error:", error);
          }
        }
      }

      totalTests += examples.length;
      totalPassedTests += passedTests;

      // Score for this question
      if (examples.length > 0) {
        totalScore += (passedTests / examples.length) * (100 / questions.length);
      }
    }

    // Round score
    totalScore = Math.round(totalScore);

    // Generate feedback
    let feedback = `Score: ${totalScore}/100. Passed ${totalPassedTests}/${totalTests} total test cases. \n` + feedbackParts.join('\n');

    const evaluation = {
      score: totalScore,
      pass: totalScore >= 70,
      feedback,
      complexityAnalysis: "Multi-question assessment",
      improvementSuggestions: totalScore < 70 ? "Review the unsolved problems." : "Good job!"
    };

    await Resume.findByIdAndUpdate(
      resumeId,
      {
        "oa.status": "evaluated",
        "oa.evaluation": evaluation,
        "oa.evaluatedAt": new Date()
      }
    );

    console.log("Assessment evaluated successfully for resume:", resumeId, "Score:", evaluation.score);

  } catch (error) {
    console.error("Error evaluating submission:", error);
    // Fallback logic...
  }
};
