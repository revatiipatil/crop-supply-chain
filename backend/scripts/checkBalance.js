import { Connection, PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

// Connect to Solana devnet
const connection = new Connection('https://api.devnet.solana.com');

// Read token info
const tokenInfoPath = path.join(process.cwd(), 'token-info.json');
const tokenInfo = JSON.parse(fs.readFileSync(tokenInfoPath, 'utf-8'));

const mintAddress = new PublicKey(tokenInfo.mintAddress);

async function checkTokenBalance(address) {
  try {
    const publicKey = new PublicKey(address);
    
    // Get associated token account
    const tokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      publicKey
    );

    // Get token account info
    const accountInfo = await getAccount(connection, tokenAccount);
    const balance = accountInfo.amount / (10 ** tokenInfo.decimals);

    console.log(`Token balance for ${address}: ${balance}`);
    return balance;
  } catch (error) {
    if (error.name === 'TokenAccountNotFoundError') {
      console.log(`No token account found for ${address}`);
      return 0;
    }
    console.error('Error:', error);
    return null;
  }
}

// Example usage
const address = process.argv[2];

if (!address) {
  console.log('Usage: node checkBalance.js <address>');
  process.exit(1);
}

checkTokenBalance(address); 