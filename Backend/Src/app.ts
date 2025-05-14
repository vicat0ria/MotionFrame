import express, { NextFunction } from "express";
import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import cors from "cors";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import logger from "./utils/logger.js";
import "./configs/passport-google.js";
import "./configs/passport-facebook.js";
import "./configs/passport-github.js";
import "./configs/passport-linkedin.js";
import "./configs/passport-local.js";
import { setupRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { setupSocketIO } from "./configs/socket.js";
import http from "http";
import {
  VideoService,
  VideoProcessingEvents,
} from "./services/videoService.service.js";

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URI || "");

// Session configuration
app.use(
  session({
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 24 hours
      autoRemove: "native",
      crypto: {
        secret: process.env.SESSION_SECRET || "your-secret-key",
      },
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
setupRoutes(app);

// Error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err && err.code === "LIMIT_FILE_SIZE") {
      res
        .status(413)
        .json({ status: "fail", message: "Video exceeds 100 MB limit" });
      return;
    }
    if (err && err.code === "LIMIT_UNEXPECTED_FILE") {
      res
        .status(400)
        .json({ status: "fail", message: "Unexpected form field" });
      return;
    }
    next(err);
  }
);

app.use(errorHandler);

// Create server instance
const server = http.createServer(app);

// Setup Socket.IO
const io = setupSocketIO(server);

// Broadcast video processing events to all connected clients
const videoService = VideoService.getInstance();
videoService["processingEvents"].on(
  "progress",
  (e: { analysisId: string; progress: number }) => {
    io.emit("video:progress", { id: e.analysisId, progress: e.progress });
  }
);
videoService["processingEvents"].on(
  "error",
  (e: { analysisId: string; error: string }) => {
    io.emit("video:error", { id: e.analysisId, error: e.error });
  }
);

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
});

export { app, server, io };
