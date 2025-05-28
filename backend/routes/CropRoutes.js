import express from 'express';
import { body, validationResult } from 'express-validator';
import CropData from '../models/CropData.js';
import RegisteredCrop from '../models/RegisteredCrop.js';
import { protect, authorize } from '../utils/auth.js';
import User from '../models/User.js';
import { mintTokens } from '../utils/solana.js';

const router = express.Router();

// Debug logging for route setup
console.log('Setting up crop routes...');

// Validation middleware
const validateCropData = [
    body("temperature").isFloat({ min: -50, max: 100 }).withMessage("Temperature must be between -50°C and 100°C"),
    body("humidity").isFloat({ min: 0, max: 100 }).withMessage("Humidity must be between 0% and 100%"),
    body("moisture").isFloat({ min: 0, max: 100 }).withMessage("Moisture must be between 0% and 100%")
];

// Validation middleware for crop registration
const validateCropRegistration = [
    body("name").trim().notEmpty().withMessage("Crop name is required"),
    body("weight").isFloat({ min: 0 }).withMessage("Weight must be a positive number"),
    body("location").trim().notEmpty().withMessage("Location is required")
];

// Store IoT Data
router.post("/add", protect, authorize("admin"), validateCropData, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { temperature, humidity, moisture } = req.body;
        const newData = new CropData({
            temperature,
            humidity,
            moisture,
            addedBy: req.user.id
        });
        
        await newData.save();
        res.status(201).json({
            message: "Data saved successfully",
            data: newData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to save data" });
    }
});

// Get IoT Data with pagination and filtering
router.get("/all", protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build query
        const query = {};
        if (req.query.startDate && req.query.endDate) {
            query.timestamp = {
                $gte: new Date(req.query.startDate),
                $lte: new Date(req.query.endDate)
            };
        }

        // Execute query with pagination
        const data = await CropData.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await CropData.countDocuments(query);

        res.json({
            data,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalItems: total
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

// Get latest data
router.get("/latest", protect, async (req, res) => {
    try {
        const latestData = await CropData.findOne()
            .sort({ timestamp: -1 });
        
        if (!latestData) {
            return res.status(404).json({ error: "No data found" });
        }

        res.json(latestData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch latest data" });
    }
});

// Register a new crop
router.post("/register", protect, authorize("farmer"), validateCropRegistration, async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, weight, location, walletAddress } = req.body;
        const farmer = req.user;

        // Check if farmer has a valid wallet address
        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                error: "Wallet address is required. Please connect your wallet first."
            });
        }

        // Update farmer's wallet address if it has changed
        if (farmer.walletAddress !== walletAddress) {
            farmer.walletAddress = walletAddress;
            await farmer.save();
        }

        // Create new registered crop
        const registeredCrop = new RegisteredCrop({
            name,
            weight: parseFloat(weight),
            location,
            farmer: farmer._id
        });

        // Save the crop
        await registeredCrop.save();

        // Calculate tokens (1 token per 10kg)
        const tokensToMint = Math.floor(parseFloat(weight) / 10);

        let tokenMintingSuccess = false;
        let tokenMintingError = null;

        if (tokensToMint > 0) {
            try {
                // Mint tokens to farmer's wallet
                await mintTokens(walletAddress, tokensToMint);
                tokenMintingSuccess = true;
                
                // Update user's token balance
                farmer.tokenBalance = (farmer.tokenBalance || 0) + tokensToMint;
                await farmer.save();
            } catch (mintError) {
                console.error('Token minting error:', mintError);
                tokenMintingError = mintError.message;
            }
        }

        // Return success response
        res.status(201).json({
            success: true,
            data: {
                crop: registeredCrop,
                tokensMinted: tokenMintingSuccess ? tokensToMint : 0,
                newBalance: farmer.tokenBalance,
                warning: tokenMintingError ? `Crop registered but token minting failed: ${tokenMintingError}` : undefined
            }
        });
    } catch (error) {
        console.error('Crop registration error:', error);
        res.status(500).json({ 
            success: false,
            error: "Failed to register crop",
            details: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
});

// Get my registered crops
router.get("/my-crops", protect, async (req, res) => {
    try {
        const crops = await RegisteredCrop.find({ farmer: req.user.id })
            .sort({ registeredAt: -1 });

        // Calculate total tokens
        const tokenSum = await RegisteredCrop.aggregate([
            { $match: { farmer: req.user.id } },
            { $group: { _id: null, total: { $sum: "$tokenBalance" } } }
        ]);

        res.json({
            success: true,
            crops,
            totalTokens: tokenSum[0]?.total || 0
        });
    } catch (error) {
        console.error('Error fetching user crops:', error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch crops"
        });
    }
});

console.log('Crop routes setup complete');

export default router;
