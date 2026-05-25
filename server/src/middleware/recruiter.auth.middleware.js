import Recruiter from "../models/recruiter.model.js";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: ACCESS_TOKEN_SECRET (or JWT_SECRET) is not set. Refusing to start with an insecure default.');
}

export const verifyRecruiterJWT = (req, res, next) => {
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

        req.id = decodedToken.id;
        req.role = 'recruiter';

        Recruiter.findById(decodedToken.id).select("-password").then(recruiter => {
            if (!recruiter) {
                return res.status(401).json({ message: "Unauthorized request: Recruiter not found" });
            }

            req.user = recruiter;
            next();
        }).catch(() => {
            return res.status(500).json({ message: "Internal Server Error" });
        });

    } catch (error) {
        return res.status(401).json({ message: "Unauthorized request: Invalid token" });
    }
};
