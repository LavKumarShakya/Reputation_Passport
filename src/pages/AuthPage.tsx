import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Github, Mail, Loader2, ChevronRight, ArrowLeft, Shield, Zap, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

type AuthMethod = 'wallet' | 'github' | 'google' | 'credentials' | null;

const GITHUB_ERROR_MESSAGES: Record<string, string> = {
  no_token: 'GitHub login did not return a valid session token. Please try again.',
  access_denied: 'You cancelled the GitHub authorization. Please try again.',
  oauth_error: 'GitHub returned an error during authorization. Please try again.',
  server_error: 'A server error occurred during GitHub login. Please try again later.',
  server_error_v4: '[DEBUG VERSION 4] A server error occurred. This confirms the new backend code is running.',
};

export default function AuthPage() {
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>(null);
  const [showMockWallet, setShowMockWallet] = useState(false);
  const [mockAddress, setMockAddress] = useState('');
  const [mockError, setMockError] = useState('');
  const [githubError, setGithubError] = useState<string | null>(null);
  const [credentialsEmail, setCredentialsEmail] = useState('');
  const [credentialsPassword, setCredentialsPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const { user, isLoading, loginWithWallet, loginWithGitHub, loginWithGoogle, loginWithMockWallet, loginWithPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const errorCode = searchParams.get('error');
    const errorMsg = searchParams.get('msg');
    if (errorCode) {
      const baseMessage = GITHUB_ERROR_MESSAGES[errorCode] ?? 'An unexpected error occurred during login. Please try again.';
      // Append raw error message so we can see exactly what crashed
      const fullMessage = errorMsg
        ? `${baseMessage}\n\nDetails: ${decodeURIComponent(errorMsg)}`
        : baseMessage;
      setGithubError(fullMessage);
      // Clean the error param from the URL without re-rendering the page
      setSearchParams({}, { replace: true });
    }
  }, []);

  const handleLogin = async (method: AuthMethod) => {
    setSelectedMethod(method);

    try {
      switch (method) {
        case 'wallet':
          alert('MetaMask required. Use Mock Wallet Login below for testing!');
          setSelectedMethod(null);
          return;
        case 'github': {
          try {
            const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
            window.location.href = `${backendUrl}/api/auth/github`;
          } catch {
            setGithubError('Could not initiate GitHub login. Please check your connection and try again.');
            setSelectedMethod(null);
          }
          return;
        }
        case 'google':
          await loginWithGoogle();
          break;
        case 'credentials': {
          const result = await loginWithPassword(credentialsEmail, credentialsPassword);
          if (result.success) {
            const targetPath = (!result.user?.handle || result.user.handle === 'addr.unknown' || !result.user.displayName || result.user.displayName === 'UNNAMED NODE') 
              ? '/onboarding' 
              : '/profile';
            navigate(targetPath);
            return;
          } else {
            setAuthError(result.error || 'Identity verification failed.');
            setSelectedMethod(null);
            return;
          }
        }
      }
      const targetPath = (!user?.handle || user.handle === 'addr.unknown' || !user.displayName || user.displayName === 'UNNAMED NODE') 
        ? '/onboarding' 
        : '/profile';
      navigate(targetPath);
    } catch (error) {
      console.error('Login failed:', error);
      setGithubError('An unexpected error occurred. Please try again.');
      setSelectedMethod(null);
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
      const targetPath = (!result.user?.handle || result.user.handle === 'addr.unknown' || !result.user.displayName || result.user.displayName === 'UNNAMED NODE') 
        ? '/onboarding' 
        : '/profile';
      navigate(targetPath);
    } else {
      setMockError(result.error || 'Login failed');
    }
  };

  const tierAddresses = [
    { tier: 'BRNZ', address: '0x1BronzeWalletAddress', color: 'bg-amber-700/80 border-amber-700' },
    { tier: 'SLVR', address: '0x2SilverWalletAddress', color: 'bg-slate-400/80 border-slate-400' },
    { tier: 'GOLD', address: '0x3GoldWalletAddress', color: 'bg-yellow-500/80 border-yellow-500' },
    { tier: 'PLAT', address: '0x4PlatinumWalletAddress', color: 'bg-purple-500/80 border-purple-500' },
    { tier: 'DIAM', address: '0x5DiamondWalletAddress', color: 'bg-cyan-400/80 border-cyan-400' },
  ];

  const authMethods = [
    {
      id: 'wallet' as const,
      title: 'Wallet Connection',
      desc: 'Cryptographic proof via Web3 provider',
      icon: Wallet,
      imports: ['Address', 'ENS', 'On-chain History'],
    },
    {
      id: 'github' as const,
      title: 'GitHub OAuth',
      desc: 'Import developer reputation vectors',
      icon: Github,
      imports: ['Repositories', 'Commits', 'PRs'],
    },
    {
      id: 'google' as const,
      title: 'Google OAuth',
      desc: 'Anchor fundamental identity layer',
      icon: Mail,
      imports: ['Email', 'Profile', 'Certs'],
    },
    {
      id: 'credentials' as const,
      title: 'Credential Login',
      desc: 'Direct access via handle & password',
      icon: Shield,
      imports: ['Username', 'Email', 'Local Password'],
    },
  ];

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
      {/* Texture Layer */}
      <div className="fixed inset-0 pointer-events-none z-10 bg-grain mix-blend-overlay opacity-30" />
      
      {/* Abstract Background Elements */}
      <div className="fixed -left-[10%] -top-[10%] h-[50vh] w-[50vh] rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
      <div className="fixed right-[10%] bottom-[10%] h-[40vh] w-[40vh] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      <div className="relative z-20 flex min-h-screen">
        {/* Left Side - Visual Anchor (Hidden on mobile) */}
        <div className="hidden lg:flex w-1/3 flex-col justify-between border-r border-border/40 p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-background/50 backdrop-blur-3xl" />
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center bg-foreground group-hover:bg-primary transition-colors">
                <span className="font-heading text-lg font-bold text-background uppercase">RP</span>
              </div>
              <span className="font-heading text-xl font-bold tracking-tight">REP.PASS</span>
            </Link>
          </div>

          <div className="relative z-10 animate-reveal-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-heading text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-6 leading-[1.1]">
              Establish Your <br />
              <span className="text-muted-foreground">Sovereign <br/> Identity.</span>
            </h2>
            <div className="h-px w-24 bg-primary mb-6" />
            <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground leading-relaxed max-w-sm">
              Connect external vectors to initialize your immutable reputation passport. All data remains encrypted and sovereign.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/50">
            <span>System Status: 100%</span>
            <span>v2.0.4 Deploy</span>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex-1 flex flex-col justify-center p-6 lg:p-24 relative">
          <div className="w-full max-w-lg mx-auto">
            {/* Mobile Header (Hidden on large screens) */}
            <div className="mb-12 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground mb-8">
                <ArrowLeft className="h-4 w-4" /> Return
              </Link>
              <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight mb-2">
                Initialize Passport
              </h1>
              <p className="text-muted-foreground">Select an authentication vector</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-10 border-b border-border/40 pb-6">
              <h1 className="font-heading text-4xl font-bold uppercase tracking-tight">
                Connect Vector
              </h1>
            </div>

            {/* Error Popups */}
            <AnimatePresence>
              {(githubError || authError) && (
                <motion.div
                  key="auth-error"
                  initial={{ opacity: 0, y: -12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="mb-6 flex items-start gap-3 border border-destructive/60 bg-destructive/10 p-4"
                  role="alert"
                >
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  <div className="flex-1">
                    <p className="font-heading text-sm font-bold uppercase tracking-wide text-destructive">Verification Failure</p>
                    <p className="mt-1 font-mono text-xs text-destructive/80">{githubError || authError}</p>
                  </div>
                  <button
                    onClick={() => { setGithubError(null); setAuthError(null); }}
                    aria-label="Dismiss error"
                    className="ml-auto shrink-0 text-destructive/60 hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Methods List */}
            <div className="space-y-4">
              {authMethods.map((method, i) => (
                <motion.div
                  key={method.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i + 0.3 }}
                >
                  <div
                    onClick={() => {
                      if (method.id === 'credentials') {
                        setSelectedMethod(selectedMethod === 'credentials' ? null : 'credentials');
                      } else {
                        handleLogin(method.id);
                      }
                    }}
                    className={cn(
                      "group w-full text-left relative overflow-hidden cursor-pointer",
                      isLoading && selectedMethod !== method.id && "opacity-50 pointer-events-none"
                    )}
                  >
                    <div className={cn(
                      "glass rounded-none p-6 border transition-colors duration-300 relative z-10",
                      selectedMethod === method.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
                    )}>
                      <div className="flex items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center transition-colors",
                            selectedMethod === method.id ? "bg-primary text-primary-foreground" : "bg-secondary/50 group-hover:bg-primary/10"
                          )}>
                            {isLoading && selectedMethod === method.id && method.id !== 'credentials' ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <method.icon className={cn(
                                "h-5 w-5 transition-colors",
                                selectedMethod === method.id ? "text-primary-foreground" : "group-hover:text-primary"
                              )} />
                            )}
                          </div>

                          <div>
                            <h3 className={cn(
                              "font-heading text-xl font-bold uppercase tracking-wide transition-colors",
                              selectedMethod === method.id ? "text-primary" : "group-hover:text-primary"
                            )}>{method.title}</h3>
                            <p className="text-sm text-muted-foreground font-medium mt-1">{method.desc}</p>
                          </div>
                        </div>

                        <ChevronRight className={cn(
                          "hidden md:block h-6 w-6 transition-transform group-hover:translate-x-2",
                          selectedMethod === method.id ? "rotate-90 text-primary" : "text-muted-foreground/50"
                        )} />
                      </div>

                      {/* Credential Form */}
                      <AnimatePresence>
                        {method.id === 'credentials' && selectedMethod === 'credentials' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 space-y-4 border-t border-primary/20 pt-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="space-y-4">
                              <div className="space-y-1">
                                <label className="font-mono text-[10px] uppercase font-bold text-muted-foreground">GitHub Handle or Email</label>
                                <input
                                  type="text"
                                  value={credentialsEmail}
                                  onChange={(e) => setCredentialsEmail(e.target.value)}
                                  placeholder="lavkumar"
                                  className="h-10 w-full rounded-none border border-border bg-background px-3 font-mono text-sm focus:border-primary focus:outline-none"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="font-mono text-[10px] uppercase font-bold text-muted-foreground">Security Key (Password)</label>
                                <input
                                  type="password"
                                  value={credentialsPassword}
                                  onChange={(e) => setCredentialsPassword(e.target.value)}
                                  placeholder="••••••••"
                                  className="h-10 w-full rounded-none border border-border bg-background px-3 font-mono text-sm focus:border-primary focus:outline-none"
                                />
                              </div>
                              <Button
                                onClick={() => handleLogin('credentials')}
                                disabled={isLoading}
                                className="w-full h-12 rounded-none bg-primary font-bold uppercase tracking-widest"
                              >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : 'Authorize Local Bridge'}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Imported Scopes */}
                      {(!selectedMethod || selectedMethod !== method.id) && (
                        <div className="mt-5 flex flex-wrap gap-2 md:pl-[68px]">
                          {method.imports.map(item => (
                            <span key={item} className="font-mono text-[10px] uppercase tracking-wider bg-background/50 border border-border/50 px-2 py-1 text-muted-foreground">
                              {item}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dev Mode - Mock Wallet */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-10"
            >
              <button
                onClick={() => setShowMockWallet(!showMockWallet)}
                className="flex w-full items-center justify-between gap-2 border border-dashed border-accent/30 bg-accent/5 p-4 text-xs font-mono uppercase tracking-widest text-accent hover:bg-accent/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Zap className="h-4 w-4" />
                  Dev Interface: Mock Auth
                </div>
                <ChevronRight className={cn("h-4 w-4 transition-transform", showMockWallet && "rotate-90")} />
              </button>

              {showMockWallet && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 border border-accent/20 bg-accent/5 p-5"
                >
                  <p className="text-xs font-mono uppercase text-muted-foreground mb-4 border-b border-accent/10 pb-2">
                    Inject predefined user states:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                    {tierAddresses.map(t => (
                      <button
                        key={t.tier}
                        onClick={() => handleMockLogin(t.address)}
                        disabled={isLoading}
                        className={cn(
                          "border p-2 text-xs font-mono font-bold text-white transition-transform hover:scale-105 disabled:opacity-50",
                          t.color
                        )}
                      >
                        {t.tier}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={mockAddress}
                      onChange={e => { setMockAddress(e.target.value); setMockError(''); }}
                      placeholder="0x... CUSTOM ADDR"
                      className="h-10 flex-1 rounded-none border border-accent/30 bg-background/50 px-3 font-mono text-sm focus:border-accent focus:outline-none"
                    />
                    <Button 
                      onClick={() => handleMockLogin()} 
                      disabled={isLoading}
                      className="rounded-none font-mono uppercase tracking-wider bg-accent text-accent-foreground hover:bg-accent/90"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Inject'}
                    </Button>
                  </div>
                  {mockError && <p className="mt-2 text-xs font-mono text-destructive">{mockError}</p>}
                </motion.div>
              )}
            </motion.div>

            {/* Privacy note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex items-start gap-4 border-l-2 border-primary/50 pl-4 py-2"
            >
              <Shield className="h-5 w-5 shrink-0 text-primary" />
              <div className="text-sm font-medium text-muted-foreground/80">
                <p className="text-foreground font-bold mb-1">SOVEREIGNTY GUARANTEED</p>
                <p>
                  Zero data is permanently stored without explicit cryptographic consent. You maintain absolute control over the passport visibility.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
