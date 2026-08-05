import dotenv from "dotenv";

dotenv.config();

// Imported first by src/index.js so this runs before any route/controller module
// is evaluated. Several auth modules throw at import time when their secret is
// missing, which crashes the boot with a stack trace pointing at whichever file
// happened to load first (e.g. recruiter.auth.middleware.js) rather than at the
// real cause. On Render a failed boot leaves the *previous* build serving
// traffic, so newly added routes silently 404 with an HTML error page. This
// check turns that into one explicit, actionable message in the deploy log.

// Fatal: the process cannot serve authenticated traffic without these.
const REQUIRED = [
  {
    name: "ACCESS_TOKEN_SECRET",
    aliases: ["JWT_SECRET"],
    why: "signs and verifies every auth token (manager, recruiter, candidate, marketplace)",
  },
  {
    name: "DB_URL",
    aliases: [],
    why: "MongoDB connection string",
  },
];

// Non-fatal: the server boots, but the related feature is degraded.
const RECOMMENDED = [
  { name: "FRONTEND_URL", why: "CORS allow-list for the deployed frontend" },
  { name: "OPENAI_API", why: "resume analysis, scorecards and AI generation" },
];

const isSet = (key) => typeof process.env[key] === "string" && process.env[key].trim() !== "";

export const validateEnv = () => {
  const missing = REQUIRED.filter(
    ({ name, aliases }) => !isSet(name) && !aliases.some(isSet)
  );

  for (const { name, why } of RECOMMENDED) {
    if (!isSet(name)) {
      console.warn(`[env] WARNING: ${name} is not set — ${why}.`);
    }
  }

  if (missing.length === 0) {
    console.log("[env] Required environment variables present.");
    return;
  }

  const details = missing
    .map(({ name, aliases, why }) => {
      const accepted = [name, ...aliases].join(" or ");
      return `  - ${accepted}\n      ${why}`;
    })
    .join("\n");

  console.error(
    `\n[env] FATAL: cannot start — ${missing.length} required environment variable(s) missing:\n${details}\n\n` +
      `Set them in the hosting provider's environment settings (Render: Dashboard > Service > Environment) and redeploy.\n`
  );

  process.exit(1);
};

validateEnv();
