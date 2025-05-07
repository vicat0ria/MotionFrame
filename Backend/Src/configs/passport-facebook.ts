import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js";
import { findOrCreateOAuthUser } from "../services/authService.js";

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID || "",
      clientSecret: process.env.FACEBOOK_APP_SECRET || "",
      callbackURL:
        process.env.FACEBOOK_CALLBACK_URL || "/api/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "displayName", "photos"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          return done(new Error("Email not provided by Facebook"));
        }

        const email = profile.emails[0].value;
        const profileData = {
          name: profile.displayName,
          picture:
            profile.photos && profile.photos[0] ? profile.photos[0].value : "",
        };

        const user = await findOrCreateOAuthUser(
          email,
          profile.id,
          "facebook",
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
