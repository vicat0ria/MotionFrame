import express from "express";
import {
  VideoController,
  getThumbnail,
} from "../controllers/video.controller.js";
import { videoStreamingMiddleware } from "../middleware/videoStreaming.middleware.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { getUserVideos } from "../controllers/video.controller.js";
import {
  upload,
  validateFileSize,
  validateVideoDuration,
} from "../middleware/upload.middleware.js";

const router = express.Router();
const videoController = VideoController.getInstance();

// Get user videos
router.get("/user", isAuthenticated, getUserVideos);

// Get signed playback URL
router.get("/:id/url", isAuthenticated, videoController.getSignedPlaybackUrl);

// Get thumbnail
router.get("/:id/thumbnail", isAuthenticated, getThumbnail);

// Stream video
router.get("/:id", videoStreamingMiddleware);

// Upload video
router.post(
  "/upload",
  isAuthenticated,
  upload,
  validateFileSize,
  validateVideoDuration,
  videoController.uploadVideo
);

// Delete video
router.delete("/:id", isAuthenticated, videoController.deleteVideo);

// Get video processing progress
router.get("/:id/progress", isAuthenticated, videoController.getVideoProgress);

export default router;
