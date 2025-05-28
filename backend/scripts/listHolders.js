import { Connection, PublicKey } from '@solana/web3.js';
import { getProgramAccounts, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import fs from 'fs';
import path from 'path';

// Connect to Solana devnet
const connection = new Connection('https://api.devnet.solana.com');

// Read token info
const tokenInfoPath = path.join(process.cwd(), 'token-info.json');
const tokenInfo = JSON.parse(fs.readFileSync(tokenInfoPath, 'utf-8'));

const mintAddress = new PublicKey(tokenInfo.mintAddress);

async function listTokenHolders() {
  try {
    console.log('Fetching token holders...');
    
    // Get all token accounts for our mint
    const accounts = await getProgramAccounts(
      connection,
      TOKEN_PROGRAM_ID,
      {
        filters: [
          {
            dataSize: 165, // Size of token account data
          },
          {
            memcmp: {
              offset: 0, // Offset to mint address in token account data
              bytes: mintAddress.toBase58(),
            },
          },
        ],
      }
    );

    console.log(`Found ${accounts.length} token holders\n`);

    // Process each account
    for (const account of accounts) {
      const accountData = account.account.data;
      const owner = new PublicKey(accountData.slice(32, 64));
      const amount = accountData.readBigUInt64LE(64);
      const balance = Number(amount) / (10 ** tokenInfo.decimals);

      if (balance > 0) {
        console.log(`Address: ${owner.toBase58()}`);
        console.log(`Balance: ${balance}`);
        console.log('-------------------');
      }
    }

    return accounts.length;
  } catch (error) {
    console.error('Error:', error);
    return 0;
  }
}

// Run the script
listTokenHolders(); 