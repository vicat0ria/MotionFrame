import mongoose, { Document, Types } from "mongoose";

export interface IProject extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  description: string;
  videoId: string;
  exportType: "skeleton" | "video";
  fileType: string;
  badge: string;
  videoTitle: string;
  s3ExportKey?: string; // S3 key for the exported file
  status: "pending" | "processing" | "completed" | "failed";
  settings?: {
    playbackSpeed: number;
    smoothness: number;
    selectedAvatar?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new mongoose.Schema<IProject>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoId: {
      type: String,
      required: true,
    },
    exportType: {
      type: String,
      enum: ["skeleton", "video"],
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    badge: {
      type: String,
      required: true,
    },
    videoTitle: {
      type: String,
      required: true,
    },
    s3ExportKey: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    settings: {
      type: {
        playbackSpeed: { type: Number, default: 1 },
        smoothness: { type: Number, default: 0.5 },
        selectedAvatar: { type: Number, default: 0 },
      },
      default: {
        playbackSpeed: 1,
        smoothness: 0.5,
        selectedAvatar: 0,
      },
    },
  },
  { timestamps: true }
);

// Indexes
projectSchema.index({ userId: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ status: 1 });

const Project = mongoose.model<IProject>("Project", projectSchema);

export default Project;
