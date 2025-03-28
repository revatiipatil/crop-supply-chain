const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { generateToken } = require("../utils/auth");

const router = express.Router();

// Validation middleware
const validateRegistration = [
    body("username").trim().isLength({ min: 3 }).withMessage("Username must be at least 3 characters long"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
];

const validateLogin = [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required")
];

// Register user
router.post("/register", validateRegistration, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Create new user
        user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Login user
router.post("/login", validateLogin, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router; 