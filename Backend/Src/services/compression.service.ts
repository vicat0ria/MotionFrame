// compression.service.ts
import ffmpeg from "fluent-ffmpeg";
import os from "os";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { promisify } from "util";
import { AppError } from "../middleware/error.middleware.js";
import logger from "../utils/logger.js";

const stat = promisify(fs.stat);

// Set ffmpeg paths
try {
  const ffmpegPath = process.env.FFMPEG_PATH;
  const ffprobePath = process.env.FFPROBE_PATH;

  if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
    console.log(`Using custom FFmpeg path: ${ffmpegPath}`);
  }

  if (ffprobePath) {
    ffmpeg.setFfprobePath(ffprobePath);
    console.log(`Using custom FFprobe path: ${ffprobePath}`);
  }
} catch (error) {
  console.error("Error setting FFmpeg paths:", error);
}

// Enum for compression presets
export enum CompressionPreset {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERYHIGH = "veryhigh",
}

// Enum for video resolutions
export enum VideoResolution {
  SD = "480p",
  HD = "720p",
  FULLHD = "1080p",
}

interface CompressionOptions {
  width?: number;
  height?: number;
  bitrate?: string;
  preset?: string;
  crf?: number;
}

// Video metrics interface
export interface VideoMetrics {
  duration: number;
  width: number;
  height: number;
  frameRate: number;
  frames: number;
  fileSize: number;
  bitRate: number;
}

// Compression service for video processing
export class CompressionService {
  private static instance: CompressionService;
  private tempDir: string;

