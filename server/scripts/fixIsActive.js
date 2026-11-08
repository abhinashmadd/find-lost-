const path = require("path");
// Load environment variables from server/.env or root .env
require("dotenv").config({ path: path.join(__dirname, "../.env") });
require("dotenv").config();

const mongoose = require("mongoose");
const { connectDB, getIsMongoConnected } = require("../config/db");
const User = require("../models/User");

// One-time script to ensure all existing users have isActive: true
const fixIsActive = async () => {
  try {
    console.log("Connecting to database...");
    await connectDB();

    console.log("Scanning for users where isActive is undefined...");
    const result = await User.updateMany(
      { isActive: { $exists: false } },
      { $set: { isActive: true } }
    );

    const count = result.modifiedCount !== undefined ? result.modifiedCount : 0;
    console.log(`Update complete: ${count} user(s) updated with isActive: true.`);

    // Disconnect if connected to MongoDB
    if (getIsMongoConnected()) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB.");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error updating users:", error.message);
    process.exit(1);
  }
};

fixIsActive();
