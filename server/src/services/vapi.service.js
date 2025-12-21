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
    callId: `web-call-${crypto.randomBytes(6).toString("hex")}`,
    joinConfig: {
      assistantId: resolvedAssistantId,
      publicApiKey: VAPI_PUBLIC_API_KEY,
      context,
    },
  };
};

