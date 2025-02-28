import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import User, { IUser } from "../models/User.js"; // Adjust the path as needed

const router = Router();

// ---------------- registration route ----------------
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Check if a user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Create a new user (password will be hashed automatically)
    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// ---------------- local login ----------------
router.post("/login", (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    (err: Error | null, user: IUser | false, info?: { message?: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({
          message: info?.message || "Login failed.",
        });
      }
      req.logIn(user, (err: Error | null) => {
        if (err) {
          return next(err);
        }
        return res.status(200).json({
          message: "Login successful.",
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
          },
        });
      });
    }
  )(req, res, next);
});

// ---------------- Google OAuth ----------------
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard"); // Redirect after successful login
  }
);

// ---------------- GitHub OAuth ----------------
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// ---------------- Facebook OAuth ----------------
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

// ---------------- LinkedIn OAuth ----------------

// LinkedIn Login Route
router.get(
  "/linkedin",
  passport.authenticate("linkedin", { scope: ["profile", "email"] })
);

// LinkedIn Callback Route
router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

// Logout Route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.redirect("/");
  });
});

export { router };
