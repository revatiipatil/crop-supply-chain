require("dotenv").config();
const { Connection, Keypair, clusterApiUrl, PublicKey } = require("@solana/web3.js");
const { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } = require("@solana/spl-token");

// Connect to Solana network
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// Load wallet from .env (Ensure you have your keypair in .env as SECRET_KEY)
const secretKey = JSON.parse(process.env.SECRET_KEY);
const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

// Your Token Mint Address (Replace this with your actual token mint address)
const TOKEN_MINT_ADDRESS = "4bzX2ycUYNXrQD5Q8SgzB33NMaB3BbUkM1FvLjrhbd9v"; 
const mintPublicKey = new PublicKey(TOKEN_MINT_ADDRESS);

module.exports = { connection, keypair, mintPublicKey };
