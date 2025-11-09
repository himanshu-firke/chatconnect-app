import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';
import socketService from '../services/socketService';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // For web deployment, always start fresh - don't auto-login
      if (Platform.OS === 'web') {
        console.log('🌐 Web platform detected - starting fresh without auto-login');
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      const token = await AsyncStorage.getItem('accessToken');
      const userData = await AsyncStorage.getItem('user');

      if (token && userData) {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });
        
        // Connect socket (non-blocking)
        socketService.connect().catch(socketError => {
          console.error('⚠️ Socket connection failed on auto-login:', socketError);
        });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      console.log('🔐 Attempting login for:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('✅ Login response received:', response.data.success);
      
      const { user, accessToken, refreshToken } = response.data.data;
      console.log('💾 Storing tokens and user data...');

      // Store tokens and user data
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
        ['user', JSON.stringify(user)],
      ]);

      console.log('✅ Tokens stored successfully');
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });

      // Connect socket (non-blocking - don't wait for it)
      socketService.connect().catch(error => {
        console.error('⚠️ Socket connection failed, but login succeeded:', error);
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (username, email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      console.log('📝 Attempting registration for:', email);
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
      });
      console.log('✅ Registration response received:', response.data.success);
      
      const { user, accessToken, refreshToken } = response.data.data;
      console.log('💾 Storing tokens and user data...');

      // Store tokens and user data
      await AsyncStorage.multiSet([
        ['accessToken', accessToken],
        ['refreshToken', refreshToken],
        ['user', JSON.stringify(user)],
      ]);

      console.log('✅ Tokens stored successfully');
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user } });

      // Connect socket (non-blocking - don't wait for it)
      socketService.connect().catch(error => {
        console.error('⚠️ Socket connection failed, but registration succeeded:', error);
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      console.log('🔐 Attempting logout...');
      // Call logout API
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      try {
        console.log('🧹 Clearing local storage...');
        // Clear local storage
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        console.log('✅ Local storage cleared');
        
        // Disconnect socket
        console.log('🔌 Disconnecting socket...');
        socketService.disconnect();
        console.log('✅ Socket disconnected successfully');
        
        dispatch({ type: 'LOGOUT' });
        console.log('✅ Logout completed successfully');
      } catch (clearError) {
        console.error('❌ Error during logout cleanup:', clearError);
        // Force logout even if cleanup fails
        dispatch({ type: 'LOGOUT' });
      }
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
