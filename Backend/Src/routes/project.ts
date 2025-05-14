import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  createProject,
  getUserProjects,
  getProjectById,
  updateProjectStatus,
  deleteProject,
  updateProject,
} from "../controllers/project.controller.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Create a new project
router.post("/", createProject);

// Get all projects for the current user
router.get("/", getUserProjects);

// Get a specific project
router.get("/:projectId", getProjectById);

// Update project
router.patch("/:projectId", updateProject);

// Update project status
router.patch("/:projectId/status", updateProjectStatus);

// Delete a project
router.delete("/:projectId", deleteProject);

export default router;
