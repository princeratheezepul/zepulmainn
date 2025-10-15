import jwt from "jsonwebtoken";
import { MpUser } from "../models/mpuser.model.js";
import { validateUserSession, createUserSession } from "../utils/sessionManager.js";

export const authenticateMarketplace = async (req, res, next) => {
  try {
    console.log("=== MARKETPLACE AUTH MIDDLEWARE ===");
    console.log("Request URL:", req.url);
    console.log("Request method:", req.method);
    
    const token = req.header("Authorization")?.replace("Bearer ", "");
    console.log("Token present:", !!token);
    console.log("Token preview:", token ? token.substring(0, 20) + '...' : 'No token');

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "marketplace_secret_key");
    console.log("Token decoded successfully:", { userId: decoded.userId, sessionId: decoded.sessionId, type: decoded.type });
    
    // Check if token is for marketplace
    if (decoded.type !== 'marketplace') {
      console.log("Invalid token type:", decoded.type);
      return res.status(401).json({
        success: false,
        message: "Invalid token type"
      });
    }

    // Verify user exists
    console.log("Verifying user exists:", decoded.userId);
    const user = await MpUser.findById(decoded.userId);
    if (!user) {
      console.log("User not found");
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }
    
    console.log("User verified successfully:", user.emailid);
    
    // Optional: Validate session if sessionId exists (non-blocking - just for logging)
    if (decoded.sessionId) {
      const sessionValidation = await validateUserSession(decoded.userId, decoded.sessionId);
      if (!sessionValidation.valid) {
        console.log("Note: Session validation failed but allowing request:", sessionValidation.reason);
        console.log("User may need to re-login for optimal experience");
      } else {
        console.log("Session is valid");
      }
    }

    console.log("Authentication successful, proceeding to next middleware");

    req.user = {
      userId: decoded.userId,
      sessionId: decoded.sessionId,
      userType: 'marketplace'
    };

    next();
  } catch (error) {
    console.error("=== MARKETPLACE AUTH MIDDLEWARE ERROR ===");
    console.error("Marketplace auth middleware error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("=== END AUTH ERROR DEBUG ===");
    
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
