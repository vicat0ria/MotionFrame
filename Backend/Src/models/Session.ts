import mongoose, { UpdateWriteOpResult, Model } from "mongoose";
import { ISession } from "../types/index.js";

interface SessionModel extends Model<ISession> {
  findActiveSessionsByUser(userId: string): Promise<ISession[]>;
  invalidateAllUserSessions(userId: string): Promise<UpdateWriteOpResult>;
}

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  token: { type: String, unique: true, sparse: true },

  expiresAt: { type: Date, required: true },

  deviceInfo: {
    userAgent: String,
    ipAddress: String,
    browser: String,
    os: String,
    lastActive: Date,
  },

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Add TTL index for automatic session cleanup
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ isActive: 1 });

// Statics
sessionSchema.statics.findActiveSessionsByUser = function (userId) {
  return this.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

sessionSchema.statics.invalidateAllUserSessions = function (userId) {
  return this.updateMany({ userId, isActive: true }, { isActive: false });
};

export default mongoose.model<ISession, SessionModel>("Session", sessionSchema);
