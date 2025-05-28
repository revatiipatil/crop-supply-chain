import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Typography,
  Box,
  IconButton,
  useTheme,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Agriculture as AgricultureIcon,
  AccountBalanceWallet as WalletIcon,
  Scale as ScaleIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const RegisterCropDialog = ({ open, onClose, onSubmit, walletAddress }) => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    location: ''
  });
  const [error, setError] = useState('');

  // Add debug logging for wallet address
  useEffect(() => {
    console.log('RegisterCropDialog: Received wallet address:', walletAddress);
  }, [walletAddress]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('RegisterCropDialog: Submitting form with wallet address:', walletAddress);

    // Validate wallet connection
    if (!walletAddress) {
      console.log('RegisterCropDialog: No wallet address provided');
      setError('Please connect your wallet first');
      return;
    }

    // Validate form data
    if (!formData.name || !formData.weight || !formData.location) {
      setError('All fields are required');
      return;
    }

    if (parseFloat(formData.weight) <= 0) {
      setError('Weight must be greater than 0');
      return;
    }

    try {
      console.log('RegisterCropDialog: Submitting crop data:', {
        ...formData,
        weight: parseFloat(formData.weight),
        walletAddress
      });
      
      await onSubmit({
        ...formData,
        weight: parseFloat(formData.weight),
        walletAddress
      });
      
      // Reset form
      setFormData({
        name: '',
        weight: '',
        location: ''
      });
      onClose();
    } catch (err) {
      console.error('RegisterCropDialog: Error submitting form:', err);
      setError(err.message || 'Failed to register crop');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: theme.shadows[5]
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AgricultureIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">Register New Crop</Typography>
        </Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2,
              borderRadius: 1
            }}
          >
            {error}
          </Alert>
        )}
        
        {!walletAddress && (
          <Alert
            severity="warning"
            sx={{
              mb: 2,
              borderRadius: 1
            }}
            icon={<WalletIcon />}
          >
            Please connect your wallet before registering a crop
          </Alert>
        )}

        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ScaleIcon sx={{ mr: 1, fontSize: 16 }} />
            You will receive 1 CROP token for every 10kg of crop registered
          </Typography>
        </Box>

        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Crop Name"
          type="text"
          fullWidth
          value={formData.name}
          onChange={handleChange}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AgricultureIcon color="action" />
              </InputAdornment>
            )
          }}
        />
        
        <TextField
          margin="dense"
          name="weight"
          label="Weight"
          type="number"
          fullWidth
          value={formData.weight}
          onChange={handleChange}
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <ScaleIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">kg</InputAdornment>
            )
          }}
        />
        
        <TextField
          margin="dense"
          name="location"
          label="Location"
          type="text"
          fullWidth
          value={formData.location}
          onChange={handleChange}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationIcon color="action" />
              </InputAdornment>
            )
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          color="inherit"
          sx={{
            borderRadius: 1,
            textTransform: 'none'
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!walletAddress}
          sx={{
            borderRadius: 1,
            textTransform: 'none',
            px: 3
          }}
        >
          Register Crop
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RegisterCropDialog; 