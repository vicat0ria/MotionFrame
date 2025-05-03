import {
  CompressionService,
  CompressionPreset,
  VideoResolution,
} from "./compression.service.js";
import { ThumbnailService } from "./thumbnail.service.js";
import { S3Service } from "./s3Service.service.js";
import VideoAnalysis from "../models/VideoAnalysis.js";
import { AppError } from "../middleware/error.middleware.js";
import path from "path";
import fs from "fs";
import { promisify } from "util";
import mongoose from "mongoose";
import logger from "../utils/logger.js";
import os from "os";
import { Socket } from "socket.io";
import { getTempUploadsDir } from "../middleware/upload.middleware.js";
import { EventEmitter } from "events";
import { ObjectId } from "mongodb";
import connectDB from "../configs/db.js";
import {
  VideoAnalysis as VideoAnalysisType,
  CompressionOptions,
  ProcessingStage,
} from "../types/index.js";
import { Readable } from "stream";
import { Db } from "mongodb";

const unlink = promisify(fs.unlink);

// safe unlink without throwing
const safeUnlink = async (p: string) => {
  try {
    if (fs.existsSync(p)) await unlink(p);
  } catch (_) {}
};

// Event emitter for progress updates
export class VideoProcessingEvents extends EventEmitter {}

export class VideoService {
  private static instance: VideoService;
  private compressionService = CompressionService.getInstance();
  private thumbnailService = ThumbnailService.getInstance();
  private s3Service = S3Service.getInstance();

  private tempDir = getTempUploadsDir();
  private processingEvents = new VideoProcessingEvents();
  private socketConnections = new Map<string, Socket>();
  private activeProcessing = new Set<string>();

  private constructor() {
    try {
      this.compressionService = CompressionService.getInstance();
      this.thumbnailService = ThumbnailService.getInstance();
      this.s3Service = S3Service.getInstance();
      this.tempDir = getTempUploadsDir();
      this.processingEvents = new VideoProcessingEvents();
      this.socketConnections = new Map();
      this.activeProcessing = new Set();

      // Set up event listeners
      this.processingEvents.on("progress", this.handleProgressEvent.bind(this));
      this.processingEvents.on("error", this.handleErrorEvent.bind(this));

      logger.info(`VideoService initialized successfully`);
    } catch (error) {
      logger.error("VideoService initialization error:", error);
      throw error;
    }
  }

