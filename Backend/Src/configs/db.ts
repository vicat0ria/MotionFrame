import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri: string | undefined = process.env.MONGO_URI;
let client: MongoClient | null = null;

async function connectDB(): Promise<Db> {
  if (!uri) throw new Error("MONGO_URI is missing!");

  if (!client) {
    client = new MongoClient(uri);
    try {
      await client.connect();
      console.log("Database connected successfully");
    } catch (error: unknown) {
      console.error("MongoDB connection error:", (error as Error).message);
      process.exit(1);
    }
  }

  return client.db("motionframe");
}

export default connectDB;
