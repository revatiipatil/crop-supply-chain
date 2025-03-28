import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Checking for current user...');
    const currentUser = authService.getCurrentUser();
    console.log('AuthProvider: Current user from storage:', currentUser);
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('AuthProvider: Attempting login...');
      const response = await authService.login(email, password);
      console.log('AuthProvider: Login successful:', response);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('AuthProvider: Login failed:', error);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('AuthProvider: Attempting registration...');
      const response = await authService.register(username, email, password);
      console.log('AuthProvider: Registration successful:', response);
      setUser(response.user);
      return response;
    } catch (error) {
      console.error('AuthProvider: Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    console.log('AuthProvider: Logging out...');
    authService.logout();
    setUser(null);
    console.log('AuthProvider: User state cleared');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 