import { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { useWallet } from '@/hooks/useWallet';

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  const { isConnected, address } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <TopNav walletConnected={isConnected} walletAddress={address || undefined} />
      
      <div className="flex">
        {showSidebar && <Sidebar />}
        
        <main className={showSidebar ? "flex-1 lg:ml-64" : "flex-1"}>
          {children}
        </main>
      </div>
    </div>
  );
}
