import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  // Modified to allow special characters
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

export const validateUsername = (username: string): boolean => {
  // Alphanumeric, underscore, hyphen, 3-20 characters
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Normalizes an email address:
 * - Converts to lowercase
 * - For Gmail addresses: removes dots before the @ and anything after + but before @
 * - For other email providers: just converts to lowercase
 *
 * @param email The email address to normalize
 * @returns The normalized email address
 */
export const normalizeEmail = (email: string): string => {
  if (!email) return "";

  // Convert to lowercase
  email = email.toLowerCase();

  // Check if it's a Gmail address
  if (email.endsWith("@gmail.com")) {
    // Extract the part before @gmail.com
    const localPart = email.split("@")[0];

    // Remove all dots
    let normalizedLocal = localPart.replace(/\./g, "");

    // Remove everything after + if it exists
    if (normalizedLocal.includes("+")) {
      normalizedLocal = normalizedLocal.split("+")[0];
    }

    return `${normalizedLocal}@gmail.com`;
  }

  // For other email providers, just return the lowercase version
  return email;
};
