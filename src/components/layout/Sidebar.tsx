import { motion } from 'framer-motion';
import { 
  Home, 
  User, 
  Trophy, 
  GitBranch, 
  Clock, 
  Search, 
  Building2, 
  Settings,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { title: 'Home', icon: Home, path: '/home' },
  { title: 'Profile', icon: User, path: '/profile' },
  { title: 'Achievements', icon: Trophy, path: '/achievements' },
  { title: 'Reputation Graph', icon: GitBranch, path: '/graph' },
  { title: 'Timeline', icon: Clock, path: '/timeline' },
];

const portalItems = [
  { title: 'Recruiter Portal', icon: Search, path: '/recruiter' },
  { title: 'Institution Portal', icon: Building2, path: '/institution' },
];

const systemItems = [
  { title: 'Onboarding', icon: Sparkles, path: '/onboarding' },
  { title: 'Settings', icon: Settings, path: '/settings' },
  { title: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin' },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed left-0 top-20 z-40 hidden h-[calc(100vh-5rem)] flex-col border-r border-border/40 bg-sidebar/80 backdrop-blur-xl transition-all duration-300 lg:flex",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="flex flex-1 flex-col gap-8 p-4 pt-6 overflow-y-auto overflow-x-hidden relative">
        {/* Main Navigation */}
        <nav className="flex flex-col gap-1.5 w-full">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={cn(
                "relative flex items-center gap-4 rounded-none px-4 py-3 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent/50 hover:text-foreground hover:translate-x-1",
                collapsed && "justify-center px-0 hover:translate-x-0"
              )}
              activeClassName="bg-primary/5 text-primary before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary font-semibold hover:translate-x-0"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="h-px w-full bg-border/40" />

        {/* Portal Section */}
        <div className="w-full">
          {!collapsed && (
            <p className="mb-3 px-4 text-xs font-mono font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              Portals
            </p>
          )}
          <nav className="flex flex-col gap-1.5 w-full">
            {portalItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-4 rounded-none px-4 py-3 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent/50 hover:text-foreground hover:translate-x-1",
                  collapsed && "justify-center px-0 hover:translate-x-0"
                )}
                activeClassName="bg-primary/5 text-primary before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary font-semibold hover:translate-x-0"
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* System Section */}
        <div className="mt-auto w-full pt-8">
          <div className="h-px w-full bg-border/40 mb-6" />
          {!collapsed && (
            <p className="mb-3 px-4 text-xs font-mono font-semibold uppercase tracking-[0.2em] text-muted-foreground/60">
              System
            </p>
          )}
          <nav className="flex flex-col gap-1.5 w-full">
            {systemItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-4 rounded-none px-4 py-3 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent/50 hover:text-foreground hover:translate-x-1",
                  collapsed && "justify-center px-0 hover:translate-x-0"
                )}
                activeClassName="bg-primary/5 text-primary before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-primary font-semibold hover:translate-x-0"
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className={cn(
                "relative flex items-center gap-4 rounded-none px-4 py-3 text-sm font-medium text-destructive/70 transition-all hover:bg-destructive/10 hover:text-destructive hover:translate-x-1",
                collapsed && "justify-center px-0 hover:translate-x-0"
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </nav>
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onCollapsedChange(!collapsed)}
          className="mx-auto mt-4 rounded-none hover:bg-secondary/50 h-10 w-10 border border-border/50 transition-transform hover:scale-105"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </motion.aside>
  );
}
