const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Register API
router.post("/register", async (req, res) => {
  const { email, name, password, mobile } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create a new user
    const newUser = new User({ email, name, password, mobile });

    // Save the new user to the database
    await newUser.save();

    // Respond with success
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login API
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users except the one with excludeUserId
router.get("/users/:excludeUserId", async (req, res) => {
  const { excludeUserId } = req.params;
  console.log("excludeUserId", excludeUserId);

  try {
    const users = await User.find({ userId: { $ne: excludeUserId } });

    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
