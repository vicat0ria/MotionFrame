import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import { normalizeEmail } from "../utils/validation.js";
import logger from "../utils/logger.js";

// Load environment variables
dotenv.config();

/**
 * Script to migrate all existing user accounts to include normalized email
 * Run this script once after deploying the updated code with normalized emails
 */
async function migrateNormalizedEmails() {
  try {
    // Connect to MongoDB
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/motionframe";
    console.log(`Connecting to MongoDB at ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Find all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    // Process each user
    for (const user of users) {
      try {
        // Skip users that already have normalizedEmail
        if (
          user.normalizedEmail &&
          user.normalizedEmail === normalizeEmail(user.email)
        ) {
          console.log(
            `User ${user._id} (${user.email}) already has correct normalizedEmail`
          );
          continue;
        }

        // Set normalized email
        user.normalizedEmail = normalizeEmail(user.email);
        await user.save();

        console.log(
          `Migrated user ${user._id}: ${user.email} -> ${user.normalizedEmail}`
        );
        migratedCount++;
      } catch (err) {
        console.error(`Error migrating user ${user._id} (${user.email}):`, err);
        errorCount++;
      }
    }

    console.log(`Migration complete:
- Total users: ${users.length}
- Successfully migrated: ${migratedCount}
- Errors: ${errorCount}`);
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
migrateNormalizedEmails()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error("Uncaught error in migration:", err);
    process.exit(1);
  });
