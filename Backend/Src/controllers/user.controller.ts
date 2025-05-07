import { Request, Response } from "express";
import User from "../models/User.js";
import { validateEmail, validateUsername } from "../utils/validation.js";
import { sanitizeUser } from "../utils/security.js";
import { AppError } from "../middleware/error.middleware.js";
import logger from "../utils/logger.js";
import { IUser } from "../types/index.js";

// Type guard to check if user exists
function ensureUserAuthenticated(
  req: Request
): asserts req is Request & { user: IUser } {
  if (!req.user) {
    throw new Error("User not authenticated");
  }
}

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    ensureUserAuthenticated(req);

    const user = await User.findById(req.user._id).select("-password -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(sanitizeUser(user));
  } catch (error) {
    logger.error("Error fetching user profile:", error);

    if ((error as Error).message === "User not authenticated") {
      return res.status(401).json({ message: "Authentication required" });
    }

    res.status(500).json({ message: "Error fetching user profile" });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    ensureUserAuthenticated(req);

    const { username, email } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate email if provided
    if (email) {
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Check if email is already in use by another user
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user._id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email is already in use" });
      }

      user.email = email;
    }

    // Validate username if provided
    if (username) {
      if (!validateUsername(username)) {
        return res.status(400).json({
          message:
            "Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens",
        });
      }

      // Check if username is already in use
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.user._id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Username is already in use" });
      }

      user.username = username;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    logger.error("Error updating profile:", error);

    if ((error as Error).message === "User not authenticated") {
      return res.status(401).json({ message: "Authentication required" });
    }

    res.status(500).json({ message: "Error updating profile" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    ensureUserAuthenticated(req);

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hard delete
    await User.findByIdAndDelete(req.user._id);

    // Log the user out
    req.logout((err) => {
      if (err) {
        logger.error("Error logging out after account deletion:", err);
      }
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    logger.error("Error deleting user:", error);

    if ((error as Error).message === "User not authenticated") {
      return res.status(401).json({ message: "Authentication required" });
    }

    res.status(500).json({ message: "Error deleting user" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    ensureUserAuthenticated(req);

    // Verify admin role
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Forbidden - Admin access required" });
    }

    // Add pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ active: { $ne: false } })
        .select("-password -__v")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments({ active: { $ne: false } }),
    ]);

    const sanitizedUsers = users.map((user) => sanitizeUser(user));

    res.status(200).json({
      users: sanitizedUsers,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error("Error fetching users:", error);

    if ((error as Error).message === "User not authenticated") {
      return res.status(401).json({ message: "Authentication required" });
    }

    res.status(500).json({ message: "Error fetching users" });
  }
};
