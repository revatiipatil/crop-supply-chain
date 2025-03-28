require("dotenv").config();
console.log("SECRET_KEY from env:", process.env.SECRET_KEY);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");

const app = express();

// Security Middleware
app.use(helmet()); // Adds various HTTP headers for security
app.use(express.json({ limit: "10kb" })); // Limit body size
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // limit each IP to 100 requests per windowMs
});
app.use("/api/", limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Default route
app.get("/", (req, res) => {
    res.send("Crop Supply Chain Backend Running...");
});

// Load wallet from the secret key (Make sure the SECRET_KEY in .env is a valid JSON array)
const secretKey = JSON.parse(process.env.SECRET_KEY);
const wallet = Keypair.fromSecretKey(Uint8Array.from(secretKey));

console.log("Connected to Solana! Wallet Address:", wallet.publicKey.toBase58());

// Solana blockchain connection
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log('--------------------');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('--------------------');
  next();
});

// Import routes
const cropRoutes = require("./routes/CropRoutes");
const walletRoutes = require("./routes/walletRoutes");
const authRoutes = require("./routes/authRoutes");

// Mount routes with debug logging
console.log('Mounting routes...');
app.use("/api/crop", (req, res, next) => {
  console.log('Crop route hit:', req.method, req.originalUrl);
  cropRoutes(req, res, next);
});
app.use("/api/wallet", walletRoutes);
app.use("/api/auth", authRoutes);
console.log('Routes mounted successfully');

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        error: "Something went wrong!",
        message: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.originalUrl);
    res.status(404).json({ error: "Route not found" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});
