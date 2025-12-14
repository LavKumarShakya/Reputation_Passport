import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Link2, Shield, Eye, Sparkles, 
  Check, ArrowRight, ArrowLeft, Github, 
  Mail, Wallet, Upload, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { OnChainStatus } from '@/components/OnChainStatus';

const steps = [
  { id: 'identity', title: 'Identity', icon: User },
  { id: 'sources', title: 'Connect Sources', icon: Link2 },
  { id: 'certificates', title: 'Verify Certificates', icon: Shield },
  { id: 'visibility', title: 'Visibility', icon: Eye },
  { id: 'preview', title: 'Preview', icon: Sparkles },
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [hashingStatus, setHashingStatus] = useState<'idle' | 'hashing' | 'confirming' | 'success'>('idle');
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-hero-gradient" />

      <div className="relative mx-auto max-w-5xl px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-heading text-4xl font-bold">
            Set Up Your Passport
          </h1>
          <p className="mt-2 text-muted-foreground">
            Let's import your achievements and build your on-chain reputation
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Steps sidebar */}
          <div className="rounded-2xl glass p-6">
            <nav className="space-y-2">
              {steps.map((step, i) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(i)}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all ${
                    i === currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : i < currentStep
                      ? 'text-accent'
                      : 'text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    i === currentStep ? 'bg-white/20' : 'bg-secondary'
                  }`}>
                    {i < currentStep ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="font-medium">{step.title}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="rounded-2xl glass p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Identity */}
              {currentStep === 0 && (
                <motion.div
                  key="identity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="font-heading text-2xl font-bold">Your Identity</h2>
                  <p className="text-muted-foreground">This is how others will see you on the platform.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium">Display Name</label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={e => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="Alex Chen"
                        className="h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Handle / ENS</label>
                      <input
                        type="text"
                        value={formData.handle}
                        onChange={e => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                        placeholder="alexchen.eth"
                        className="h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="alex@example.com"
                        className="h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">Avatar</label>
                      <div className="flex h-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-primary/50">
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
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
                  className="space-y-6"
                >
                  <h2 className="font-heading text-2xl font-bold">Connect Your Sources</h2>
                  <p className="text-muted-foreground">Import your achievements from various platforms.</p>

                  <div className="space-y-4">
                    {[
                      { id: 'github' as const, icon: Github, name: 'GitHub', desc: 'Import repositories, commits, and contributions' },
                      { id: 'google' as const, icon: Mail, name: 'Google', desc: 'Import certifications and profile info' },
                      { id: 'wallet' as const, icon: Wallet, name: 'Wallet', desc: 'Connect your Web3 wallet for on-chain data' },
                    ].map(source => (
                      <div
                        key={source.id}
                        className={`flex items-center gap-4 rounded-xl border p-4 transition-all ${
                          formData.connectedSources[source.id]
                            ? 'border-accent bg-accent/10'
                            : 'border-border bg-secondary/30 hover:border-primary/30'
                        }`}
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                          <source.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{source.name}</h4>
                          <p className="text-sm text-muted-foreground">{source.desc}</p>
                        </div>
                        <Button
                          variant={formData.connectedSources[source.id] ? 'accent' : 'outline'}
                          onClick={() => toggleSource(source.id)}
                        >
                          {formData.connectedSources[source.id] ? (
                            <>
                              <Check className="mr-1 h-4 w-4" />
                              Connected
                            </>
                          ) : (
                            'Connect'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* GitHub preview */}
                  {formData.connectedSources.github && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="rounded-xl bg-secondary/50 p-4"
                    >
                      <p className="mb-3 text-sm font-medium">Preview from GitHub</p>
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1">
                          {[4, 6, 8, 5, 9, 7, 6, 8, 10, 7, 9, 8].map((h, i) => (
                            <div
                              key={i}
                              className="w-3 rounded-sm bg-accent"
                              style={{ height: h * 4 }}
                            />
                          ))}
                        </div>
                        <div className="text-sm">
                          <p className="font-mono font-bold">1,247 commits</p>
                          <p className="text-muted-foreground">Last 12 months</p>
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
                  className="space-y-6"
                >
                  <h2 className="font-heading text-2xl font-bold">Verify Certificates</h2>
                  <p className="text-muted-foreground">Upload certificates to be verified and hashed on-chain.</p>

                  <div className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30 transition-all hover:border-primary/50">
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-3 font-medium">Drag & drop certificates here</p>
                    <p className="mt-1 text-sm text-muted-foreground">or click to browse</p>
                    <p className="mt-3 text-xs text-muted-foreground">Supports PDF, PNG, JPG</p>
                  </div>

                  <div className="rounded-xl bg-secondary/30 p-4">
                    <p className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-accent" />
                      <span>Certificates will be cryptographically hashed before being stored on-chain</span>
                    </p>
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
                  className="space-y-6"
                >
                  <h2 className="font-heading text-2xl font-bold">Visibility Settings</h2>
                  <p className="text-muted-foreground">Control what others can see on your profile.</p>

                  <div className="space-y-3">
                    {[
                      { id: 'profile' as const, label: 'Public Profile', desc: 'Anyone can view your basic info' },
                      { id: 'repos' as const, label: 'Repositories', desc: 'Show your GitHub repositories' },
                      { id: 'certificates' as const, label: 'Certificates', desc: 'Display your verified certificates' },
                      { id: 'endorsements' as const, label: 'Endorsements', desc: 'Show endorsements from others' },
                    ].map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-4"
                      >
                        <div>
                          <p className="font-medium">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => toggleVisibility(item.id)}
                          className={`relative h-6 w-11 rounded-full transition-colors ${
                            formData.visibility[item.id] ? 'bg-accent' : 'bg-muted'
                          }`}
                        >
                          <div
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                              formData.visibility[item.id] ? 'left-6' : 'left-1'
                            }`}
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
                  className="space-y-6"
                >
                  <h2 className="font-heading text-2xl font-bold">Preview Your Passport</h2>
                  <p className="text-muted-foreground">Here's how your dynamic NFT will look.</p>

                  {/* NFT Preview */}
                  <div className="flex justify-center">
                    <div className="relative h-[250px] w-[350px] overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-yellow-500 via-amber-400 to-yellow-600">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      
                      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-black/30 px-3 py-1.5 backdrop-blur-sm">
                        <Sparkles className="h-4 w-4 text-yellow-300" />
                        <span className="font-mono text-lg font-bold text-white">500</span>
                      </div>

                      <div className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold uppercase text-white backdrop-blur-sm">
                        Gold
                      </div>

                      <div className="absolute bottom-4 left-4">
                        <h3 className="font-heading text-xl font-bold text-white">
                          {formData.displayName || 'Your Name'}
                        </h3>
                        <p className="font-mono text-sm text-white/70">
                          {formData.handle || 'yourname.eth'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <OnChainStatus status={hashingStatus} txHash="0xabc123...def456" />

                  <Button
                    variant="hero"
                    size="xl"
                    className="w-full"
                    onClick={handleFinish}
                    disabled={hashingStatus !== 'idle' && hashingStatus !== 'success'}
                  >
                    {hashingStatus === 'idle' ? (
                      <>
                        Create Passport & Go On-Chain
                        <Sparkles className="ml-2 h-5 w-5" />
                      </>
                    ) : hashingStatus === 'success' ? (
                      <>
                        Continue to Profile
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    ) : (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    )}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            {currentStep < 4 && (
              <div className="mt-8 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button variant="hero" onClick={nextStep}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
