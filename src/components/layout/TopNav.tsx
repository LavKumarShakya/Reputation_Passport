import { Search, Bell, Settings, Wallet, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

interface TopNavProps {
  onMenuClick?: () => void;
  walletConnected?: boolean;
  walletAddress?: string;
}

export function TopNav({ onMenuClick, walletConnected, walletAddress }: TopNavProps) {
  const location = useLocation();
  
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/') return 'Home';
    if (path === '/profile') return 'Home / Profile';
    if (path === '/achievements') return 'Home / Achievements';
    if (path === '/timeline') return 'Home / Timeline';
    if (path === '/graph') return 'Home / Reputation Graph';
    if (path === '/recruiter') return 'Home / Recruiter Portal';
    if (path === '/institution') return 'Home / Institution Portal';
    if (path === '/settings') return 'Home / Settings';
    if (path === '/admin') return 'Home / Admin';
    return 'Home';
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-strong">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Left - Logo & Search */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-heading text-sm font-bold text-primary-foreground">RP</span>
            </div>
            <span className="hidden font-heading text-lg font-semibold md:block">
              ReputationPassport
            </span>
          </Link>

          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users, certificates..."
                className="h-9 w-64 rounded-lg border border-border bg-secondary/50 pl-9 pr-4 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Center - Breadcrumb */}
        <div className="hidden text-sm text-muted-foreground lg:block">
          {getBreadcrumb()}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
          </Button>

          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>

          {walletConnected ? (
            <Button variant="glass" size="sm" className="gap-2">
              <Wallet className="h-4 w-4 text-accent" />
              <span className="font-mono text-xs">{walletAddress}</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm">
                Connect
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
