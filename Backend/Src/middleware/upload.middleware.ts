import { Request, Response, NextFunction } from "express";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import fs from "fs";
import os from "os";
import { AppError } from "./error.middleware.js";
import logger from "../utils/logger.js";

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
const maxSize = Number(process.env.UPLOAD_MAX_SIZE) || 500 * 1024 * 1024; // 500MB default

// Multer instance using disk storage
export const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: maxSize,
  },
  fileFilter,
});

// Get temp directory
export const getTempUploadsDir = () => tempUploadsDir;
