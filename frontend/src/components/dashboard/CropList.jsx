import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  useTheme
} from '@mui/material';
import { format, isValid } from 'date-fns';
import { Agriculture as AgricultureIcon, Token as TokenIcon } from '@mui/icons-material';

const CropList = ({ crops }) => {
  const theme = useTheme();
  const totalTokens = crops.reduce((sum, crop) => {
    const tokens = Math.floor(crop.weight / 10);
    return sum + tokens;
  }, 0);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid Date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AgricultureIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">My Registered Crops</Typography>
        </Box>
        <Chip
          icon={<TokenIcon />}
          label={`Total Tokens: ${totalTokens} Tokens`}
          color="primary"
          variant="outlined"
          sx={{
            borderRadius: 2,
            '& .MuiChip-icon': {
              color: 'inherit'
            }
          }}
        />
      </Box>
      
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: theme.shadows[3],
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: 'background.default',
                '& th': {
                  fontWeight: 'bold',
                  color: 'text.secondary'
                }
              }}
            >
              <TableCell>Crop Name</TableCell>
              <TableCell align="right">Weight (kg)</TableCell>
              <TableCell align="right">Tokens Earned</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Registration Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {crops.map((crop) => {
              const tokens = Math.floor(crop.weight / 10);
              return (
                <TableRow
                  key={crop._id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 'medium'
                    }}
                  >
                    {crop.name}
                  </TableCell>
                  <TableCell align="right">{crop.weight}</TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      label={`${tokens} Tokens`}
                      color="primary"
                      variant="outlined"
                      sx={{ borderRadius: 1 }}
                    />
                  </TableCell>
                  <TableCell>{crop.location}</TableCell>
                  <TableCell>
                    {formatDate(crop.createdAt)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          mt: 2,
          display: 'block',
          textAlign: 'center'
        }}
      >
        1 CROP token is earned for every 10 kg of crops registered
      </Typography>
    </Box>
  );
};

export default CropList; 