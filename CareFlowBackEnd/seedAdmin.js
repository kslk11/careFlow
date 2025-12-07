const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User");
require('dotenv').config()
const MONGO_URL = "mongodb+srv://kaushalmahawer267:kaushal12@cluster0.eg8cc.mongodb.net/careflow";

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("MongoDB connected");

    const adminExists = await User.findOne({ email: "admin@gmail.com" });

    if (adminExists) {
      console.log("Admin already exists");
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await User.create({
      name: "Super Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      phone: "9999999999",
      address: "Head Office",
      age: 30,
      gender: "male",
      bloodGroup: "O+",
      medicalHistory: "None",
      profileImage: "",
      isActive: true,
    });

    console.log("Admin seeded successfully");
    process.exit(0);

  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1);
  }
}

seedAdmin();
