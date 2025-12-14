import { motion } from 'framer-motion';
import { Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';

interface ConnectWalletButtonProps {
  onConnect?: () => void;
  size?: 'default' | 'sm' | 'lg' | 'xl';
}

export function ConnectWalletButton({ onConnect, size = 'default' }: ConnectWalletButtonProps) {
  const { isConnected, isConnecting, address, connect, disconnect } = useWallet();

  const handleClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
      onConnect?.();
    }
  };

  if (isConnected) {
    return (
      <Button
        variant="glass"
        size={size}
        onClick={handleClick}
        className="gap-2"
      >
        <Wallet className="h-4 w-4 text-accent" />
        <span className="font-mono text-sm">{address}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="wallet"
      size={size}
      onClick={handleClick}
      disabled={isConnecting}
      className="gap-2"
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}
