import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AppError } from "../middleware/error.middleware.js";
import logger from "../utils/logger.js";
import { Readable } from "stream";
import fs from "fs";

export class S3Service {
  private static instance: S3Service;
  private s3Client: S3Client;
  private bucketName: string;

  private constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_KEY || "",
      },
    });
    this.bucketName =
      process.env.AWS_BUCKET_NAME || "motionframe-videoupload-bucket";
  }

  public static getInstance(): S3Service {
    if (!S3Service.instance) {
      S3Service.instance = new S3Service();
    }
    return S3Service.instance;
  }

  /**
   * Upload a Buffer or Readable stream to S3.
   * Ensures ContentLength is set to avoid SDK adding
   * `x‑amz‑decoded‑content‑length: undefined`.
   */
  async uploadFile(
    originalBody: Buffer | Readable,
    key: string,
    contentType: string
  ): Promise<string> {
    try {
      let body: Buffer | Readable = originalBody;
      let contentLength: number | undefined;

      /* Determine size */
      if (Buffer.isBuffer(body)) {
        contentLength = body.length;
      } else {
        const maybePath = (body as Readable & { path?: string }).path;
        if (maybePath && fs.existsSync(maybePath)) {
          contentLength = fs.statSync(maybePath).size;
        } else {
          // Fallback: read stream into buffer (thumbnail streams hit this path)
          const chunks: Buffer[] = [];
          for await (const chunk of body) chunks.push(chunk as Buffer);
          body = Buffer.concat(chunks);
          contentLength = (body as Buffer).length;
          logger.debug(
            `Converted stream to buffer for key=${key}  len=${contentLength}`
          );
        }
      }

      logger.debug(`S3 upload → key=${key}  contentLength=${contentLength}`);

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
        ...(contentLength !== undefined && { ContentLength: contentLength }),
      });

      await this.s3Client.send(command);
      return key;
    } catch (error) {
      logger.error("Error uploading file to S3:", error);
      throw new AppError("Failed to upload file", 500);
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      logger.error("Error generating signed URL:", error);
      throw new AppError("Failed to generate signed URL", 500);
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
    } catch (error) {
      logger.error("Error deleting file from S3:", error);
      throw new AppError("Failed to delete file", 500);
    }
  }

  async getFileStream(
    key: string,
    range?: { start: number; end: number }
  ): Promise<{ stream: Readable; contentLength: number }> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ...(range && { Range: `bytes=${range.start}-${range.end}` }),
      });

      const response = await this.s3Client.send(command);
      if (!response.Body) {
        throw new AppError("File not found", 404);
      }

      return {
        stream: response.Body as Readable,
        contentLength: response.ContentLength || 0,
      };
    } catch (error) {
      logger.error("Error getting file stream from S3:", error);
      throw new AppError("Failed to get file stream", 500);
    }
  }
}
