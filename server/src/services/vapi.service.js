import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

const VAPI_PUBLIC_API_KEY = process.env.VAPI_PUBLIC_API_KEY || "";
const VAPI_API_KEY = process.env.VAPI_API_KEY || "";
const VAPI_BASE_URL = process.env.VAPI_BASE_URL || "https://api.vapi.ai";
const VAPI_PROMPT_PATH = process.env.VAPI_PROMPT_PATH || "docs/MEETING_PROMPT.md";

const VAPI_MODEL_PROVIDER = process.env.VAPI_MODEL_PROVIDER || "openai";
const VAPI_MODEL_NAME = process.env.VAPI_MODEL_NAME || "gpt-4o-mini";
const VAPI_VOICE_PROVIDER = process.env.VAPI_VOICE_PROVIDER || "11labs";
const VAPI_VOICE_ID = process.env.VAPI_VOICE_ID || "pNInz6obpgDQGcFmaJgB";
const VAPI_ASSISTANT_NAME = process.env.VAPI_ASSISTANT_NAME || "AI Interviewer";

let cachedPromptTemplate = null;

/**
 * Load the base prompt template from the markdown file
 */
const loadPromptTemplate = async () => {
  if (cachedPromptTemplate) return cachedPromptTemplate;
  try {
    const filePath = path.resolve(process.cwd(), VAPI_PROMPT_PATH);
    cachedPromptTemplate = await fs.readFile(filePath, "utf-8");
    console.log(`Loaded Vapi prompt from: ${filePath}`);
    return cachedPromptTemplate;
  } catch (error) {
    console.error(`Failed to load Vapi prompt from ${VAPI_PROMPT_PATH}:`, error);
    cachedPromptTemplate = "You are an AI interviewer. Conduct a professional interview.";
    return cachedPromptTemplate;
  }
};

/**
 * Build the assistant body with contextualized prompt
 */
const buildAssistantBody = async (context = {}) => {
  const baseInstructions = await loadPromptTemplate();
  const job = context?.job || {};
  const resume = context?.resume || {};
  const durationMinutes = context?.durationMinutes || 40;

  // Build job context summary
  const jobSummary = [
    job.jobtitle && `Job Title: ${job.jobtitle}`,
    job.description && `Job Description: ${job.description}`,
    job.skills?.length && `Required Skills: ${job.skills.join(", ")}`,
    job.location && `Location: ${job.location}`,
    job.employmentType && `Employment Type: ${job.employmentType}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Build candidate context summary
  const resumeSummary = [
    resume.name && `Candidate Name: ${resume.name}`,
    resume.title && `Candidate Title: ${resume.title}`,
    resume.email && `Candidate Email: ${resume.email}`,
    resume.phone && `Candidate Phone: ${resume.phone}`,
    resume.experience && `Candidate Experience: ${resume.experience}`,
    resume.skills?.length && `Candidate Skills: ${resume.skills.join(", ")}`,
    resume.aiSummary?.technicalExperience &&
    `Technical Experience Summary: ${resume.aiSummary.technicalExperience}`,
    resume.aiSummary?.projectExperience &&
    `Project Experience Summary: ${resume.aiSummary.projectExperience}`,
  ]
    .filter(Boolean)
    .join("\n");

  // Build concerns and strengths context
  const concernsContext = resume.potentialConcern?.length > 0
    ? `**POTENTIAL CONCERNS TO ADDRESS:**
${resume.potentialConcern.map((concern, idx) => `${idx + 1}. ${concern}`).join("\n")}

IMPORTANT: During the interview, you should naturally probe these areas to get clarity. Ask follow-up questions that help assess whether these concerns are valid or if the candidate can address them. Do NOT mention these concerns directly to the candidate - instead, ask questions that would reveal information about these areas.`
    : "";

  const strengthsContext = resume.keyStrength?.length > 0
    ? `**KEY STRENGTHS:**
${resume.keyStrength.map((strength, idx) => `${idx + 1}. ${strength}`).join("\n")}

You can build upon these strengths during the interview and explore them in more depth.`
    : "";

  // Build time context
  const timeContext = `**TIME CONTEXT:**
- Total interview duration: ${durationMinutes} minutes
- You should track time during the interview and manage pacing accordingly
- When you have completed all closing questions and delivered the closing script, call the 'end_interview' function to gracefully end the call
- If time is running out and you haven't asked all closing questions yet, prioritize them immediately`;

  // Combine base prompt with context
  const contextualInstructions = `${baseInstructions}

Job context:
${jobSummary || "Not provided"}

Candidate context:
${resumeSummary || "Not provided"}
${strengthsContext ? `\n\n${strengthsContext}` : ""}
${concernsContext ? `\n\n${concernsContext}` : ""}

${timeContext}`;

  // Construct webhook URL - prioritize explicit setting, then backend URL, then construct from frontend
  let webhookUrl = process.env.VAPI_WEBHOOK_URL;

  if (!webhookUrl) {
    const backendUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL?.replace(/\/$/, "");
    if (backendUrl) {
      webhookUrl = `${backendUrl}/api/meetings/webhook/vapi`;
    } else {
      // Fallback for local development
      webhookUrl = "http://localhost:5880/api/meetings/webhook/vapi";
      console.warn("⚠️  Using localhost webhook URL. Set VAPI_WEBHOOK_URL or BACKEND_URL for production.");
    }
  }

  console.log("🔗 Vapi webhook URL:", webhookUrl);

  // Build the exact starting message as specified
  const firstMessage = `Hello, I'm Kai from Zepul.
I'll be guiding you through this interview on behalf of the hiring team.

This interview focuses on your skills and experience related to the role you've applied for and will take approximately ${durationMinutes} minutes.

Please respond naturally and feel free to take a moment before answering each question.

If you're ready, let's begin.`;

  // Define the end_interview tool/function for graceful call termination
  const endInterviewFunction = {
    type: "function",
    function: {
      name: "end_interview",
      description: "Call this function to gracefully end the interview after you have completed all closing questions and delivered the closing script. This ensures the transcript is properly saved and the call ends smoothly.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Brief reason for ending (e.g., 'Interview completed successfully', 'All closing questions answered')",
          },
        },
        required: ["reason"],
      },
    },
  };

  return {
    name: VAPI_ASSISTANT_NAME,
    firstMessage,
    model: {
      provider: VAPI_MODEL_PROVIDER,
      model: VAPI_MODEL_NAME,
      messages: [
        {
          role: "system",
          content: contextualInstructions,
        },
      ],
      tools: [endInterviewFunction],
    },
    voice: {
      provider: VAPI_VOICE_PROVIDER,
      voiceId: VAPI_VOICE_ID,
    },
    serverUrl: webhookUrl,
    serverMessages: [
      "status-update",
      "transcript",
      "function-call",
      "end-of-call-report",
    ],
  };
};

