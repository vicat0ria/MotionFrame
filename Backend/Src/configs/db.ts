import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/motionframe";

export const getDb = () => {
  if (!mongoose.connection.readyState) {
    mongoose.connect(MONGODB_URI);
  }
  return mongoose.connection.getClient().db();
};

async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // timeout in ms
    });
    logger.info("Database connected successfully with Mongoose");

    // Set up connection event handlers
    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB connection lost. Attempting to reconnect...");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected successfully");
    });
  } catch (error: unknown) {
    logger.error("MongoDB connection error:", (error as Error).message);
    throw error; // Propagate the error up
  }
}

export default connectDB;
