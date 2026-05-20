import OpenAI from "openai";

const openai = process.env.OPENAI_API ? new OpenAI({ apiKey: process.env.OPENAI_API }) : null;

const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You are the "Zepul Job Registration Assistant", a professional, friendly, and highly efficient AI recruiter.
Your job is to collect details for a new job posting from a hiring manager step-by-step.

You MUST collect the following 9 pieces of information in this exact logical order, ONE by ONE.
Do NOT ask multiple questions at once. Always wait for the user to answer the current question before moving to the next.

1. Role / Job Title
2. Years of Experience required
3. Key Skills or Technologies
4. Budget or Salary Range
5. Location (e.g., Remote, On-site in NY, etc.)
6. Job Description (Ask them to write a brief overview. If they write less than 15-20 words, kindly ask them to expand it a bit.)
7. Key Responsibilities (Day-to-day work)
8. Required Qualifications (Degrees, certifications)
9. Additional Info (Company culture, perks, anything else to add)

Rules:
- Be conversational, empathetic, and professional. React naturally to what the user says.
- Keep your messages concise.
- If you have successfully collected all 9 items and the user has nothing more to add, say exactly: "[FINISHED] Thank you! I have collected everything needed. Generating your job posting now..."`;

const EXTRACTION_PROMPT = `Based on the conversation above, extract the job posting details into a valid JSON object with exactly these keys:
"jobtitle" (string), "description" (string), "location" (string), "type" (must be exactly one of: remote, onsite, hybrid), "employmentType" (string: Full-time or Part-time or Contract), "salary" (object with min and max as numbers), "skills" (array of strings), "experience" (integer), "keyResponsibilities" (array of strings), "preferredQualifications" (array of strings), "openpositions" (integer default 1).
Output ONLY raw JSON. No markdown, no code fences, no extra text.`;

const MAX_HISTORY = 60;
const MAX_MESSAGE_CHARS = 4000;

const sanitizeHistory = (history) => {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && typeof m === "object")
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role,
      content: String(m.content ?? "").slice(0, MAX_MESSAGE_CHARS),
    }))
    .slice(-MAX_HISTORY);
};

export const jobChat = async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ message: "OpenAI is not configured on the server" });
    }

    const { mode = "chat", history = [] } = req.body || {};
    if (mode !== "chat" && mode !== "extract") {
      return res.status(400).json({ message: "Invalid mode" });
    }

    const cleanHistory = sanitizeHistory(history);
    const messages = [{ role: "system", content: SYSTEM_PROMPT }, ...cleanHistory];
    if (mode === "extract") {
      messages.push({ role: "user", content: EXTRACTION_PROMPT });
    }

    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages,
      ...(mode === "extract" ? { response_format: { type: "json_object" } } : {}),
    });

    const content = completion.choices?.[0]?.message?.content ?? "";
    return res.status(200).json({ content });
  } catch (error) {
    console.error("job-chat error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
