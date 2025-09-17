import jwt from "jsonwebtoken";
import { MpUser } from "../models/mpuser.model.js";

export const authenticateMarketplace = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "marketplace_secret_key");
    
    // Check if token is for marketplace
    if (decoded.type !== 'marketplace') {
      return res.status(401).json({
        success: false,
        message: "Invalid token type"
      });
    }

    // Verify user still exists
    const user = await MpUser.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }

    req.user = {
      userId: decoded.userId,
      userType: 'marketplace'
    };

    next();
  } catch (error) {
    console.error("Marketplace auth middleware error:", error);
    
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
