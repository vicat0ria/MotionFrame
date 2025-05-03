import { Document, Types } from "mongoose";
import mongoose from "mongoose";
import { SessionData } from "express-session";

//  User interface
export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  username?: string;
  password?: string;
  role: "user" | "admin";
  googleId?: string;
  githubId?: string;
  facebookId?: string;
  linkedinId?: string;
  resetToken?: string;
  resetTokenExpires?: Date;
  isEmailVerified?: boolean;
  createdAt?: Date;
  lastLogin?: Date;
  active?: boolean;
  oauthProviders?: string[];
  profile?: {
    name?: string;
    avatar?: string;
  };
  updatedAt?: Date;
}

//  File interface
export interface IFile extends Document {
  _id: Types.ObjectId;
  filename: string;
  contentType: string;
  length: number;
  uploadDate: Date;
  metadata: {
    userId: Types.ObjectId;
    originalName?: string;
    description?: string;
    tags?: string[];
    processingStatus?: "pending" | "processing" | "completed" | "failed";
    processingResults?: any;
  };
}

//  Session interface
export interface ISession extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  csrfToken?: string;
  expiresAt: Date;
  deviceInfo: {
    userAgent?: string;
    ipAddress?: string;
    browser?: string;
    os?: string;
    lastActive?: Date;
    location?: string;
  };
  isActive?: boolean;
  createdAt: Date;
}

//  Video Analysis interface
export interface IVideoAnalysis extends Document {
  _id: Types.ObjectId;
  videoId: Types.ObjectId;
  userId: Types.ObjectId;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  thumbnailId?: Types.ObjectId;
  compressedVideoId?: Types.ObjectId;
  originalName: string;
  size?: number;
  s3VideoKey: string;
  s3ThumbnailKey: string;
  s3LandmarksKey?: string;
  results?: {
    poseData?: any[];
    motionData?: any[];
    timestamps?: any[];
    metrics?: Record<string, any>;
  };
  error?: {
    message: string;
    code?: string;
    timestamp: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

//  Video Metrics (for FFmpeg analysis)
export interface VideoMetrics {
  duration: number;
  width: number;
  height: number;
  frameRate: number;
  frames: number;
  fileSize: number;
  bitRate: number;
}

//  Extend Express user for passport session
declare global {
  namespace Express {
    interface User extends IUser {}
    interface Request {
      // For video streaming middleware
      videoInfo?: {
        fileId: string;
        objectId: mongoose.Types.ObjectId;
        file: any;
        fileSize: number;
        rangeInfo?: {
          start: number;
          end: number;
          chunkSize: number;
        };
      };
    }
    interface Session extends SessionData {
      csrfToken?: string;
      lastActive?: Date;
    }
  }
}

export enum ProcessingStage {
  PREPARING = "preparing",
  COMPRESSING = "compressing",
  EXTRACTING_THUMBNAIL = "extracting_thumbnail",
  ANALYZING = "analyzing",
  STORING = "storing",
  CLEANING = "cleaning",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface VideoAnalysis {
  _id: string;
  userId: string;
  originalName: string;
  status: "processing" | "completed" | "failed";
  progress: number;
  s3VideoKey: string;
  s3ThumbnailKey: string;
  s3LandmarksKey?: string;
  size: number;
  duration?: number;
  resolution?: {
    width: number;
    height: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CompressionOptions {
  preset?:
    | "ultrafast"
    | "superfast"
    | "veryfast"
    | "faster"
    | "fast"
    | "medium"
    | "slow"
    | "slower"
    | "veryslow";
  crf?: number;
  resolution?: {
    width: number;
    height: number;
  };
}
