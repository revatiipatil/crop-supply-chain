import express from 'express';
import { connection, keypair, mintPublicKey } from '../utils/solana.js';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';

const router = express.Router();

/**
 * Transfer tokens to another wallet
 */
router.post('/transfer', async (req, res) => {
    try {
        const { toAddress, amount } = req.body;
        
        if (!toAddress || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const toPublicKey = new PublicKey(toAddress);
        
        // Get or create token accounts
        const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mintPublicKey,
            keypair.publicKey
        );

        const toTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mintPublicKey,
            toPublicKey
        );

        // Create transfer instruction
        const transferInstruction = createTransferInstruction(
            fromTokenAccount.address,
            toTokenAccount.address,
            keypair.publicKey,
            amount
        );

        // Create and send transaction
        const transaction = new Transaction().add(transferInstruction);
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [keypair]
        );

        res.json({ success: true, signature });
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ error: 'Failed to transfer tokens' });
    }
});

/**
 * Get token balance for a wallet
 */
router.get('/balance/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const publicKey = new PublicKey(address);

        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mintPublicKey,
            publicKey
        );

        const balance = await connection.getTokenAccountBalance(tokenAccount.address);
        res.json({ balance: balance.value.uiAmount });
    } catch (error) {
        console.error('Balance check error:', error);
        res.status(500).json({ error: 'Failed to get token balance' });
    }
});

export default router;
