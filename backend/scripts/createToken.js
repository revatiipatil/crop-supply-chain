import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  mintTo,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

// Connect to Solana devnet
const connection = new Connection('https://api.devnet.solana.com');

// Read admin keypair
const keypairPath = path.join(process.cwd(), 'admin-keypair.json');
const keypairJson = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
const adminKeypair = Keypair.fromSecretKey(new Uint8Array(keypairJson.secretKey));

async function createAndMintToken() {
  try {
    console.log('Creating token mint...');
    const mint = await createMint(
      connection,
      adminKeypair,
      adminKeypair.publicKey, // mint authority
      adminKeypair.publicKey, // freeze authority
      9 // decimals
    );

    console.log('Token mint created successfully!');
    console.log('Mint address:', mint.toString());

    // Create associated token account for admin
    const adminTokenAccount = await getAssociatedTokenAddress(
      mint,
      adminKeypair.publicKey
    );

    console.log('Creating admin token account...');
    const transaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        adminKeypair.publicKey,
        adminTokenAccount,
        adminKeypair.publicKey,
        mint
      )
    );

    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = adminKeypair.publicKey;

    const signedTx = await adminKeypair.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signedTx.serialize());
    await connection.confirmTransaction(signature);

    console.log('Admin token account created successfully!');

    // Mint initial supply
    const initialSupply = 1000000; // 1 million tokens
    console.log(`Minting ${initialSupply} tokens...`);
    
    await mintTo(
      connection,
      adminKeypair,
      mint,
      adminTokenAccount,
      adminKeypair.publicKey,
      initialSupply * (10 ** 9) // Convert to token decimals
    );

    console.log('Tokens minted successfully!');

    // Save token information
    const tokenInfo = {
      mintAddress: mint.toString(),
      adminTokenAccount: adminTokenAccount.toString(),
      decimals: 9,
      initialSupply: initialSupply
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'token-info.json'),
      JSON.stringify(tokenInfo, null, 2)
    );

    console.log('Token information saved to token-info.json');
  } catch (error) {
    console.error('Error:', error);
  }
}

createAndMintToken(); 