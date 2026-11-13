const path = require("path");
// Load environment variables from server/.env with fallback to root .env
require("dotenv").config({ path: path.join(__dirname, ".env") });
if (!process.env.JWT_SECRET && !process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "../.env") });
}
const bcrypt = require("bcryptjs");
const { connectDB } = require("./config/db");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@1234";
    const adminName = process.env.ADMIN_NAME || "System Admin";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log(`Admin user with email "${adminEmail}" already exists.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "admin",
      phone: "9999999999",
      isActive: true,
    });

    console.log("Admin user seeded successfully!");
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`Password: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
    process.exit(1);
  }
};

seedAdmin();
