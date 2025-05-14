import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { findOrCreateOAuthUser } from "../services/authService.js";
import dotenv from "dotenv";
import User, { IUser } from "../models/User.js";

dotenv.config();

// Extend Express.User
declare global {
  namespace Express {
    interface User extends IUser {
      isNew?: boolean;
    }
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        /* Guard: Google sometimes omits the e-mail field if it’s private. */
        if (!profile.emails?.[0]?.value) {
          return done(
            new Error("Google account did not provide an e-mail address")
          );
        }

        const email = profile.emails[0].value;

        const user = await findOrCreateOAuthUser(
          email,
          profile.id, // providerId
          "google", // provider name
          {
            name: profile.displayName,
            picture: profile.photos?.[0]?.value ?? "",
          }
        );

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

// Serialize and Deserialize User
passport.serializeUser((user: Express.User, done) => {
  // store only the Mongo _id in the session cookie
  done(null, (user as IUser)._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const userDoc = await User.findById(id);
    // toObject() strips Mongoose getters and adds plain JS props
    done(null, userDoc?.toObject() as Express.User | null);
  } catch (err) {
    done(err as Error, null);
  }
});

export default GoogleStrategy;
