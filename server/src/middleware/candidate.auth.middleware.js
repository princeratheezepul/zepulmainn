import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: ACCESS_TOKEN_SECRET (or JWT_SECRET) is not set. Refusing to start with an insecure default.');
}

/**
 * Verifies the candidate session token issued at login/signup and pins the
 * request to that candidate. Candidate records are addressed by :id in the URL,
 * so `requireSelf` is what stops one candidate reading or overwriting another's.
 */
export const verifyCandidate = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token) {
    return res.status(401).json({ message: "Please log in to continue" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== "candidate") {
      return res.status(403).json({ message: "Not a candidate session" });
    }
    req.candidateId = String(decoded.id);
    return next();
  } catch {
    return res.status(401).json({ message: "Session expired. Please log in again." });
  }
};

export const requireSelf = (req, res, next) => {
  if (String(req.params.id) !== req.candidateId) {
    return res.status(403).json({ message: "You can only access your own profile" });
  }
  return next();
};
