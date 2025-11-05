import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.user);
    } catch (error) {
      console.error('Error loading profile:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const register = async (userData) => {
    const response = await authAPI.register(userData);
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isFleetManager = () => user?.role === 'fleet_manager';
  const isTechnician = () => user?.role === 'technician';
  const isDriver = () => user?.role === 'driver';

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAdmin,
    isFleetManager,
    isTechnician,
    isDriver,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};