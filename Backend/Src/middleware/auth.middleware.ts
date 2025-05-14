import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";
// Import directly from express-session instead
import "express-session";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  // Clear any existing session data
  req.session.destroy((err) => {
    if (err) {
      logger.error("Error destroying session:", err);
    }
  });
  res.clearCookie("connect.sid", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.status(401).json({ message: "Unauthorized - Please log in" });
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Admin access required" });
};

export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Get the CSRF token from the request header
  const csrfToken = req.headers["x-csrf-token"] as string;

  // Get the stored token from the session
  const storedToken = req.session.csrfToken;

  if (!csrfToken || !storedToken || csrfToken !== storedToken) {
    logger.warn("CSRF attack detected", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    return res.status(403).json({ message: "CSRF token validation failed" });
  }

  next();
};

// Optional middleware to add user info to response for debugging
export const addUserToResponse = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (process.env.NODE_ENV !== "production" && req.isAuthenticated()) {
    res.locals.user = {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    };
  }
  next();
};

// Session activity tracker
export const trackActivity = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip logging for video routes and thumbnail routes
  if (req.path.includes("/api/videos/") || req.path.includes("/thumbnail")) {
    return next();
  }

  if (req.isAuthenticated() && req.user) {
    // Update last activity timestamp
    req.session.lastActive = new Date();

    // Only log non-GET requests to reduce spam
    if (process.env.NODE_ENV !== "production" && req.method !== "GET") {
      logger.debug(`User activity: ${req.user.email}`, {
        path: req.path,
        method: req.method,
      });
    }
  }
  next();
};
