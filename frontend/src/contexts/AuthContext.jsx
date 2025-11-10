import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext();

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
}

// Create axios instance with interceptors
const createApiClient = (getTokens, refreshTokenFn, logout) => {
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Request interceptor to add auth token
  apiClient.interceptors.request.use(
    (config) => {
      const { accessToken } = getTokens();
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle token refresh
  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const { refreshToken } = getTokens();
          if (refreshToken) {
            await refreshTokenFn(refreshToken);
            const { accessToken } = getTokens();
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return apiClient;
};

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Get tokens from state
  const getTokens = () => ({
    accessToken: state.accessToken,
    refreshToken: state.refreshToken
  });

  // Refresh token function
  const refreshTokenFn = async (refreshToken) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
        refreshToken
      });

      const { accessToken: newAccessToken } = response.data.data;
      
      // Update tokens in localStorage
      localStorage.setItem('accessToken', newAccessToken);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: state.user,
          accessToken: newAccessToken,
          refreshToken: refreshToken
        }
      });

      return newAccessToken;
    } catch (error) {
      throw error;
    }
  };

  // Create API client with interceptors
  
  // Authentication functions
  const login = async (email, password, rememberMe = false) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
        rememberMe
      });

      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken }
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);

      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken }
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Signup failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };

  const sendSignupOtp = async (email, firstName) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/send-signup-otp`, {
        email,
        firstName
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const verifySignupOtp = async (email, otp, userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START });

      const response = await axios.post(`${API_BASE_URL}/auth/verify-signup-otp`, {
        email,
        otp,
        ...userData
      });

      const { user, accessToken, refreshToken } = response.data.data;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, accessToken, refreshToken }
      });

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'OTP verification failed';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage
      });
      throw error;
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint if we have a token
      if (state.accessToken) {
        await apiClient.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };
const apiClient = createApiClient(getTokens, refreshTokenFn, logout);

  const getCurrentUser = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: response.data.data
      });
      return response.data.data;
    } catch (error) {
      console.error('Get current user error:', error);
      logout();
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        if (accessToken && refreshToken) {
          // Set tokens in state (user will be fetched)
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: null, accessToken, refreshToken }
          });

          // Fetch current user
          const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.data.data });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        // Always end the loading state
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Handle OAuth callback
  const handleOAuthCallback = (params) => {
    const urlParams = new URLSearchParams(params);
    const accessToken = urlParams.get('token');
    const refreshToken = urlParams.get('refresh');
    const error = urlParams.get('error');

    if (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: 'OAuth authentication failed'
      });
      return;
    }

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Update state
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: null, // Will be fetched
          accessToken,
          refreshToken
        }
      });

      // Fetch user data
      getCurrentUser();
    }
  };

  // Role checking functions
  const isAdmin = () => state.user?.role === 'admin';
  const isFleetManager = () => state.user?.role === 'fleet_manager';
  const isTechnician = () => state.user?.role === 'technician';
  const isDriver = () => state.user?.role === 'driver';

  const value = {
    ...state,
    login,
    signup,
    sendSignupOtp,
    verifySignupOtp,
    forgotPassword,
    resetPassword,
    logout,
    getCurrentUser,
    clearError,
    handleOAuthCallback,
    apiClient,
    isAdmin,
    isFleetManager,
    isTechnician,
    isDriver,
    // Legacy compatibility
    user: state.user,
    loading: state.isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;