import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  username?: string;
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  facebookId?: string;
  linkedinId?: string;
  role: string;
  tokens: string[];
  createdAt?: Date;
  comparePassword(plainPassword: string): Promise<boolean>;
}
// Define User Schema
const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: false, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for OAuth users
    googleId: { type: String },
    githubId: { type: String },
    facebookId: { type: String },
    linkedinId: { type: String },
    tokens: [{ type: String }],
  },
  { timestamps: true }
);

// Ensure Indexes Are Created (Remove Duplicates)
UserSchema.index({ linkedinId: 1 }, { unique: true, sparse: true });
UserSchema.index({ googleId: 1 }, { unique: true, sparse: true });
UserSchema.index({ githubId: 1 }, { unique: true, sparse: true });
UserSchema.index({ facebookId: 1 }, { unique: true, sparse: true });

// Hash password before saving a user
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Compare entered password with stored hash
UserSchema.methods.comparePassword = async function (plainPassword: string) {
  return bcrypt.compare(plainPassword, this.password as string);
};

// Create User Model
const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema);

export default User;
