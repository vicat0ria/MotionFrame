import { Request, Response } from "express";
import {
  getActiveSessions,
  invalidateSession,
  invalidateAllUserSessions,
} from "../services/sessionService.js";
import logger from "../utils/logger.js";
import { IUser } from "../types/index.js";
import mongoose from "mongoose";

// type guard to ensure user is authenticated
function ensureUserAuthenticated(
  req: Request
): asserts req is Request & { user: IUser & { _id: mongoose.Types.ObjectId } } {
  if (!req.user) {
    throw new Error("User not authenticated");
  }
}

/**
 * Get all active sessions for the current user
 */
export const getUserSessions = async (req: Request, res: Response) => {
  try {
    ensureUserAuthenticated(req);

    const userId = req.user._id.toString();
    const sessions = await getActiveSessions(userId);

    // Format the sessions for the client
    const formattedSessions = sessions.map((session) => ({
      id: session._id,
      device: {
        browser: session.deviceInfo?.browser || "Unknown",
        os: session.deviceInfo?.os || "Unknown",
      },
      ipAddress: session.deviceInfo?.ipAddress || "Unknown",
      lastActive: session.deviceInfo?.lastActive || session.createdAt,
      current: session.token === req.sessionID,
    }));

    res.status(200).json(formattedSessions);
  } catch (error) {
    logger.error("Error getting user sessions:", error);

    if ((error as Error).message === "User not authenticated") {
      return res.status(401).json({ message: "Authentication required" });
    }

    res.status(500).json({ message: "Error retrieving session information" });
  }
};

/**
 * Terminate a specific session
 */
export const terminateSession = async (req: Request, res: Response) => {
  try {
    ensureUserAuthenticated(req);

    const userId = req.user._id.toString();
    const { sessionId } = req.params;

    // Get the session to check if it belongs to the current user
    const sessions = await getActiveSessions(userId);
    const session = sessions.find((s) => s._id.toString() === sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Prevent terminating the current session through this endpoint
    if (session.token === req.sessionID) {
      return res.status(400).json({
        message: "Cannot terminate current session. Use logout instead.",
      });
    }

    await invalidateSession(session.token);
    res.status(200).json({ message: "Session terminated successfully" });
  } catch (error) {
    logger.error("Error terminating session:", error);

    if ((error as Error).message === "User not authenticated") {
      return res.status(401).json({ message: "Authentication required" });
    }

    res.status(500).json({ message: "Error terminating session" });
  }
};

/**
 * Terminate all sessions except the current one
 */
export const terminateAllSessions = async (req: Request, res: Response) => {
  try {
    ensureUserAuthenticated(req);

    const userId = req.user._id.toString();
    const sessions = await getActiveSessions(userId);

    // Identify and terminate all sessions except the current one
    const terminationPromises = sessions
      .filter((session) => session.token !== req.sessionID)
      .map((session) => invalidateSession(session.token));

    await Promise.all(terminationPromises);

    const terminatedCount = terminationPromises.length;
    res.status(200).json({
      message: `Successfully terminated ${terminatedCount} ${
        terminatedCount === 1 ? "session" : "sessions"
      }`,
    });
  } catch (error) {
    logger.error("Error terminating all sessions:", error);

    if ((error as Error).message === "User not authenticated") {
      return res.status(401).json({ message: "Authentication required" });
    }

    res.status(500).json({ message: "Error terminating sessions" });
  }
};

/**
 * Terminate all sessions and logout current user
 */
export const terminateAllAndLogout = async (req: Request, res: Response) => {
  try {
    ensureUserAuthenticated(req);

    const userId = req.user._id.toString();

    // Terminate all sessions including current one
    await invalidateAllUserSessions(userId);

    // Logout current user
    req.logout((err) => {
      if (err) {
        logger.error("Error during logout:", err);
        return res.status(500).json({ message: "Error during logout" });
      }

      // Destroy the session
      req.session.destroy((err) => {
        if (err) {
          logger.error("Error destroying session:", err);
          return res.status(500).json({ message: "Error destroying session" });
        }

        // Clear session cookie
        res.clearCookie("connect.sid", {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });

        res.status(200).json({ message: "Logged out from all devices" });
      });
    });
  } catch (error) {
    logger.error("Error in terminate all and logout:", error);

    if ((error as Error).message === "User not authenticated") {
      return res.status(401).json({ message: "Authentication required" });
    }

    res.status(500).json({ message: "Error logging out from all devices" });
  }
};
