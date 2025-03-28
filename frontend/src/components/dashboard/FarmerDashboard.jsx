import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Agriculture as AgricultureIcon,
  Token as TokenIcon,
  ContentCopy as ContentCopyIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import RegisterCropDialog from './RegisterCropDialog';
import { cropService } from '../../services/api';
import { format, isToday, isYesterday } from 'date-fns';
import WalletConnect from '../wallet/WalletConnect';
import { connectWallet, disconnectWallet, getWalletBalance } from '../../utils/wallet';

const FarmerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openRegisterDialog, setOpenRegisterDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [solBalance, setSolBalance] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchCrops = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await cropService.getMyCrops();
      if (response.success) {
        setCrops(response.crops);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to fetch crops');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

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

  const tier = calculateTier(user.tokenBalance);

  const handleWalletConnect = async (publicKey) => {
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
    setWalletConnected(false);
    setWalletAddress('');
    setSolBalance(0);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {copySuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 2 }}
          icon={<CheckCircleIcon />}
          onClose={() => setCopySuccess(false)}
        >
          Wallet address copied to clipboard!
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Farmer Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <PersonIcon fontSize="large" color="primary" />
            </Box>
            <Typography variant="h6" gutterBottom>
              Farmer Profile
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {user?.email}
            </Typography>
            {user?.phone && (
              <Typography color="text.secondary" gutterBottom>
                Phone: {user.phone}
              </Typography>
            )}
            {user?.address && (
              <Typography color="text.secondary">
                Address: {user.address}
              </Typography>
            )}
            <Box mt={2}>
              <Typography variant="subtitle2" gutterBottom>
                Wallet Address:
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
                  {user.walletAddress}
                </Typography>
                <Tooltip title="Copy Address">
                  <IconButton size="small" onClick={handleCopyAddress}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Registered Crops Card */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <AgricultureIcon fontSize="large" color="primary" />
            </Box>
            <Typography variant="h6" gutterBottom>
              Registered Crops
            </Typography>
            <Typography variant="h4" gutterBottom>
              {crops.length}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenRegisterDialog(true)}
              fullWidth
            >
              Register New Crop
            </Button>
          </Paper>
        </Grid>

        {/* Wallet Balance Card */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
              <TokenIcon fontSize="large" color="primary" />
            </Box>
            <Typography variant="h6" gutterBottom>
              Wallet Balance
            </Typography>
            {walletConnected ? (
              <>
                <Typography variant="h4" gutterBottom>
                  {solBalance.toFixed(4)} SOL
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Wallet: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </Typography>
              </>
            ) : (
              <Box mt={2}>
                <WalletConnect
                  onConnect={handleWalletConnect}
                  onDisconnect={handleWalletDisconnect}
                />
              </Box>
            )}
            <Box mt={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">Tier: {tier.name}</Typography>
                <Chip
                  label={tier.name}
                  color={tier.color}
                  size="small"
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={tier.progress}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Tabs Section */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="My Crops" />
              <Tab label="Token Transactions" />
            </Tabs>

            {/* My Crops Tab */}
            {activeTab === 0 && (
              <Box p={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">Registered Crops</Typography>
                  <Tooltip title="Refresh">
                    <IconButton onClick={fetchCrops}>
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                {loading ? (
                  <LinearProgress />
                ) : error ? (
                  <Alert severity="error">{error}</Alert>
                ) : crops.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <AgricultureIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No crops registered yet
                    </Typography>
                    <Typography color="text.secondary">
                      Register your first crop to receive CROP tokens
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Crop Name</TableCell>
                          <TableCell align="right">Weight (kg)</TableCell>
                          <TableCell align="right">Tokens Earned</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Registration Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {crops.map((crop) => (
                          <TableRow key={crop._id}>
                            <TableCell>{crop.name}</TableCell>
                            <TableCell align="right">{crop.weight}</TableCell>
                            <TableCell align="right">{Math.floor(crop.weight)}</TableCell>
                            <TableCell>{crop.location}</TableCell>
                            <TableCell>
                              {formatDate(crop.registeredAt || crop.createdAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* Token Transactions Tab */}
            {activeTab === 1 && (
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Token Transactions
                </Typography>
                <Box textAlign="center" py={4}>
                  <TokenIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    Transaction History Coming Soon
                  </Typography>
                  <Typography color="text.secondary">
                    Track your token transactions and rewards here
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <RegisterCropDialog
        open={openRegisterDialog}
        onClose={() => setOpenRegisterDialog(false)}
        onSuccess={(response) => {
          setOpenRegisterDialog(false);
          setCrops(prevCrops => [response.crop, ...prevCrops]);
        }}
      />
    </Container>
  );
};

export default FarmerDashboard; 