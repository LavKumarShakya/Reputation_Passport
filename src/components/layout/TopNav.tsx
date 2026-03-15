import { Search, Bell, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';

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
    <header className="sticky top-0 z-50 w-full glass-strong bg-grain border-b border-border/40">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
        {/* Left - Logo & Search */}
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-foreground group-hover:bg-primary transition-colors duration-300">
              <span className="font-heading text-lg font-bold text-background uppercase tracking-tighter">
                RP
              </span>
            </div>
            <span className="hidden font-heading text-xl font-bold tracking-tight md:block">
              REP.PASS
            </span>
          </Link>

          <div className="hidden md:block ml-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search index..."
                className="h-10 w-72 rounded-none border border-border/50 bg-secondary/30 pl-11 pr-4 text-sm font-medium placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Center - Breadcrumb */}
        <div className="hidden text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground lg:block">
          {getBreadcrumb()}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <div className="flex items-center gap-1 border-l border-border/50 pl-4 ml-2">
            <Button variant="ghost" size="icon" className="relative hover:bg-secondary/50 rounded-none h-10 w-10">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse-icon" />
            </Button>

            <Link to="/settings">
              <Button variant="ghost" size="icon" className="hover:bg-secondary/50 rounded-none h-10 w-10">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="ml-2">
            {walletConnected ? (
              <Button variant="outline" size="sm" className="gap-2 h-10 rounded-none border-primary/30 bg-primary/5 hover:bg-primary/10">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse-icon" />
                <span className="font-mono text-xs">{walletAddress}</span>
              </Button>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="h-10 rounded-none bg-primary hover:bg-primary/90 text-primary-foreground px-6 text-sm font-semibold uppercase tracking-wider">
                  Connect
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
