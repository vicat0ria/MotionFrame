import passport from "passport";
import { Strategy as FacebookStrategy, Profile } from "passport-facebook";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

// Define a custom VerifyCallback type
type VerifyCallback = (error: any, user?: Express.User | false | null) => void;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL as string,
      profileFields: ["id", "displayName", "email"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        let user = await User.findOne({ facebookId: profile.id });

        if (!user) {
          user = new User({
            facebookId: profile.id,
            username: profile.displayName,
            email: profile.emails?.[0]?.value || `${profile.id}@facebook.com`,
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
