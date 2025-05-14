import mongoose from "mongoose";
import type { IVideoAnalysis } from "../types/index.js";

const videoAnalysisSchema = new mongoose.Schema(
  {
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoAnalysis",
      required: true,
    },
    compressedVideoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VideoAnalysis",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    error: {
      message: { type: String },
      code: { type: String },
      timestamp: { type: Date },
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
    s3LandmarksJsonKey: {
      type: String,
    },
    videoHash: {
      type: String,
      index: true,
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
videoAnalysisSchema.index({ videoHash: 1 });

const VideoAnalysis = mongoose.model<IVideoAnalysis>(
  "VideoAnalysis",
  videoAnalysisSchema
);
export default VideoAnalysis;
