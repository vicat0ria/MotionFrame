import passport from "passport";
import {
  Strategy as LinkedInStrategy,
  Profile,
} from "passport-linkedin-oauth2";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

// Define Verify Callback Type
type VerifyCallback = (error: any, user?: Express.User | false | null) => void;

passport.use(
  new LinkedInStrategy(
    {
      clientID: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
      callbackURL: process.env.LINKEDIN_CALLBACK_URL as string,
      scope: ["profile", "email"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        let user = await User.findOne({ linkedinId: profile.id });
        if (!user) {
          user = new User({
            linkedinId: profile.id,
            username: profile.displayName,
            email: profile.emails?.[0]?.value || `${profile.id}@linkedin.com`,
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

// Serialize & Deserialize User
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err as Error, null);
  }
});

export default passport;
