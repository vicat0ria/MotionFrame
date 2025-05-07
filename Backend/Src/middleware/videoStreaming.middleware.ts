import { Request, Response, NextFunction } from "express";
import { S3Service } from "../services/s3Service.service.js";
import { AppError } from "./error.middleware.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";
import { GetObjectCommandOutput } from "@aws-sdk/client-s3";

/**
 * Middleware for handling video streaming
 * - Supports HTTP range requests for efficient streaming
 * - Handles partial content delivery
 * - Sets appropriate headers for video playback
 */
export const videoStreamingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const fileId = req.params.id;
    if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
      throw new AppError("Invalid file ID", 400);
    }

    const s3Service = S3Service.getInstance();
    const { stream, contentLength } = await s3Service.getFileStream(
      `videos/${fileId}`
    );

    // Set response headers
    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Accept-Ranges", "bytes");

    // Handle range requests
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : undefined;

      // Set partial content headers
      res.setHeader(
        "Content-Range",
        `bytes ${start}-${end || "*"}/${contentLength}`
      );
      res.setHeader(
        "Content-Length",
        end ? end - start + 1 : contentLength - start
      );
      res.status(206);
    }

    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};
