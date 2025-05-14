import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  updatePassword,
  findUserByEmail,
} from "../services/authService.js";
import {
  validateEmail,
  validatePassword,
  validateUsername,
  normalizeEmail,
} from "../utils/validation.js";
import { AppError } from "../middleware/error.middleware.js";
import logger from "../utils/logger.js";
import { generateToken } from "../utils/security.js";
import { createSession } from "../services/sessionService.js";

declare module "express" {
  interface Request {
    useragent?: {
      browser?: string;
      os?: string;
    };
  }
}

// user registration controller
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, name } = req.body;

    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number",
      });
    }

    if (username && !validateUsername(username)) {
      return res.status(400).json({
        message:
          "Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens",
      });
    }

    // Check if email exists with any provider
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      // Check if this is an OAuth user
      if (existingUser.oauthProviders?.length > 0) {
        return res.status(400).json({
          message: `This email is already registered with ${existingUser.oauthProviders.join(
            ", "
          )}. Please sign in with that method.`,
          authMethods: existingUser.oauthProviders,
        });
      }

      return res.status(400).json({ message: "Email already registered" });
    }

    // Create user
    const user = await registerUser(email, password, username);

    // Set profile name if provided
    if (name && !user.profile?.name) {
      user.profile = { ...user.profile, name };
      await user.save();
    }

    res.status(201).json({
      message: "User registered successfully",
      userId: user._id.toString(),
    });
  } catch (error) {
    logger.error("Registration error:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error during registration" });
  }
};

// user login controller
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    try {
      const user = await loginUser(email, password);

      // Handle session
      req.login(user, (err) => {
        if (err) {
          logger.error("Session error during login:", err);
          return res.status(500).json({ message: "Error during login" });
        }

        return res.status(200).json({
          message: "Login successful",
          user: {
            id: user._id.toString(),
            email: user.email,
            username: user.username,
            profile: user.profile,
            isEmailVerified: user.isEmailVerified,
          },
        });
      });
    } catch (error) {
      // Special handling for OAuth accounts
      if (error instanceof AppError && error.message.includes("social login")) {
        const user = await findUserByEmail(email);

        if (user?.oauthProviders && user.oauthProviders.length > 0) {
          return res.status(400).json({
            message: `This account was created with ${user.oauthProviders.join(
              ", "
            )}. Please sign in with that method.`,
            authMethods: user.oauthProviders,
          });
        }
      }

      throw error; // Re-throw for the outer catch
    }
  } catch (error) {
    logger.error("Login error:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error during login" });
  }
};

// change password controller
export const changePassword = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, and one number",
      });
    }

    await updatePassword(req.user._id.toString(), currentPassword, newPassword);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    logger.error("Password change error:", error);

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error while updating password" });
  }
};

// user logout controller
export const logout = (req: Request, res: Response) => {
  // If not authenticated, just ensure the cookie is cleared
  if (!req.isAuthenticated()) {
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res.status(200).json({ message: "Already logged out" });
  }

  req.logout((err) => {
    if (err) {
      logger.error("Logout error:", err);
      return res.status(500).json({ message: "Error during logout" });
    }

    req.session.destroy((err) => {
      if (err) {
        logger.error("Session destruction error:", err);
        return res.status(500).json({ message: "Error destroying session" });
      }

      res.clearCookie("connect.sid", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.status(200).json({ message: "Logged out successfully" });
    });
  });
};

// get current user controller
export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const user = req.user as any;

  // Determine authentication provider and password status
  const authProvider =
    user.oauthProviders && user.oauthProviders.length > 0
      ? user.oauthProviders[0]
      : "email";
  // Assuming passwordHash or similar field indicates local password
  const hasPassword = !!user.passwordHash;
  return res.status(200).json({
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    profile: user.profile,
    isEmailVerified: user.isEmailVerified || false,
    authProvider,
    hasPassword,
  });
};

export const oauthCallback = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
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
      return res.redirect("/login?error=oauth_failed");
    }

    // Generate new session token
    const token = generateToken();
    if (!token) {
      throw new AppError("Failed to generate session token", 500);
    }

    // Create new session
    await createSession(req.user._id.toString(), {
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      browser: req.useragent?.browser,
      os: req.useragent?.os,
    });

    // Redirect to frontend with success
    return res.redirect(
      `${process.env.CLIENT_URL}/oauth-callback?success=true&token=${token}`
    );
  } catch (error) {
    logger.error("OAuth callback error:", error);
    // Clear session on error
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
    return res.redirect("/login?error=oauth_failed");
  }
};
