import dotenv from 'dotenv';
import { Connection, Keypair, clusterApiUrl, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getMint, getOrCreateAssociatedTokenAccount, createMint, mintTo } from '@solana/spl-token';

dotenv.config();

// Connect to Solana network
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

// Load wallet from .env (Ensure you have your keypair in .env as SECRET_KEY)
const secretKey = JSON.parse(process.env.SECRET_KEY);
const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

// Initialize token mint
let mintPublicKey;
const initializeToken = async () => {
    try {
        // Create new token mint
        mintPublicKey = await createMint(
            connection,
            keypair,
            keypair.publicKey,
            null,
            9 // 9 decimals
        );

        console.log('Token mint created:', mintPublicKey.toBase58());
        return mintPublicKey;
    } catch (error) {
        console.error('Error creating token mint:', error);
        throw error;
    }
};

// Create a new wallet for a user
const createUserWallet = async () => {
    try {
        const newKeypair = Keypair.generate();
        
        // Request airdrop for new wallet
        const airdropSignature = await connection.requestAirdrop(
            newKeypair.publicKey,
            LAMPORTS_PER_SOL * 1 // 1 SOL
        );
        
        await connection.confirmTransaction(airdropSignature, "confirmed");
        
        return {
            publicKey: newKeypair.publicKey.toBase58(),
            secretKey: Array.from(newKeypair.secretKey)
        };
    } catch (error) {
        console.error('Error creating user wallet:', error);
        throw error;
    }
};

// Mint tokens to a recipient
const mintTokens = async (recipientPublicKey, amount) => {
    try {
        // Validate recipient address
        if (!recipientPublicKey) {
            throw new Error('Recipient public key is required');
        }

        // Validate amount
        if (!amount || amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }

        // Create PublicKey instance
        let recipient;
        try {
            recipient = new PublicKey(recipientPublicKey);
        } catch (error) {
            throw new Error(`Invalid recipient address: ${recipientPublicKey}`);
        }

        // Ensure mint is initialized
        if (!mintPublicKey) {
            await initializeToken();
        }
        
        // Get or create recipient's token account
        const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mintPublicKey,
            recipient
        );

        // Mint tokens
        await mintTo(
            connection,
            keypair,
            mintPublicKey,
            recipientTokenAccount.address,
            keypair.publicKey,
            amount * (10 ** 9) // Convert to token decimals
        );

        console.log(`Successfully minted ${amount} tokens to ${recipientPublicKey}`);
        return true;
    } catch (error) {
        console.error('Error minting tokens:', error);
        throw error;
    }
};

// Get token balance for a wallet
const getTokenBalance = async (walletPublicKey) => {
    try {
        const wallet = new PublicKey(walletPublicKey);
        
        // Get token account
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mintPublicKey,
            wallet
        );

        // Get balance
        const balance = await connection.getTokenAccountBalance(tokenAccount.address);
        return balance.value.uiAmount;
    } catch (error) {
        console.error('Error getting token balance:', error);
        throw error;
    }
};

// Initialize token on startup
initializeToken().catch(console.error);

export {
    connection,
    keypair,
    mintPublicKey,
    createUserWallet,
    mintTokens,
    getTokenBalance
};
