const bcrypt = require("bcryptjs");
const config = require("./config/env");
const { connectDB } = require("./config/db");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = config.admin.email;
    const adminPassword = config.admin.password;
    const adminName = config.admin.name;

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
