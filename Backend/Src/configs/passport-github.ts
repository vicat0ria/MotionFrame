import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import dotenv from "dotenv";
import User from "../models/User.js";
import { Profile } from "passport-github2";
import { findOrCreateOAuthUser } from "../services/authService.js";

dotenv.config();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      callbackURL:
        process.env.GITHUB_CALLBACK_URL || "/api/auth/github/callback",
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: any, user?: any) => void
    ) => {
      try {
        // GitHub may not provide email, handle this case
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          return done(new Error("Email not provided by GitHub"));
        }

        const email = profile.emails[0].value;
        const profileData = {
          name: profile.displayName || profile.username,
          picture:
            profile.photos && profile.photos[0] ? profile.photos[0].value : "",
          // Include additional GitHub profile data if needed
        };

        const user = await findOrCreateOAuthUser(
          email,
          profile.id,
          "github",
          profileData
        );

        return done(null, user);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

export default passport;
