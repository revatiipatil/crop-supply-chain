import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
} from '@mui/material';
import { cropService } from '../../services/api';

const RegisterCropDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For weight, only allow numbers and decimal point
    if (name === 'weight' && value !== '' && !/^\d*\.?\d*$/.test(value)) {
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Crop name is required');
      setLoading(false);
      return;
    }

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      setError('Please enter a valid weight');
      setLoading(false);
      return;
    }

    if (!formData.location.trim()) {
      setError('Location is required');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting crop data:', formData);
      const response = await cropService.addData({
        name: formData.name.trim(),
        weight: parseFloat(formData.weight),
        location: formData.location.trim()
      });
      
      if (response.success) {
        onSuccess(response);
        handleClose();
      } else {
        setError(response.error || 'Failed to register crop. Please try again.');
      }
    } catch (err) {
      console.error('Crop registration error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.details || 
                          err.message || 
                          'Failed to register crop. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', weight: '', location: '' });
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Register New Crop</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Crop Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g., Wheat, Rice, Corn"
            />
            <TextField
              label="Weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              required
              disabled={loading}
              type="text"
              placeholder="0.00"
              InputProps={{
                endAdornment: <InputAdornment position="end">kg</InputAdornment>,
              }}
            />
            <TextField
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="e.g., Farm A, Field 1"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Register Crop
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RegisterCropDialog; 