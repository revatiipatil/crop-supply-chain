import mongoose from 'mongoose';

const CropDataSchema = new mongoose.Schema({
    temperature: {
        type: Number,
        required: [true, "Temperature is required"],
        min: [-50, "Temperature cannot be below -50°C"],
        max: [100, "Temperature cannot be above 100°C"]
    },
    humidity: {
        type: Number,
        required: [true, "Humidity is required"],
        min: [0, "Humidity cannot be below 0%"],
        max: [100, "Humidity cannot be above 100%"]
    },
    moisture: {
        type: Number,
        required: [true, "Moisture is required"],
        min: [0, "Moisture cannot be below 0%"],
        max: [100, "Moisture cannot be above 100%"]
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// Index for faster queries
CropDataSchema.index({ timestamp: -1 });
CropDataSchema.index({ addedBy: 1 });

const CropData = mongoose.model('CropData', CropDataSchema);

export default CropData;
