import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import cropRoutes from './routes/CropRoutes.js';
import authRoutes from './routes/authRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
console.log("SECRET_KEY from env:", process.env.SECRET_KEY);

const app = express();

// Security Middleware
app.use(express.json({ limit: "10kb" })); // Limit body size
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

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
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.originalUrl);
    res.status(404).json({ error: "Route not found" });
});
