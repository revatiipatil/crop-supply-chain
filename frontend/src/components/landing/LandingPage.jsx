import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  AppBar,
  Toolbar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../../contexts/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    console.log('Current user state:', user);
    console.log('Local storage user:', localStorage.getItem('user'));
    console.log('Local storage token:', localStorage.getItem('token'));
  }, [user]);

  const handleLogout = () => {
    try {
      console.log('Logging out...');
      logout();
      console.log('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Navigation */}
      <AppBar position="fixed" color="transparent" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/')}
          >
            CropChain
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {user ? (
              <>
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/dashboard')}
                >
                  Dashboard
                </Button>
                <Button 
                  color="inherit"
                  onClick={handleLogout}
                  variant="outlined"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  color="inherit"
                  onClick={() => navigate('/login')}
                >
                  Login
                </Button>
                <Button 
                  color="primary"
                  variant="contained"
                  onClick={() => navigate('/register')}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pt: { xs: 8, md: 0 }
          }}
        >
          <Box>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2,
              }}
            >
              Blockchain-Powered Crop Management
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}
            >
              Register your crops on the blockchain and receive tokens proportional to your crop quantity. Transparent, secure, and efficient.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                color="primary"
                onClick={() => navigate('/register')}
                endIcon={<ArrowForwardIcon />}
              >
                Register as Farmer
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
            </Box>
          </Box>
        </Box>

        {/* How It Works Section */}
        <Box sx={{ pb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            align="center"
            sx={{ mb: 2, fontWeight: 'bold' }}
          >
            How It Works
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            align="center"
            sx={{ mb: 6, maxWidth: '800px', mx: 'auto' }}
          >
            Our platform connects farmers directly to the blockchain, creating transparency and trust in the supply chain.
          </Typography>
          
          <Grid container spacing={4}>
            {[
              {
                title: 'Register',
                description: 'Create your farmer account with secure blockchain identity',
                step: 1
              },
              {
                title: 'Add Crops',
                description: 'Register your crops with details like name and quantity',
                step: 2
              },
              {
                title: 'Receive Tokens',
                description: 'Get tokens proportional to your registered crop quantity',
                step: 3
              }
            ].map((step) => (
              <Grid item xs={12} md={4} key={step.step}>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 4, 
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  >
                    {step.step}
                  </Box>
                  <Typography variant="h5" align="left" gutterBottom sx={{ mb: 2 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" align="left">
                    {step.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingPage;