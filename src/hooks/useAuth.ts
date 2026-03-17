import { useState, useCallback, useEffect } from 'react';
import api from '@/lib/api';

export interface User {
  id: string;
  handle: string;
  displayName: string;
  email?: string;
  walletAddress?: string;
  avatar?: string;
  reputationScore?: number;
  tier?: string;
  techStack?: Record<string, number>;
  connectedProviders?: {
    github?: { id: string; username: string; accessToken: string };
    google?: { id: string; email: string };
  };
  verified?: boolean;
  createdAt?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  authMethod: 'password' | 'wallet' | 'github' | 'google' | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    // Check if we already have a token and user data
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    let user: User | null = null;
    try {
      if (storedUser) user = JSON.parse(storedUser);
    } catch { }
    return {
      isAuthenticated: !!token,
      user,
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
      localStorage.setItem('auth_user', JSON.stringify(user));

      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        authMethod: 'password',
      });
      return { success: true, user };
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
      localStorage.setItem('auth_user', JSON.stringify(user));

      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        authMethod: 'wallet',
      });
      return { success: true, user };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: 'Wallet verification failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
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
      localStorage.setItem('auth_user', JSON.stringify(user));

      setState({
        isAuthenticated: true,
        user,
        isLoading: false,
        authMethod: 'wallet',
      });
      return { success: true, user };
    } catch (error: any) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.response?.data?.error || 'Mock wallet login failed' };
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.isAuthenticated) return;
    try {
      const response = await api.get('/profile/me');
      const userData = response.data.user || response.data;
      const refreshedUser = {
        ...userData,
        id: userData._id || userData.id
      };
      
      localStorage.setItem('auth_user', JSON.stringify(refreshedUser));
      setState(prev => ({ ...prev, user: refreshedUser }));
    } catch (err) {
      console.error('Failed to refresh user session', err);
    }
  }, [state.isAuthenticated]);

  useEffect(() => {
    // Proactive refresh: if authenticated but missing critical metadata, fetch full profile
    const needsRefresh = state.isAuthenticated && (
      !state.user?.id || 
      (state.user?.email && !state.user?.handle) ||
      state.user?.connectedProviders === undefined  // Fetch full profile if connectedProviders not yet loaded (e.g. after GitHub OAuth)
    );

    if (needsRefresh) {
      refreshUser();
    }
  }, [state.isAuthenticated, refreshUser, state.user]);

  return {
    ...state,
    loginWithPassword,
    loginWithWallet,
    loginWithMockWallet,
    loginWithGitHub,
    loginWithGoogle,
    logout,
    refreshUser,
  };
}
