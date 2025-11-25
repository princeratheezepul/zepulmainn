import { GoogleGenerativeAI } from "@google/generative-ai";
import Resume from "../models/resume.model.js";
import { Job } from "../models/job.model.js";
import crypto from 'crypto';
import nodemailer from "nodemailer";

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
Generate a coding problem suitable for a ${job.jobtitle} role.

Job Description: ${job.description || 'General software development position'}
Required Skills: ${job.requiredSkills ? job.requiredSkills.join(", ") : 'Programming, Problem Solving'}

The problem should:
1. Be a single algorithmic function challenge (NOT a full web application or API)
2. Be relevant to the job role but solvable as a pure function
3. Be solvable within 30-45 minutes
4. Be strictly in **JavaScript**

Return ONLY a valid JSON object in this EXACT format (no markdown, no code blocks):
{
  "title": "Problem Title",
  "description": "Detailed problem description. Use \\n for line breaks.",
  "difficulty": "Easy or Medium",
  "constraints": "Time and space constraints",
  "functionName": "nameOfFunctionToCall",
  "examples": [
    {
      "input": [arg1, arg2], // Array of arguments to pass to function
      "output": "Expected return value",
      "explanation": "Why this output is correct"
    }
  ]
}
      `.trim();

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
      ]);

      const response = await result.response;
      const text = response.text();
      const cleanedText = text.replace(/```json|```/g, "").trim();
      questionData = JSON.parse(cleanedText);
      
      console.log("✓ AI generated question:", questionData.title);
    } catch (aiError) {
      console.log("AI generation failed, using fallback:", aiError.message);
      
      // Fallback to a role-appropriate default question
      const roleKeywords = job.jobtitle.toLowerCase();
      
      if (roleKeywords.includes('frontend') || roleKeywords.includes('react') || roleKeywords.includes('ui')) {
        questionData = {
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
        };
      } else if (roleKeywords.includes('backend') || roleKeywords.includes('api') || roleKeywords.includes('node')) {
        questionData = {
          title: "API Rate Limiter",
          description: "Implement a function `isRateLimited` that checks if a user has exceeded their request limit.\n\nArguments:\n- userId (string)\n- timestamp (number)\n- maxRequests (number)\n- windowMs (number)\n\nReturn true if request is allowed, false if rate limit exceeded.",
          difficulty: "Medium",
          constraints: "Must efficiently handle thousands of users",
          functionName: "isRateLimited",
          examples: [
            {
              input: ["user1", 1000, 3, 60000],
              output: true,
              explanation: "First request is always allowed"
            }
          ]
        };
      } else {
        // Default fallback
        questionData = {
          title: "Two Sum Problem",
          description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.",
          difficulty: "Easy",
          constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
          functionName: "twoSum",
          examples: [
            {
              input: [[2,7,11,15], 9],
              output: [0,1],
              explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
              input: [[3,2,4], 6],
              output: [1,2],
              explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]."
            }
          ]
        };
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
          question: questionData
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
      question: questionData
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
      question: resume.oa.question
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
    const { code, language } = req.body;

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
        "oa.submission": {
          code,
          language,
          submittedAt: new Date()
        }
      }
    );

    // Trigger AI Evaluation (Async)
    evaluateSubmission(resume._id, code, resume.oa.question);

    res.status(200).json({ message: "Assessment submitted successfully" });

  } catch (error) {
    console.error("Error submitting assessment:", error);
    res.status(500).json({ message: "Failed to submit assessment" });
  }
};

// @desc AI Evaluation Logic (Internal Helper)
const evaluateSubmission = async (resumeId, code, question) => {
  try {
    console.log("Starting evaluation for resume:", resumeId);
    
    // Step 1: Check for meaningful implementation
    const codeWithoutComments = code.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
    const hasActualCode = codeWithoutComments.length > 50; // More than just function signature
    const hasReturn = code.includes('return') && !code.match(/return\s*;?\s*$/m); // Has return with value
    const hasLogic = /if|for|while|map|reduce|filter|forEach/.test(code);
    
    // If code is essentially empty, give very low score
    if (!hasActualCode || !hasReturn) {
      const evaluation = {
        score: 15,
        pass: false,
        feedback: "Your solution appears to be incomplete. The function needs to be implemented with actual logic to solve the problem. Currently, it only contains the function signature without any meaningful code.",
        complexityAnalysis: "N/A - No implementation provided",
        improvementSuggestions: "Start by reading the problem description carefully. Implement the Two Sum algorithm using a hash map for O(n) time complexity. Remember to return the indices of the two numbers that add up to the target."
      };
      
      await Resume.findByIdAndUpdate(
        resumeId,
        {
          "oa.status": "evaluated",
          "oa.evaluation": evaluation,
          "oa.evaluatedAt": new Date()
        }
      );
      console.log("Empty submission evaluated with score:", evaluation.score);
      return;
    }
    
    // Step 2: Try to execute code against test cases
    let testResults = [];
    let passedTests = 0;
    const examples = question.examples || [];
    
    for (const example of examples) {
      try {
        // Parse example input
        const inputMatch = example.input.match(/\[([^\]]+)\].*?(\d+)/);
        if (!inputMatch) continue;
        
        const numsStr = inputMatch[1];
        const target = parseInt(inputMatch[2]);
        const nums = numsStr.split(',').map(n => parseInt(n.trim()));
        
        // Execute the code
        const testCode = `
          ${code}
          try {
            const result = twoSum([${nums.join(',')}], ${target});
            JSON.stringify(result);
          } catch (e) {
            "ERROR: " + e.message;
          }
        `;
        
        const actualOutput = eval(testCode);
        const expectedOutput = example.output;
        const passed = actualOutput === expectedOutput && !actualOutput.startsWith("ERROR");
        
        if (passed) passedTests++;
        
        testResults.push({
          passed,
          input: example.input,
          expectedOutput,
          actualOutput
        });
      } catch (error) {
        testResults.push({
          passed: false,
          input: example.input,
          error: error.message
        });
      }
    }
    
    // Step 3: Calculate score based on test results and code quality
    let score = 0;
    const totalTests = examples.length;
    
    // Test results: 60 points max
    if (totalTests > 0) {
      score += (passedTests / totalTests) * 60;
    }
    
    // Code quality: 40 points max
    if (hasLogic) score += 15; // Uses appropriate control structures
    if (code.includes('Map') || code.includes('{}')) score += 15; // Uses hash map/object
    if (code.length < 300) score += 10; // Concise solution
    
    // Round score
    score = Math.round(score);
    
    // Generate feedback
    let feedback = "";
    if (score >= 90) {
      feedback = `Excellent solution! You've correctly implemented the Two Sum algorithm. All test cases passed and the code demonstrates strong problem-solving skills.`;
    } else if (score >= 70) {
      feedback = `Good solution! You've implemented a working approach. ${passedTests}/${totalTests} test cases passed. The code is functional but there might be room for optimization.`;
    } else if (score >= 40) {
      feedback = `Partial solution. ${passedTests}/${totalTests} test cases passed. The logic has some issues that need to be addressed. Review the failing test cases to identify where the algorithm breaks down.`;
    } else {
      feedback = `Your solution needs significant improvement. ${passedTests}/${totalTests} test cases passed. The current implementation doesn't correctly solve the problem. Review the algorithm requirements and test with the provided examples.`;
    }
    
    const complexityAnalysis = hasLogic && (code.includes('Map') || code.includes('{}'))
      ? "Time: O(n), Space: O(n) - Uses hash map for efficient lookup"
      : "Time: O(n²), Space: O(1) - May be using nested loops";
    
    const improvementSuggestions = score >= 70
      ? "Consider edge cases like duplicate values. Add input validation. Think about optimizing space complexity if using extra data structures."
      : "Focus on the core algorithm: iterate through the array once, using a hash map to store complements. For each number, check if its complement (target - current number) exists in the map.";
    
    const evaluation = {
      score,
      pass: score >= 70,
      feedback,
      complexityAnalysis,
      improvementSuggestions
    };

    await Resume.findByIdAndUpdate(
      resumeId,
      {
        "oa.status": "evaluated",
        "oa.evaluation": evaluation,
        "oa.evaluatedAt": new Date()
      }
    );

    console.log("Assessment evaluated successfully for resume:", resumeId, "Score:", evaluation.score, `(${passedTests}/${totalTests} tests passed)`);

  } catch (error) {
    console.error("Error evaluating submission:", error);
    
    // Final fallback
    try {
      await Resume.findByIdAndUpdate(
        resumeId,
        {
          "oa.status": "completed",
          "oa.evaluation": {
            score: 0,
            pass: false,
            feedback: "Evaluation failed. Please review the submission manually.",
            complexityAnalysis: "N/A",
            improvementSuggestions: "Manual review required."
          }
        }
      );
    } catch (fallbackError) {
      console.error("Failed to save fallback evaluation:", fallbackError);
    }
  }
};
