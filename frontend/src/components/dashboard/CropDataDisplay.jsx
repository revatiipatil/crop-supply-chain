import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ResponsiveLine } from '@nivo/line';
import { ResponsiveBar } from '@nivo/bar';
import { cropService } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const CropDataDisplay = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cropService.getAllData();
      
      if (!response || !response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid data format received from server');
      }

      // Validate and format the data
      const formattedData = response.data.map(item => ({
        ...item,
        temperature: Number(item.temperature),
        humidity: Number(item.humidity),
        moisture: Number(item.moisture),
        timestamp: new Date(item.timestamp)
      }));

      setData(formattedData);
    } catch (err) {
      console.error('Error fetching crop data:', err);
      setError(err.message || 'Failed to fetch crop data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return <LoadingSpinner message="Loading crop data..." />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="info"
          action={
            <Button color="inherit" size="small" onClick={handleRetry}>
              Refresh
            </Button>
          }
        >
          No crop data available
        </Alert>
      </Box>
    );
  }

  // Prepare data for charts
  const latestData = data[0]; // Most recent data is first due to sort
  const chartData = data.map(item => ({
    x: item.timestamp.toLocaleTimeString(),
    y: item.temperature
  }));

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Tooltip title="Refresh data">
          <IconButton onClick={handleRetry}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Latest Readings</Typography>
            <Typography>Temperature: {latestData.temperature.toFixed(1)}°C</Typography>
            <Typography>Humidity: {latestData.humidity.toFixed(1)}%</Typography>
            <Typography>Moisture: {latestData.moisture.toFixed(1)}%</Typography>
            <Typography variant="caption" color="text.secondary">
              Last updated: {latestData.timestamp.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 300 }}>
            <ResponsiveLine
              data={[{ id: 'temperature', data: chartData }]}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
              xScale={{ type: 'point' }}
              yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
              axisBottom={{
                tickRotation: -45
              }}
              enablePoints={false}
              enableArea={true}
              areaOpacity={0.1}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2, height: 300 }}>
            <ResponsiveBar
              data={data.slice(0, 10)}
              keys={['temperature', 'humidity', 'moisture']}
              indexBy={d => new Date(d.timestamp).toLocaleTimeString()}
              margin={{ top: 20, right: 20, bottom: 50, left: 50 }}
              padding={0.3}
              groupMode="grouped"
              axisBottom={{
                tickRotation: -45
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CropDataDisplay; 