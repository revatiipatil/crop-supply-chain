const express = require("express");
const CropData = require("../models/CropData");

const router = express.Router();

// Store IoT Data
router.post("/add", async (req, res) => {
    try {
        const { temperature, humidity, moisture } = req.body;
        const newData = new CropData({ temperature, humidity, moisture });
        await newData.save();
        res.json({ message: "Data saved successfully", data: newData });
    } catch (error) {
        res.status(500).json({ error: "Failed to save data" });
    }
});

// Get IoT Data
router.get("/all", async (req, res) => {
    try {
        const data = await CropData.find();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

module.exports = router;
