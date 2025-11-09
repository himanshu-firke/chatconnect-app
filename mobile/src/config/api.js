import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variables for production, fallback to localhost for development
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

// Development URLs - Local backend (for local testing only)
// For web/browser: use localhost
// For physical device/emulator: replace localhost with your computer's IP address (run 'ipconfig' to find it)
// export const API_BASE_URL = 'http://localhost:3000/api';
// export const SOCKET_URL = 'http://localhost:3000';

// If testing on physical device, use your local IP:
// export const API_BASE_URL = 'http://192.168.x.x:3000/api';
// export const SOCKET_URL = 'http://192.168.x.x:3000';

// Production URLs (set these in Vercel environment variables):
// EXPO_PUBLIC_API_URL=https://chatconnect-app-j8zm.onrender.com/api
// EXPO_PUBLIC_SOCKET_URL=https://chatconnect-app-j8zm.onrender.com

console.log('API Configuration:', { API_BASE_URL, SOCKET_URL });

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for Render cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      console.log('🔑 Token check:', token ? 'Token found' : 'No token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('✅ Authorization header set');
      } else {
        console.log('❌ No token available for request');
      }
    } catch (error) {
      console.error('❌ Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          
          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        // Navigation will be handled by the auth context
      }
    }

    return Promise.reject(error);
  }
);

export default api;
