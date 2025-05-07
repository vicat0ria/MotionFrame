import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/User.js";
import { normalizeEmail } from "../utils/validation.js";

// Extend IVerifyOptions to include authMethods
declare module "passport-local" {
  interface IVerifyOptions {
    authMethods?: string[];
  }
}

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const normalizedUserEmail = normalizeEmail(email);
        const user = await User.findOne({
          normalizedEmail: normalizedUserEmail,
        });

        if (!user) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        // Check if this is an OAuth user without a password
        if (!user.password) {
          // Return message with available OAuth providers
          const providers = user.oauthProviders || [];
          return done(null, false, {
            message: `This account uses ${providers.join(
              ", "
            )} login. Please sign in with that method.`,
            authMethods: providers,
          });
        }

        const isValid = await user.validatePassword(password);
        if (!isValid) {
          return done(null, false, { message: "Incorrect email or password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
