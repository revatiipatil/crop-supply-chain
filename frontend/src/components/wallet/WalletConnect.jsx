import React, { useState, useEffect } from 'react';
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { connectWallet, disconnectWallet, getWalletBalance } from '../../utils/wallet';

const WalletConnect = ({ onConnect, onDisconnect }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState(null);
  const [showInstallDialog, setShowInstallDialog] = useState(false);

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError('');
      const publicKey = await connectWallet();
      const balance = await getWalletBalance(publicKey);
      setBalance(balance);
      onConnect(publicKey);
    } catch (err) {
      if (err.message.includes('install Phantom wallet')) {
        setShowInstallDialog(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError('');
      await disconnectWallet();
      setBalance(null);
      onDisconnect();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleConnect}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} /> : null}
      >
        Connect Wallet
      </Button>

      {balance !== null && (
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            Wallet Balance: {balance.toFixed(4)} SOL
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleDisconnect}
            disabled={loading}
            sx={{ mt: 1 }}
          >
            Disconnect
          </Button>
        </Box>
      )}

      <Dialog open={showInstallDialog} onClose={() => setShowInstallDialog(false)}>
        <DialogTitle>Install Phantom Wallet</DialogTitle>
        <DialogContent>
          <Typography>
            To use this feature, you need to install the Phantom wallet extension.
            Please install it from the Chrome Web Store.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInstallDialog(false)}>Cancel</Button>
          <Button
            href="https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa"
            target="_blank"
            rel="noopener noreferrer"
            color="primary"
          >
            Install Phantom
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WalletConnect; 