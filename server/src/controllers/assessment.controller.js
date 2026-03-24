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

const sendAvaloqAssessmentEmail = async (toEmail, candidateName, assessmentLink, jobTitle) => {
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
    subject: `Avaloq Banking Assessment Invitation for ${jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d97706;">Avaloq Banking Assessment Invitation</h2>
        <p>Dear ${candidateName},</p>
        <p>You have been invited to take an <strong>Avaloq Banking Assessment</strong> for the <strong>${jobTitle}</strong> position.</p>
        <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #fbbf24;">
          <p><strong>Assessment Details:</strong></p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>Duration: 90 minutes</li>
            <li>Questions: 5-6 (SQL, Banking Scenarios, Debugging)</li>
            <li>Focus: Practical banking domain skills</li>
          </ul>
          <p>Please click the link below to start the assessment:</p>
          <a href="${assessmentLink}" style="display: inline-block; background-color: #d97706; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Assessment</a>
          <p style="margin-top: 10px; font-size: 12px; color: #64748b;">Or copy this link: ${assessmentLink}</p>
        </div>
        <p>The assessment is designed to take approximately 90 minutes. Please ensure you have a stable internet connection.</p>
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
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
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

// @desc Generate an Avaloq Banking Assessment
export const generateAvaloqAssessment = async (req, res) => {
  try {
    const { resumeId } = req.body;

    const resume = await Resume.findById(resumeId).populate('jobId');
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const job = resume.jobId;
    let questionData;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `
You are an expert assessment designer for Avaloq banking software developer roles.

Generate a complete coding assessment with the following specifications:

Assessment Structure:
- Total duration: 90 minutes
- Total questions: 5-6
- Difficulty level: Medium to Senior
- Focus on practical, job-relevant skills (NOT competitive programming)

Job Title: ${job.jobtitle || 'Avaloq Developer'}
Job Description: ${job.description || 'Banking software development'}
Required Skills: ${job.requiredSkills ? job.requiredSkills.join(", ") : 'SQL, PL-SQL, Banking Domain, Java'}

Question Distribution:
1. 2-3 SQL coding questions (MUST include joins, aggregations, and one complex query)
2. 1-2 banking scenario-based problems (transaction processing, balance validation, interest calculation, etc.)
3. 1 debugging question (broken SQL or incorrect business logic)
4. Optional: 1 simple coding problem (Java or Python)

Requirements for Each Question:
- Clear problem statement
- Sample input/output (if applicable)
- Constraints (if needed)
- Expected solution approach
- Evaluation criteria
- Max score (total across all questions should equal 100)

SQL Questions:
- Use realistic banking datasets (customers, accounts, transactions tables)
- Include one advanced query involving multiple joins and aggregation
- Provide table schemas: 
  - customers(customer_id, name, email, account_type, created_at)
  - accounts(account_id, customer_id, account_type, balance, currency, status, opened_at)
  - transactions(txn_id, from_account_id, to_account_id, amount, txn_type, status, created_at)

Banking Scenarios:
- Real-world use cases (e.g., insufficient balance handling, transaction rollback, interest calculation, KYC validation)

Debugging:
- Provide a faulty SQL query or logic and ask candidate to identify and fix the bug

IMPORTANT:
- Avoid DSA-heavy or competitive programming questions
- Focus on real-world Avaloq developer responsibilities
- Keep the test practical and industry-relevant

Return ONLY a valid JSON array of objects in this EXACT format (no markdown, no code blocks):
[
  {
    "section": "SQL" | "Banking Scenario" | "Debugging" | "Optional Coding",
    "title": "Question Title",
    "description": "Detailed problem statement with table schemas if SQL. Use \\n for line breaks.",
    "difficulty": "Medium" | "Hard",
    "constraints": "Any constraints or rules",
    "sampleInput": "Sample input data or table state (if applicable)",
    "sampleOutput": "Expected output or result",
    "expectedApproach": "Brief description of the expected solution approach",
    "evaluationCriteria": "What to evaluate: correctness, efficiency, edge cases, etc.",
    "maxScore": number,
    "answerKey": "The correct solution (SQL query, code, or explanation)",
    "functionName": "functionNameIfCoding",
    "examples": [
      {
        "input": "sample input",
        "output": "expected output",
        "explanation": "Why this output is correct"
      }
    ]
  }
]
      `.trim();

      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
      ]);

      const response = await result.response;
      const text = response.text();
      const cleanedText = text.replace(/```json|```/g, "").trim();
      questionData = JSON.parse(cleanedText);

      if (!Array.isArray(questionData)) {
        questionData = [questionData];
      }

      console.log("✓ AI generated Avaloq assessment questions:", questionData.length);
    } catch (aiError) {
      console.log("AI generation failed for Avaloq assessment, using fallback:", aiError.message);

      questionData = [
        {
          section: "SQL",
          title: "Customer Account Summary",
          description: "Given the following tables:\n\ncustomers(customer_id, name, email, account_type, created_at)\naccounts(account_id, customer_id, account_type, balance, currency, status, opened_at)\ntransactions(txn_id, from_account_id, to_account_id, amount, txn_type, status, created_at)\n\nWrite a SQL query to find all customers who have more than one active account, along with the total balance across all their accounts and the number of transactions made in the last 30 days. Order by total balance descending.",
          difficulty: "Medium",
          constraints: "Only include active accounts (status = 'active'). Use proper JOIN syntax.",
          sampleInput: "Tables with sample banking data",
          sampleOutput: "customer_id | name | num_accounts | total_balance | recent_txn_count",
          expectedApproach: "Use JOINs between customers, accounts, and transactions tables with GROUP BY, HAVING, and date filtering.",
          evaluationCriteria: "Correct JOINs, proper GROUP BY/HAVING, date filtering, result ordering",
          maxScore: 20,
          answerKey: "SELECT c.customer_id, c.name, COUNT(DISTINCT a.account_id) as num_accounts, SUM(a.balance) as total_balance, COUNT(DISTINCT t.txn_id) as recent_txn_count FROM customers c JOIN accounts a ON c.customer_id = a.customer_id AND a.status = 'active' LEFT JOIN transactions t ON (a.account_id = t.from_account_id OR a.account_id = t.to_account_id) AND t.created_at >= CURRENT_DATE - INTERVAL '30 days' GROUP BY c.customer_id, c.name HAVING COUNT(DISTINCT a.account_id) > 1 ORDER BY total_balance DESC;",
          functionName: "",
          examples: []
        },
        {
          section: "SQL",
          title: "Monthly Transaction Analysis",
          description: "Write a SQL query to generate a monthly report showing:\n- Month and year\n- Total number of transactions\n- Total credit amount (txn_type = 'credit')\n- Total debit amount (txn_type = 'debit')\n- Net flow (credits - debits)\n\nFor the year 2024. Only include successful transactions (status = 'success').",
          difficulty: "Medium",
          constraints: "Use DATE_TRUNC or EXTRACT for date grouping. Handle NULL values.",
          sampleInput: "Transactions table with 2024 data",
          sampleOutput: "month | year | total_txns | total_credits | total_debits | net_flow",
          expectedApproach: "Use CASE WHEN for conditional aggregation, DATE_TRUNC for monthly grouping, and filtering on status and date.",
          evaluationCriteria: "Correct conditional aggregation, proper date handling, NULL handling",
          maxScore: 20,
          answerKey: "SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as total_txns, SUM(CASE WHEN txn_type = 'credit' THEN amount ELSE 0 END) as total_credits, SUM(CASE WHEN txn_type = 'debit' THEN amount ELSE 0 END) as total_debits, SUM(CASE WHEN txn_type = 'credit' THEN amount ELSE -amount END) as net_flow FROM transactions WHERE status = 'success' AND EXTRACT(YEAR FROM created_at) = 2024 GROUP BY DATE_TRUNC('month', created_at) ORDER BY month;",
          functionName: "",
          examples: []
        },
        {
          section: "SQL",
          title: "Detecting Suspicious Transactions",
          description: "Write a complex SQL query to identify potentially suspicious accounts. An account is suspicious if:\n1. It has more than 5 transactions in a single day, OR\n2. The total daily transaction amount exceeds 50,000, OR\n3. There are transactions to more than 3 unique destination accounts in a single day\n\nReturn: account_id, transaction_date, daily_txn_count, daily_total_amount, unique_destinations, and a flag column 'suspicious_reason' indicating which rule(s) were violated.",
          difficulty: "Hard",
          constraints: "Consider both outgoing and incoming transactions. Use window functions if needed.",
          sampleInput: "Transactions table with various patterns",
          sampleOutput: "account_id | txn_date | daily_txn_count | daily_total | unique_dest | suspicious_reason",
          expectedApproach: "Use CTEs or subqueries with daily aggregation, then apply CASE WHEN for rule checking. Consider using STRING_AGG or array_agg for combining reasons.",
          evaluationCriteria: "Handling multiple conditions, correct aggregation, readable output, edge case handling",
          maxScore: 25,
          answerKey: "WITH daily_stats AS (SELECT from_account_id as account_id, DATE(created_at) as txn_date, COUNT(*) as daily_txn_count, SUM(amount) as daily_total, COUNT(DISTINCT to_account_id) as unique_dest FROM transactions WHERE status = 'success' GROUP BY from_account_id, DATE(created_at)) SELECT *, CONCAT_WS(', ', CASE WHEN daily_txn_count > 5 THEN 'High frequency' END, CASE WHEN daily_total > 50000 THEN 'High value' END, CASE WHEN unique_dest > 3 THEN 'Multiple destinations' END) as suspicious_reason FROM daily_stats WHERE daily_txn_count > 5 OR daily_total > 50000 OR unique_dest > 3 ORDER BY txn_date DESC;",
          functionName: "",
          examples: []
        },
        {
          section: "Banking Scenario",
          title: "Fund Transfer with Validation",
          description: "Design the logic (in pseudocode or SQL) for a fund transfer system that:\n\n1. Validates that the source account exists and is active\n2. Validates that the destination account exists\n3. Checks if the source account has sufficient balance (including a minimum balance requirement of 1000)\n4. Performs the transfer atomically (debit source, credit destination)\n5. Creates a transaction record\n6. Handles failure scenarios (rollback on any error)\n\nConsider edge cases: same account transfer, negative amounts, currency mismatch, daily transfer limits (max 200,000 per day).",
          difficulty: "Medium",
          constraints: "Must use transaction management (BEGIN/COMMIT/ROLLBACK). Must handle all edge cases.",
          sampleInput: "transfer(from_account_id=1001, to_account_id=1002, amount=5000, currency='USD')",
          sampleOutput: "Success: Transaction ID TXN_12345 created. Source balance: 45000, Destination balance: 15000",
          expectedApproach: "Use a stored procedure or transaction block with proper validation checks, error handling, and atomic operations.",
          evaluationCriteria: "Completeness of validations, proper transaction handling, edge case coverage, clarity of logic",
          maxScore: 15,
          answerKey: "BEGIN TRANSACTION; -- Validate source SELECT balance, status, currency INTO v_balance, v_status, v_currency FROM accounts WHERE account_id = p_from_id FOR UPDATE; IF v_status != 'active' THEN ROLLBACK; RAISE 'Source account inactive'; END IF; IF v_balance - p_amount < 1000 THEN ROLLBACK; RAISE 'Insufficient balance'; END IF; -- Check daily limit SELECT COALESCE(SUM(amount), 0) INTO v_daily_total FROM transactions WHERE from_account_id = p_from_id AND DATE(created_at) = CURRENT_DATE; IF v_daily_total + p_amount > 200000 THEN ROLLBACK; RAISE 'Daily limit exceeded'; END IF; -- Perform transfer UPDATE accounts SET balance = balance - p_amount WHERE account_id = p_from_id; UPDATE accounts SET balance = balance + p_amount WHERE account_id = p_to_id; INSERT INTO transactions VALUES (...); COMMIT;",
          functionName: "",
          examples: []
        },
        {
          section: "Debugging",
          title: "Fix the Interest Calculation Query",
          description: "The following SQL query is supposed to calculate quarterly compound interest for savings accounts, but it has multiple bugs. Identify and fix ALL issues.\n\nBuggy Query:\n```sql\nSELECT a.account_id, a.balance,\n  a.balance * (1 + 0.045) ^ 4 - a.balance AS annual_interest,\n  a.balance * (1 + 0.045) AS quarterly_interest\nFROM accounts a\nWHERE a.account_type = 'savings'\n  AND a.status = 'Active'\n  AND a.balance > 0\nGROUP BY a.account_id\nORDER BY annual_interest;\n```\n\nHints: Consider the interest rate per quarter, the exponentiation operator in SQL, status value consistency, GROUP BY requirements, and whether the quarterly interest formula is correct.",
          difficulty: "Medium",
          constraints: "Annual interest rate is 4.5%. Interest compounds quarterly. Use POWER() function for exponentiation in SQL.",
          sampleInput: "Account with balance 100,000",
          sampleOutput: "Corrected query returning accurate interest calculations",
          expectedApproach: "Fix: 1) Use quarterly rate (0.045/4), 2) Use POWER() instead of ^, 3) Fix status case to 'active', 4) Fix GROUP BY to include all columns, 5) Fix quarterly interest formula.",
          evaluationCriteria: "Number of bugs identified, correctness of fixes, understanding of compound interest formula",
          maxScore: 20,
          answerKey: "SELECT a.account_id, a.balance, a.balance * (POWER(1 + 0.045/4, 4) - 1) AS annual_interest, a.balance * (POWER(1 + 0.045/4, 1) - 1) AS quarterly_interest FROM accounts a WHERE a.account_type = 'savings' AND a.status = 'active' AND a.balance > 0 ORDER BY annual_interest DESC;",
          functionName: "",
          examples: []
        }
      ];
    }

    const assessmentId = crypto.randomBytes(16).toString('hex');

    await Resume.findByIdAndUpdate(
      resumeId,
      {
        avaloqOa: {
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

    if (resume.email) {
      try {
        await sendAvaloqAssessmentEmail(
          resume.email,
          resume.name,
          assessmentLink,
          job.jobtitle
        );
      } catch (emailError) {
        console.error("Failed to send Avaloq assessment email:", emailError);
      }
    }

    res.status(200).json({
      message: "Avaloq Assessment generated successfully",
      assessmentId: assessmentId,
      link: `/assessment/${assessmentId}`,
      questions: questionData
    });

  } catch (error) {
    console.error("Error generating Avaloq assessment:", error);
    res.status(500).json({ message: "Failed to generate Avaloq assessment", error: error.message });
  }
};

// @desc Get assessment details (for candidate)
export const getAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    let resume = await Resume.findOne({ "oa.assessmentId": assessmentId });
    let assessmentField = 'oa';

    if (!resume) {
      resume = await Resume.findOne({ "avaloqOa.assessmentId": assessmentId });
      assessmentField = 'avaloqOa';
    }

    if (!resume) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const oaData = resume[assessmentField];

    if (oaData.status === 'completed' || oaData.status === 'evaluated') {
      return res.status(400).json({ message: "Assessment already completed" });
    }

    res.status(200).json({
      candidateName: resume.name,
      questions: oaData.questions,
      assessmentType: assessmentField === 'avaloqOa' ? 'avaloq' : 'standard'
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

    let resume = await Resume.findOne({ "oa.assessmentId": assessmentId });
    let assessmentField = 'oa';

    if (!resume) {
      resume = await Resume.findOne({ "avaloqOa.assessmentId": assessmentId });
      assessmentField = 'avaloqOa';
    }

    if (!resume) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Update status to completed
    await Resume.findOneAndUpdate(
      { [`${assessmentField}.assessmentId`]: assessmentId },
      {
        [`${assessmentField}.status`]: "completed",
        [`${assessmentField}.completionDate`]: new Date(),
        [`${assessmentField}.submissions`]: submissions.map(s => ({
          ...s,
          submittedAt: new Date()
        }))
      }
    );

    // Trigger AI Evaluation (Async)
    evaluateSubmission(resume._id, submissions, resume[assessmentField].questions, assessmentField);

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

    let resume = await Resume.findOne({ "oa.assessmentId": assessmentId });
    let assessmentField = 'oa';
    if (!resume) {
      resume = await Resume.findOne({ "avaloqOa.assessmentId": assessmentId });
      assessmentField = 'avaloqOa';
    }
    if (!resume) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    const question = resume[assessmentField].questions[questionIndex];
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (language === 'java') {
      const result = await executeJava(code, question.examples, question.functionName);
      // executeJava returns { error, results } on failure — always respond 200
      // so the frontend's `if (data.error)` path can handle it gracefully.
      return res.status(200).json(result);
    }

    // JS is handled client-side; frontend won't call this for JS.
    // Return a user-friendly 200 with error field so frontend doesn't crash.
    return res.status(200).json({ error: "JavaScript execution is handled in the browser." });

  } catch (error) {
    console.error("Error running code:", error);
    // Return 200 with error message so frontend can show it in the terminal output
    res.status(200).json({ error: `Execution failed: ${error.message}` });
  }
};

// @desc AI Evaluation Logic (Internal Helper)
const evaluateSubmission = async (resumeId, submissions, questions, assessmentField = 'oa') => {
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
        [`${assessmentField}.status`]: "evaluated",
        [`${assessmentField}.evaluation`]: evaluation,
        [`${assessmentField}.evaluatedAt`]: new Date()
      }
    );

    console.log("Assessment evaluated successfully for resume:", resumeId, "Score:", evaluation.score);

  } catch (error) {
    console.error("Error evaluating submission:", error);
    // Fallback logic...
  }
};
