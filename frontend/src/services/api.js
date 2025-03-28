import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// Crop data services
export const cropService = {
  getAllData: async (page = 1, limit = 10) => {
    const params = new URLSearchParams({ page, limit });
    const response = await api.get(`/crop/all?${params}`);
    return response.data;
  },

  getLatestData: async () => {
    const response = await api.get('/crop/latest');
    return response.data;
  },

  addData: async (cropData) => {
    const response = await api.post('/crop/register', cropData);
    return response.data;
  },

  getMyCrops: async () => {
    const response = await api.get('/crop/my-crops');
    return response.data;
  },
};

// Wallet services
export const walletService = {
  transferTokens: async (recipient, amount) => {
    const response = await api.post('/wallet/transfer', { recipient, amount });
    return response.data;
  },
};

export default api; 