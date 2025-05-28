import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { connectWallet, disconnectWallet, getWalletBalance } from '../../utils/wallet';

const WalletInfo = ({ profile, onRegisterCrop, onWalletConnect, onWalletDisconnect }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [solBalance, setSolBalance] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        // Check if Phantom wallet is installed
        if (!window.solana) {
          console.log('Phantom wallet not found');
          return;
        }

        // Check if wallet is already connected
        const isConnected = window.solana.isConnected;
        if (isConnected) {
          const address = window.solana.publicKey.toString();
          console.log('Wallet connected with address:', address);
          setWalletConnected(true);
          setWalletAddress(address);
          const balance = await getWalletBalance(address);
          setSolBalance(balance);
          onWalletConnect?.(address);
        }

        // Listen for wallet connection changes
        window.solana.on('connect', async (publicKey) => {
          console.log('Wallet connected:', publicKey.toString());
          setWalletConnected(true);
          setWalletAddress(publicKey.toString());
          const balance = await getWalletBalance(publicKey);
          setSolBalance(balance);
          onWalletConnect?.(publicKey.toString());
        });

        window.solana.on('disconnect', () => {
          console.log('Wallet disconnected');
          setWalletConnected(false);
          setWalletAddress('');
          setSolBalance(0);
          onWalletDisconnect?.();
        });
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkWalletConnection();

    // Cleanup listeners on unmount
    return () => {
      if (window.solana) {
        window.solana.removeAllListeners('connect');
        window.solana.removeAllListeners('disconnect');
      }
    };
  }, [onWalletConnect, onWalletDisconnect]);

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      console.log('Connecting wallet with address:', address);
      setWalletConnected(true);
      setWalletAddress(address);
      const balance = await getWalletBalance(address);
      setSolBalance(balance);
      onWalletConnect?.(address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      setWalletConnected(false);
      setWalletAddress('');
      setSolBalance(0);
      onWalletDisconnect?.();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Error copying address:', error);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Wallet Information
          </Typography>
          {walletConnected ? (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Connected Wallet:
                </Typography>
                <Box display="flex" alignItems="center">
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      bgcolor: 'background.paper',
                      p: 1,
                      borderRadius: 1,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {walletAddress}
                  </Typography>
                  <Tooltip title={copySuccess ? "Copied!" : "Copy Address"}>
                    <IconButton size="small" onClick={handleCopyAddress}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              <Typography variant="subtitle2" gutterBottom>
                SOL Balance:
              </Typography>
              <Typography variant="h6" gutterBottom>
                {solBalance.toFixed(4)} SOL
              </Typography>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDisconnectWallet}
                startIcon={<AccountBalanceWalletIcon />}
                sx={{ mt: 1 }}
              >
                Disconnect Wallet
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleConnectWallet}
              startIcon={<AccountBalanceWalletIcon />}
            >
              Connect Wallet
            </Button>
          )}
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Token Balance
          </Typography>
          <Typography variant="h4" gutterBottom>
            {profile?.tokenBalance || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            1 token = 10kg of registered crops
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Actions
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={onRegisterCrop}
            fullWidth
            disabled={!walletConnected}
          >
            Register New Crop
          </Button>
          {!walletConnected && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              Please connect your wallet to register crops
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default WalletInfo; 