import Session from "../models/Session.js";
import { ISession } from "../types/index.js";
import { generateToken } from "../utils/security.js";
import { AppError } from "../middleware/error.middleware.js";
import logger from "../utils/logger.js";

export const createSession = async (
  userId: string,
  deviceInfo: any
): Promise<string> => {
  try {
    // Generate a unique session token
    const token = generateToken();

    // Validate token was generated properly
    if (!token || token.trim() === "") {
      logger.error("Failed to generate valid session token");
      throw new AppError("Failed to generate session token", 500);
    }

    // Create expiration date (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Create new session
    const session = new Session({
      userId,
      token,
      expiresAt,
      deviceInfo: {
        userAgent: deviceInfo.userAgent,
        ipAddress: deviceInfo.ipAddress,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        lastActive: new Date(),
      },
      isActive: true,
    });

    await session.save();
    return token;
  } catch (error: any) {
    logger.error("Error creating session:", error);
    if (error.code === 11000) {
      return createSession(userId, deviceInfo);
    }
    throw new AppError("Failed to create session", 500);
  }
};

export const validateSession = async (
  token: string
): Promise<ISession | null> => {
  try {
    // Ensure token is a non-empty string
    if (!token || token.trim() === "") {
      logger.warn("Empty token provided to validateSession");
      return null;
    }

    const session = await Session.findOne({
      token,
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    return session as ISession | null;
  } catch (error) {
    logger.error("Error validating session:", error);
    return null;
  }
};

export const invalidateSession = async (token: string): Promise<boolean> => {
  try {
    // Ensure token is a non-empty string
    if (!token || token.trim() === "") {
      logger.warn("Empty token provided to invalidateSession");
      return false;
    }

    const result = await Session.updateOne({ token }, { isActive: false });

    return result.modifiedCount > 0;
  } catch (error) {
    logger.error("Error invalidating session:", error);
    throw new AppError("Failed to invalidate session", 500);
  }
};

export const invalidateAllUserSessions = async (
  userId: string
): Promise<boolean> => {
  try {
    // Replace static method call with a direct query
    const result = await Session.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );
    return result.modifiedCount > 0;
  } catch (error) {
    logger.error("Error invalidating user sessions:", error);
    throw new AppError("Failed to invalidate user sessions", 500);
  }
};

export const getActiveSessions = async (userId: string) => {
  try {
    // Replace static method call with a direct query
    return await Session.find({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  } catch (error) {
    logger.error("Error fetching active sessions:", error);
    throw new AppError("Failed to fetch active sessions", 500);
  }
};

export const updateSessionActivity = async (
  token: string
): Promise<boolean> => {
  try {
    // Ensure token is a non-empty string
    if (!token || token.trim() === "") {
      logger.warn("Empty token provided to updateSessionActivity");
      return false;
    }

    const result = await Session.updateOne(
      { token, isActive: true },
      {
        "deviceInfo.lastActive": new Date(),
        // Extend expiration if needed
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    logger.error("Error updating session activity:", error);
    return false;
  }
};
