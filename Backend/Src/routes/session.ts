import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  getUserSessions,
  terminateSession,
  terminateAllSessions,
  terminateAllAndLogout,
} from "../controllers/session.controller.js";

const router = Router();

// Apply authentication to all session routes
router.use(isAuthenticated);

// Get active sessions for the current user
router.get("/", getUserSessions);

// Terminate a specific session
router.delete("/:sessionId", terminateSession);

// Terminate all sessions except the current one
router.delete("/", terminateAllSessions);

// Terminate all sessions and logout
router.post("/logout-all", terminateAllAndLogout);

export default router;