  public static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService();
    }
    return VideoService.instance;
  }

  /**
   * Register a socket connection for progress updates
   * @param userId User ID
   * @param socket Socket.io connection
   */
  public registerSocket(userId: string, socket: Socket): void {
    this.socketConnections.set(userId, socket);
    logger.info(`Registered socket for user ${userId}`);

    // Clean up on disconnect
    socket.on("disconnect", () => {
      this.socketConnections.delete(userId);
      logger.info(`Socket disconnected for user ${userId}`);
    });
  }

  /**
   * Get a video stream by ID
   * @param videoId Video ID to stream
   * @returns Stream from S3
   */
  async getVideo(videoId: string): Promise<VideoAnalysisType> {
    try {
      const analysis = await VideoAnalysis.findOne({
        $or: [{ _id: videoId }, { videoId }, { compressedVideoId: videoId }],
      });

      if (!analysis) {
        throw new AppError("Video not found", 404);
      }

      return {
        _id: analysis._id.toString(),
        userId: analysis.userId.toString(),
        originalName: analysis.originalName,
        status: analysis.status,
        progress: analysis.progress,
        s3VideoKey: analysis.s3VideoKey,
        s3ThumbnailKey: analysis.s3ThumbnailKey,
        s3LandmarksKey: analysis.s3LandmarksKey,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      } as VideoAnalysisType;
    } catch (error) {
      logger.error("getVideo error:", error);
      throw new AppError("Failed to retrieve video", 404);
    }
  }

  /**
   * Process a video that has been uploaded to the temp directory
   * @param filePath Path to the uploaded file
   * @param originalName Original filename
   * @param userId User ID
   * @returns ID of the processed video analysis
   */
  async processUploadedVideo(
    filePath: string,
    originalName: string,
    userId: string,
    options = {
      compressionPreset: CompressionPreset.MEDIUM,
      resolution: VideoResolution.HD,
    }
  ): Promise<string> {
    if (!fs.existsSync(filePath))
      throw new AppError(`Uploaded file not found at ${filePath}`, 404);

    const randomId = new mongoose.Types.ObjectId();
    const compressedOutPath = path.join(
      this.tempDir,
      `compressed_${randomId}.mp4`
    );

    const analysis = await VideoAnalysis.create({
      videoId: randomId,
      userId,
      status: "processing",
      progress: 0,
      originalName,
      s3VideoKey: `videos/compressed_${randomId.toString()}.mp4`,
      s3ThumbnailKey: `thumbnails/thumbnail_${randomId.toString()}.jpg`,
      size: fs.statSync(filePath).size,
    });

    /* fire-and-forget background work */
    this.startBackgroundProcessing(
      filePath,
      compressedOutPath,
      analysis._id.toString(),
      userId,
      options
    ).catch((err) => logger.error("Background processing error:", err));

    return analysis._id.toString();
  }

  /**
   * Start background processing of the video
   * This includes compression, thumbnail extraction, and storing in S3
   */
  private async startBackgroundProcessing(
    inputPath: string,
    outputPath: string,
    analysisId: string,
    userId: string,
    options: {
      compressionPreset: CompressionPreset;
      resolution: VideoResolution;
    }
  ): Promise<{ videoId: string }> {
    if (this.activeProcessing.has(analysisId))
      throw new AppError("Video is already being processed", 400);
    this.activeProcessing.add(analysisId);

    try {
      /* 0‑20 % : Compression */
      await this.updateProgress(analysisId, 0, ProcessingStage.PREPARING);
      await this.updateProgress(analysisId, 20, ProcessingStage.COMPRESSING);
      const compressedVideoId = await this.compressionService.compressVideo(
        inputPath,
        outputPath,
        options.compressionPreset,
        options.resolution
      );

      /* 20‑40 % : Thumbnail */
      await this.updateProgress(
        analysisId,
        40,
        ProcessingStage.EXTRACTING_THUMBNAIL
      );
      const thumbPath = await this.thumbnailService.extractThumbnail(
        outputPath
      );
      const thumbnailId = path.basename(thumbPath, path.extname(thumbPath));

      /* 40‑80 % : Uploads */
      await this.updateProgress(analysisId, 60, ProcessingStage.STORING);
      await this.s3Service.uploadFile(
        fs.createReadStream(outputPath),
        `videos/${compressedVideoId}.mp4`,
        "video/mp4"
      );
      await this.s3Service.uploadFile(
        fs.createReadStream(thumbPath),
        `thumbnails/${thumbnailId}`,
        "image/jpeg"
      );

      /* 80‑100 % : DB + cleanup */
      await VideoAnalysis.findByIdAndUpdate(analysisId, {
        compressedVideoId: `${compressedVideoId}.mp4`,
        thumbnailId,
        status: "completed",
        progress: 100,
        s3VideoKey: `videos/${compressedVideoId}.mp4`,
        s3ThumbnailKey: `thumbnails/${thumbnailId}`,
      });

      await this.updateProgress(analysisId, 80, ProcessingStage.CLEANING);
      await safeUnlink(inputPath);
      await safeUnlink(outputPath);
      await safeUnlink(thumbPath);

      await this.updateProgress(analysisId, 100, ProcessingStage.COMPLETED);
      return { videoId: compressedVideoId.toString() };
    } catch (err) {
      logger.error("Background processing error:", err);
      await this.updateProgress(analysisId, 0, ProcessingStage.FAILED);
      throw err;
    } finally {
      this.activeProcessing.delete(analysisId);
    }
  }

  // Clean up temp files
  private async updateProgress(
    analysisId: string,
    progress: number,
    stage: ProcessingStage
  ) {
    try {
      await VideoAnalysis.findByIdAndUpdate(analysisId, {
        progress,
        status:
          stage === ProcessingStage.COMPLETED
            ? "completed"
            : stage === ProcessingStage.FAILED
            ? "failed"
            : "processing",
      });
      this.processingEvents.emit("progress", { analysisId, progress, stage });
    } catch (err) {
      logger.error("Error updating progress:", err);
    }
  }

  private handleProgressEvent = (e: {
    analysisId: string;
    userId?: string;
    progress: number;
    stage: ProcessingStage;
  }) => {
    const socket = e.userId ? this.socketConnections.get(e.userId) : undefined;
    if (socket?.connected)
      socket.emit("video:progress", {
        id: e.analysisId,
        progress: e.progress,
        stage: e.stage,
      });
  };

  private handleErrorEvent = (e: {
    analysisId: string;
    userId?: string;
    error: string;
  }) => {
    const socket = e.userId ? this.socketConnections.get(e.userId) : undefined;
    if (socket?.connected)
      socket.emit("video:error", { id: e.analysisId, error: e.error });
  };

  /**
   * Delete a video and all associated files
   */
  async deleteVideo(fileId: string, userId: string) {
    try {
      // Find by any of _id, videoId, or compressedVideoId
      const analysis = await VideoAnalysis.findOne({
        $or: [
          { _id: fileId, userId },
          { videoId: fileId, userId },
          { compressedVideoId: fileId, userId },
        ],
      });

      if (!analysis) {
        throw new AppError("Video not found", 404);
      }

      // Delete all related files from S3
      if (analysis.thumbnailId) {
        await this.s3Service.deleteFile(`thumbnails/${analysis.thumbnailId}`);
      }
      if (analysis.compressedVideoId) {
        await this.s3Service.deleteFile(`videos/${analysis.compressedVideoId}`);
      }
      if (analysis.videoId) {
        await this.s3Service.deleteFile(`videos/${analysis.videoId}`);
      }

      await analysis.deleteOne();

      return true;
    } catch (error) {
      logger.error("deleteVideo error:", error);
      if (error instanceof AppError) throw error;
      throw new AppError("Failed to delete video", 500);
    }
  }

  /**
   * Get results of video processing (landmarks, etc.)
   */
  async getProcessingResults(videoId: string, userId: string) {
    try {
      const analysis = await VideoAnalysis.findOne({ videoId, userId });

      if (!analysis) {
        throw new AppError("Analysis not found", 404);
      }

      if (analysis.status !== "completed") {
        throw new AppError(
          `Analysis is not complete (current status: ${analysis.status})`,
          400
        );
      }

      return analysis.results;
    } catch (error) {
      throw new AppError("Failed to get processing results", 500);
    }
  }

  async processVideo(
    fileId: string,
    userId: string,
    originalName: string,
    size: number,
    options?: CompressionOptions
  ): Promise<VideoAnalysisType> {
    try {
      const analysis = await this.db.collection("videoAnalysis").insertOne({
        videoId: new ObjectId(fileId),
        userId: new ObjectId(userId),
        status: "processing",
        progress: 0,
        originalName,
        size,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Simulate processing
      await this.updateProgress(
        analysis.insertedId.toString(),
        25,
        ProcessingStage.COMPRESSING
      );
      await this.updateProgress(
        analysis.insertedId.toString(),
        50,
        ProcessingStage.ANALYZING
      );
      await this.updateProgress(
        analysis.insertedId.toString(),
        75,
        ProcessingStage.STORING
      );
      await this.updateProgress(
        analysis.insertedId.toString(),
        100,
        ProcessingStage.COMPLETED
      );

      const result = await this.getAnalysis(analysis.insertedId.toString());
      return result;
    } catch (error) {
      logger.error("Error processing video:", error);
      throw new AppError("Failed to process video", 500);
    }
  }

  async getAnalysis(id: string): Promise<VideoAnalysisType> {
    const doc = await this.db
      .collection("videoAnalysis")
      .findOne({ _id: new ObjectId(id) });

    if (!doc) {
      throw new AppError("Video analysis not found", 404);
    }

    return {
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      originalName: doc.originalName,
      status: doc.status,
      progress: doc.progress,
      s3VideoKey: doc.s3VideoKey,
      s3ThumbnailKey: doc.s3ThumbnailKey,
      s3LandmarksKey: doc.s3LandmarksKey,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    } as VideoAnalysisType;
  }

  async streamVideo(
    id: string,
    range?: string
  ): Promise<{ stream: Readable; headers: any }> {
    const video = await this.getVideo(id);
    const { stream } = await this.s3Service.getFileStream(video.s3VideoKey);
    return { stream, headers: this.getVideoHeaders(video, range) };
  }

  async getThumbnail(id: string): Promise<{ stream: Readable }> {
    const video = await this.getVideo(id);
    const { stream } = await this.s3Service.getFileStream(video.s3ThumbnailKey);
    return { stream };
  }

  private getVideoHeaders(video: VideoAnalysisType, range?: string): any {
    return {
      "Accept-Ranges": "bytes",
      "Content-Type": "video/mp4",
    };
  }

  private get db(): Db {
    if (!mongoose.connection || !mongoose.connection.readyState)
      throw new AppError("Database connection not available", 500);
    return mongoose.connection.db;
  }
}
