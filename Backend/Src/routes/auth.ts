import { Router } from "express";
import passport from "passport";
import { AuthenticateOptions } from "passport-facebook";
import { authLimiter } from "../middleware/ratelimit.middleware.js";
import { validateRequest } from "../utils/validation.js";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  changePassword,
  getCurrentUser,
} from "../controllers/auth.controller.js";

const router = Router();

// Remove global rate limiting
// router.use(authLimiter);

// Registration validation
const registerValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("username")
    .optional()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores and hyphens"
    ),
];

// Login validation
const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Apply rate limiting only to local auth routes
router.post(
  "/register",
  authLimiter,
  registerValidation,
  validateRequest,
  register
);
router.post("/login", authLimiter, loginValidation, validateRequest, login);

// Password management
router.post(
  "/change-password",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  ],
  validateRequest,
  changePassword
);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // Always show account selector
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/MotionFrame/#/login`,
    failureMessage: true,
  }),
  (req, res) => {
    const isNewUser = req.user?.isNew;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(
      `${frontendUrl}/MotionFrame/#${
        isNewUser ? "/video-editor?newUser=true" : "/video-editor"
      }`
    );
  }
);

// GitHub OAuth
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
    prompt: "consent", // Always show consent screen
  })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/MotionFrame/#/login`,
    failureMessage: true,
  }),
  (req, res) => {
    const isNewUser = req.user?.isNew;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(
      `${frontendUrl}/MotionFrame/#${
        isNewUser ? "/video-editor?newUser=true" : "/video-editor"
      }`
    );
  }
);

// Facebook OAuth
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
    display: "popup",
  } as AuthenticateOptions)
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/MotionFrame/#/login`,
    failureMessage: true,
  }),
  (req, res) => {
    const isNewUser = req.user?.isNew;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(
      `${frontendUrl}/MotionFrame/#${
        isNewUser ? "/video-editor?newUser=true" : "/video-editor"
      }`
    );
  }
);

// LinkedIn OAuth
router.get(
  "/linkedin",
  passport.authenticate("linkedin", {
    scope: ["r_emailaddress", "r_liteprofile"],
    prompt: "select_account", // Always show account selector
  })
);

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", {
    failureRedirect: `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/MotionFrame/#/login`,
    failureMessage: true,
  }),
  (req, res) => {
    const isNewUser = req.user?.isNew;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(
      `${frontendUrl}/MotionFrame/#${
        isNewUser ? "/video-editor?newUser=true" : "/video-editor"
      }`
    );
  }
);

// Current user
router.get("/current-user", getCurrentUser);

// Logout
router.post("/logout", logout);

export default router;
