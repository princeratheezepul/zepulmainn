import crypto from "crypto";

const HEADER_NAME = "x-admin-invite-secret";

const timingSafeStringEqual = (a, b) => {
    if (typeof a !== "string" || typeof b !== "string") return false;
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return crypto.timingSafeEqual(aBuf, bBuf);
};

export const adminInviteGuard = (req, res, next) => {
    const expected = process.env.ADMIN_INVITE_SECRET;

    if (!expected || expected.length < 16) {
        return res.status(503).json({ message: "Admin registration is disabled" });
    }

    const provided = req.headers[HEADER_NAME];
    if (!timingSafeStringEqual(provided, expected)) {
        return res.status(403).json({ message: "Forbidden" });
    }

    next();
};
