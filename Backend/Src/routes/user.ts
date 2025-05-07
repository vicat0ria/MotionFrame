import { Router } from "express";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware.js";
import { apiLimiter } from "../middleware/ratelimit.middleware.js";
import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getAllUsers,
} from "../controllers/user.controller.js";

const router = Router();

// Apply rate limiting to all routes
router.use(apiLimiter);

// Protected routes
router.get("/profile", isAuthenticated, getUserProfile);
router.put("/profile", isAuthenticated, updateUserProfile);
router.delete("/profile", isAuthenticated, deleteUser);

// Admin only routes
router.get("/all", isAuthenticated, isAdmin, getAllUsers);

export default router;