/**
 * Create a Vapi assistant via API
 */
export const createAssistant = async (context = {}) => {
  if (!VAPI_API_KEY) {
    console.warn("VAPI_API_KEY is not set. Cannot create Vapi assistant.");
    return null;
  }

  // Validate model provider - should be an LLM provider, not a voice provider
  if (VAPI_MODEL_PROVIDER === "11labs" || VAPI_MODEL_PROVIDER === "playht" || VAPI_MODEL_PROVIDER === "deepgram") {
    console.warn(
      `Warning: VAPI_MODEL_PROVIDER is set to "${VAPI_MODEL_PROVIDER}" which is a voice provider, not a model provider. ` +
      `Model provider should be "openai", "anthropic", etc. Using default "openai".`
    );
  }

  try {
    const body = await buildAssistantBody(context);

    // Vapi API uses /assistant (singular) - see https://docs.vapi.ai/api-reference/assistants
    const endpoint = `${VAPI_BASE_URL}/assistant`;
    console.log("Creating Vapi assistant at:", endpoint);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Vapi API error (${response.status}) at ${endpoint}:`, errorText);
      console.error("Request body:", JSON.stringify(body, null, 2));
      throw new Error(
        `Failed to create assistant: ${response.status} ${errorText}`
      );
    }

    const data = await response.json();
    const assistantId = data.id || data.assistantId || data._id;
    if (!assistantId) {
      console.error("Vapi response missing assistant ID:", data);
      throw new Error("Assistant created but no ID returned");
    }
    console.log("Vapi assistant created successfully:", assistantId);
    return assistantId;
  } catch (error) {
    console.error("Vapi assistant creation error:", error.message || error);
    return null;
  }
};

/**
 * Delete a Vapi assistant
 */
export const deleteAssistant = async (assistantId) => {
  if (!VAPI_API_KEY || !assistantId) {
    console.warn("Cannot delete assistant: missing API key or assistant ID");
    return false;
  }

  try {
    const endpoint = `${VAPI_BASE_URL}/assistant/${assistantId}`;
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to delete assistant ${assistantId}: ${response.status} ${errorText}`);
      return false;
    }

    console.log(`Vapi assistant deleted successfully: ${assistantId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting assistant ${assistantId}:`, error.message || error);
    return false;
  }
};

