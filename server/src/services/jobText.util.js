/**
 * Shared text normalisation for job matching.
 *
 * Query text and job postings run through exactly the same pipeline, so the
 * stemming here does not have to be linguistically perfect — it only has to be
 * symmetric. "devops" -> "devop" on both sides still matches.
 *
 * The property that matters is that matching is token based rather than
 * substring based. Substring matching is what made the old search wrong:
 * "java" matched "javascript", the skill "go" matched "mongodb" and "django",
 * and a two-letter skill matched almost every posting in the database.
 */

// Multi-word concepts whose spelling varies between a candidate's query and a
// job description. Collapsed before tokenising so both sides agree on how many
// tokens the concept is worth.
const PRE_REPLACE = [
  [/\bfront[\s-]?end\b/g, "frontend"],
  [/\bback[\s-]?end\b/g, "backend"],
  [/\bfull[\s-]?stack\b/g, "fullstack"],
  [/\bmachine[\s-]?learning\b/g, "machinelearning"],
  [/\bdeep[\s-]?learning\b/g, "deeplearning"],
  [/\bdata[\s-]?science\b/g, "datascience"],
  [/\bdata[\s-]?scientist\b/g, "datascientist"],
  [/\bnode[\s-]?js\b/g, "nodejs"],
  [/\bui\s*[\/&+]\s*ux\b/g, "ui ux"],
  [/\bwork from home\b/g, "remote"],
  [/\bon[\s-]?site\b/g, "onsite"],
  [/\bin[\s-]?office\b/g, "onsite"],
  [/\bwork from office\b/g, "onsite"],
  [/\bpart[\s-]?time\b/g, "parttime"],
  [/\bfull[\s-]?time\b/g, "fulltime"],
  [/\bc\s?\+\s?\+/g, "cplusplus"],
  [/\bc\s?#/g, "csharp"],
  [/\.net\b/g, "dotnet"],
];

// Variant spellings that mean the same thing. Applied per token.
//
// "engineer" and "developer" collapse together on purpose: in job titles they
// are interchangeable, and keeping them apart made "react developer" miss every
// "React Engineer" posting. Collapsing also raises the shared token's document
// frequency, which correctly lowers how much the word is worth when scoring.
const ALIASES = {
  js: "javascript",
  ts: "typescript",
  "node.js": "nodejs",
  node: "nodejs",
  "react.js": "react",
  reactjs: "react",
  "vue.js": "vue",
  vuejs: "vue",
  angularjs: "angular",
  "next.js": "nextjs",
  py: "python",
  k8s: "kubernetes",
  kube: "kubernetes",
  golang: "go",
  postgres: "postgresql",
  psql: "postgresql",
  mongo: "mongodb",
  ml: "machinelearning",
  nlp: "naturallanguageprocessing",
  dev: "developer",
  devs: "developer",
  development: "developer",
  developing: "developer",
  programmer: "developer",
  coder: "developer",
  engineer: "developer",
  engineering: "developer",
  sde: "developer",
  swe: "developer",
  designing: "design",
  designer: "design",
  sr: "senior",
  jr: "junior",
  analyst: "analytics",
  analysis: "analytics",
  qa: "quality",
  sdet: "quality",
  hr: "humanresources",
  pm: "productmanager",
  mgr: "manager",
  management: "manager",
  managing: "manager",
  intern: "internship",
  interns: "internship",
  trainee: "internship",
  apprentice: "internship",
  apprenticeship: "internship",
  fresher: "junior",
  graduate: "junior",
  entry: "junior",
  bangalore: "bengaluru",
  bombay: "mumbai",
  calcutta: "kolkata",
  madras: "chennai",
  gurgaon: "gurugram",
  noida: "noida",
  ncr: "delhi",
  sf: "sanfrancisco",
  nyc: "newyork",
  blr: "bengaluru",
};

// Tokens whose trailing "s" is part of the word, so de-pluralising them would
// produce a token that no longer matches anything real.
const KEEP_PLURAL = new Set([
  "kubernetes", "devops", "aws", "mlops", "jenkins", "kafkas", "analytics",
  "graphics", "mathematics", "physics", "logistics", "ios", "news", "ops",
  "sales", "operations", "systems", "communications",
]);

// Filler words that carry no matching signal. Stripped from both sides.
export const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "you", "your", "are", "was", "were",
  "have", "has", "had", "but", "not", "from", "they", "them", "their", "would",
  "want", "wants", "wanted", "looking", "look", "role", "roles", "job", "jobs",
  "work", "like", "really", "just", "about", "into", "what", "when", "where",
  "which", "who", "will", "can", "could", "should", "more", "some", "any",
  "yeah", "okay", "know", "think", "kind", "going", "good", "great", "well",
  "right", "lot", "also", "able", "i'm", "i've", "it's", "zeus", "zepul",
  "interview", "candidate", "assistant", "hello", "thanks", "thank", "need",
  "find", "show", "give", "please", "position", "positions", "opening",
  "openings", "opportunity", "opportunities", "hiring", "apply", "near", "around",
  // Short function words. Kept out of the corpus so "developer in bengaluru"
  // does not spend query weight on "in".
  "in", "at", "on", "of", "or", "to", "an", "as", "by", "be", "is", "it", "we",
  "my", "me", "am", "do", "so", "up", "if", "no", "yes", "a", "i",
]);

const preNormalise = (text) => {
  let out = String(text || "").toLowerCase();
  for (const [re, to] of PRE_REPLACE) out = out.replace(re, to);
  return out;
};

