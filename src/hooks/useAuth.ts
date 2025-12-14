import { useState, useCallback } from 'react';
import { currentUser, User } from '@/lib/mockData';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  authMethod: 'wallet' | 'github' | 'google' | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    authMethod: null,
  });

  const loginWithWallet = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await new Promise(resolve => setTimeout(resolve, 1500));
    setState({
      isAuthenticated: true,
      user: currentUser,
      isLoading: false,
      authMethod: 'wallet',
    });
  }, []);

  const loginWithGitHub = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await new Promise(resolve => setTimeout(resolve, 2000));
    setState({
      isAuthenticated: true,
      user: currentUser,
      isLoading: false,
      authMethod: 'github',
    });
  }, []);

  const loginWithGoogle = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await new Promise(resolve => setTimeout(resolve, 1800));
    setState({
      isAuthenticated: true,
      user: currentUser,
      isLoading: false,
      authMethod: 'google',
    });
  }, []);

  const logout = useCallback(() => {
    setState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      authMethod: null,
    });
  }, []);

  return {
    ...state,
    loginWithWallet,
    loginWithGitHub,
    loginWithGoogle,
    logout,
  };
}
