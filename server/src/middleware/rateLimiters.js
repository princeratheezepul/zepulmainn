import rateLimit from "express-rate-limit";

// Throttle OpenAI-backed endpoints to protect API spend from authenticated abuse.
// Keys by user._id when an auth middleware has populated req.user, falls back to IP.
export const openAILimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.user?._id?.toString() || req.ip,
    message: { message: "Too many requests, please slow down." },
});

// Throttle the public proctoring-screenshot upload endpoints. These are unauthenticated
// (gated only by the unguessable assessmentId / meeting token), so cap per IP as
// defense-in-depth alongside the size limit, session-state guard, and per-session cap.
// A real session uploads ~3/min (one frame every 20s); the generous ceiling avoids
// locking out multiple legitimate candidates sharing one NAT/corporate IP.
export const screenshotLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many uploads, please slow down." },
});

// Cap admin-register attempts per IP. Defense-in-depth alongside the invite-secret guard.
export const adminRegisterLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many registration attempts. Try again later." },
});
