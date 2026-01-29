const express = require("express");
const User = require("../Model/user.model");

const router = express.Router();

// Public profile by ID
router.get("/profile/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -email -resetPasswordToken -resetPasswordExpires"
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Public projects by user ID
router.get("/projects/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("projects");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.projects || []);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});
