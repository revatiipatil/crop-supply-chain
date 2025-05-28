import mongoose from 'mongoose';

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
        ref: 'User',
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

// Calculate token balance based on weight (1 token per 10kg)
RegisteredCropSchema.pre('save', function(next) {
    this.tokenBalance = Math.floor(this.weight / 10); // 1 token per 10kg
    next();
});

// Create indexes for faster queries
RegisteredCropSchema.index({ farmer: 1 });
RegisteredCropSchema.index({ registeredAt: -1 });

const RegisteredCrop = mongoose.model('RegisteredCrop', RegisteredCropSchema);

export default RegisteredCrop; 