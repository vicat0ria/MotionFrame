import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import logger from "../utils/logger.js";

import { S3Service } from "../services/s3Service.service.js";
import VideoAnalysis from "../models/VideoAnalysis.js";
import { AppError } from "./error.middleware.js";

/* Resolve an incoming ID into the exact S3 key */
async function resolveS3Key(id: string): Promise<string> {
  if (id.startsWith("videos/") || id.startsWith("thumbnails/"))
    return id.replace(/^\/+/, "");
  if (id.startsWith("compressed_") || id.endsWith(".mp4"))
    return `videos/${id.replace(/\.mp4$/i, "")}`;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const doc = await VideoAnalysis.findOne({
      $or: [{ _id: id }, { videoId: id }, { compressedVideoId: id }],
    }).lean();
    if (doc?.s3VideoKey) return doc.s3VideoKey;
  }
  return `videos/${id}`;
}

export const videoStreamingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const fileId = req.params.id;
    const rangeHeader = req.headers.range as string | undefined;
    const key = await resolveS3Key(fileId);
    logger.debug(`Streaming request → resolved S3 key: ${key}`);

    const s3 = S3Service.getInstance();

    if (rangeHeader) {
      // parse client range
      const [startStr, endStr] = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(startStr, 10);
      const end = endStr ? parseInt(endStr, 10) : undefined;

      // fetch only that byte range
      const { stream, contentLength, contentRange } = await s3.getFileStream(
        key,
        { start, end }
      );

      const actualRange =
        contentRange ??
        `bytes ${start}-${end ?? contentLength - 1}/${contentLength}`;
      const chunkSize = (end != null ? end : contentLength - 1) - start + 1;

      res.writeHead(206, {
        "Content-Range": actualRange,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunkSize),
        "Content-Type": "video/mp4",
      });

      stream.on("error", next).pipe(res);
    } else {
      // no range: serve entire file
      const { stream, contentLength } = await s3.getFileStream(key);

      res.writeHead(200, {
        "Content-Length": String(contentLength),
        "Content-Type": "video/mp4",
        "Accept-Ranges": "bytes",
      });

      stream.on("error", next).pipe(res);
    }
  } catch (err) {
    if (
      err instanceof AppError ||
      (err as any)?.Code === "NoSuchKey" ||
      (err as any)?.name === "NoSuchKey"
    ) {
      return next(new AppError("Video not found", 404));
    }
    logger.error("Streaming error:", err);
    next(err);
  }
};
