import { useState, useCallback } from 'react';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  const connect = useCallback(async () => {
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      // Simulate wallet connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful connection
      setState({
        isConnected: true,
        address: '0x1234...5678',
        chainId: 137, // Polygon
        isConnecting: false,
        error: null,
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        error: 'Failed to connect wallet',
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      isConnected: false,
      address: null,
      chainId: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    connect,
    disconnect,
  };
}
