import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { 
  User, Link2, Eye, Shield, Wallet, Bell, 
  Trash2, ExternalLink, Check, Github, Mail 
} from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'connections', label: 'Connections', icon: Link2 },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'wallet', label: 'Wallet & Gas', icon: Wallet },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="font-heading text-3xl font-bold">Settings</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your account and preferences
            </p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar */}
            <nav className="w-48 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Content */}
            <div className="flex-1">
              {activeTab === 'account' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="rounded-2xl glass p-6">
                    <h2 className="font-heading text-xl font-semibold">Profile Information</h2>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Display Name</label>
                        <input
                          type="text"
                          defaultValue="Alex Chen"
                          className="h-10 w-full rounded-lg border border-border bg-secondary/50 px-4"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Email</label>
                        <input
                          type="email"
                          defaultValue="alex@example.com"
                          className="h-10 w-full rounded-lg border border-border bg-secondary/50 px-4"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Handle</label>
                        <input
                          type="text"
                          defaultValue="alexchen.eth"
                          className="h-10 w-full rounded-lg border border-border bg-secondary/50 px-4"
                        />
                      </div>
                      <Button variant="hero">Save Changes</Button>
                    </div>
                  </div>

                  <div className="rounded-2xl glass p-6">
                    <h2 className="font-heading text-xl font-semibold text-destructive">Danger Zone</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Permanently delete your account and all associated data.
                    </p>
                    <Button variant="destructive" className="mt-4">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'connections' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {[
                    { name: 'GitHub', icon: Github, connected: true, lastSync: '2 hours ago' },
                    { name: 'Google', icon: Mail, connected: true, lastSync: '1 day ago' },
                    { name: 'Wallet', icon: Wallet, connected: true, lastSync: 'Just now' },
                  ].map(connection => (
                    <div key={connection.name} className="flex items-center justify-between rounded-2xl glass p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                          <connection.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-medium">{connection.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {connection.connected ? `Last synced: ${connection.lastSync}` : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {connection.connected && (
                          <span className="flex items-center gap-1 text-sm text-accent">
                            <Check className="h-4 w-4" />
                            Connected
                          </span>
                        )}
                        <Button variant={connection.connected ? 'outline' : 'hero'} size="sm">
                          {connection.connected ? 'Disconnect' : 'Connect'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'wallet' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="rounded-2xl glass p-6">
                    <h2 className="font-heading text-xl font-semibold">Preferred Network</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Choose your preferred blockchain for on-chain operations
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {['Polygon', 'Ethereum', 'Arbitrum', 'Optimism'].map(network => (
                        <button
                          key={network}
                          className={`rounded-xl border p-4 text-left transition-colors ${
                            network === 'Polygon'
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/30'
                          }`}
                        >
                          <p className="font-medium">{network}</p>
                          <p className="text-xs text-muted-foreground">
                            {network === 'Polygon' ? 'Recommended - Low gas fees' : 'Available'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl glass p-6">
                    <h2 className="font-heading text-xl font-semibold">Recent Transactions</h2>
                    <div className="mt-4 space-y-3">
                      {[
                        { tx: '0xabc...123', type: 'Certificate Issued', gas: '0.002 MATIC', date: '2024-02-20' },
                        { tx: '0xdef...456', type: 'Profile Update', gas: '0.001 MATIC', date: '2024-02-18' },
                      ].map(tx => (
                        <div key={tx.tx} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                          <div>
                            <p className="font-mono text-sm">{tx.tx}</p>
                            <p className="text-xs text-muted-foreground">{tx.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{tx.gas}</p>
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {(activeTab === 'privacy' || activeTab === 'notifications' || activeTab === 'security') && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl glass p-6"
                >
                  <h2 className="font-heading text-xl font-semibold capitalize">{activeTab} Settings</h2>
                  <p className="mt-2 text-muted-foreground">
                    Configure your {activeTab} preferences here.
                  </p>
                  <div className="mt-6 space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Option {i + 1}</p>
                          <p className="text-sm text-muted-foreground">Description for this option</p>
                        </div>
                        <button className="relative h-6 w-11 rounded-full bg-accent transition-colors">
                          <div className="absolute left-6 top-1 h-4 w-4 rounded-full bg-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
