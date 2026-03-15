import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Link2, Shield, Eye, Sparkles,
  Check, ArrowRight, ArrowLeft, Github,
  Mail, Wallet, Upload, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { OnChainStatus } from '@/components/OnChainStatus';
import { cn } from '@/lib/utils';

const steps = [
  { id: 'identity', title: 'Sovereign Identity', icon: User, desc: 'Define your public anchor' },
  { id: 'sources', title: 'Data Vectors', icon: Link2, desc: 'Connect reputation sources' },
  { id: 'certificates', title: 'Cryptographic Proofs', icon: Shield, desc: 'Upload verifiable artifacts' },
  { id: 'visibility', title: 'Access Control', icon: Eye, desc: 'Define visibility permissions' },
  { id: 'preview', title: 'Node Deployment', icon: Sparkles, desc: 'Review and anchor on-chain' },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [hashingStatus, setHashingStatus] = useState<'idle' | 'hashing' | 'confirming' | 'success'>('idle');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    displayName: '',
    handle: '',
    email: '',
    avatar: null as File | null,
    connectedSources: {
      github: false,
      google: false,
      wallet: false,
      linkedin: false,
    },
    certificates: [] as File[],
    visibility: {
      profile: true,
      repos: true,
      certificates: true,
      endorsements: false,
    },
  });

  useEffect(() => {
    const githubId = searchParams.get('github_id');
    const githubUser = searchParams.get('github_user');

    if (githubId && githubUser) {
      setFormData(prev => ({
        ...prev,
        connectedSources: { ...prev.connectedSources, github: true },
        handle: githubUser + '.eth' // Suggest handle from github
      }));
      setCurrentStep(1); // Ensure we stay on sources step
    }
  }, [searchParams]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    setHashingStatus('hashing');
    await new Promise(r => setTimeout(r, 2000));
    setHashingStatus('confirming');
    await new Promise(r => setTimeout(r, 2000));
    setHashingStatus('success');
    await new Promise(r => setTimeout(r, 1500));
    navigate('/profile');
  };

  const toggleSource = (source: keyof typeof formData.connectedSources) => {
    if (source === 'github' && !formData.connectedSources.github) {
      // Redirect to backend OAuth flow
      const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      window.location.href = `${backendUrl}/api/auth/github`;
      return;
    }

    setFormData(prev => ({
      ...prev,
      connectedSources: {
        ...prev.connectedSources,
        [source]: !prev.connectedSources[source],
      },
    }));
  };

  const toggleVisibility = (key: keyof typeof formData.visibility) => {
    setFormData(prev => ({
      ...prev,
      visibility: {
        ...prev.visibility,
        [key]: !prev.visibility[key],
      },
    }));
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
      {/* Texture Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-grain mix-blend-overlay opacity-30" />

      {/* Abstract Background Element */}
      <div className="fixed right-0 top-0 h-[800px] w-[800px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/5 blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-12 lg:py-20 lg:min-h-screen lg:flex lg:flex-col lg:justify-center">
        {/* Header */}
        <div className="mb-12 lg:mb-16">
          <Link to="/auth" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Terminate Sequence
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-heading text-4xl lg:text-6xl font-bold uppercase tracking-tight leading-none mb-4">
                Initialize <br className="hidden md:block"/> Passport
              </h1>
              <p className="text-lg text-muted-foreground/80 max-w-md">
                Configure your immutable reputation node.
              </p>
            </div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary/80 border border-primary/20 px-4 py-2 bg-primary/5">
              Sequence {currentStep + 1} / {steps.length}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr] items-start">
          {/* Steps Sidebar */}
          <div className="glass-strong rounded-none border border-border/40 p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent" />
            
            <nav className="space-y-1 relative z-10 w-full flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible pb-4 lg:pb-0">
              {steps.map((step, i) => (
                <button
                  key={step.id}
                  onClick={() => i < currentStep && setCurrentStep(i)}
                  disabled={i > currentStep}
                  className={cn(
                    "flex flex-col lg:flex-row lg:items-center gap-4 rounded-none p-4 text-left transition-all duration-300 relative min-w-[200px] lg:min-w-0 w-full",
                    i === currentStep
                      ? "bg-secondary text-foreground border-l-2 border-primary"
                      : "border-l-2 border-transparent text-muted-foreground hover:bg-secondary/20",
                    i > currentStep && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center border transition-colors",
                    i === currentStep ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-background"
                  )}>
                    {i < currentStep ? (
                      <Check className="h-5 w-5 text-primary" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <span className="font-heading text-sm font-bold uppercase tracking-wide block">{step.title}</span>
                    <span className="text-xs text-muted-foreground/70 hidden lg:block mt-0.5">{step.desc}</span>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="glass rounded-none border border-border/40 p-6 lg:p-12 shadow-2xl min-h-[500px] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
            
            <div className="flex-1 relative z-10">
              <AnimatePresence mode="wait">
                {/* Step 1: Identity */}
                {currentStep === 0 && (
                  <motion.div
                    key="identity"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="font-heading text-3xl font-bold uppercase tracking-tight mb-2">Sovereign Identity</h2>
                      <p className="text-muted-foreground">Define the canonical public anchor for your passport.</p>
                    </div>

                    <div className="space-y-6 max-w-xl">
                      <div className="space-y-2">
                        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Canonical Display Name</label>
                        <input
                          type="text"
                          value={formData.displayName}
                          onChange={e => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                          placeholder="ALEX CHEN"
                          className="h-14 w-full rounded-none border border-border bg-secondary/30 px-4 font-heading text-lg focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all uppercase"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">ENS / Protocol Handle</label>
                        <input
                          type="text"
                          value={formData.handle}
                          onChange={e => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                          placeholder="alexchen.eth"
                          className="h-14 w-full rounded-none border border-border bg-secondary/30 px-4 font-mono text-sm focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Secure Comms (Email)</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="sysadmin@example.com"
                          className="h-14 w-full rounded-none border border-border bg-secondary/30 px-4 font-mono text-sm focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>

                      <div className="space-y-2 pt-2">
                        <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Visual Cryptogram (Avatar)</label>
                        <div className="group flex h-32 cursor-pointer items-center justify-center border max-w-xs border-dashed border-border bg-secondary/10 transition-colors hover:border-primary/50 hover:bg-primary/5">
                          <div className="text-center transition-transform group-hover:scale-105">
                            <Upload className="mx-auto h-6 w-6 text-muted-foreground group-hover:text-primary mb-3" />
                            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground group-hover:text-foreground">Upload Vector</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Connect Sources */}
                {currentStep === 1 && (
                  <motion.div
                    key="sources"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="font-heading text-3xl font-bold uppercase tracking-tight mb-2">Ingest Data Vectors</h2>
                      <p className="text-muted-foreground">Authorize reputation imports from external protocols.</p>
                    </div>

                    <div className="grid gap-4 max-w-2xl">
                      {[
                        { id: 'github' as const, icon: Github, name: 'GitHub OAuth', desc: 'Sync repository history and commits' },
                        { id: 'google' as const, icon: Mail, name: 'Google OAuth', desc: 'Sync email-based certifications' },
                        { id: 'wallet' as const, icon: Wallet, name: 'Web3 Provider', desc: 'Sync on-chain transaction history' },
                      ].map(source => (
                        <div
                          key={source.id}
                          className={cn(
                            "flex flex-col sm:flex-row sm:items-center gap-6 border p-6 transition-all duration-300 group",
                            formData.connectedSources[source.id]
                              ? "border-primary bg-primary/5"
                              : "border-border/50 bg-secondary/20 hover:border-primary/40"
                          )}
                        >
                          <div className="flex items-center gap-6 flex-1">
                            <div className={cn(
                              "flex h-14 w-14 shrink-0 items-center justify-center border transition-colors",
                              formData.connectedSources[source.id] ? "border-primary text-primary" : "border-border text-foreground group-hover:text-primary"
                            )}>
                              <source.icon className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-heading text-xl font-bold uppercase tracking-wide">{source.name}</h4>
                              <p className="text-sm font-medium text-muted-foreground mt-1">{source.desc}</p>
                            </div>
                          </div>
                          
                          <Button
                            variant={formData.connectedSources[source.id] ? 'outline' : 'default'}
                            className={cn(
                              "rounded-none sm:w-32 uppercase tracking-wide font-bold",
                              formData.connectedSources[source.id] ? "border-primary text-primary hover:bg-primary/10" : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground"
                            )}
                            onClick={() => toggleSource(source.id)}
                          >
                            {formData.connectedSources[source.id] ? (
                              <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Active</span>
                            ) : 'Authorize'}
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* GitHub preview */}
                    {formData.connectedSources.github && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-background/50 border border-primary/30 p-6 max-w-2xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-2 bg-primary/20 text-primary text-[10px] font-mono uppercase tracking-widest font-bold">Vector Ingested</div>
                        <p className="mb-4 font-mono text-sm uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-icon" />
                          Node Validation Success
                        </p>
                        <div className="flex items-center gap-6">
                          <div className="flex gap-1.5 items-end h-12">
                            {[4, 6, 8, 5, 9, 7, 6, 8, 10, 7, 9, 8, 6, 12, 10, 5, 8].map((h, i) => (
                              <div
                                key={i}
                                className="w-2 bg-primary/80"
                                style={{ height: h * 4 }}
                              />
                            ))}
                          </div>
                          <div className="border-l border-border pl-6">
                            <p className="font-heading text-2xl font-bold">1,247</p>
                            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Verified Commits</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Certificates */}
                {currentStep === 2 && (
                  <motion.div
                    key="certificates"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="font-heading text-3xl font-bold uppercase tracking-tight mb-2">Cryptographic Proofs</h2>
                      <p className="text-muted-foreground">Upload physical or digital certificates to be anchored on-chain.</p>
                    </div>

                    <div className="group flex flex-col items-center justify-center p-12 border-2 border-dashed border-border/50 bg-secondary/10 hover:border-primary/50 hover:bg-primary/5 transition-all text-center max-w-2xl cursor-pointer min-h-[300px]">
                      <div className="h-16 w-16 mb-6 flex items-center justify-center bg-background border border-border group-hover:border-primary/50 group-hover:text-primary transition-colors">
                        <Upload className="h-8 w-8" />
                      </div>
                      <h3 className="font-heading text-xl font-bold uppercase mb-2">Transmit Artifacts</h3>
                      <p className="text-muted-foreground font-medium mb-4">Drag payload here or browse local file system</p>
                      <div className="flex gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground/60">
                        <span className="bg-background px-2 py-1 border border-border">PDF</span>
                        <span className="bg-background px-2 py-1 border border-border">PNG</span>
                        <span className="bg-background px-2 py-1 border border-border">JPG</span>
                      </div>
                    </div>

                    <div className="max-w-2xl flex items-start gap-4 border-l-2 border-accent/50 bg-accent/5 p-4">
                      <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wide text-foreground mb-1">Hashing Protocol Active</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          All artifacts are passed through SHA-256 local hashing before upload. We only store the cryptographic hash on-chain, preserving privacy.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Visibility */}
                {currentStep === 3 && (
                  <motion.div
                    key="visibility"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="font-heading text-3xl font-bold uppercase tracking-tight mb-2">Access Control Lists</h2>
                      <p className="text-muted-foreground">Configure cryptographic viewing permissions for the public network.</p>
                    </div>

                    <div className="space-y-4 max-w-2xl">
                      {[
                        { id: 'profile' as const, label: 'Public Core Profile', desc: 'Base identity hash, display name, and handle' },
                        { id: 'repos' as const, label: 'Development History', desc: 'Aggregated commit metrics and primary repositories' },
                        { id: 'certificates' as const, label: 'Verified Artifacts', desc: 'List of hashed certificates and proof links' },
                        { id: 'endorsements' as const, label: 'Peer Network Endorsements', desc: 'Signed messages from network peers' },
                      ].map(item => (
                        <div
                          key={item.id}
                          className="flex sm:items-center justify-between gap-6 border border-border/50 bg-secondary/10 p-5 hover:border-border transition-colors"
                        >
                          <div>
                            <p className="font-heading text-lg font-bold uppercase tracking-wide mb-1 flex items-center gap-3">
                              {item.label}
                              {formData.visibility[item.id] && <span className="font-mono text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 border border-primary/30">PUBLIC</span>}
                              {!formData.visibility[item.id] && <span className="font-mono text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 border border-border">ENCRYPTED</span>}
                            </p>
                            <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
                          </div>
                          <button
                            onClick={() => toggleVisibility(item.id)}
                            className={cn(
                              "relative h-7 w-12 shrink-0 rounded-full transition-colors border outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              formData.visibility[item.id] ? "bg-primary border-primary" : "bg-muted border-muted-foreground/30"
                            )}
                          >
                            <div
                              className={cn(
                                "absolute w-5 h-5 bg-white rounded-full transition-all top-[3px]",
                                formData.visibility[item.id] ? "left-[22px] shadow-sm" : "left-[3px]"
                              )}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 5: Preview */}
                {currentStep === 4 && (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="font-heading text-3xl font-bold uppercase tracking-tight mb-2">Protocol Deployment</h2>
                      <p className="text-muted-foreground">Finalize payload for on-chain anchoring.</p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 max-w-4xl">
                      {/* NFT Preview */}
                      <div className="flex justify-center lg:justify-start">
                        <div className="relative h-[280px] w-full max-w-[400px] overflow-hidden rounded-none border border-border/50 bg-secondary shadow-2xl group">
                          {/* Holographic background gradient */}
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-amber-600/20 to-orange-700/20 opacity-80" />
                          <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-50" />
                          
                          {/* Inner brutalist frame */}
                          <div className="absolute inset-2 border border-foreground/10" />

                          {/* Top row */}
                          <div className="absolute left-6 top-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center bg-background border border-border">
                              <Sparkles className="h-5 w-5 text-accent" />
                            </div>
                            <div className="bg-background/80 backdrop-blur px-3 py-1 border border-border">
                              <span className="font-heading text-xl font-bold text-foreground">500</span>
                            </div>
                          </div>

                          <div className="absolute right-6 top-6 bg-accent text-accent-foreground px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest">
                            Foundational Node
                          </div>

                          {/* Bottom info */}
                          <div className="absolute bottom-6 left-6 right-6 p-4 bg-background/90 backdrop-blur border border-border">
                            <h3 className="font-heading text-2xl font-bold uppercase tracking-tight truncate">
                              {formData.displayName || 'UNNAMED_NODE'}
                            </h3>
                            <div className="flex items-center justify-between mt-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">
                              <span>{formData.handle || 'addr.pending'}</span>
                              <span className="text-primary">v2.0</span>
                            </div>
                          </div>
                          
                          {/* Scanning line animation overlay */}
                          <div className="absolute inset-0 h-[2px] w-full bg-primary/20 blur-[1px] -translate-y-full group-hover:animate-accordion-down" />
                        </div>
                      </div>

                      <div className="flex flex-col justify-end space-y-6">
                        <OnChainStatus status={hashingStatus} txHash="0x7a3f...d94c" />

                        <Button
                          size="xl"
                          className={cn(
                            "w-full h-16 rounded-none text-sm font-bold uppercase tracking-widest transition-all",
                            hashingStatus === 'idle' 
                              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                              : hashingStatus === 'success' 
                                ? "bg-foreground text-background hover:bg-foreground/90" 
                                : "bg-secondary text-foreground border border-border"
                          )}
                          onClick={handleFinish}
                          disabled={hashingStatus !== 'idle' && hashingStatus !== 'success'}
                        >
                          {hashingStatus === 'idle' ? (
                            <span className="flex items-center">
                              Execute Immutable Anchor
                              <Shield className="ml-3 h-5 w-5" />
                            </span>
                          ) : hashingStatus === 'success' ? (
                            <span className="flex items-center">
                              Enter Global Network
                              <ArrowRight className="ml-3 h-5 w-5" />
                            </span>
                          ) : (
                            <span className="flex items-center text-primary">
                              <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                              Anchoring Payload
                            </span>
                          )}
                        </Button>
                        
                        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground text-center">
                          Tx fee handled by relayer network
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <div className="relative z-10 pt-8 mt-4 border-t border-border/40 flex justify-between items-center">
              <Button
                variant="outline"
                className={cn(
                  "rounded-none px-6 h-12 uppercase font-bold tracking-wider hover:bg-secondary/50",
                  currentStep === 0 && "opacity-0 pointer-events-none"
                )}
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Reverse
              </Button>
              
              {currentStep < steps.length - 1 && (
                <Button 
                  className="rounded-none px-8 h-12 uppercase font-bold tracking-wider bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all" 
                  onClick={nextStep}
                >
                  Proceed
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
