import { Connection, PublicKey } from '@solana/web3.js';

// Connect to Solana devnet
const connection = new Connection(process.env.REACT_APP_SOLANA_RPC_URL || 'https://api.devnet.solana.com');

// Get Phantom wallet provider
const getProvider = () => {
  if ('phantom' in window) {
    const provider = window.phantom?.solana;
    if (provider?.isPhantom) {
      return provider;
    }
  }
  throw new Error('Please install Phantom wallet');
};

// Connect wallet
export const connectWallet = async () => {
  try {
    const provider = getProvider();
    const response = await provider.connect();
    return response.publicKey.toString();
  } catch (error) {
    throw new Error('Failed to connect wallet: ' + error.message);
  }
};

// Disconnect wallet
export const disconnectWallet = async () => {
  try {
    const provider = getProvider();
    await provider.disconnect();
  } catch (error) {
    throw new Error('Failed to disconnect wallet: ' + error.message);
  }
};

// Get wallet balance
export const getWalletBalance = async (publicKey) => {
  try {
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / 1e9; // Convert lamports to SOL
  } catch (error) {
    throw new Error('Failed to get wallet balance: ' + error.message);
  }
}; 