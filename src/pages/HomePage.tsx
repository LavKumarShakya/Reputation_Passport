import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  User, Trophy, GitBranch, Clock, Settings,
  ArrowRight, Activity, Zap, Github, Wallet, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const quickLinks = [
  { label: 'Profile', desc: 'View your identity matrix', icon: User, path: '/profile', accent: 'text-primary' },
  { label: 'Achievements', desc: 'View secured artifacts', icon: Trophy, path: '/achievements', accent: 'text-yellow-500' },
  { label: 'Reputation Graph', desc: 'Visualize your network', icon: GitBranch, path: '/graph', accent: 'text-accent' },
  { label: 'Timeline', desc: 'Browse your event log', icon: Clock, path: '/timeline', accent: 'text-muted-foreground' },
  { label: 'Settings', desc: 'Configure your node', icon: Settings, path: '/settings', accent: 'text-muted-foreground' },
];

export default function HomePage() {
  const { user } = useAuth();

  const connectedProviders = user?.connectedProviders as any;
  const githubConnected = !!connectedProviders?.github;
  const walletConnected = !!user?.walletAddress;
  const providersCount = [githubConnected, walletConnected].filter(Boolean).length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
        {/* Background Texture */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-grain mix-blend-overlay opacity-30" />

        <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10 max-w-7xl">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 border-b-2 border-border/40 pb-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[2px] w-12 bg-primary" />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Node Active
              </span>
            </div>
            <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.9]">
              {greeting()}, <br />
              <span className="text-muted-foreground/80">
                {user?.displayName || user?.handle || 'Sovereign.'}
              </span>
            </h1>
            <p className="font-mono text-sm text-muted-foreground uppercase tracking-widest mt-6">
              Your reputation passport is live on the network.
            </p>
          </motion.div>

          {/* Status Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16"
          >
            {/* Auth Method */}
            <div className="border border-border/50 bg-secondary/5 p-6 group hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground border border-border/40 px-2 py-0.5">Auth</span>
              </div>
              <p className="font-heading text-2xl font-bold uppercase tracking-tight mb-1">
                ACTIVE
              </p>
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Session Authenticated</p>
            </div>

            {/* Bridges */}
            <div className="border border-border/50 bg-secondary/5 p-6 group hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <Activity className="h-5 w-5 text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground border border-border/40 px-2 py-0.5">Bridges</span>
              </div>
              <p className="font-heading text-2xl font-bold uppercase tracking-tight mb-1">
                {providersCount} / 2
              </p>
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                {githubConnected ? 'GitHub' : '—'} {walletConnected ? '+ Wallet' : ''}
              </p>
            </div>

            {/* Quick Profile Link */}
            <div className="border border-border/50 bg-secondary/5 p-6 group hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground border border-border/40 px-2 py-0.5">Score</span>
              </div>
              <p className="font-heading text-2xl font-bold uppercase tracking-tight mb-1">
                {user?.reputationScore ?? '—'}
              </p>
              <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Reputation Index</p>
            </div>
          </motion.div>

          {/* Connected Providers Status */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[2px] w-8 bg-border" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Network Bridges</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* GitHub */}
              <div className={cn(
                "flex-1 flex items-center gap-4 border p-4 transition-colors",
                githubConnected ? "border-accent/40 bg-accent/5" : "border-border/50 bg-secondary/5"
              )}>
                <Github className={cn("h-5 w-5", githubConnected ? "text-foreground" : "text-muted-foreground")} />
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-sm font-bold uppercase">GitHub</p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest truncate">
                    {githubConnected ? `@${connectedProviders?.github?.username || 'LINKED'}` : 'Not Connected'}
                  </p>
                </div>
                {githubConnected ? (
                  <span className="font-mono text-[10px] font-bold text-accent uppercase border border-accent/30 px-2 py-0.5 bg-accent/5 shrink-0">BRIDGE</span>
                ) : (
                  <Link to="/settings">
                    <Button variant="outline" className="rounded-none h-8 px-3 font-mono text-[10px] uppercase tracking-widest border-border/50">
                      Connect
                    </Button>
                  </Link>
                )}
              </div>

              {/* Wallet */}
              <div className={cn(
                "flex-1 flex items-center gap-4 border p-4 transition-colors",
                walletConnected ? "border-accent/40 bg-accent/5" : "border-border/50 bg-secondary/5"
              )}>
                <Wallet className={cn("h-5 w-5", walletConnected ? "text-foreground" : "text-muted-foreground")} />
                <div className="flex-1 min-w-0">
                  <p className="font-heading text-sm font-bold uppercase">Wallet</p>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest truncate">
                    {walletConnected ? `${user!.walletAddress!.substring(0, 6)}...${user!.walletAddress!.substring(38)}` : 'Not Connected'}
                  </p>
                </div>
                {walletConnected ? (
                  <span className="font-mono text-[10px] font-bold text-accent uppercase border border-accent/30 px-2 py-0.5 bg-accent/5 shrink-0">BRIDGE</span>
                ) : (
                  <Link to="/settings">
                    <Button variant="outline" className="rounded-none h-8 px-3 font-mono text-[10px] uppercase tracking-widest border-border/50">
                      Connect
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[2px] w-8 bg-border" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Quick Access</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {quickLinks.map((item) => (
                <Link key={item.path} to={item.path} className="group">
                  <div className="border border-border/50 bg-secondary/5 p-5 h-full flex flex-col justify-between hover:border-primary/40 hover:bg-secondary/10 transition-all group-hover:shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                      <item.icon className={cn("h-5 w-5", item.accent)} />
                      <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                    <div>
                      <p className="font-heading text-sm font-bold uppercase tracking-tight mb-1">{item.label}</p>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
}
