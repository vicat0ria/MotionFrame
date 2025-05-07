import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/security.js";
import { AppError } from "../middleware/error.middleware.js";
import { normalizeEmail } from "../utils/validation.js";

export const registerUser = async (
  email: string,
  password: string,
  username?: string
) => {
  const normalizedUserEmail = normalizeEmail(email);

  // First check if a user with this normalized email already exists
  const existingUser = await User.findOne({
    normalizedEmail: normalizedUserEmail,
  });
  if (existingUser) {
    throw new AppError("Email already registered", 400);
  }

  const user = new User({
    email,
    normalizedEmail: normalizedUserEmail,
    password,
    username,
  });

  await user.save();
  return user;
};

export const loginUser = async (email: string, password: string) => {
  const normalizedUserEmail = normalizeEmail(email);

  const user = await User.findOne({ normalizedEmail: normalizedUserEmail });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.password) {
    // This is an OAuth user without a password
    throw new AppError(
      "This account was created with a social login. Please sign in with that method.",
      401
    );
  }

  const isMatch = await user.validatePassword(password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  return user;
};

export const updatePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  // If this is an OAuth user that doesn't have a password yet
  if (!user.password) {
    // Just set the new password
    user.password = newPassword;
    await user.save();
    return;
  }

  // Otherwise, validate the current password
  const isMatch = await user.validatePassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Current password is incorrect", 401);
  }

  user.password = newPassword;
  await user.save();
};

// Finding a user by email, using normalized email
export const findUserByEmail = async (email: string) => {
  const normalizedUserEmail = normalizeEmail(email);
  return User.findOne({ normalizedEmail: normalizedUserEmail });
};

// Find or create a user with OAuth credentials
export const findOrCreateOAuthUser = async (
  email: string,
  providerId: string,
  providerName: "google" | "facebook" | "github" | "linkedin",
  profile: any
) => {
  const normalizedUserEmail = normalizeEmail(email);

  // Try to find an existing user with this normalized email
  let user = await User.findOne({ normalizedEmail: normalizedUserEmail });

  if (user) {
    // User exists - update the OAuth provider ID if not already set
    // Check which provider we're dealing with and set the appropriate ID
    switch (providerName) {
      case "google":
        if (!user.googleId) {
          user.googleId = providerId;
          if (!user.oauthProviders.includes("google")) {
            user.oauthProviders.push("google");
          }
        }
        break;
      case "facebook":
        if (!user.facebookId) {
          user.facebookId = providerId;
          if (!user.oauthProviders.includes("facebook")) {
            user.oauthProviders.push("facebook");
          }
        }
        break;
      case "github":
        if (!user.githubId) {
          user.githubId = providerId;
          if (!user.oauthProviders.includes("github")) {
            user.oauthProviders.push("github");
          }
        }
        break;
      case "linkedin":
        if (!user.linkedinId) {
          user.linkedinId = providerId;
          if (!user.oauthProviders.includes("linkedin")) {
            user.oauthProviders.push("linkedin");
          }
        }
        break;
    }

    await user.save();
    return user;
  }

  // User doesn't exist, create a new one with appropriate provider ID
  const newUserData: any = {
    email,
    normalizedEmail: normalizedUserEmail,
    oauthProviders: [providerName],
    profile: {
      name: profile.name,
      picture: profile.picture,
      provider: providerName,
    },
    isEmailVerified: true, // OAuth emails are verified by the provider
  };

  // Add the specific provider ID
  newUserData[`${providerName}Id`] = providerId;

  const newUser = new User(newUserData);
  await newUser.save();
  return newUser;
};