/**
 * Build the assistant body for the Job Description Interview
 * This AI interviews a recruiter to gather a full job description.
 */
export const buildJobDescriptionAssistantBody = async () => {
  const instructions = `You are a professional job description assistant. Your job is to conduct a structured, friendly voice conversation with a recruiter or hiring manager to help them fully describe a job opening.

You will ask them about every important aspect of the job in a natural, conversational way. Do not rush — ask one topic at a time and ask follow-up questions if an answer is vague or incomplete.

Topics to cover (in roughly this order):
1. Job title and department
2. High-level role summary (what does this person do day to day?)
3. Specific responsibilities and key duties
4. Required skills and technical proficiencies (must-haves)
5. Nice-to-have skills or experience
6. Years of experience required
7. Educational qualifications (if any)
8. Employment type (full-time, part-time, contract, remote, hybrid, on-site)
9. Location or time zone requirements
10. Tech stack, tools, or platforms used
11. Team structure (who would they work with? team size?)
12. Company culture and values
13. Compensation range (salary, equity, etc. — only if they are comfortable sharing)
14. Interview process (stages, timeline)
15. Any additional perks, benefits, or growth opportunities

Rules:
- Be conversational and professional. Use natural language.
- Acknowledge what the recruiter says before moving to the next topic.
- If the recruiter skips a topic, gently prompt them later.
- If the recruiter says they are done or happy with the description, call the 'end_description' function to end the session.
- Do NOT ask all questions at once. Guide the conversation naturally.
- Keep your messages concise and clear. The recruiter is speaking, not typing.

Start by welcoming the recruiter and asking them to begin describing the role.`;

  const firstMessage = `Hi there! I'm your AI job description assistant from Zepul.

I'll guide you through describing your job opening step by step. We'll cover everything — from the role's day-to-day responsibilities to the team culture and compensation.

Just speak naturally, and I'll ask follow-up questions along the way.

Whenever you're ready, go ahead and tell me — what role are you hiring for?`;

  const endDescriptionFunction = {
    type: "function",
    function: {
      name: "end_description",
      description:
        "Call this function when the recruiter has finished describing the job and is satisfied with all the information provided. This gracefully ends the session.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Brief reason for ending (e.g., 'Job description completed')",
          },
        },
        required: ["reason"],
      },
    },
  };

  let webhookUrl = process.env.VAPI_WEBHOOK_URL;
  if (!webhookUrl) {
    const backendUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL?.replace(/\/$/, "");
    if (backendUrl) {
      webhookUrl = `${backendUrl}/api/job-description-sessions/webhook/vapi`;
    } else {
      webhookUrl = "http://localhost:5880/api/job-description-sessions/webhook/vapi";
      console.warn("⚠️  Using localhost webhook URL for job description sessions.");
    }
  } else {
    // If VAPI_WEBHOOK_URL is the meeting one, replace the path
    webhookUrl = webhookUrl.replace(
      "/api/meetings/webhook/vapi",
      "/api/job-description-sessions/webhook/vapi"
    );
  }

  console.log("🔗 Job Description Vapi webhook URL:", webhookUrl);

  return {
    name: "Job Description Assistant",
    firstMessage,
    model: {
      provider: VAPI_MODEL_PROVIDER,
      model: VAPI_MODEL_NAME,
      messages: [
        {
          role: "system",
          content: instructions,
        },
      ],
      tools: [endDescriptionFunction],
    },
    voice: {
      provider: VAPI_VOICE_PROVIDER,
      voiceId: VAPI_VOICE_ID,
    },
    serverUrl: webhookUrl,
    serverMessages: [
      "status-update",
      "transcript",
      "function-call",
      "end-of-call-report",
    ],
  };
};

/**
 * Create a Job Description Assistant and return joinConfig for the browser SDK
 */
