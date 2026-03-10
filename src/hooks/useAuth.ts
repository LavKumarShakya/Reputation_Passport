import { useState, useCallback } from 'react';
import api from '@/lib/api';

export interface User {
  id: string;
  handle: string;
  displayName: string;
  email?: string;
  walletAddress?: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  authMethod: 'password' | 'wallet' | 'github' | 'google' | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    // Check if we already have a token
    const token = localStorage.getItem('auth_token');
    return {
      isAuthenticated: !!token,
      user: null, // We would normally decode the token or fetch /me here
      isLoading: false,
      authMethod: null,
    };
  });

  const loginWithPassword = useCallback(async (email, password) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      localStorage.setItem('auth_token', token);

      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        authMethod: 'password',
      });
      return { success: true };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  }, []);

  const loginWithWallet = useCallback(async (walletAddress, signature, message) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await api.post('/auth/wallet', { walletAddress, signature, message });
      const { user, token } = response.data;
      localStorage.setItem('auth_token', token);

      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        authMethod: 'wallet',
      });
      return { success: true };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Wallet verification failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      authMethod: null,
    });
  }, []);

  // Placeholders for future third-party auth
  const loginWithGitHub = useCallback(async () => { }, []);
  const loginWithGoogle = useCallback(async () => { }, []);

  const loginWithMockWallet = useCallback(async (walletAddress: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await api.post('/auth/mock-wallet', { walletAddress });
      const { user, token } = response.data;
      localStorage.setItem('auth_token', token);

      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        authMethod: 'wallet',
      });
      return { success: true };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.response?.data?.error || 'Mock wallet login failed' };
    }
  }, []);

  return {
    ...state,
    loginWithPassword,
    loginWithWallet,
    loginWithMockWallet,
    loginWithGitHub,
    loginWithGoogle,
    logout,
  };
}
