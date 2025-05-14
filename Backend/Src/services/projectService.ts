import Project, { IProject } from "../models/Project.js";
import { Types } from "mongoose";

class ProjectService {
  async createProject(
    projectData: Omit<IProject, "_id" | "createdAt" | "updatedAt">
  ): Promise<IProject> {
    const project = new Project(projectData);
    return await project.save();
  }

  async getUserProjects(userId: string): Promise<IProject[]> {
    return await Project.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getProjectById(projectId: string): Promise<IProject | null> {
    return await Project.findById(projectId).exec();
  }

  async updateProject(
    projectId: string,
    updateData: Partial<IProject>
  ): Promise<IProject | null> {
    return await Project.findByIdAndUpdate(
      projectId,
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async updateProjectStatus(
    projectId: string,
    status: IProject["status"],
    s3ExportKey?: string
  ): Promise<IProject | null> {
    const update: Partial<IProject> = { status };
    if (s3ExportKey) {
      update.s3ExportKey = s3ExportKey;
    }
    return await Project.findByIdAndUpdate(projectId, update, {
      new: true,
    }).exec();
  }

  async deleteProject(projectId: string): Promise<boolean> {
    const result = await Project.findByIdAndDelete(projectId).exec();
    return !!result;
  }
}

export const projectService = new ProjectService();
