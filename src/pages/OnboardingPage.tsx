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
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import api from '@/lib/api';

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
  const [txHash, setTxHash] = useState<string>('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const { connect: connectWallet, address: walletAddress, isConnected: isWalletConnected } = useWallet();

  const [formData, setFormData] = useState({
    displayName: '',
    handle: '',
    email: '',
    avatar: null as File | null,
    avatarUrl: '',
    connectedSources: {
      github: false,
      google: false,
      wallet: false,
      linkedin: false,
    },
    walletAddress: '',
    certificates: [] as Array<{
      name: string;
      certificateId?: string;
      issuerName: string;
      verifiableLink?: string;
      recipientProfileLink: string;
      fileName?: string;
      fileSize?: number;
      fileType?: string;
      fileData?: string; // base64
    }>,
    visibility: {
      profile: true,
      repos: true,
      certificates: true,
      endorsements: false,
    },
  });

  // Certificate input fields sub-state (Step 3)
  const [certForm, setCertForm] = useState({
    name: '',
    certificateId: '',
    issuerName: '',
    verifiableLink: '',
    recipientProfileLink: '',
    file: null as File | null,
    fileData: '',
    fileName: '',
    fileSize: 0,
    fileType: '',
  });

  // Pre-populate fields when user context is loaded
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: prev.displayName || user.displayName || '',
        handle: prev.handle || user.handle || '',
        email: prev.email || user.email || '',
        avatarUrl: prev.avatarUrl || user.avatar || '',
        connectedSources: {
          ...prev.connectedSources,
          github: !!user.connectedProviders?.github,
          google: !!user.connectedProviders?.google,
          wallet: !!user.walletAddress || prev.connectedSources.wallet,
        },
        walletAddress: prev.walletAddress || user.walletAddress || '',
      }));
    }
  }, [user]);

  // Handle OAuth callback parameters (GitHub)
  useEffect(() => {
    const githubId = searchParams.get('github_id');
    const githubUser = searchParams.get('github_user');

    if (githubId && githubUser) {
      setFormData(prev => ({
        ...prev,
        connectedSources: { ...prev.connectedSources, github: true },
        handle: githubUser + '.eth'
      }));
      setCurrentStep(1); // Stay on sources step
    }
  }, [searchParams]);

  // Sync wallet connect address to form data
  useEffect(() => {
    if (isWalletConnected && walletAddress) {
      setFormData(prev => ({
        ...prev,
        walletAddress: walletAddress,
        connectedSources: {
          ...prev.connectedSources,
          wallet: true
        }
      }));
    }
  }, [isWalletConnected, walletAddress]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Visual Cryptogram avatar file must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: file,
          avatarUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Certificate file size must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertForm(prev => ({
          ...prev,
          file: file,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileData: reader.result as string, // base64 Data URL
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCertificate = () => {
    const { name, issuerName, recipientProfileLink, fileData } = certForm;
    if (!name.trim()) {
      alert('Certificate Title/Name is required.');
      return;
    }
    if (!issuerName.trim()) {
      alert('Issuer Name is required.');
      return;
    }
    if (!recipientProfileLink.trim()) {
      alert('Recipient Profile Link is required.');
      return;
    }
    if (!fileData) {
      alert('Please upload a certificate file.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      certificates: [
        ...prev.certificates,
        {
          name: certForm.name.trim(),
          certificateId: certForm.certificateId.trim() || undefined,
          issuerName: certForm.issuerName.trim(),
          verifiableLink: certForm.verifiableLink.trim() || undefined,
          recipientProfileLink: certForm.recipientProfileLink.trim(),
          fileName: certForm.fileName,
          fileSize: certForm.fileSize,
          fileType: certForm.fileType,
          fileData: certForm.fileData,
        }
      ]
    }));

    // Reset form
    setCertForm({
      name: '',
      certificateId: '',
      issuerName: '',
      verifiableLink: '',
      recipientProfileLink: '',
      file: null,
      fileData: '',
      fileName: '',
      fileSize: 0,
      fileType: '',
    });
  };

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
    try {
      setHashingStatus('hashing');
      
      const payload = {
        displayName: formData.displayName,
        handle: formData.handle,
        email: formData.email,
        walletAddress: formData.walletAddress,
        avatar: formData.avatarUrl,
        visibility: {
          certificates: formData.visibility.certificates,
          repos: formData.visibility.repos,
          endorsements: formData.visibility.endorsements
        },
        certificates: formData.certificates
      };

      // Ingest payload to backend database & hash on-chain
      const response = await api.post('/profile/onboard', payload);
      
      const credentials = response.data?.credentials;
      if (credentials && credentials.length > 0) {
        // Take the first txHash if available
        const hash = credentials[0].txHash;
        if (hash) {
          setTxHash(hash);
        }
      }
      
      setHashingStatus('confirming');
      // Premium visual confirmation pause
      await new Promise(r => setTimeout(r, 2000));
      
      setHashingStatus('success');
      await new Promise(r => setTimeout(r, 1500));
      
      if (refreshUser) {
        await refreshUser();
      }
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Onboarding submission failed:', error);
      const errMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Unknown Error';
      const statusText = error.response?.status ? ` (Status: ${error.response.status})` : '';
      alert(`Failed to complete onboarding sequence: ${errMsg}${statusText}`);
      setHashingStatus('idle');
    }
  };

  const toggleSource = (source: keyof typeof formData.connectedSources) => {
    if (source === 'github') {
      if (user?.connectedProviders?.github || formData.connectedSources.github) {
        setFormData(prev => ({
          ...prev,
          connectedSources: { ...prev.connectedSources, github: !prev.connectedSources.github }
        }));
        return;
      }
      
      const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
      window.location.href = `${backendUrl}/api/auth/github`;
      return;
    }

    if (source === 'wallet') {
      if (formData.connectedSources.wallet) {
        setFormData(prev => ({
          ...prev,
          connectedSources: { ...prev.connectedSources, wallet: false },
          walletAddress: ''
        }));
      } else {
        connectWallet();
      }
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
                        <input
                          type="file"
                          id="avatar-input"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarChange}
                        />
                        {formData.avatarUrl ? (
                          <div className="relative group max-w-xs h-32 border border-primary/30 bg-secondary/10 flex items-center justify-center">
                            <img
                              src={formData.avatarUrl}
                              alt="Avatar Preview"
                              className="h-28 w-28 object-cover border border-primary/20"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, avatar: null, avatarUrl: '' }))}
                              className="absolute top-1 right-1 bg-background/80 hover:bg-destructive hover:text-white border border-border p-1 text-xs uppercase font-mono font-bold transition-all text-foreground"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => document.getElementById('avatar-input')?.click()}
                            className="group flex h-32 cursor-pointer items-center justify-center border max-w-xs border-dashed border-border bg-secondary/10 transition-colors hover:border-primary/50 hover:bg-primary/5"
                          >
                            <div className="text-center transition-transform group-hover:scale-105">
                              <Upload className="mx-auto h-6 w-6 text-muted-foreground group-hover:text-primary mb-3" />
                              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground group-hover:text-foreground">Upload Vector</p>
                            </div>
                          </div>
                        )}
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

                    {/* Added Certificates List */}
                    {formData.certificates.length > 0 && (
                      <div className="space-y-4 max-w-2xl border border-primary/20 bg-primary/5 p-6">
                        <h3 className="font-mono text-xs uppercase tracking-widest text-primary/80 font-bold border-b border-primary/10 pb-2">
                          Ingested Certificates ({formData.certificates.length})
                        </h3>
                        <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
                          {formData.certificates.map((cert, idx) => (
                            <div key={idx} className="flex items-center justify-between border border-border bg-background p-3">
                              <div className="flex items-center gap-3 truncate">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-primary text-primary bg-primary/5 font-mono text-xs">
                                  {idx + 1}
                                </div>
                                <div className="truncate">
                                  <p className="font-heading text-sm font-bold uppercase truncate">{cert.name}</p>
                                  <p className="font-mono text-[10px] text-muted-foreground truncate">
                                    Issuer: {cert.issuerName} {cert.certificateId ? `| ID: ${cert.certificateId}` : ''}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-none text-destructive hover:bg-destructive/10 uppercase font-bold text-xs"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    certificates: prev.certificates.filter((_, i) => i !== idx)
                                  }));
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Certificate Form */}
                    <div className="space-y-6 max-w-2xl border border-border bg-secondary/10 p-6">
                      <h3 className="font-heading text-lg font-bold uppercase tracking-wide border-b border-border pb-2">
                        Add New Verification Node
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Certificate Title / Name *</label>
                          <input
                            type="text"
                            value={certForm.name}
                            onChange={e => setCertForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. SPECIALIST DEFI AUDITOR"
                            className="h-11 w-full rounded-none border border-border bg-background px-3 font-mono text-sm focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Issuer Name *</label>
                          <input
                            type="text"
                            value={certForm.issuerName}
                            onChange={e => setCertForm(prev => ({ ...prev, issuerName: e.target.value }))}
                            placeholder="e.g. ACME ACADEMY"
                            className="h-11 w-full rounded-none border border-border bg-background px-3 font-mono text-sm focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Certificate ID (Optional)</label>
                            <input
                              type="text"
                              value={certForm.certificateId}
                              onChange={e => setCertForm(prev => ({ ...prev, certificateId: e.target.value }))}
                              placeholder="e.g. CERT-102938"
                              className="h-11 w-full rounded-none border border-border bg-background px-3 font-mono text-sm focus:border-primary focus:outline-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Verifiable Link (Optional)</label>
                            <input
                              type="url"
                              value={certForm.verifiableLink}
                              onChange={e => setCertForm(prev => ({ ...prev, verifiableLink: e.target.value }))}
                              placeholder="e.g. https://verify.com/cert/102938"
                              className="h-11 w-full rounded-none border border-border bg-background px-3 font-mono text-sm focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Recipient Profile Link *</label>
                          <input
                            type="url"
                            value={certForm.recipientProfileLink}
                            onChange={e => setCertForm(prev => ({ ...prev, recipientProfileLink: e.target.value }))}
                            placeholder="e.g. https://github.com/myusername (Your issued profile link)"
                            className="h-11 w-full rounded-none border border-border bg-background px-3 font-mono text-sm focus:border-primary focus:outline-none"
                          />
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground font-bold">Certificate Document File *</label>
                          <input
                            type="file"
                            id="cert-file-input"
                            className="hidden"
                            accept=".pdf,image/*"
                            onChange={handleCertFileChange}
                          />
                          {certForm.fileData ? (
                            <div className="flex items-center justify-between border border-primary/40 bg-primary/5 p-4">
                              <div className="flex items-center gap-3 truncate">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-primary bg-background text-primary">
                                  <Shield className="h-5 w-5" />
                                </div>
                                <div className="truncate">
                                  <p className="font-mono text-sm font-bold truncate">{certForm.fileName}</p>
                                  <p className="font-mono text-xs text-muted-foreground">
                                    {(certForm.fileSize / 1024).toFixed(1)} KB | {certForm.fileType}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 rounded-none text-destructive hover:bg-destructive/10 uppercase font-bold text-xs"
                                onClick={() => setCertForm(prev => ({ ...prev, file: null, fileData: '', fileName: '', fileSize: 0, fileType: '' }))}
                              >
                                Delete
                              </Button>
                            </div>
                          ) : (
                            <div
                              onClick={() => document.getElementById('cert-file-input')?.click()}
                              className="group flex flex-col items-center justify-center p-8 border border-dashed border-border hover:border-primary/50 bg-background/50 hover:bg-primary/5 transition-all text-center cursor-pointer min-h-[140px]"
                            >
                              <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary mb-2 transition-colors" />
                              <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground group-hover:text-foreground">Click to upload document vector</p>
                              <p className="text-[10px] font-mono text-muted-foreground/60 mt-1">PDF, PNG, JPG (Max 5MB)</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={handleAddCertificate}
                        className="w-full h-11 rounded-none bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-widest transition-all"
                      >
                        Ingest Verification Node
                      </Button>
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
                        <OnChainStatus status={hashingStatus} txHash={txHash || undefined} />

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
