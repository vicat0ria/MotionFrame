import ffmpeg from "fluent-ffmpeg";
import * as ffmpegStatic from "ffmpeg-static";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { AppError } from "../middleware/error.middleware.js";
import logger from "../utils/logger.js";
import os from "os";

const unlink = promisify(fs.unlink);

export class ThumbnailService {
  private static instance: ThumbnailService;
  private tempDir: string;

  private constructor() {
    this.tempDir = process.env.TEMP_DIR || os.tmpdir();

    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    // Set the ffmpeg path to use ffmpeg-static
    if (ffmpegStatic.default) {
      logger.info(`Setting ffmpeg path: ${ffmpegStatic.default}`);
      ffmpeg.setFfmpegPath(ffmpegStatic.default?.toString() || "");
    } else {
      logger.warn("ffmpeg-static path not found, relying on system ffmpeg");
    }
  }

  public static getInstance(): ThumbnailService {
    if (!ThumbnailService.instance) {
      ThumbnailService.instance = new ThumbnailService();
    }
    return ThumbnailService.instance;
  }

  /**
   * Extract a thumbnail from a video file
   * @param videoPath Path to the video file
   * @param thumbnailPath Output path for the thumbnail (optional)
   * @param timePosition Position in seconds to extract thumbnail (default: 1)
   * @returns Path to the generated thumbnail
   */
  async extractThumbnail(
    videoPath: string,
    thumbnailPath?: string,
    timePosition: number = 1
  ): Promise<string> {
    try {
      if (!fs.existsSync(videoPath)) {
        throw new AppError(`Video file not found: ${videoPath}`, 404);
      }

      // Generate a thumbnail filename if not provided
      const outputPath =
        thumbnailPath ||
        path.join(
          this.tempDir,
          `thumbnail_${path.basename(videoPath, path.extname(videoPath))}.jpg`
        );

      return new Promise<string>((resolve, reject) => {
        ffmpeg(videoPath)
          .on("error", (err) => {
            logger.error(`Thumbnail extraction error: ${err.message}`);
            reject(new Error(`Thumbnail extraction failed: ${err.message}`));
          })
          .on("end", () => {
            logger.info(`Thumbnail extracted to ${outputPath}`);
            resolve(outputPath);
          })
          .screenshots({
            timestamps: [timePosition],
            filename: path.basename(outputPath),
            folder: path.dirname(outputPath),
            size: "320x240", // Small thumbnail size
          });
      });
    } catch (error) {
      logger.error(`Thumbnail extraction error: ${error}`);
      throw new AppError("Failed to extract thumbnail", 500);
    }
  }

  /**
   * Clean up a thumbnail file
   * @param thumbnailPath Path to the thumbnail file
   */
  async cleanupThumbnail(thumbnailPath: string): Promise<void> {
    try {
      if (fs.existsSync(thumbnailPath)) {
        await unlink(thumbnailPath);
        logger.info(`Cleaned up thumbnail: ${thumbnailPath}`);
      }
    } catch (error) {
      logger.error(`Thumbnail cleanup error: ${error}`);
    }
  }
}
