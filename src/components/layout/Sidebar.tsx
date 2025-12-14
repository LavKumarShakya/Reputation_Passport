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
  ChevronRight
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Home', icon: Home, path: '/' },
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
  { title: 'Settings', icon: Settings, path: '/settings' },
  { title: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={cn(
        "fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] flex-col border-r border-border bg-sidebar transition-all duration-300 lg:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-1 flex-col gap-6 p-4">
        {/* Main Navigation */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-accent",
                collapsed && "justify-center px-2"
              )}
              activeClassName="bg-sidebar-accent text-sidebar-primary"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Portal Section */}
        <div>
          {!collapsed && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Portals
            </p>
          )}
          <nav className="flex flex-col gap-1">
            {portalItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-accent",
                  collapsed && "justify-center px-2"
                )}
                activeClassName="bg-sidebar-accent text-sidebar-primary"
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* System Section */}
        <div className="mt-auto">
          {!collapsed && (
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              System
            </p>
          )}
          <nav className="flex flex-col gap-1">
            {systemItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-accent",
                  collapsed && "justify-center px-2"
                )}
                activeClassName="bg-sidebar-accent text-sidebar-primary"
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="mx-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </motion.aside>
  );
}
