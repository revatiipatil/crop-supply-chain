import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Agriculture as AgricultureIcon,
  Token as TokenIcon,
  ContentCopy as ContentCopyIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RegisterCropDialog from './RegisterCropDialog';
import { getAllData, addData, getMyCrops, getProfile } from '../../services/api';
import { format, isToday, isYesterday } from 'date-fns';
import WalletConnect from '../wallet/WalletConnect';
import { connectWallet, disconnectWallet, getWalletBalance } from '../../utils/wallet';
import CropList from './CropList';
import WalletInfo from './WalletInfo';

const FarmerDashboard = () => {
  const theme = useTheme();
  console.log('FarmerDashboard: Component rendering');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [solBalance, setSolBalance] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchCrops = useCallback(async () => {
    console.log('FarmerDashboard: Fetching crops');
    try {
      const data = await getMyCrops();
      console.log('FarmerDashboard: Crops data received:', data);
      setCrops(data.crops || []);
      setTokenBalance(data.totalTokens || 0);
      setError(null);
    } catch (err) {
      console.error('FarmerDashboard: Error fetching crops:', err);
      setError(err.message || 'Failed to fetch crops');
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    console.log('FarmerDashboard: Fetching profile');
    try {
      const data = await getProfile();
      console.log('FarmerDashboard: Profile data received:', data);
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('FarmerDashboard: Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile');
    }
  }, []);

  useEffect(() => {
    console.log('FarmerDashboard: useEffect triggered');
    const loadData = async () => {
      try {
        console.log('FarmerDashboard: Starting data load');
        setLoading(true);
        await Promise.all([fetchCrops(), fetchProfile()]);
        console.log('FarmerDashboard: Data load completed');
      } catch (err) {
        console.error('FarmerDashboard: Error in loadData:', err);
        setError('Failed to load dashboard data');
      } finally {
        console.log('FarmerDashboard: Setting loading to false');
        setLoading(false);
      }
    };

    loadData();
  }, [fetchCrops, fetchProfile]);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(user.walletAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const calculateTier = (balance) => {
    if (balance >= 1000) return { name: 'Gold', progress: 100, color: 'warning' };
    if (balance >= 500) return { name: 'Silver', progress: 75, color: 'secondary' };
    if (balance >= 100) return { name: 'Bronze', progress: 50, color: 'error' };
    return { name: 'Basic', progress: 25, color: 'default' };
  };

  // Calculate current tier based on token balance
  const currentTier = calculateTier(tokenBalance);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const handleWalletConnect = async (publicKey) => {
    console.log('FarmerDashboard: Wallet connected with address:', publicKey);
    setWalletConnected(true);
    setWalletAddress(publicKey);
    try {
      const balance = await getWalletBalance(publicKey);
      setSolBalance(balance);
    } catch (error) {
      console.error('Error setting up wallet:', error);
      setError('Failed to setup wallet');
    }
  };

  const handleWalletDisconnect = () => {
    console.log('FarmerDashboard: Wallet disconnected');
    setWalletConnected(false);
    setWalletAddress('');
    setSolBalance(0);
  };

  // Add debug logging for wallet state
  useEffect(() => {
    console.log('FarmerDashboard: Current wallet state:', {
      connected: walletConnected,
      address: walletAddress
    });
  }, [walletConnected, walletAddress]);

  const handleRegisterCrop = async (cropData) => {
    try {
      console.log('FarmerDashboard: Registering crop with data:', cropData);
      const response = await addData(cropData);
      if (response.success) {
        console.log('FarmerDashboard: Crop registered successfully:', response.data);
        
        // Calculate new token balance (1 token per 10kg)
        const newTokens = Math.floor(cropData.weight / 10);
        const newTokenBalance = tokenBalance + newTokens;
        
        console.log('FarmerDashboard: Token calculation:', {
          cropWeight: cropData.weight,
          newTokens,
          previousBalance: tokenBalance,
          newBalance: newTokenBalance
        });
        
        // Update crops list and token balance
        setCrops(prevCrops => [response.data.crop, ...prevCrops]);
        setTokenBalance(newTokenBalance);
        
        // Update profile with new token balance
        setProfile(prevProfile => ({
          ...prevProfile,
          tokenBalance: newTokenBalance
        }));
        
        setOpenDialog(false);
        // Refresh the crops list to get updated data
        await fetchCrops();
      }
    } catch (err) {
      console.error('FarmerDashboard: Error registering crop:', err);
      setError('Failed to register crop');
    }
  };

  const handleConnectWallet = async () => {
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      setWalletConnected(true);
      
      // Get token balance
      const balance = await getWalletBalance(address);
      setTokenBalance(balance);
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Failed to connect wallet');
    }
  };

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet();
      setWalletAddress('');
      setWalletConnected(false);
      setTokenBalance(0);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet');
    }
  };

  const handleDialogClose = (success) => {
    console.log('FarmerDashboard: Dialog closing, success:', success);
    setOpenDialog(false);
    if (success) {
      fetchCrops();
    }
  };

  console.log('FarmerDashboard: Current state:', { loading, error, cropsCount: crops.length, hasProfile: !!profile });

  if (loading) {
    console.log('FarmerDashboard: Rendering loading state');
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.log('FarmerDashboard: Rendering error state');
    return (
      <Container>
        <Typography color="error" variant="h6" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  console.log('FarmerDashboard: Rendering main content');
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
        pt: 3,
        pb: 6,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Farmer Profile Card */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[3],
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Farmer Profile</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile?.email || 'Email not provided'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Phone: {profile?.phone || 'Not provided'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Address: {profile?.address || 'Not provided'}
              </Typography>
            </Paper>
          </Grid>

          {/* Registered Crops Card */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[3],
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AgricultureIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Registered Crops</Typography>
              </Box>
              <Typography variant="h3" gutterBottom>
                {crops.length}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total crop varieties registered
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                fullWidth
                sx={{
                  mt: 2,
                  bgcolor: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                Register New Crop
              </Button>
            </Paper>
          </Grid>

          {/* Token Balance Card */}
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[3],
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TokenIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Token Balance</Typography>
              </Box>
              <Typography variant="h3" gutterBottom>
                {tokenBalance} CROP
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                1 CROP token per 10kg of registered crops
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min((tokenBalance / 500) * 100, 100)}
                sx={{
                  mt: 2,
                  mb: 1,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'background.default',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: theme.palette[currentTier.color]?.main || theme.palette.primary.main,
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {tokenBalance === 0 ? (
                  'Basic Tier • Register crops to earn tokens'
                ) : (
                  `${currentTier.name} Tier • ${500 - (tokenBalance % 500)} more tokens until next tier`
                )}
              </Typography>
            </Paper>
          </Grid>

          {/* Tabs and Content */}
          <Grid item xs={12}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{
                  '& .MuiTab-root': {
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                <Tab label="My Crops" />
                <Tab label="Token Transactions" />
              </Tabs>
            </Box>

            {activeTab === 0 && (
              <Box>
                {crops.length > 0 ? (
                  <CropList crops={crops} />
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      color: 'text.secondary',
                    }}
                  >
                    <AgricultureIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom>
                      No crops registered yet
                    </Typography>
                    <Typography variant="body2">
                      Register your first crop to receive CROP tokens
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  color: 'text.secondary',
                }}
              >
                <TokenIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  Token transaction history coming soon
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>

        <WalletInfo
          profile={profile}
          onRegisterCrop={() => setOpenDialog(true)}
          onWalletConnect={handleWalletConnect}
          onWalletDisconnect={handleWalletDisconnect}
        />

        <RegisterCropDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSubmit={handleRegisterCrop}
          walletAddress={walletAddress}
        />
      </Container>
    </Box>
  );
};

export default FarmerDashboard; 