const cleanToken = (raw) => {
  if (!raw) return "";
  // Alias before stripping dots so "react.js" and "node.js" resolve.
  let t = ALIASES[raw] || raw;
  t = t.replace(/^\.+|\.+$/g, "");
  if (!t) return "";
  t = ALIASES[t] || t;

  // Symmetric de-pluralisation. Applied to both the query and the posting, so
  // an imperfect result ("sales" -> "sale") still matches on both sides.
  if (t.length > 4 && t.endsWith("s") && !KEEP_PLURAL.has(t) && !/(ss|us|is|as|os)$/.test(t)) {
    const singular = t.slice(0, -1);
    t = ALIASES[singular] || singular;
  }
  return t;
};

/**
 * Break text into canonical matching tokens.
 * Stop words are dropped unless the caller needs the raw shape (locations).
 */
export const tokenize = (text, { keepStopWords = false } = {}) =>
  preNormalise(text)
    .replace(/[^a-z0-9+#.]+/g, " ")
    .split(" ")
    .map(cleanToken)
    .filter((t) => t && t.length >= 2 && (keepStopWords || !STOP_WORDS.has(t)));

/** Tokens of a single term ("react developer" -> ["react","developer"]). */
export const termTokens = (term) => tokenize(term);

/** Space-padded token string, so a phrase can be located on word boundaries. */
const phraseOf = (tokens) => (tokens.length ? ` ${tokens.join(" ")} ` : "");

export const hasPhrase = (phrase, tokens) =>
  tokens.length > 0 && phrase.includes(` ${tokens.join(" ")} `);

const toList = (v) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);

/**
 * Pre-computed token view of a posting. Built once per corpus refresh and then
 * reused by every search, so scoring a query is pure set lookups rather than a
 * fresh pass over every description.
 */
export const indexDocument = (doc) => {
  const titleTokens = tokenize(doc.title);
  const skillTokens = tokenize(toList(doc.skills).join(" "));
  const bodyTokens = tokenize(doc.body);
  const locationTokens = tokenize(doc.location, { keepStopWords: true });

  return {
    doc,
    titleSet: new Set(titleTokens),
    titlePhrase: phraseOf(titleTokens),
    skillSet: new Set(skillTokens),
    skillPhrase: phraseOf(skillTokens),
    bodySet: new Set(bodyTokens),
    bodyPhrase: phraseOf(bodyTokens),
    locationPhrase: phraseOf(locationTokens),
    // Distinct tokens only — document frequency counts documents, not mentions.
    allTokens: new Set([...titleTokens, ...skillTokens, ...bodyTokens]),
  };
};

// Where a term was found decides how much the hit is worth. A skill named in the
// title is a far stronger signal than the same word buried in a description.
export const HIT_TITLE = 1;
export const HIT_SKILL = 0.9;
export const HIT_BODY = 0.55;

const MISS = { hit: 0, where: null };

const singleTokenHit = (token, idx) => {
  if (idx.titleSet.has(token)) return { hit: HIT_TITLE, where: "title" };
  if (idx.skillSet.has(token)) return { hit: HIT_SKILL, where: "skill" };
  if (idx.bodySet.has(token)) return { hit: HIT_BODY, where: "body" };
  return MISS;
};

/**
 * How strongly a term appears in a posting: `hit` runs 0 (absent) to 1 (in the
 * title), and `where` names the strongest field it was found in.
 *
 * A multi-word term scores best as an exact phrase and gets partial credit when
 * only some of its words are present. Callers need `where` because a word found
 * only in the body of a description is weak evidence — enough to rank on, not
 * enough on its own to call a posting a match.
 */
export const termHit = (tokens, idx) => {
  if (!tokens.length) return MISS;
  if (tokens.length === 1) return singleTokenHit(tokens[0], idx);

  if (hasPhrase(idx.titlePhrase, tokens)) return { hit: HIT_TITLE, where: "title" };
  if (hasPhrase(idx.skillPhrase, tokens)) return { hit: HIT_SKILL, where: "skill" };
  if (hasPhrase(idx.bodyPhrase, tokens)) return { hit: HIT_BODY, where: "body" };

  // Scattered rather than phrased — worth less than an exact phrase hit.
  const parts = tokens.map((t) => singleTokenHit(t, idx));
  const found = parts.filter((p) => p.hit > 0);
  if (!found.length) return MISS;

  const mean = found.reduce((sum, p) => sum + p.hit, 0) / tokens.length;
  const best = found.some((p) => p.where === "title")
    ? "title"
    : found.some((p) => p.where === "skill")
      ? "skill"
      : "body";
  return { hit: mean * 0.85, where: best };
};

/**
 * Document frequency table over a corpus. Terms that appear in most postings
 * ("developer", "team") end up nearly worthless, which is what stops a generic
 * word in the query from dragging in a page of unrelated roles.
 */
export const buildIdf = (indexes) => {
  const df = new Map();
  for (const idx of indexes) {
    for (const token of idx.allTokens) df.set(token, (df.get(token) || 0) + 1);
  }
  return { n: indexes.length, df };
};

export const FLAT_IDF = { n: 0, df: new Map() };

/** Smoothed IDF, clamped so a single exotic token cannot dominate a score. */
export const idfWeight = (idf, token) => {
  if (!idf || !idf.n) return 1;
  const d = idf.df.get(token) || 0;
  return Math.min(3, Math.max(0.3, Math.log((idf.n + 1) / (d + 1)) + 0.25));
};

/** A term is worth as much as its rarest word — that word is what makes it specific. */
export const termWeight = (idf, tokens) =>
  tokens.length ? Math.max(...tokens.map((t) => idfWeight(idf, t))) : 0;
