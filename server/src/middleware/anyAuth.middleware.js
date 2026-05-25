import jwt from "jsonwebtoken";
import Recruiter from "../models/recruiter.model.js";
import { User } from "../models/user.model.js";
import { Admin } from "../models/admin.model.js";
import { MpUser } from "../models/mpuser.model.js";

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL: ACCESS_TOKEN_SECRET (or JWT_SECRET) is not set. Refusing to start with an insecure default.");
}

const extractToken = (req) => {
  return (
    req.cookies?.recruiterToken ||
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace(/^Bearer\s+/i, "") ||
    null
  );
};

// Accepts any authenticated principal: recruiter, manager/admin/accountmanager (User), Admin, or marketplace user.
// Use this on shared endpoints (e.g., AI proxies) that multiple roles legitimately call.
export const anyAuth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const principalId = decoded._id || decoded.id || decoded.userId;
  if (!principalId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (decoded.type === "marketplace") {
      const mp = await MpUser.findById(principalId).select("-password -refreshToken");
      if (!mp) return res.status(401).json({ message: "Unauthorized" });
      req.user = mp;
      req.id = mp._id;
      req.role = "marketplace";
      return next();
    }

    const [recruiter, user, admin] = await Promise.all([
      Recruiter.findById(principalId).select("-password -refreshToken"),
      User.findById(principalId).select("-password -refreshToken"),
      Admin.findById(principalId).select("-password -refreshToken"),
    ]);

    const principal = recruiter || user || admin;
    if (!principal) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = principal;
    req.id = principal._id;
    req.role = recruiter ? "recruiter" : user ? user.type || "manager" : "admin";
    return next();
  } catch {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
