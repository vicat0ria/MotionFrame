import mongoose from "mongoose";

interface IVideo {
  filename: string;
  contentType: string;
  uploadDate: Date;
  deviceInfo: any;
  networkInfo: any;
}

const videoSchema = new mongoose.Schema<IVideo>({
  filename: {
    type: String,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
  deviceInfo: {
    type: Object,
    default: null,
  },
  networkInfo: {
    type: Object,
    default: null,
  },
});

export const Video = mongoose.model<IVideo>("Video", videoSchema);
