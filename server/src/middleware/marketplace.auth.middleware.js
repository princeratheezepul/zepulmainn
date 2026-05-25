import jwt from "jsonwebtoken";
import { MpUser } from "../models/mpuser.model.js";
import { validateUserSession, createUserSession } from "../utils/sessionManager.js";

const MARKETPLACE_JWT_SECRET = process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
if (!MARKETPLACE_JWT_SECRET) {
  throw new Error('FATAL: ACCESS_TOKEN_SECRET (or JWT_SECRET) is not set. Refusing to start with an insecure default.');
}

export const authenticateMarketplace = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, MARKETPLACE_JWT_SECRET);

    if (decoded.type !== 'marketplace') {
      return res.status(401).json({
        success: false,
        message: "Invalid token type"
      });
    }

    const user = await MpUser.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    if (decoded.sessionId) {
      await validateUserSession(decoded.userId, decoded.sessionId);
    }

    req.user = {
      userId: decoded.userId,
      sessionId: decoded.sessionId,
      userType: 'marketplace'
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired"
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
