import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';

// Generate a new keypair
const keypair = Keypair.generate();

// Convert to JSON format
const keypairJson = {
  publicKey: keypair.publicKey.toBase58(),
  secretKey: Array.from(keypair.secretKey)
};

// Save to file
const keypairPath = path.join(process.cwd(), 'admin-keypair.json');
fs.writeFileSync(keypairPath, JSON.stringify(keypairJson, null, 2));

console.log('Admin keypair generated successfully!');
console.log('Public Key:', keypair.publicKey.toBase58());
console.log('Keypair saved to:', keypairPath); 