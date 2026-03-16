import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { 
  User, Link2, Eye, Shield, Wallet, Bell, 
  Trash2, ExternalLink, Check, Github, Mail, Activity, Key, Cpu, LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  
  const [formData, setFormData] = useState({
    email: '',
    handle: ''
  });

  const [securityData, setSecurityData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        handle: user.handle || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.patch('/profile', formData);
      // Update local storage so useAuth picks it up
      localStorage.setItem('auth_user', JSON.stringify(response.data));
      toast({
        title: 'Settings Updated',
        description: 'Your identity matrix has been recalibrated.',
      });
      // Force reload or state update if needed, but useAuth usually handles localstorage
      window.location.reload(); // Simplest way to ensure all components see the new user data
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error.response?.data?.error || 'Failed to sync with network.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const [isPurging, setIsPurging] = useState(false);

  const handlePurge = async () => {
    if (!window.confirm('CRITICAL: This will irreversibly destroy your identity matrix and all associated artifacts. Are you absolutely sure?')) {
      return;
    }

    setIsPurging(true);
    try {
      await api.delete('/profile');
      toast({
        title: 'Node Terminated',
        description: 'Your identity has been purged from the network.',
        variant: 'destructive'
      });
      
      // Logout and redirect
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/auth'; 
    } catch (error: any) {
      toast({
        title: 'Purge Failed',
        description: error.response?.data?.error || 'System error during termination.',
        variant: 'destructive'
      });
    } finally {
      setIsPurging(false);
    }
  };

  const handleSecuritySave = async () => {
    if (!securityData.newPassword) {
      toast({
        title: 'Input Required',
        description: 'Please define a new security protocol (password).',
      });
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({
        title: 'Entropy Mismatch',
        description: 'Password confirmation does not match the primary protocol.',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      await api.patch('/profile', { password: securityData.newPassword });
      toast({
        title: 'Security Protocol Updated',
        description: 'Your local credential bridge has been established.',
      });
      setSecurityData({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: 'Sync Failed',
        description: error.response?.data?.error || 'System error during protocol update.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnect = (source: string) => {
    if (source === 'github') {
      if (user?.connectedProviders?.github) {
        toast({
          title: 'Already Connected',
          description: 'Your GitHub architecture is already bridged.',
        });
        return;
      }
      const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      window.location.href = `${backendUrl}/api/auth/github`;
    }
  };

  const tabs = [
    { id: 'account', label: 'Identity Matrix', icon: User },
    { id: 'connections', label: 'Network Bridges', icon: Link2 },
    { id: 'wallet', label: 'Gas & Execution', icon: Wallet },
    { id: 'privacy', label: 'Telemetry Bounds', icon: Eye },
    { id: 'notifications', label: 'Event Triggers', icon: Bell },
    { id: 'security', label: 'Protocol Defense', icon: Shield },
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
        {/* Background Texture */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-grain mix-blend-overlay opacity-30" />
        
        <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10 max-w-7xl">
          
          {/* Header */}
          <div className="mb-12 border-b-2 border-border/40 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-12 bg-primary" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">System Configuration</span>
              </div>
              <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.9]">
                Node <br />
                <span className="text-muted-foreground/80">Settings.</span>
              </h1>
            </div>

            <div className="flex flex-col md:items-end gap-4">
              <div className="flex items-center gap-4">
                <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2 border border-border/50 px-3 py-1.5 bg-secondary/10">
                  <Cpu className="h-4 w-4" /> 
                  System Parameters
                </div>
                
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="h-9 px-4 border border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 rounded-none font-mono text-[10px] uppercase tracking-widest gap-2"
                >
                  <LogOut className="h-3 w-3" /> Terminate Session
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Nav Menu */}
            <nav className="w-full lg:w-64 shrink-0 flex flex-col gap-2">
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest px-4 mb-2">Configuration Vectors</div>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex w-full items-center gap-4 px-4 py-4 text-left font-mono text-xs uppercase tracking-widest transition-all border border-transparent",
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "text-muted-foreground hover:bg-secondary/50 hover:border-border/50 hover:text-foreground"
                  )}
                >
                  <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary-foreground" : "text-muted-foreground")} />
                  {tab.label}
                  {activeTab === tab.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse-icon" />}
                </button>
              ))}
            </nav>

            {/* Content Area */}
            <div className="flex-1 min-w-0 border-t lg:border-t-0 lg:border-l border-border/50 pt-8 lg:pt-0 lg:pl-12">
              
              {activeTab === 'account' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12 max-w-2xl"
                >
                  <section>
                    <div className="mb-6 flex items-center gap-3">
                      <User className="h-5 w-5 text-primary" />
                      <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Identity Matrix</h2>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Network Alias</label>
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="h-14 w-full rounded-none border border-border bg-secondary/10 px-4 font-heading text-xl uppercase tracking-wider focus:border-primary focus:bg-background focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Transmission Address</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="h-14 w-full rounded-none border border-border bg-secondary/10 px-4 font-mono text-sm uppercase focus:border-primary focus:bg-background focus:outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Global Namespace Handle</label>
                        <input
                          type="text"
                          value={formData.handle}
                          onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                          className="h-14 w-full rounded-none border border-border bg-secondary/10 px-4 font-mono text-sm uppercase focus:border-primary focus:bg-background focus:outline-none transition-colors"
                        />
                      </div>
                      <Button 
                        variant="hero" 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="rounded-none h-14 px-8 font-bold uppercase tracking-widest w-full sm:w-auto"
                      >
                        {isSaving ? 'Synchronizing...' : 'Commit Changes'}
                      </Button>
                    </div>
                  </section>

                  <section className="border border-destructive/30 bg-destructive/5 p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-2 h-full bg-destructive/50" />
                    <h2 className="font-heading text-xl font-bold uppercase tracking-wider text-destructive flex items-center gap-2 mb-2">
                      <Trash2 className="h-5 w-5" /> Terminate Node
                    </h2>
                    <p className="font-mono text-xs text-muted-foreground mb-6 max-w-md">
                      Executing this command will irreversibly destroy your identity matrix and sever all network connections.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handlePurge}
                      disabled={isPurging}
                      className="rounded-none font-bold uppercase tracking-widest h-12"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isPurging ? 'Purging Subroutines...' : 'Execute Purge'}
                    </Button>
                  </section>
                </motion.div>
              )}

              {activeTab === 'connections' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 max-w-3xl"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <Link2 className="h-5 w-5 text-primary" />
                    <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Network Bridges</h2>
                  </div>

                  <div className="grid gap-4 bg-secondary/5 border border-border/50 p-4">
                  {[
                    { 
                      name: 'GitHub Architecture', 
                      icon: Github, 
                      connected: !!(user?.connectedProviders as any)?.github, 
                      lastSync: (user?.connectedProviders as any)?.github?.username?.toUpperCase() || 'NULL' 
                    },
                    { 
                      name: 'Wallet Protocol', 
                      icon: Wallet, 
                      connected: !!user?.walletAddress, 
                      lastSync: user?.walletAddress ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(38)}` : 'NULL' 
                    },
                  ].map(connection => (
                    <div key={connection.name} className="flex flex-col sm:flex-row sm:items-center justify-between border border-border/50 bg-background p-4 group hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-6 mb-4 sm:mb-0">
                        <div className="flex h-12 w-12 items-center justify-center border border-border/50 bg-secondary/20 group-hover:bg-primary/10 transition-colors">
                          <connection.icon className={cn("h-5 w-5", connection.connected ? "text-foreground group-hover:text-primary" : "text-muted-foreground")} />
                        </div>
                        <div>
                          <p className="font-heading text-lg font-bold uppercase tracking-wide">{connection.name}</p>
                          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                            {connection.connected ? `IDENTIFIER: ${connection.lastSync}` : 'NO SIGNAL'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 sm:ml-auto border-t sm:border-t-0 border-border/50 pt-4 sm:pt-0">
                        {connection.connected && (
                          <span className="flex items-center gap-2 font-mono text-[10px] text-accent font-bold uppercase tracking-widest px-2 py-1 border border-accent/20 bg-accent/5">
                            <Check className="h-3 w-3" /> ACTIVE
                          </span>
                        )}
                        <Button 
                          variant={connection.connected ? 'outline' : 'hero'} 
                          onClick={() => !connection.connected && handleConnect(connection.name.toLowerCase().split(' ')[0])}
                          className={cn("rounded-none font-bold uppercase tracking-widest h-10 w-full sm:w-auto", 
                             connection.connected ? "border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive" : ""
                          )}
                        >
                          {connection.connected ? 'SOURCE ACTIVE' : 'BRIDGE'}
                        </Button>
                      </div>
                    </div>
                  ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'wallet' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12 max-w-3xl"
                >
                  <section>
                    <div className="mb-6 flex items-center gap-3">
                      <Activity className="h-5 w-5 text-primary" />
                      <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Gas & Execution Environment</h2>
                    </div>
                    
                    <p className="font-mono text-xs text-muted-foreground uppercase mb-6">Select primary layer 2 resolution network</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { name: 'Polygon', desc: 'Optimized / Primary Node', active: true },
                        { name: 'Ethereum', desc: 'Layer 1 / Max Security', active: false },
                        { name: 'Arbitrum', desc: 'Optimistic Rollup', active: false },
                        { name: 'Optimism', desc: 'Optimistic Rollup', active: false },
                      ].map(network => (
                        <button
                          key={network.name}
                          className={cn(
                            "group flex flex-col items-start p-6 border text-left transition-colors relative overflow-hidden",
                            network.active
                              ? "border-primary bg-primary/5"
                              : "border-border/50 bg-secondary/10 hover:border-primary/40 hover:bg-secondary/20"
                          )}
                        >
                          {network.active && (
                            <div className="absolute top-0 right-0 w-1.5 h-full bg-primary" />
                          )}
                          <p className={cn("font-heading text-2xl font-bold uppercase tracking-tight mb-2", network.active ? "text-primary" : "text-foreground")}>
                            {network.name}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                            {network.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
                      <h2 className="font-heading text-xl font-bold uppercase tracking-wider">Execution Log</h2>
                      <span className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">Last 24 HRS</span>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { tx: '0X8B3...4A9', type: 'MINT_ARTIFACT', gas: '0.002 MATIC', date: 'TIMESTAMP: 1708420993' },
                        { tx: '0XF1E...2D7', type: 'UPDATE_TELEMETRY', gas: '0.001 MATIC', date: 'TIMESTAMP: 1708248192' },
                      ].map(tx => (
                        <div key={tx.tx} className="flex flex-col sm:flex-row sm:items-center justify-between border border-border/50 bg-secondary/5 p-4 hover:bg-secondary/10 transition-colors group">
                          <div className="flex items-center gap-4 mb-4 sm:mb-0">
                            <div className="h-8 w-8 flex items-center justify-center border border-border/50 bg-background group-hover:border-primary/50 transition-colors">
                              <Key className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                              <p className="font-mono text-sm font-bold text-foreground flex items-center gap-2">
                                {tx.tx} 
                                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{tx.type}</p>
                            </div>
                          </div>
                          <div className="sm:text-right border-t sm:border-t-0 border-border/50 pt-3 sm:pt-0">
                            <p className="font-mono text-xs font-bold text-accent">{tx.gas}</p>
                            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{tx.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl space-y-12"
                >
                  <section>
                    <div className="mb-6 flex items-center gap-3">
                      <Shield className="h-5 w-5 text-primary" />
                      <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Protocol Defense</h2>
                    </div>
                    
                    <p className="font-mono text-xs text-muted-foreground uppercase mb-8 leading-relaxed">
                      Establish a local credential bridge to enable password-based resolution alongside your network provider.
                    </p>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">New Security Key (Password)</label>
                        <input
                          type="password"
                          value={securityData.newPassword}
                          onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                          className="h-14 w-full rounded-none border border-border bg-secondary/10 px-4 font-mono text-sm focus:border-primary focus:bg-background focus:outline-none transition-colors"
                          placeholder="••••••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Confirm Security Key</label>
                        <input
                          type="password"
                          value={securityData.confirmPassword}
                          onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                          className="h-14 w-full rounded-none border border-border bg-secondary/10 px-4 font-mono text-sm focus:border-primary focus:bg-background focus:outline-none transition-colors"
                          placeholder="••••••••••••"
                        />
                      </div>
                      <Button 
                        variant="hero" 
                        onClick={handleSecuritySave}
                        disabled={isSaving}
                        className="rounded-none h-14 px-8 font-bold uppercase tracking-widest w-full sm:w-auto"
                      >
                        {isSaving ? 'Encrypting...' : 'Update Protocol'}
                      </Button>
                    </div>
                  </section>
                </motion.div>
              )}

              {(activeTab === 'privacy' || activeTab === 'notifications') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl border border-border/50 bg-secondary/5 p-8"
                >
                  <div className="mb-8 border-b border-border/50 pb-6 flex items-start justify-between">
                    <div>
                      <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">{activeTab} protocol</h2>
                      <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-2 max-w-sm">
                        Configure node parameters for {activeTab} subroutines.
                      </p>
                    </div>
                    {activeTab === 'privacy' && <Eye className="h-6 w-6 text-muted-foreground/30" />}
                    {activeTab === 'notifications' && <Bell className="h-6 w-6 text-muted-foreground/30" />}
                  </div>

                  <div className="space-y-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between border border-border/30 bg-background p-4 group hover:border-primary/30 transition-colors">
                        <div>
                          <p className="font-mono text-sm font-bold uppercase text-foreground mb-1">PARAMETER_FLAG_{i + 1}</p>
                          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Toggle telemetry bounds for vector {i+1}</p>
                        </div>
                        
                        {/* Brutalist Toggle Switch */}
                        <div className="relative flex cursor-pointer items-center border border-border bg-secondary/50 p-1 w-16 h-8 group-hover:border-primary/50 transition-colors">
                          <input type="checkbox" className="peer sr-only" defaultChecked={i % 2 === 0} />
                          <div className="h-full w-1/2 bg-muted-foreground/30 transition-all peer-checked:bg-primary peer-checked:translate-x-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-border/50">
                    <Button variant="default" className="rounded-none font-bold uppercase tracking-widest w-full">Apply Force State</Button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
