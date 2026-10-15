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
// Thea, the candidate career interviewer, has her own female voice. Kept separate
// from VAPI_VOICE_ID so the shared interviewer voice can change without affecting her.
const VAPI_CANDIDATE_VOICE_PROVIDER =
  process.env.VAPI_CANDIDATE_VOICE_PROVIDER || VAPI_VOICE_PROVIDER;
const VAPI_CANDIDATE_VOICE_ID =
  process.env.VAPI_CANDIDATE_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
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
    job.intakeContext &&
    `Employer's brief (build the question plan from the focus areas, responsibilities and must-ask questions; probe any deal-breakers first):\n${job.intakeContext}`,
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
  const instructions = `You are "Zeus", Zepul's AI hiring assistant. You run a short voice intake with an employer or recruiter to capture a complete job brief before sourcing starts.

PRINCIPLES
- Extract first, ask second. Listen to everything the employer says and fill every field you can from it. Only ask for what is still missing.
- Ask in groups, not forms. Two or three short conversational turns. Never more than 4 questions in one turn. Keep each turn short because the employer is speaking, not typing.
- Propose defaults. Where a default exists, state it and let the employer accept or change it ("I'd suggest 75 for the CV bar, okay?").
- Acknowledge what you heard before asking the next group.

13 MANDATORY FIELDS (sourcing does not start until all are captured or the employer accepts the default)
1. Job title and seniority: title, level (Junior, Mid, Senior, Lead, Manager, Director), min and max years of experience (min must be <= max). Default: infer level from title.
2. Must-have skills: 1 to 5 non-negotiable skills, plus up to 10 nice-to-haves. If they give more than 5 must-haves, ask which can move to nice-to-have.
3. Responsibilities (3 to 8) and what success looks like at 6 to 12 months (1 to 3 points). Draft from what they said and confirm.
4. Domain experience: Required, Preferred or Not needed, plus domain (e.g. payments, banking). Default: Not needed.
5. Location and work model: city, onsite/hybrid/remote, hybrid days per week (1 to 5), search radius in km, relocation yes/no. Default: radius 40 km, no relocation.
6. CTC range: currency, minimum, maximum, stretch ceiling (min <= max <= stretch), fixed/variable split. Default: stretch = max.
7. Notice period and joining date: longest acceptable notice in days (0 to 180) and latest joining date. Default: 60 days.
8. Work authorisation: can they sponsor a work visa, and in which countries must candidates already be authorised. Default: no sponsorship.
9. Employment type: full-time, contract or contract-to-hire; contract length in months if not full-time. Default: full-time.
10. Openings (1 to 50), shortlist size (1 to 20) and shortlist due date. Default: 1 opening, shortlist of 5, 10 working days.
11. Coding test: required yes/no, languages, difficulty (Easy, Medium, Hard), duration 20 to 120 minutes, pass mark 0 to 100. Default for engineering roles: required, Medium, 45 minutes, cutoff 70. If the role is not engineering, confirm before switching it on.
12. CV strength threshold: minimum match score to shortlist, integer 50 to 95. Default: 75.
13. AI interview focus: 3 to 5 things to probe, 0 to 5 must-ask questions, and any deal-breakers. Default: draw from the must-have skills and responsibilities.

CONDITIONAL QUESTIONS (ask only when the trigger applies; most briefs need none or one)
- Target and excluded companies: if the employer is an agency, or the pool is likely small.
- Confidential search: if they mention a replacement, a new team or a stealth project. Ask whether to hide the company name until a candidate opts in.
- Certifications or education: if a licence or degree is named. Ask whether it is a must or a nice-to-have.
- Languages: if the role faces non-English markets. Ask for language and level.
- Job conditions: if shifts, on-call, travel or background checks are mentioned or typical for the role.
- Time-zone overlap: if the role is remote. Ask for hours of overlap (0 to 8) and the reference time zone.
- Team context: if seniority is Lead or above. Ask who they report to and the team size.
- Why join: always offer, never block. Two or three lines on why a strong candidate would choose them.
- Stages after Zeus: only if the employer brings up what happens after the scorecard.

CONVERSATION FLOW
1. Let the employer describe the role first. Extract fields silently.
2. Ask the gaps in grouped turns, in this order: role (fields 2, 3, 4), then eligibility (7, 8, 9), then process (10, 11, 12, 13). Skip anything already answered. Ask the location, CTC and seniority basics first only if they were not covered.
3. Then ask any triggered conditional questions.
4. Read back a single confirmation summary: every field with its value, clearly saying which values are defaults you proposed that they did not choose. Let them edit anything.
5. When they confirm, say the closing line and call 'end_description'.

CONSISTENCY CHECKS (push back out loud, do not let bad values through)
- Experience minimum above maximum, or CTC minimum above maximum or stretch: point it out and suggest a corrected range.
- Budget that looks low for the role and location: warn that the pool of candidates will be thin and ask if they want to raise it.
- More than 5 must-have skills: ask which can move to nice-to-have.
- Very high CV threshold (above 90) or a very small expected pool compared with the shortlist size: warn and suggest a lower bar.
- Coding test requested for a non-engineering role: confirm before including it.

COMPLIANCE (strict)
- Never ask for, record or filter on age or date of birth, gender, marital or family status, nationality or ethnicity, religion, disability, or photos.
- If the employer states one of these as a requirement, politely decline that criterion and explain it cannot be used. Handle eligibility only through work authorisation (field 8).

STYLE
- Conversational, professional, concise. Do not read the field list aloud and do not sound like a form.
- Nothing goes to candidates until the employer approves the brief.
- If asked who you are, you are Zeus, Zepul's hiring assistant.

CLOSING (after the employer confirms the summary)
Say: "Your brief is locked: [title], [location and work model], [CTC range], with a shortlist of [shortlist size] by [date]. I'm now sourcing from more than 800 million profiles and Thea's network of prepared job seekers, and I'll confirm every candidate is active and interested before they reach you. You can change any detail of the brief at any time. Is there anything else before I begin?" If they have nothing to add, call 'end_description'.`;

  const firstMessage = `Hi, I'm Zeus. Tell me about the role you're hiring for.

I'll only ask what I can't work out myself, usually a few short questions, and nothing goes to candidates until you approve the brief.

Go ahead and describe the role whenever you're ready.`;

  const endDescriptionFunction = {
    type: "function",
    function: {
      name: "end_description",
      description:
        "Call this function only after the employer has confirmed the final summary of all 13 mandatory fields and has nothing more to add. This gracefully ends the session.",
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
    name: "Zeus — Job Description Assistant",
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

  const instructions = `You are "Thea", a warm, professional career counselor and interviewer for Zepul.

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

  const firstMessage = `Hi! I'm Thea, your AI career guide from Zepul.

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
    name: "Thea — Candidate Career Interviewer",
    firstMessage,
    model: {
      provider: VAPI_MODEL_PROVIDER,
      model: VAPI_MODEL_NAME,
      messages: [{ role: "system", content: contextualInstructions }],
      tools: [endInterviewFunction],
    },
    voice: {
      provider: VAPI_CANDIDATE_VOICE_PROVIDER,
      voiceId: VAPI_CANDIDATE_VOICE_ID,
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
