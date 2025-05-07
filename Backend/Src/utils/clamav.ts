import NodeClam from "clamscan";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import logger from "./logger.js";
import { AppError } from "../middleware/error.middleware.js";

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

interface ScanResult {
  isInfected: boolean;
  viruses?: string[];
}

class ClamAVScanner {
  private static instance: ClamAVScanner;
  private scanner: any;
  private initialized: boolean = false;
  private tempDir: string;

  private constructor() {
    this.tempDir = process.env.TEMP_DIR || path.join(process.cwd(), "temp");

    // Ensure temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  public static getInstance(): ClamAVScanner {
    if (!ClamAVScanner.instance) {
      ClamAVScanner.instance = new ClamAVScanner();
    }
    return ClamAVScanner.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const options = {
        clamdscan: {
          socket: process.env.CLAMAV_SOCKET || "/var/run/clamav/clamd.sock",
          host: process.env.CLAMAV_HOST || "127.0.0.1",
          port: Number(process.env.CLAMAV_PORT) || 3310,
          timeout: 60000,
          local_fallback: true,
          path: process.env.CLAMAV_PATH || "/usr/bin/clamdscan",
          config_file: process.env.CLAMAV_CONFIG || "/etc/clamav/clamd.conf",
        },
        preference: "clamdscan" as const,
      };

      this.scanner = await new NodeClam().init(options);
      this.initialized = true;
      logger.info("ClamAV scanner initialized successfully");
    } catch (error) {
      logger.error("ClamAV initialization error:", error);
      throw new Error("Failed to initialize virus scanner");
    }
  }

  public async scanBuffer(
    buffer: Buffer,
    filename: string
  ): Promise<ScanResult> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Write buffer to temp file for scanning
      const tempFilePath = path.join(this.tempDir, `${Date.now()}_${filename}`);
      await writeFile(tempFilePath, buffer);

      // Scan the file
      const result = await this.scanFile(tempFilePath);

      // Clean up temp file
      await unlink(tempFilePath);

      return result;
    } catch (error) {
      logger.error("Virus scan error:", error);
      throw new AppError("Error during virus scan", 500);
    }
  }

  public async scanFile(filePath: string): Promise<ScanResult> {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      if (!fs.existsSync(filePath)) {
        throw new AppError(`File not found: ${filePath}`, 404);
      }

      const result = await this.scanner.scanFile(filePath);

      if (result.isInfected) {
        logger.warn(`Virus detected in file: ${filePath}`, {
          viruses: result.viruses,
        });
      }

      return {
        isInfected: result.isInfected,
        viruses: result.viruses,
      };
    } catch (error) {
      logger.error("File scan error:", error);
      throw new AppError("Error during file scan", 500);
    }
  }

  // Legacy method for backward compatibility
  public async scanMulterFile(file: Express.Multer.File): Promise<ScanResult> {
    if (file.buffer) {
      return await this.scanBuffer(file.buffer, file.originalname);
    } else if (file.path) {
      return await this.scanFile(file.path);
    } else {
      throw new AppError("Invalid file object", 400);
    }
  }
}

export default ClamAVScanner;
