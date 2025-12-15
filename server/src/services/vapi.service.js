import crypto from "crypto";
import { readFile } from "fs/promises";
import path from "path";

const VAPI_PUBLIC_API_KEY = process.env.VAPI_PUBLIC_API_KEY || "";
const VAPI_API_KEY = process.env.VAPI_API_KEY || "";
const VAPI_BASE_URL = process.env.VAPI_BASE_URL || "https://api.vapi.ai";
const VAPI_PROMPT_PATH =
  process.env.VAPI_PROMPT_PATH ||
  path.resolve(process.cwd(), "docs/MEETING_PROMPT.md");

let cachedAssistantId = null;

const defaultAssistantPayload = {
  name: process.env.VAPI_ASSISTANT_NAME || "AI Interviewer",
  instructions: "PLACEHOLDER_PROMPT_OVERRIDDEN_BELOW",
  model: {
    provider: process.env.VAPI_MODEL_PROVIDER || "openai",
    model: process.env.VAPI_MODEL_NAME || "gpt-4o-mini",
  },
  voice: {
    provider: process.env.VAPI_VOICE_PROVIDER || "11labs",
    voiceId: process.env.VAPI_VOICE_ID || "pNInz6obpgDQGcFmaJgB",
  },
};

let promptTemplateCache = null;

const loadPromptTemplate = async () => {
  if (promptTemplateCache) return promptTemplateCache;
  try {
    const content = await readFile(VAPI_PROMPT_PATH, "utf-8");
    promptTemplateCache = content.trim();
    return promptTemplateCache;
  } catch (err) {
    console.error("Unable to read Vapi prompt file:", err.message);
    promptTemplateCache =
      "You are an AI technical interviewer. Run a 30-40 minute interview, probe into the candidate's experience, tailor questions to the job description and resume, ask focused follow-ups, keep concise, and end with a brief recap of strengths, risks, and recommendation.";
    return promptTemplateCache;
  }
};

const buildAssistantBody = async (context = {}) => {
  const job = context?.job || {};
  const resume = context?.resume || {};

  const jobSummary = [
    job.title && `Job Title: ${job.title}`,
    job.description && `Job Description: ${job.description}`,
    job.skills?.length && `Skills: ${job.skills.join(", ")}`,
    job.location && `Location: ${job.location}`,
  ]
    .filter(Boolean)
    .join("\n");

  const resumeSummary = [
    resume.name && `Candidate: ${resume.name}`,
    resume.summary && `Summary: ${resume.summary}`,
    resume.skills?.length && `Skills: ${resume.skills.join(", ")}`,
    resume.experience && `Experience: ${resume.experience}`,
  ]
    .filter(Boolean)
    .join("\n");

  const basePrompt = await loadPromptTemplate();

  const contextualInstructions = `${basePrompt}

Job context:
${jobSummary || "Not provided"}

Candidate context:
${resumeSummary || "Not provided"}
`;

  return {
    ...defaultAssistantPayload,
    instructions: contextualInstructions,
  };
};

const createAssistant = async (context) => {
  if (!VAPI_API_KEY) return null;
  try {
    const body = await buildAssistantBody(context);
    const resp = await fetch(`${VAPI_BASE_URL}/assistants`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${VAPI_API_KEY}`,
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Failed to create assistant: ${resp.status} ${text}`);
    }
    const data = await resp.json();
    return data.id || data.assistantId || data._id;
  } catch (err) {
    console.error("Vapi assistant creation error:", err);
    return null;
  }
};

const ensureAssistant = async (context) => {
  if (process.env.VAPI_ASSISTANT_ID) return process.env.VAPI_ASSISTANT_ID;
  if (cachedAssistantId) return cachedAssistantId;
  const id = await createAssistant(context);
  if (id) cachedAssistantId = id;
  return id || "assistant_placeholder_configure_env";
};

export const startWebCallForMeeting = async ({ assistantId, context }) => {
  const resolvedAssistantId = assistantId || (await ensureAssistant(context));

  if (!VAPI_PUBLIC_API_KEY) {
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

