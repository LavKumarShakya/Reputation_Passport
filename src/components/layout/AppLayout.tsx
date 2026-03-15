import { ReactNode, useState } from 'react';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { useWallet } from '@/hooks/useWallet';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  const { isConnected, address } = useWallet();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <TopNav walletConnected={isConnected} walletAddress={address || undefined} />
      
      <div className="flex">
        {showSidebar && (
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onCollapsedChange={setSidebarCollapsed} 
          />
        )}
        
        <main 
          className={cn(
            "flex-1 transition-all duration-300 min-h-[calc(100vh-5rem)]",
            showSidebar ? (sidebarCollapsed ? "lg:ml-20" : "lg:ml-64") : ""
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