  private constructor() {
    // Set up temp directory for video processing
    this.tempDir = process.env.TEMP_DIR || os.tmpdir();
    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  public static getInstance(): CompressionService {
    if (!CompressionService.instance) {
      CompressionService.instance = new CompressionService();
    }
    return CompressionService.instance;
  }

  /**
   * Get video metrics using ffmpeg
   * @param inputPath Path to the video file
   * @returns Promise with video metrics
   */
  async getVideoMetrics(inputPath: string): Promise<VideoMetrics> {
    try {
      // Check if input file exists
      const fileStats = await fs.promises.stat(inputPath);
      const fileSizeMB = fileStats.size / (1024 * 1024);

      return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
          if (err) {
            logger.error(`FFprobe error: ${err.message}`);
            reject(new Error(`FFprobe error: ${err.message}`));
            return;
          }

          const videoStream = metadata.streams.find(
            (stream) => stream.codec_type === "video"
          );

          if (!videoStream) {
            reject(new Error("No video stream found"));
            return;
          }

          // Calculate duration in seconds
          const duration = parseFloat(String(metadata.format.duration || "0"));

          // Parse video details
          const width = videoStream.width || 0;
          const height = videoStream.height || 0;

          // Calculate frame rate
          let frameRate = 0;
          if (videoStream.r_frame_rate) {
            const [num, den] = videoStream.r_frame_rate.split("/").map(Number);
            frameRate = num / (den || 1);
          }

          // Calculate total frames
          const frames = Math.round(duration * frameRate);

          // Parse bitrate
          const bitRate =
            parseInt(String(metadata.format.bit_rate || "0")) / 1000; // kbps

          resolve({
            duration,
            width,
            height,
            frameRate,
            frames,
            fileSize: fileStats.size,
            bitRate,
          });
        });
      });
    } catch (error) {
      logger.error(`Video metrics error: ${error}`);
      throw new AppError("Failed to get video metrics", 500);
    }
  }

  /**
   * Compress a video file to the given compression level and resolution
   *
   * @param inputPath Path to input video file
   * @param outputPath Path for output file (optional)
   * @param preset Compression preset (default MEDIUM)
   * @param resolution Target resolution (default HD - 720p)
   * @returns Promise with path to compressed video
   */
  public async compressVideo(
    inputPath: string,
    outputPath: string,
    compressionPreset: CompressionPreset,
    resolution: VideoResolution,
    options: CompressionOptions = {}
  ): Promise<string> {
    const {
      width = 1280,
      height = 720,
      bitrate = "2000k",
      preset = "veryfast",
      crf = 23,
    } = options;

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          "-c:v libx264",
          `-preset ${preset}`,
          `-crf ${crf}`,
          `-b:v ${bitrate}`,
          `-maxrate ${bitrate}`,
          `-bufsize ${bitrate}`,
          `-vf scale=${width}:${height}`,
          "-movflags +faststart",
          "-c:a aac",
          "-b:a 128k",
        ])
        .output(outputPath)
        .on("end", () => {
          logger.info(`Video compression completed: ${outputPath}`);
          resolve(path.basename(outputPath, path.extname(outputPath)));
        })
        .on("error", (err) => {
          logger.error(`Error compressing video: ${err.message}`);
          reject(err);
        })
        .run();
    });
  }

  /**
   * Get compression settings based on preset and resolution
   *
   * @param preset Compression preset
   * @param resolution Target resolution
   * @returns Compression settings object
   */
  private getCompressionSettings(
    preset: CompressionPreset,
    resolution: VideoResolution
  ) {
    // Base settings
    const settings = {
      videoCodec: "libx264",
      audioCodec: "aac",
      preset: "medium", // ffmpeg preset (not the same as our compression preset)
      size: "?x720", // Default to 720p
      videoBitrate: "1000k",
      audioBitrate: "128k",
      crf: 23, // Default CRF value (lower = better quality, higher = smaller file)
    };

    // Adjust size based on resolution
    switch (resolution) {
      case VideoResolution.SD:
        settings.size = "?x480";
        break;
      case VideoResolution.HD:
        settings.size = "?x720";
        break;
      case VideoResolution.FULLHD:
        settings.size = "?x1080";
        break;
    }

    // Adjust video quality settings based on preset
    switch (preset) {
      case CompressionPreset.LOW:
        settings.crf = 32; // Higher CRF for more compression
        settings.preset = "veryfast";
        // Lower bitrates for lower preset
        settings.videoBitrate =
          resolution === VideoResolution.SD
            ? "500k"
            : resolution === VideoResolution.HD
            ? "800k"
            : "1200k";
        settings.audioBitrate = "96k";
        break;

      case CompressionPreset.MEDIUM:
        settings.crf = 28; // Medium CRF
        settings.preset = "fast";
        settings.videoBitrate =
          resolution === VideoResolution.SD
            ? "800k"
            : resolution === VideoResolution.HD
            ? "1500k"
            : "2500k";
        settings.audioBitrate = "128k";
        break;

      case CompressionPreset.HIGH:
        settings.crf = 23; // Lower CRF for better quality
        settings.preset = "medium";
        settings.videoBitrate =
          resolution === VideoResolution.SD
            ? "1200k"
            : resolution === VideoResolution.HD
            ? "2500k"
            : "4000k";
        settings.audioBitrate = "192k";
        break;

      case CompressionPreset.VERYHIGH:
        settings.crf = 18; // Low CRF for high quality
        settings.preset = "slow";
        settings.videoBitrate =
          resolution === VideoResolution.SD
            ? "1500k"
            : resolution === VideoResolution.HD
            ? "3500k"
            : "6000k";
        settings.audioBitrate = "256k";
        break;
    }

    logger.debug(`Compression settings: ${JSON.stringify(settings)}`);
    return settings;
  }

  // Method to verify ffmpeg installation
  async verifyFfmpeg(): Promise<boolean> {
    return new Promise((resolve) => {
      ffmpeg.getAvailableFormats((err, formats) => {
        if (err) {
          logger.error("FFmpeg not properly installed:", err);
          resolve(false);
          return;
        }

        if (formats && Object.keys(formats).length > 0) {
          logger.info("FFmpeg installed correctly");
          resolve(true);
        } else {
          logger.error("FFmpeg installed but no formats available");
          resolve(false);
        }
      });
    });
  }
}
