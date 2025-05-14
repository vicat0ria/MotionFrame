import express from "express";
import {
  VideoController,
  getThumbnail,
} from "../controllers/video.controller.js";
import { videoStreamingMiddleware } from "../middleware/videoStreaming.middleware.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { getUserVideos } from "../controllers/video.controller.js";
import { upload } from "../middleware/upload.middleware.js";
import VideoAnalysis from "../models/VideoAnalysis.js";
import { S3Service } from "../services/s3Service.service.js";
import { AppError } from "../middleware/error.middleware.js";

const router = express.Router();
const videoController = VideoController.getInstance();

// Get user videos
router.get("/user", isAuthenticated, getUserVideos);

// Get signed playback URL - Make sure this route is defined before the video streaming route
router.get("/:id/url", isAuthenticated, videoController.getSignedPlaybackUrl);

// Get thumbnail
router.get("/:id/thumbnail", isAuthenticated, getThumbnail);

// Get video processing status
router.get("/:id/status", isAuthenticated, videoController.getVideoProgress);

// Stream video - this should be last among the /:id/* routes
router.get("/:id", videoStreamingMiddleware);

// Upload video
router.post(
  "/upload",
  isAuthenticated,
  upload.single("video"),
  videoController.uploadVideo
);

// Delete video
router.delete("/:id", isAuthenticated, videoController.deleteVideo);

// Update video title
router.patch("/:id/title", isAuthenticated, videoController.updateVideoTitle);

// Get per-frame landmarks JSON
router.get("/:id/landmarks", isAuthenticated, async (req, res, next) => {
  try {
    const analysis = await VideoAnalysis.findById(req.params.id);
    if (!analysis || !analysis.s3LandmarksJsonKey) {
      throw new AppError("Landmarks not found", 404);
    }
    const { stream } = await S3Service.getInstance().getFileStream(
      analysis.s3LandmarksJsonKey
    );
    let buf = "";
    stream.on("data", (chunk) => {
      buf += chunk;
    });
    stream.on("end", () => {
      res.json(JSON.parse(buf));
    });
  } catch (err) {
    next(err);
  }
});

export default router;
