import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const ensureRelativePath = (path) => path.replace(/^\/+/u, '');

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post(ensureRelativePath('auth/login'), credentials),
  register: (userData) => api.post(ensureRelativePath('auth/register'), userData),
  getProfile: () => api.get(ensureRelativePath('auth/profile')),
  refreshToken: (refreshToken) =>
    api.post(ensureRelativePath('auth/refresh-token'), { refreshToken }),
  sendSignupOtp: (payload) =>
    api.post(ensureRelativePath('auth/send-signup-otp'), payload),
  verifySignupOtp: (payload) =>
    api.post(ensureRelativePath('auth/verify-signup-otp'), payload),
  verifyOtp: (payload) =>
    api.post(ensureRelativePath('auth/verify-otp'), payload),
  forgotPassword: (payload) =>
    api.post(ensureRelativePath('auth/forgot-password'), payload),
  resetPassword: (payload) =>
    api.post(ensureRelativePath('auth/reset-password'), payload),
};

export const vehicleAPI = {
  getAll: () => api.get(ensureRelativePath('vehicles')),
  getById: (id) => api.get(ensureRelativePath(`vehicles/${id}`)),
  create: (data) => api.post(ensureRelativePath('vehicles'), data),
  update: (id, data) => api.put(ensureRelativePath(`vehicles/${id}`), data),
  delete: (id) => api.delete(ensureRelativePath(`vehicles/${id}`)),
};

export const serviceRequestAPI = {
  getAll: () => api.get(ensureRelativePath('service-requests')),
  getById: (id) => api.get(ensureRelativePath(`service-requests/${id}`)),
  create: (data) => api.post(ensureRelativePath('service-requests'), data),
  update: (id, data) => api.put(ensureRelativePath(`service-requests/${id}`), data),
  assignTechnician: (id, technicianId) =>
    api.put(ensureRelativePath(`service-requests/${id}/assign`), { technicianId }),
};

export const technicianAPI = {
  getAll: () => api.get(ensureRelativePath('technicians')),
  getById: (id) => api.get(ensureRelativePath(`technicians/${id}`)),
  create: (data) => api.post(ensureRelativePath('technicians'), data),
  update: (id, data) => api.put(ensureRelativePath(`technicians/${id}`), data),
  delete: (id) => api.delete(ensureRelativePath(`technicians/${id}`)),
};

export default api;