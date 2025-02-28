import express, { Request, Response } from "express";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import connectDB from "./configs/db.js";
import { router as authRoutes } from "./routes/auth.js";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT: number = Number(process.env.PORT) || 5000;

// Middleware
app.use(express.json());

// Add Session Middleware for Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Initialize Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Import Passport Strategies
import "./configs/passport-google.js";
import "./configs/passport-github.js";
import "./configs/passport-facebook.js";
import "./configs/passport-linkedin.js";

// Register Authentication Routes
app.use("/auth", authRoutes);

// Test Route
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

connectDB()
  .then(() => {
    console.log("Connected to database");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err: unknown) => {
    console.error("Database connection failed:", (err as Error).message);
    process.exit(1);
  });
