require("dotenv").config();
const { Connection, Keypair, clusterApiUrl, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } = require("@solana/web3.js");
const { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getMint, getOrCreateAssociatedTokenAccount, createMint, mintTo } = require("@solana/spl-token");

// Connect to Solana network
const connection = new Connection(process.env.SOLANA_RPC_URL, "confirmed");

// Load wallet from .env (Ensure you have your keypair in .env as SECRET_KEY)
const secretKey = JSON.parse(process.env.SECRET_KEY);
const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

// Your Token Mint Address (Replace this with your actual token mint address)
const TOKEN_MINT_ADDRESS = "4bzX2ycUYNXrQD5Q8SgzB33NMaB3BbUkM1FvLjrhbd9v"; 
const mintPublicKey = new PublicKey(TOKEN_MINT_ADDRESS);

let tokenMint = null;

const initializeToken = async () => {
  try {
    // Check if token mint already exists
    if (process.env.TOKEN_MINT) {
      tokenMint = new PublicKey(process.env.TOKEN_MINT);
      console.log("Using existing token mint:", tokenMint.toBase58());
      return tokenMint;
    }

    // Create new token mint
    console.log("Creating new token mint...");
    tokenMint = await createMint(
      connection,
      keypair, // Payer
      keypair.publicKey, // Mint authority
      keypair.publicKey, // Freeze authority
      9 // Decimals
    );

    console.log("Token mint created:", tokenMint.toBase58());
    return tokenMint;
  } catch (error) {
    console.error("Error initializing token:", error);
    throw error;
  }
};

const createUserWallet = async () => {
  try {
    const newWallet = Keypair.generate();
    
    // Airdrop some SOL for transaction fees
    const signature = await connection.requestAirdrop(
      newWallet.publicKey,
      LAMPORTS_PER_SOL / 100 // 0.01 SOL
    );
    await connection.confirmTransaction(signature);

    return {
      publicKey: newWallet.publicKey.toBase58(),
      privateKey: Array.from(newWallet.secretKey)
    };
  } catch (error) {
    console.error("Error creating user wallet:", error);
    throw error;
  }
};

const mintTokens = async (recipientPublicKey, amount) => {
  try {
    if (!tokenMint) {
      await initializeToken();
    }

    const recipientPubKey = new PublicKey(recipientPublicKey);
    
    // Get or create associated token account for recipient
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair, // Payer
      tokenMint,
      recipientPubKey
    );

    // Mint tokens to recipient's token account
    const mintAmount = amount * Math.pow(10, 9); // Convert to token decimals
    await mintTo(
      connection,
      keypair, // Payer
      tokenMint,
      recipientTokenAccount.address,
      keypair, // Mint authority
      mintAmount
    );

    console.log(`Minted ${amount} tokens to ${recipientPublicKey}`);
    return recipientTokenAccount.address.toBase58();
  } catch (error) {
    console.error("Error minting tokens:", error);
    throw error;
  }
};

const getTokenBalance = async (walletPublicKey) => {
  try {
    if (!tokenMint) {
      await initializeToken();
    }

    const pubKey = new PublicKey(walletPublicKey);
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      keypair,
      tokenMint,
      pubKey
    );

    const balance = await connection.getTokenAccountBalance(tokenAccount.address);
    return parseFloat(balance.value.uiAmount);
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw error;
  }
};

module.exports = {
  initializeToken,
  createUserWallet,
  mintTokens,
  getTokenBalance,
  connection
};
