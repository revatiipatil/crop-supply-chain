const mongoose = require("mongoose");

const CropDataSchema = new mongoose.Schema({
    temperature: Number,
    humidity: Number,
    moisture: Number,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("CropData", CropDataSchema);
