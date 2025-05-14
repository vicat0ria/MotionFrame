// backgroundProcessor.ts
import { VideoService } from "../services/videoService.service.js";
import VideoAnalysis from "../models/VideoAnalysis.js";
import connectDB from "../configs/db.js";
import logger from "../utils/logger.js";

async function processNextVideo() {
  try {
    // Connect to database
    await connectDB();

    // Find a pending video
    const pendingVideo = await VideoAnalysis.findOne({
      status: "pending",
      progress: 0,
    }).sort({ createdAt: 1 });

    if (!pendingVideo) {
      logger.info("No pending videos to process");
      return false;
    }

    logger.info(`Processing video: ${pendingVideo.videoId}`);

    // Get the video service
    const videoService = VideoService.getInstance();

    // Process the video
    await videoService.processUploadedVideo(
      pendingVideo.videoId.toString(),
      pendingVideo.originalName,
      pendingVideo.userId.toString()
    );

    return true;
  } catch (error) {
    logger.error(`Background processing error: ${error}`);
    return false;
  }
}

// Main processing loop
async function processingLoop() {
  while (true) {
    const hasProcessed = await processNextVideo();

    // If no videos were processed, wait longer before checking again
    await new Promise((resolve) =>
      setTimeout(resolve, hasProcessed ? 1000 : 10000)
    );
  }
}

// Start the background processor
processingLoop().catch((err) => {
  logger.error(`Fatal background processor error: ${err}`);
  process.exit(1);
});
