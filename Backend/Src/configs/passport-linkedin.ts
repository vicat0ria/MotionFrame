import passport from "passport";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import User from "../models/User.js";
import { findOrCreateOAuthUser } from "../services/authService.js";

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID || "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
      callbackURL:
        process.env.LINKEDIN_CALLBACK_URL || "/api/auth/linkedin/callback",
      scope: ["r_emailaddress", "r_liteprofile"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails[0] || !profile.emails[0].value) {
          return done(new Error("Email not provided by LinkedIn"));
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
          "linkedin",
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
