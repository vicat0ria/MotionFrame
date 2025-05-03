import { Request, Response, NextFunction } from "express";
import { VideoService } from "../services/videoService.service.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";
import type { IUser, IVideoAnalysis } from "../types/index.js";
import VideoAnalysis from "../models/VideoAnalysis.js";
import { Socket } from "socket.io";
import { AppError } from "../middleware/error.middleware.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Service } from "../services/s3Service.service.js";

function ensureUserAuthenticated(
  req: Request
): asserts req is Request & { user: IUser } {
  if (!req.user) {
    throw new Error("User not authenticated");
  }
}

// controller class
export class VideoController {
  private static instance: VideoController;
  private videoService: VideoService;

  private constructor() {
    this.videoService = VideoService.getInstance();
  }

  /* Singleton accessor */
  public static getInstance(): VideoController {
    if (!VideoController.instance) {
      VideoController.instance = new VideoController();
    }
    return VideoController.instance;
  }

  // handler functions
  public uploadVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.file) throw new AppError("No file uploaded", 400);
      if (!req.user) throw new AppError("User not authenticated", 401);

      const videoId = await this.videoService.processUploadedVideo(
        req.file.path,
        req.file.originalname,
        req.user._id.toString()
      );

      res.status(201).json({ videoId });
    } catch (err) {
      next(err);
    }
  };

  public getVideo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { stream, headers } = await this.videoService.streamVideo(id);
      res.set(headers);
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  };

  public streamVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      const { stream, headers } = await this.videoService.streamVideo(
        id,
        req.headers.range
      );
      res.set(headers);
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  };

  public deleteVideo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) throw new AppError("User not authenticated", 401);

      await this.videoService.deleteVideo(
        req.params.id,
        req.user._id.toString()
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  public getVideoProgress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const analysis = await VideoAnalysis.findById(req.params.id);
      if (!analysis) throw new AppError("Video not found", 404);

      res.json({ progress: analysis.progress, status: analysis.status });
    } catch (err) {
      next(err);
    }
  };

  public getThumbnail = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;
      if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid thumbnail ID" });
      }

      const { stream } = await this.videoService.getThumbnail(id);
      res.setHeader("Content-Type", "image/jpeg");
      res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year
      stream.pipe(res);
    } catch (err) {
      logger.error("Thumbnail error:", err);
      res.status(500).json({ message: "Error retrieving thumbnail" });
    }
  };

  public async getSignedPlaybackUrl(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params; // analysisId (or videoId / fileId)
      const videoService = VideoService.getInstance();
      const analysis = await videoService.getVideo(id); // throws 404 if bad

      const s3 = S3Service.getInstance();
      const url = await s3.getSignedUrl(analysis.s3VideoKey, 3600); // 1 h

      res.json({ url });
    } catch (err) {
      next(err);
    }
  }
}

// helper functions
export const registerSocket = (userId: string, socket: Socket) => {
  try {
    VideoService.getInstance().registerSocket(userId, socket);
  } catch (err) {
    logger.error("Socket registration error:", err);
  }
};

export const getVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const { stream, headers } = await VideoService.getInstance().streamVideo(
      id,
      req.headers.range
    );
    res.set(headers);
    stream.pipe(res);
  } catch (err) {
    logger.error("Video streaming error:", err);
    if (!res.headersSent)
      res.status(500).json({ message: "Error streaming video" });
  }
};

export const getVideoStatus = async (req: Request, res: Response) => {
  try {
    ensureUserAuthenticated(req);
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid video ID" });
    }

    const analysis = await VideoAnalysis.findOne({
      _id: id,
      userId: req.user._id,
    });
    if (!analysis)
      return res.status(404).json({ message: "Video analysis not found" });

    res.status(200).json({
      status: analysis.status,
      progress: analysis.progress,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
      error: analysis.error,
    });
  } catch (err) {
    logger.error("Get status error:", err);
    res.status(500).json({ message: "Error getting video status" });
  }
};

export const getUserVideos = async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated() || !req.user)
      return res.status(401).json({ message: "Not authenticated" });

    const limit = parseInt(req.query.limit as string, 10) || 10;
    const analyses = await VideoAnalysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        "videoId status progress createdAt thumbnailId originalName size compressedVideoId"
      )
      .lean<IVideoAnalysis[]>();

    const videos = analyses.map((a) => ({
      id: a._id,
      videoId: a.compressedVideoId ?? a.videoId,
      name: a.originalName,
      type: "video/mp4",
      size: a.size ?? 0,
      status: a.status,
      progress: a.progress,
      createdAt: a.createdAt,
      thumbnailId: a.thumbnailId ?? null,
    }));

    res.status(200).json({ videos });
  } catch (err) {
    logger.error("Get user videos error:", err);
    res.status(500).json({ message: "Error retrieving videos" });
  }
};

export const getThumbnail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid thumbnail ID" });
    }

    const { stream } = await VideoService.getInstance().getThumbnail(id);
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000");
    stream.pipe(res);
  } catch (err) {
    logger.error("Thumbnail error:", err);
    res.status(500).json({ message: "Error retrieving thumbnail" });
  }
};
