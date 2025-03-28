require("dotenv").config();
console.log("SECRET_KEY from env:", process.env.SECRET_KEY);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Connection, Keypair, PublicKey } = require("@solana/web3.js");


const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
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

// Import and use routes
const cropRoutes = require("./routes/CropRoutes");
app.use("/api/crop", cropRoutes);

const walletRoutes = require("./routes/walletRoutes");
app.use("/api/wallet", walletRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
