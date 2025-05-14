import mongoose, { Document, Types } from "mongoose";
import bcrypt from "bcrypt";
import { normalizeEmail } from "../utils/validation.js";

interface IUserPreferences {
  theme: "dark" | "light";
  language: "en" | "es" | "fr";
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  normalizedEmail: string;
  password?: string;
  username?: string;
  facebookId?: string;
  githubId?: string;
  linkedinId?: string;
  googleId?: string;
  oauthProviders: string[];
  profile?: {
    name?: string;
    picture?: string;
    provider?: string;
  };
  role: "user" | "admin";
  isEmailVerified: boolean;
  preferences: IUserPreferences;
  validatePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  normalizedEmail: { type: String, required: true, unique: true },
  password: { type: String },
  username: { type: String },
  facebookId: { type: String },
  githubId: { type: String },
  linkedinId: { type: String },
  googleId: { type: String },
  oauthProviders: { type: [String], default: [] },
  profile: {
    name: { type: String },
    picture: { type: String },
    provider: { type: String },
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isEmailVerified: { type: Boolean, default: false },
  preferences: {
    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "dark",
    },
    language: {
      type: String,
      enum: ["en", "es", "fr"],
      default: "en",
    },
  },
});

// Ensure Indexes Are Created (Remove Duplicates)
userSchema.index({ linkedinId: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });
userSchema.index({ githubId: 1 }, { unique: true, sparse: true });
userSchema.index({ facebookId: 1 }, { unique: true, sparse: true });
userSchema.index({ normalizedEmail: 1 }, { unique: true });

// Generate normalizedEmail before saving
userSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.normalizedEmail = normalizeEmail(this.email);
  }
  next();
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Password comparison method
userSchema.methods.validatePassword = async function (
  password: string
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model<IUser>("User", userSchema);

export default User;
