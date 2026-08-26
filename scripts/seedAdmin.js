import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error("Error: MONGODB_URI not found in environment variables");
      process.exit(1);
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Check if an admin user already exists with role 'ADMIN'
    const existingAdmin = await User.findOne({
      $or: [{ role: "ADMIN" }, { email: "admin@docpulse.com" }],
    });

    if (existingAdmin) {
      console.log(`Admin account already exists: ${existingAdmin.email} (${existingAdmin.role})`);
      console.log("Admin account verified/seeded successfully.");
    } else {
      // Hash password for default admin
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("Admin@12345", salt);

      const newAdmin = await User.create({
        name: "Super Admin",
        email: "admin@docpulse.com",
        password: hashedPassword,
        role: "ADMIN",
      });

      console.log(`Super Admin created successfully: ${newAdmin.email}`);
      console.log("Admin account verified/seeded successfully.");
    }
  } catch (error) {
    console.error("Error seeding admin account:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();
