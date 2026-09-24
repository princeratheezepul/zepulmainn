/**
 * The conversational half of candidate job search.
 *
 * Typing a phrase into the search box works, but it forces the candidate to
 * compress everything they care about — the stack, the setup, the industry, the
 * things they will not accept — into one line. This agent asks for that depth a
 * question at a time, then distils the conversation into a single search phrase.
 *
 * The phrase is deliberately the only output that reaches the matcher: it goes
 * through the same buildSearchIntent → searchJobs path as a typed search, so
 * there is one ranking implementation rather than two that can drift apart.
 */

import OpenAI from "openai";

const openai = process.env.OPENAI_API ? new OpenAI({ apiKey: process.env.OPENAI_API }) : null;

const MODEL = "gpt-4o-mini";

// Must stay at or under the search endpoints' own MAX_QUERY_LEN, otherwise the
// distilled phrase gets truncated mid-word before it is ever parsed.
const MAX_SEARCH_QUERY_LEN = 180;

const SYSTEM_PROMPT = `You are "Zepul Job Search Assistant", a warm, focused AI career advisor.
Your job is to understand — in depth — what kind of role this candidate wants next, so you can search for it on their behalf.

Collect the following, ONE question at a time, in this order. Never ask two questions in one message.

1. The kind of role or work they want next (job title, or a description if they are unsure).
2. The skills, tools or technologies they want to actually use day to day.
3. Their experience level (years, or "fresher" / "student").
4. Where they want to work — city or country — and whether they want remote, hybrid or on-site.
5. Employment type: full-time, internship, contract or part-time.
6. Industry, company size or type of company they are drawn to (or "no preference").
7. Salary or stipend expectation (make clear this is optional and they may skip it).
8. Anything that would rule a job out for them — deal-breakers, or must-haves.

Rules:
- Be conversational and encouraging. React briefly to what they said before asking the next thing.
- Keep every message short: two sentences at most, then the question.
- If an answer is vague, ask ONE follow-up to sharpen it before moving on. Depth matters more than speed here.
- Never invent preferences they did not state, and never recommend specific jobs — searching is a later step.
- If they say they don't know or don't mind, accept it and move on.
- Once you have all eight, reply with exactly: "[FINISHED] Perfect — I've got a clear picture. Searching for roles that match now..."`;

const EXTRACTION_PROMPT = `Based on the conversation above, produce a valid JSON object with exactly these keys:

"query" (string): ONE dense search phrase, at most ${MAX_SEARCH_QUERY_LEN} characters, written the way a candidate would type it into a job search box. Lead with the role, then the key skills, then location/work type, seniority and employment type. Example: "senior react developer, typescript, node, remote or Bengaluru, 5+ years, full-time, fintech". No sentences, no salary figures, no deal-breakers.
"summary" (string): one short plain-English sentence describing what they are looking for, addressed to them ("You're looking for...").
"role" (string): the single job title that best fits.
"skills" (array of strings): the skills and tools they named, at most 8.
"locations" (array of strings): the places they named. Empty array if none.
"workType" (string): exactly one of "remote", "hybrid", "onsite", or "" if unstated.
"employmentType" (string): exactly one of "Full-time", "Part-time", "Contract", "Internship", or "" if unstated.
"experience" (string): what they said about years of experience, e.g. "5+ years" or "fresher". Empty string if unstated.
"notes" (array of strings): their deal-breakers and must-haves, at most 4 short phrases.

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

export const candidateSearchChat = async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ message: "The search assistant is unavailable right now." });
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

    return res.status(200).json({ content: completion.choices?.[0]?.message?.content ?? "" });
  } catch (error) {
    console.error("candidate search-chat error:", error);
    return res.status(500).json({ message: "The search assistant hit a problem. Please try again." });
  }
};
