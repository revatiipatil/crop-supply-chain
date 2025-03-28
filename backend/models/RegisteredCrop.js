const mongoose = require("mongoose");

const RegisteredCropSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Crop name is required"],
        trim: true
    },
    weight: {
        type: Number,
        required: [true, "Weight is required"],
        min: [0, "Weight cannot be negative"]
    },
    location: {
        type: String,
        required: [true, "Location is required"],
        trim: true
    },
    farmer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    tokenBalance: {
        type: Number,
        default: 0
    }
});

// Index for faster queries
RegisteredCropSchema.index({ farmer: 1 });
RegisteredCropSchema.index({ registeredAt: -1 });

// Pre-save middleware to calculate token balance
RegisteredCropSchema.pre('save', function(next) {
    // Calculate tokens (1 token per kg)
    this.tokenBalance = Math.floor(this.weight);
    next();
});

module.exports = mongoose.model("RegisteredCrop", RegisteredCropSchema); 