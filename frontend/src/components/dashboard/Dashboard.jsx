import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import CropDataDisplay from './CropDataDisplay';

const Dashboard = () => {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Monitor your crop data in real-time
        </Typography>
      </Container>
      <CropDataDisplay />
    </Box>
  );
};

export default Dashboard; 