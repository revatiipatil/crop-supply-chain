import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  transfer,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

// Connect to Solana devnet
const connection = new Connection('https://api.devnet.solana.com');

// Read admin keypair and token info
const keypairPath = path.join(process.cwd(), 'admin-keypair.json');
const tokenInfoPath = path.join(process.cwd(), 'token-info.json');

const keypairJson = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
const tokenInfo = JSON.parse(fs.readFileSync(tokenInfoPath, 'utf-8'));

const adminKeypair = Keypair.fromSecretKey(new Uint8Array(keypairJson.secretKey));
const mintAddress = new PublicKey(tokenInfo.mintAddress);
const adminTokenAccount = new PublicKey(tokenInfo.adminTokenAccount);

async function sendTokensToFarmer(farmerAddress, amount) {
  try {
    const farmerPublicKey = new PublicKey(farmerAddress);
    
    // Get or create farmer's token account
    const farmerTokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      farmerPublicKey
    );

    // Check if farmer's token account exists
    try {
      await connection.getTokenAccountBalance(farmerTokenAccount);
    } catch {
      console.log('Creating farmer token account...');
      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          adminKeypair.publicKey,
          farmerTokenAccount,
          farmerPublicKey,
          mintAddress
        )
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = adminKeypair.publicKey;

      const signedTx = await adminKeypair.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      await connection.confirmTransaction(signature);
      console.log('Farmer token account created successfully!');
    }

    // Transfer tokens
    console.log(`Transferring ${amount} tokens to farmer...`);
    await transfer(
      connection,
      adminKeypair,
      adminTokenAccount,
      farmerTokenAccount,
      adminKeypair.publicKey,
      amount * (10 ** tokenInfo.decimals)
    );

    console.log('Tokens transferred successfully!');
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

// Example usage
const farmerAddress = process.argv[2];
const amount = parseInt(process.argv[3]);

if (!farmerAddress || !amount) {
  console.log('Usage: node sendToken.js <farmer-address> <amount>');
  process.exit(1);
}

sendTokensToFarmer(farmerAddress, amount); 