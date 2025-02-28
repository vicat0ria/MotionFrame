import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI as string;

if (!uri) {
  throw new Error("MONGO_URI is missing!");
}

async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000, // timeout in ms
    });
    console.log("Database connected successfully with Mongoose");
  } catch (error: unknown) {
    console.error("MongoDB connection error:", (error as Error).message);
    process.exit(1);
  }
}

export default connectDB;
