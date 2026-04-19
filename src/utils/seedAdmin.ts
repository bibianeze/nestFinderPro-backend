import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("Connected to MongoDB");

    const adminEmail = process.env.ADMIN_EMAIL || "admin123@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    // Check if admin already exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin — password is hashed automatically
    const admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      isVerified: true, // admin does not need email verification
    });

    console.log(`Admin created: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`You can now log in with these credentials on the frontend`);

    process.exit(0);
  } catch (error) {
    console.error("Seeder error:", error);
    process.exit(1);
  }
};

seedAdmin();