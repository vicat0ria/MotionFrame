import { Express } from "express";
import videoRoutes from "./video.js";
import authRoutes from "./auth.js";
import userRoutes from "./user.js";
import sessionRoutes from "./session.js";
import mlRoutes from "./ml.js";
import projectRoutes from "./project.js";

export function setupRoutes(app: Express) {
  app.use("/api/videos", videoRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/sessions", sessionRoutes);
  app.use("/api/ml", mlRoutes);
  app.use("/api/projects", projectRoutes);
}
