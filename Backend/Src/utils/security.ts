import bcrypt from "bcrypt";
import crypto from "crypto";
import { IUser } from "../types/index.js";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string | undefined
): Promise<boolean> => {
  // If the hashed password is undefined, authentication fails
  if (!hashedPassword) {
    return false;
  }
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (): string => {
  const token = crypto.randomBytes(32).toString("hex");
  if (!token || token.trim() === "") {
    throw new Error("Failed to generate token");
  }
  return token;
};

export const generateResetToken = (): string => {
  return crypto.randomBytes(20).toString("hex");
};

export const sanitizeUser = (user: any) => {
  const sanitized = { ...(user.toObject ? user.toObject() : user) };

  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.__v;
  delete sanitized.resetToken;
  delete sanitized.resetTokenExpires;

  return sanitized;
};

// XSS Prevention
export const escapeHTML = (str: string): string => {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// CSRF Token
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(100).toString("base64");
};

// Generate random password (for OAuth users)
export const generateRandomPassword = (length: number = 12): string => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};