export const startWebCallForJobDescription = async () => {
  const body = await buildJobDescriptionAssistantBody();

  if (!VAPI_API_KEY) {
    console.warn("VAPI_API_KEY is not set. Returning mock config for job description session.");
    return {
      callId: `mock-call-${crypto.randomBytes(6).toString("hex")}`,
      joinConfig: {
        mock: true,
        assistantId: "mock-assistant",
        publicApiKey: VAPI_PUBLIC_API_KEY || "missing VAPI_PUBLIC_API_KEY",
      },
    };
  }

  const endpoint = `${VAPI_BASE_URL}/assistant`;
  console.log("Creating Job Description Vapi assistant at:", endpoint);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VAPI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Vapi API error (${response.status}):`, errorText);
    throw new Error(`Failed to create job description assistant: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const assistantId = data.id || data.assistantId || data._id;

  if (!assistantId) {
    throw new Error("Assistant created but no ID returned from Vapi");
  }

  console.log("✅ Job Description Vapi assistant created:", assistantId);

  if (!VAPI_PUBLIC_API_KEY) {
    console.warn("VAPI_PUBLIC_API_KEY is not set. Returning mock joinConfig.");
    return {
      callId: null,
      joinConfig: {
        mock: true,
        assistantId,
        publicApiKey: "missing VAPI_PUBLIC_API_KEY",
      },
    };
  }

  return {
    callId: null,
    joinConfig: {
      assistantId,
      publicApiKey: VAPI_PUBLIC_API_KEY,
    },
  };
};

/**
 * Build the assistant body for the Candidate Career Interview.
 * This AI conducts an in-depth (up to 30 min) interview with a job seeker to
 * understand the role they want, their skills, experience and preferences, so
 * the platform can match them with suitable jobs afterwards.
 */
export const buildCandidateInterviewAssistantBody = async (context = {}) => {
  const candidate = context?.candidate || {};
  const durationMinutes = context?.durationMinutes || 30;

  const candidateSummary = [
    candidate.fullName && `Candidate Name: ${candidate.fullName}`,
    candidate.email && `Candidate Email: ${candidate.email}`,
    candidate.phoneNumber && `Candidate Phone: ${candidate.phoneNumber}`,
    candidate.address && `Candidate Location: ${candidate.address}`,
  ]
    .filter(Boolean)
    .join("\n");

  const instructions = `You are "Zeus", a warm, professional career counselor and interviewer for Zepul.

Your goal is to conduct an in-depth career discovery interview with a job seeker to deeply understand the kind of role they are looking for, so Zepul can match them with the most suitable open jobs afterwards.

Conduct a natural, conversational interview lasting up to ${durationMinutes} minutes. Ask ONE question at a time, listen, acknowledge the answer, and ask thoughtful follow-up questions to go deep. Do not rush and do not ask multiple questions at once.

Cover these areas thoroughly over the course of the conversation:
1. The exact role / job title they are looking for right now (their "dream job")
2. Why that role — what excites them about it
3. Their current/most recent role and responsibilities
4. Core technical skills, tools, and technologies they are strongest in
5. Years of professional experience and seniority level they want (e.g., junior, mid, senior, lead)
6. Domains or industries they prefer
7. Type of company they want (startup, enterprise, agency, etc.)
8. Work arrangement preference (remote, hybrid, on-site) and preferred locations
9. Employment type (full-time, part-time, contract)
10. Salary expectations (only if they are comfortable sharing)
11. Deal-breakers or must-haves, and anything they want to avoid
12. Career goals for the next few years

Rules:
- Be empathetic, encouraging and concise. The candidate is speaking, not typing.
- Always acknowledge what they said before moving on.
- Probe vague answers with gentle follow-ups to get specifics (especially concrete skills and the target role title).
- Keep track of time. As you approach ${durationMinutes} minutes, begin wrapping up.
- When you have covered the key areas (especially the target role and skills) and the candidate has nothing more to add, briefly summarize what you heard, thank them, and then call the 'end_interview' function to end the session.

Start by warmly welcoming the candidate and asking what kind of role they are looking for.`;

  const firstMessage = `Hi! I'm Zeus, your AI career guide from Zepul.

I'm going to ask you some questions to really understand the kind of role you're looking for, so we can match you with the best opportunities. This is a relaxed conversation and can take up to ${durationMinutes} minutes — there's no rush.

Just speak naturally, and I'll ask follow-up questions along the way.

So, to start — what kind of role are you looking for right now?`;

  const endInterviewFunction = {
    type: "function",
    function: {
      name: "end_interview",
      description:
        "Call this function when you have understood the candidate's desired role, skills and preferences and the candidate has nothing more to add. This gracefully ends the interview so the transcript can be analyzed.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "Brief reason for ending (e.g., 'Career discovery completed').",
          },
        },
        required: ["reason"],
      },
    },
  };

  let webhookUrl = process.env.VAPI_WEBHOOK_URL;
  if (!webhookUrl) {
    const backendUrl = process.env.BACKEND_URL || process.env.FRONTEND_URL?.replace(/\/$/, "");
    webhookUrl = backendUrl
      ? `${backendUrl}/api/candidate-interview/webhook/vapi`
      : "http://localhost:5880/api/candidate-interview/webhook/vapi";
  } else {
    webhookUrl = webhookUrl
      .replace("/api/meetings/webhook/vapi", "/api/candidate-interview/webhook/vapi")
      .replace("/api/job-description-sessions/webhook/vapi", "/api/candidate-interview/webhook/vapi");
  }

  console.log("🔗 Candidate Interview Vapi webhook URL:", webhookUrl);

  const contextualInstructions = candidateSummary
    ? `${instructions}\n\nCandidate context:\n${candidateSummary}`
    : instructions;

  return {
    name: "Candidate Career Interviewer",
    firstMessage,
    model: {
      provider: VAPI_MODEL_PROVIDER,
      model: VAPI_MODEL_NAME,
      messages: [{ role: "system", content: contextualInstructions }],
      tools: [endInterviewFunction],
    },
    voice: {
      provider: VAPI_VOICE_PROVIDER,
      voiceId: VAPI_VOICE_ID,
    },
    serverUrl: webhookUrl,
    serverMessages: [
      "status-update",
      "transcript",
      "function-call",
      "end-of-call-report",
    ],
  };
};

