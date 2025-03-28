const express = require("express");
const { connection, keypair, mintPublicKey } = require("../utils/solana");
const { getOrCreateAssociatedTokenAccount, createTransferInstruction, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { PublicKey, Transaction, sendAndConfirmTransaction } = require("@solana/web3.js");

const router = express.Router();

/**
 * Transfer tokens to another wallet
 */
router.post("/transfer", async (req, res) => {
    try {
        const { recipient, amount } = req.body;

        if (!recipient || !amount) {
            return res.status(400).json({ error: "Recipient and amount are required" });
        }

        const recipientPublicKey = new PublicKey(recipient);
        const senderTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection, keypair, mintPublicKey, keypair.publicKey
        );

        const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
            connection, keypair, mintPublicKey, recipientPublicKey
        );

        const transaction = new Transaction().add(
            createTransferInstruction(
                senderTokenAccount.address, recipientTokenAccount.address, keypair.publicKey, amount * 1e9, [], TOKEN_PROGRAM_ID
            )
        );

        const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);

        res.json({ message: "Transfer successful", signature });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
