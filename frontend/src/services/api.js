import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
);

// Crop related API calls
export const getAllData = async () => {
  try {
    return await api.get('/crop/all');
  } catch (error) {
    throw error;
  }
};

export const getMyCrops = async () => {
  try {
    return await api.get('/crop/my-crops');
  } catch (error) {
    throw error;
  }
};

export const addData = async (data) => {
  try {
    return await api.post('/crop/register', data);
  } catch (error) {
    throw error;
  }
};

// Auth related API calls
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getProfile = async () => {
  try {
    return await api.get('/auth/profile');
  } catch (error) {
    throw error;
  }
};

// Wallet services
export const walletService = {
  transferTokens: async (recipient, amount) => {
    const response = await api.post('/wallet/transfer', { recipient, amount });
    return response.data;
  },
};

export default api; 