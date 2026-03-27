const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "demo@example.com";
    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Demo user already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Password123!", 10);
    await User.create({
      name: "Demo User",
      email,
      password: hashedPassword,
    });

    console.log("Demo user created:");
    console.log("Email: demo@example.com");
    console.log("Password: Password123!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed user:", error.message);
    process.exit(1);
  }
}

seed();
