import api from "./api";
import { Project } from "@/types/video.d";

export const projectService = {
  async createProject(projectData: Omit<Project, "id">): Promise<Project> {
    const response = await api.post<Project>("/projects", projectData);
    return response.data;
  },

  async getUserProjects(): Promise<Project[]> {
    const response = await api.get<Project[]>("/projects");
    return response.data;
  },

  async getProjectById(projectId: string): Promise<Project> {
    const response = await api.get<Project>(`/projects/${projectId}`);
    return response.data;
  },

  async updateProject(
    projectId: string,
    projectData: Partial<Project>
  ): Promise<Project> {
    const response = await api.patch<Project>(
      `/projects/${projectId}`,
      projectData
    );
    return response.data;
  },

  async updateProjectStatus(
    projectId: string,
    status: "pending" | "processing" | "completed" | "failed",
    s3ExportKey?: string
  ): Promise<Project> {
    const response = await api.patch<Project>(`/projects/${projectId}/status`, {
      status,
      s3ExportKey,
    });
    return response.data;
  },

  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },
};
