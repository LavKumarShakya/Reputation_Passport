import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Github, Mail, Loader2, ChevronRight, ArrowLeft, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type AuthMethod = 'wallet' | 'github' | 'google' | null;

export default function AuthPage() {
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>(null);
  const [showMockWallet, setShowMockWallet] = useState(false);
  const [mockAddress, setMockAddress] = useState('');
  const [mockError, setMockError] = useState('');
  const { isLoading, loginWithWallet, loginWithGitHub, loginWithGoogle, loginWithMockWallet } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (method: AuthMethod) => {
    setSelectedMethod(method);

    try {
      switch (method) {
        case 'wallet':
          alert('MetaMask required. Use Mock Wallet Login below for testing!');
          setSelectedMethod(null);
          return;
        case 'github':
          await loginWithGitHub();
          break;
        case 'google':
          await loginWithGoogle();
          break;
      }
      navigate('/profile');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleMockLogin = async (address?: string) => {
    const walletAddr = address || mockAddress;
    if (!walletAddr) {
      setMockError('Please enter a wallet address');
      return;
    }
    setMockError('');
    const result = await loginWithMockWallet(walletAddr);
    if (result.success) {
      navigate('/profile');
    } else {
      setMockError(result.error || 'Login failed');
    }
  };

  const tierAddresses = [
    { tier: 'Bronze', address: '0x1BronzeWalletAddress', color: 'from-amber-700 to-yellow-700' },
    { tier: 'Silver', address: '0x2SilverWalletAddress', color: 'from-slate-400 to-zinc-400' },
    { tier: 'Gold', address: '0x3GoldWalletAddress', color: 'from-yellow-500 to-amber-400' },
    { tier: 'Platinum', address: '0x4PlatinumWalletAddress', color: 'from-purple-500 to-fuchsia-500' },
    { tier: 'Diamond', address: '0x5DiamondWalletAddress', color: 'from-cyan-400 to-teal-400' },
  ];

  const authMethods = [
    {
      id: 'wallet' as const,
      title: 'Connect Wallet',
      desc: 'Use MetaMask, WalletConnect, or any Web3 wallet',
      icon: Wallet,
      variant: 'wallet' as const,
      imports: ['Wallet address', 'ENS name', 'On-chain history'],
    },
    {
      id: 'github' as const,
      title: 'Continue with GitHub',
      desc: 'Import your repositories and contributions',
      icon: Github,
      variant: 'github' as const,
      imports: ['Repositories', 'Commit history', 'Contribution graph'],
    },
    {
      id: 'google' as const,
      title: 'Continue with Google',
      desc: 'Quick sign-in with your Google account',
      icon: Mail,
      variant: 'google' as const,
      imports: ['Email', 'Profile info', 'Linked certifications'],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-hero-gradient" />
      <div className="fixed left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="fixed right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative flex min-h-screen items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500">
              <span className="font-heading text-2xl font-bold text-white">RP</span>
            </div>

            <h1 className="font-heading text-3xl font-bold">
              Create Your Passport
            </h1>
            <p className="mt-2 text-muted-foreground">
              Choose how you want to sign in
            </p>
          </div>

          {/* Auth Methods */}
          <div className="space-y-4">
            {authMethods.map((method, i) => (
              <motion.div
                key={method.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  onClick={() => handleLogin(method.id)}
                  disabled={isLoading}
                  className="group w-full rounded-2xl glass p-5 text-left transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                      {isLoading && selectedMethod === method.id ? (
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <method.icon className="h-6 w-6" />
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-heading text-lg font-semibold">{method.title}</h3>
                      <p className="text-sm text-muted-foreground">{method.desc}</p>
                    </div>

                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>

                  {/* What will be imported */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {method.imports.map(item => (
                      <span key={item} className="rounded-full bg-secondary/50 px-2 py-0.5 text-xs text-muted-foreground">
                        {item}
                      </span>
                    ))}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Mock Wallet Login (Dev Only) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <button
              onClick={() => setShowMockWallet(!showMockWallet)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-yellow-500/30 bg-yellow-500/5 p-3 text-sm text-yellow-500 transition-colors hover:bg-yellow-500/10"
            >
              <Zap className="h-4 w-4" />
              Dev Mode: Mock Wallet Login
              <ChevronRight className={`h-4 w-4 transition-transform ${showMockWallet ? 'rotate-90' : ''}`} />
            </button>

            {showMockWallet && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 space-y-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4"
              >
                <p className="text-xs text-muted-foreground">
                  Click a tier to instantly log in as that user:
                </p>

                {/* Quick-select tier buttons */}
                <div className="grid grid-cols-5 gap-2">
                  {tierAddresses.map(t => (
                    <button
                      key={t.tier}
                      onClick={() => handleMockLogin(t.address)}
                      disabled={isLoading}
                      className={`rounded-lg bg-gradient-to-r ${t.color} px-2 py-2 text-xs font-bold text-white transition-transform hover:scale-105 disabled:opacity-50`}
                    >
                      {t.tier}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={mockAddress}
                    onChange={e => { setMockAddress(e.target.value); setMockError(''); }}
                    placeholder="0x1BronzeWalletAddress"
                    className="h-10 flex-1 rounded-lg border border-border bg-secondary/50 px-3 text-sm focus:border-primary focus:outline-none"
                  />
                  <Button onClick={() => handleMockLogin()} disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login'}
                  </Button>
                </div>
                {mockError && <p className="text-xs text-red-400">{mockError}</p>}
              </motion.div>
            )}
          </motion.div>

          {/* Privacy note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex items-start gap-3 rounded-xl bg-secondary/30 p-4"
          >
            <Shield className="h-5 w-5 shrink-0 text-accent" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Your data is secure</p>
              <p className="mt-1">
                We only import what you explicitly approve. No surprises — you control what goes on-chain.
              </p>
            </div>
          </motion.div>

          {/* Terms */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="#" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
