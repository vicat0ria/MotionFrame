import { Request, Response, NextFunction } from "express";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import os from "os";
import ffmpeg from "fluent-ffmpeg";
import { AppError } from "./error.middleware.js";
import logger from "../utils/logger.js";

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const MAX_VIDEO_DURATION = 30; // 30 seconds

// Ensure temp directory exists
const tempUploadsDir =
  process.env.TEMP_UPLOADS_DIR || path.join(os.tmpdir(), "tmp_uploads");
if (!fs.existsSync(tempUploadsDir)) {
  fs.mkdirSync(tempUploadsDir, { recursive: true });
  logger.info(`Created temp uploads directory: ${tempUploadsDir}`);
}

// Disk storage config for temporary files
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempUploadsDir);
  },
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, buf) => {
      if (err) return cb(err, "");

      const filename = buf.toString("hex") + path.extname(file.originalname);
      cb(null, filename);
    });
  },
});

// Allowed MIME types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/webm",
    "video/x-matroska",
    "video/x-ms-wmv",
    "video/x-flv",
    "video/3gpp",
    "video/x-m4v",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type. Only video files allowed. Got: ${file.mimetype}`,
        400
      )
    );
  }
};

// File size limits
const maxSize = Number(process.env.UPLOAD_MAX_SIZE) || MAX_FILE_SIZE;

// Multer instance using disk storage
export const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: maxSize,
  },
  fileFilter,
}).single("video");

export const validateFileSize = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }

  try {
    const stats = await fs.promises.stat(req.file.path);
    if (stats.size > maxSize) {
      // Clean up the file
      await fs.promises.unlink(req.file.path);
      return next(
        new AppError(
          `File size ${stats.size / (1024 * 1024)}MB exceeds limit of ${
            maxSize / (1024 * 1024)
          }MB`,
          413
        )
      );
    }
    next();
  } catch (error) {
    logger.error("Error validating file size:", error);
    return next(new AppError("Error validating file size", 500));
  }
};

export const validateVideoDuration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return next(new AppError("No file uploaded", 400));
  }

  const file = req.file as Express.Multer.File;

  try {
    const duration = await new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(file.path, (err, metadata) => {
        if (err) return reject(err);
        resolve(metadata.format.duration || 0);
      });
    });

    if (duration > MAX_VIDEO_DURATION) {
      await fs.promises.unlink(file.path);
      return next(
        new AppError(
          `Video duration (${duration.toFixed(
            1
          )} seconds) exceeds limit of ${MAX_VIDEO_DURATION} seconds`,
          413
        )
      );
    }
    next();
  } catch (error) {
    logger.error("Error validating video duration:", error);
    if (file?.path) {
      await fs.promises
        .unlink(file.path)
        .catch((err) =>
          logger.error(
            "Error cleaning up file after duration check failed:",
            err
          )
        );
    }
    return next(new AppError("Error validating video duration", 500));
  }
};

// Get temp directory
export const getTempUploadsDir = () => tempUploadsDir;
