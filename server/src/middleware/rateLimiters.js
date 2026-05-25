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

// Cap admin-register attempts per IP. Defense-in-depth alongside the invite-secret guard.
export const adminRegisterLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many registration attempts. Try again later." },
});
