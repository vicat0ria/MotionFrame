import { Request, Response } from "express";
import { projectService } from "../services/projectService.js";
import { Types } from "mongoose";

export const createProject = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const project = await projectService.createProject({
      ...req.body,
      userId: new Types.ObjectId(userId),
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Error creating project" });
  }
};

export const getUserProjects = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const projects = await projectService.getUserProjects(userId.toString());
    res.json(projects);
  } catch (error) {
    console.error("Error getting user projects:", error);
    res.status(500).json({ message: "Error getting projects" });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const project = await projectService.getProjectById(projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user owns the project
    if (project.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error getting project:", error);
    res.status(500).json({ message: "Error getting project" });
  }
};

export const updateProjectStatus = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { status, s3ExportKey } = req.body;

    const project = await projectService.updateProjectStatus(
      projectId,
      status,
      s3ExportKey
    );
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error updating project status:", error);
    res.status(500).json({ message: "Error updating project" });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const success = await projectService.deleteProject(projectId);

    if (!success) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ message: "Error deleting project" });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;

    // Get the project first to check ownership
    const project = await projectService.getProjectById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if user owns the project
    if (project.userId.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // Update the project
    const updatedProject = await projectService.updateProject(
      projectId,
      updateData
    );
    res.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Error updating project" });
  }
};