/**
 * Create a Candidate Interview assistant and return joinConfig for the browser SDK
 */
export const startWebCallForCandidateInterview = async (context = {}) => {
  const body = await buildCandidateInterviewAssistantBody(context);

  if (!VAPI_API_KEY) {
    console.warn("VAPI_API_KEY is not set. Returning mock config for candidate interview.");
    return {
      callId: `mock-call-${crypto.randomBytes(6).toString("hex")}`,
      joinConfig: {
        mock: true,
        assistantId: "mock-assistant",
        publicApiKey: VAPI_PUBLIC_API_KEY || "missing VAPI_PUBLIC_API_KEY",
      },
    };
  }

  const endpoint = `${VAPI_BASE_URL}/assistant`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VAPI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Vapi API error (${response.status}):`, errorText);
    throw new Error(`Failed to create candidate interview assistant: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const assistantId = data.id || data.assistantId || data._id;
  if (!assistantId) {
    throw new Error("Assistant created but no ID returned from Vapi");
  }

  console.log("✅ Candidate Interview Vapi assistant created:", assistantId);

  if (!VAPI_PUBLIC_API_KEY) {
    console.warn("VAPI_PUBLIC_API_KEY is not set. Returning mock joinConfig.");
    return {
      callId: null,
      joinConfig: { mock: true, assistantId, publicApiKey: "missing VAPI_PUBLIC_API_KEY" },
    };
  }

  return {
    callId: null,
    joinConfig: { assistantId, publicApiKey: VAPI_PUBLIC_API_KEY },
  };
};

export const startWebCallForMeeting = async ({ assistantId, context }) => {
  let resolvedAssistantId = assistantId;

  if (!resolvedAssistantId) {
    resolvedAssistantId = await createAssistant(context);
  }

  if (!resolvedAssistantId) {
    console.warn(
      "No assistant ID available. Returning mock config for local/dev usage."
    );
    return {
      callId: `mock-call-${crypto.randomBytes(6).toString("hex")}`,
      joinConfig: {
        mock: true,
        assistantId: "mock-assistant",
        publicApiKey: VAPI_PUBLIC_API_KEY || "missing VAPI_PUBLIC_API_KEY",
        context,
      },
    };
  }

  // If public API key is missing, return mock config
  if (!VAPI_PUBLIC_API_KEY) {
    console.warn("VAPI_PUBLIC_API_KEY is not set. Returning mock config.");
    return {
      callId: `mock-call-${crypto.randomBytes(6).toString("hex")}`,
      joinConfig: {
        mock: true,
        assistantId: resolvedAssistantId,
        publicApiKey: "missing VAPI_PUBLIC_API_KEY",
        context,
      },
    };
  }

  return {
    // Real Vapi call ID is emitted via webhook events after call start.
    // Do not generate a synthetic call ID here, as it breaks webhook matching.
    callId: null,
    joinConfig: {
      assistantId: resolvedAssistantId,
      publicApiKey: VAPI_PUBLIC_API_KEY,
      context,
    },
  };
};
