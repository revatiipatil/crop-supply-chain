import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import * as fs from "fs";

// Load Admin Wallet
const adminKeypair = Keypair.fromSecretKey(
  Uint8Array.from(JSON.parse(fs.readFileSync("admin-keypair.json", "utf8")))
);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Token Mint Address (Replace with your actual token mint address)
const TOKEN_MINT_ADDRESS = new PublicKey(C83fwZrRwmPCx9L6UohhzJdUBnC98apqFi56VvE4poG2);

// Function to Send Tokens
async function sendTokens(farmerWalletAddress) {
  const farmerWallet = new PublicKey(farmerWalletAddress);

  // Get or create farmer's associated token account
  const farmerTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    adminKeypair,
    TOKEN_MINT_ADDRESS,
    farmerWallet
  );

  // Mint tokens to farmer's account
  await mintTo(
    connection,
    adminKeypair,
    TOKEN_MINT_ADDRESS,
    farmerTokenAccount.address,
    adminKeypair,
    100 // Amount of tokens to send
  );

  console.log(`✅ Sent 100 tokens to ${farmerWallet.toBase58()}`);
}

// Example usage: Replace with actual farmer's wallet address
sendTokens(Bj8BMGD5U4A6D18sPkx5mqsuAXrLgb6SCGBeTc8Nzq7D).catch(console.error);
