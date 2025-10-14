import crypto from 'crypto';
import { MpUser } from '../models/mpuser.model.js';

/**
 * Generate a unique session ID
 */
export const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a new session for a user
 * This will invalidate any existing sessions for the user
 */
export const createUserSession = async (userId) => {
  try {
    const sessionId = generateSessionId();
    const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    const user = await MpUser.findByIdAndUpdate(
      userId,
      {
        currentSessionId: sessionId,
        lastLoginAt: new Date(),
        sessionExpiresAt: sessionExpiresAt
      },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return {
      sessionId,
      expiresAt: sessionExpiresAt,
      user
    };
  } catch (error) {
    console.error('Error creating user session:', error);
    throw error;
  }
};

/**
 * Validate a user's session
 */
export const validateUserSession = async (userId, sessionId) => {
  try {
    const user = await MpUser.findById(userId);
    
    if (!user) {
      return { valid: false, reason: 'User not found' };
    }

    // Check if session ID matches
    if (!user.currentSessionId || user.currentSessionId !== sessionId) {
      return { valid: false, reason: 'Invalid session ID' };
    }

    // Check if session has expired
    if (!user.sessionExpiresAt || user.sessionExpiresAt < new Date()) {
      return { valid: false, reason: 'Session expired' };
    }

    return { valid: true, user };
  } catch (error) {
    console.error('Error validating user session:', error);
    return { valid: false, reason: 'Validation error' };
  }
};

/**
 * Invalidate a user's session (logout)
 */
export const invalidateUserSession = async (userId) => {
  try {
    const user = await MpUser.findByIdAndUpdate(
      userId,
      {
        currentSessionId: null,
        sessionExpiresAt: null
      },
      { new: true }
    );

    return user;
  } catch (error) {
    console.error('Error invalidating user session:', error);
    throw error;
  }
};

/**
 * Extend a user's session
 */
export const extendUserSession = async (userId, sessionId) => {
  try {
    const sessionExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    const user = await MpUser.findOneAndUpdate(
      { _id: userId, currentSessionId: sessionId },
      { sessionExpiresAt: sessionExpiresAt },
      { new: true }
    );

    if (!user) {
      return { success: false, reason: 'Session not found or invalid' };
    }

    return { success: true, expiresAt: sessionExpiresAt };
  } catch (error) {
    console.error('Error extending user session:', error);
    return { success: false, reason: 'Extension error' };
  }
};

/**
 * Clean up expired sessions (can be called periodically)
 */
export const cleanupExpiredSessions = async () => {
  try {
    const result = await MpUser.updateMany(
      {
        sessionExpiresAt: { $lt: new Date() }
      },
      {
        currentSessionId: null,
        sessionExpiresAt: null
      }
    );

    console.log(`Cleaned up ${result.modifiedCount} expired sessions`);
    return result.modifiedCount;
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
    throw error;
  }
};

/**
 * Get session info for a user
 */
export const getSessionInfo = async (userId) => {
  try {
    const user = await MpUser.findById(userId).select('currentSessionId lastLoginAt sessionExpiresAt');
    
    if (!user) {
      return null;
    }

    return {
      sessionId: user.currentSessionId,
      lastLoginAt: user.lastLoginAt,
      sessionExpiresAt: user.sessionExpiresAt,
      isActive: user.currentSessionId && user.sessionExpiresAt && user.sessionExpiresAt > new Date()
    };
  } catch (error) {
    console.error('Error getting session info:', error);
    return null;
  }
};
