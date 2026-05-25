import { Admin } from '../models/admin.model.js';
import { User } from '../models/user.model.js';
import Recruiter from '../models/recruiter.model.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: ACCESS_TOKEN_SECRET (or JWT_SECRET) is not set. Refusing to start with an insecure default.');
}

export const multiAuthMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.recruiterToken ||
                 req.cookies?.accessToken ||
                 req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Unauthorized request: No token provided" });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET);

    if (!decodedToken) {
      return res.status(401).json({ message: "Unauthorized request: Invalid token" });
    }

    Promise.all([
      Recruiter.findById(decodedToken.id || decodedToken._id).select("-password"),
      User.findById(decodedToken.id || decodedToken._id).select("-password"),
      Admin.findById(decodedToken.id || decodedToken._id).select("-password")
    ]).then(([recruiter, user, admin]) => {
      if (recruiter) {
        req.user = recruiter;
        req.id = recruiter._id;
        req.role = 'recruiter';
        return next();
      } else if (user && user.type === 'manager') {
        req.user = user;
        req.id = user._id;
        req.role = 'manager';
        return next();
      } else if (admin) {
        req.user = admin;
        req.id = admin._id;
        req.role = 'admin';
        return next();
      } else {
        return res.status(401).json({ message: "Unauthorized request: User not found" });
      }
    }).catch(() => {
      return res.status(500).json({ message: "Internal Server Error" });
    });

  } catch (error) {
    return res.status(401).json({ message: "Unauthorized request: Invalid token" });
  }
};

// Keep the old export for backward compatibility
export const verifyMultiJWT = multiAuthMiddleware; 