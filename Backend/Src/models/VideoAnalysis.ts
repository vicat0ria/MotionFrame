import mongoose from "mongoose";
import type { IVideoAnalysis } from "../types/index.js";

const videoAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed"],
      default: "processing",
    },
    progress: {
      type: Number,
      default: 0,
    },
    s3VideoKey: {
      type: String,
      required: true,
    },
    s3ThumbnailKey: {
      type: String,
      required: true,
    },
    s3LandmarksKey: {
      type: String,
    },
    size: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
    },
    resolution: {
      width: Number,
      height: Number,
    },
  },
  { timestamps: true }
);

videoAnalysisSchema.index({ userId: 1 });
videoAnalysisSchema.index({ createdAt: 1 });

const VideoAnalysis = mongoose.model<IVideoAnalysis>(
  "VideoAnalysis",
  videoAnalysisSchema
);
export default VideoAnalysis;
