import passport from "passport";
import { Strategy as LocalStrategy, IVerifyOptions } from "passport-local";
import User, { IUser } from "../models/User.js";

// Define the verify callback type for local authentication
type LocalVerifyCallback = (
  error: any,
  user?: any,
  options?: IVerifyOptions
) => void;

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: false, // Ensures we use the non-request overload
    },
    (email: string, password: string, done: LocalVerifyCallback) => {
      // Wrap the async operations in an IIFE so that the outer function returns void.
      (async () => {
        try {
          // Find the user by email
          const user = await User.findOne({ email });
          if (!user) {
            return done(null, false, {
              message: "Incorrect email or password.",
            });
          }

          // Use non-null assertion since comparePassword is always defined in our schema
          const isMatch = await user.comparePassword!(password);
          if (!isMatch) {
            return done(null, false, {
              message: "Incorrect email or password.",
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      })();
    }
  )
);

// Serialize and deserialize the user (if not already set up elsewhere)
passport.serializeUser((user, done) => {
  const u = user as unknown as IUser; // now TypeScript knows u has an _id property
  done(null, u._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
