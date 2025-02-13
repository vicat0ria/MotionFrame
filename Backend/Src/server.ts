import express, { Request, Response } from "express";
import connectDB from "./configs/db.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT: number = Number(process.env.PORT) || 5000;

// Connect to MongoDB
connectDB()
  .then(() => console.log("Connected to database"))
  .catch((err: unknown) => {
    console.error("Database connection failed:", (err as Error).message);
    process.exit(1);
  });

// Middleware
app.use(express.json());

// Test Route
app.get("/", (req: Request, res: Response) => {
  res.send("Server is running!");
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
