import { useState, useEffect } from 'react';
import { ArrowRight, Shield, Globe, Sparkles, Check, Users, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ProofStrip } from '@/components/ProofStrip';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ReputationIndicator } from '@/components/ReputationIndicator';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
      {/* Texture Layer */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-grain mix-blend-overlay opacity-30" />

      {/* Navigation */}
      <nav className="fixed top-0 z-40 w-full glass bg-background/80 border-b border-border/40 transition-all duration-300">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-none bg-foreground group-hover:bg-primary transition-colors duration-300">
              <span className="font-heading text-lg font-bold text-background uppercase tracking-tighter">
                RP
              </span>
            </div>
            <span className="hidden font-heading text-xl font-bold tracking-tight md:block">
              REP.PASS
            </span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/recruiter" className="hidden text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground md:block transition-colors">
              Recruiters
            </Link>
            <Link to="/institution" className="hidden text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground md:block transition-colors">
              Institutions
            </Link>
            <div className="h-4 w-px bg-border/50 hidden md:block" />
            <ThemeToggle />
            <Link to="/auth">
              <Button size="sm" className="h-10 rounded-none bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-wider px-6 transition-all">
                Enter App
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 lg:pt-48 lg:pb-32 relative overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-12 gap-8 items-start">
            {/* Main Editorial Content - Breaks the grid */}
            <div className="col-span-12 lg:col-span-10 lg:col-start-1 relative">
              <div className="animate-reveal-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-[2px] w-12 bg-primary" />
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    Protocol v2.0 Live
                  </p>
                </div>

                <h1 className="font-heading text-5xl md:text-7xl lg:text-[7rem] font-bold leading-[0.9] tracking-[-0.03em] mb-8 text-foreground uppercase">
                  Verify <br />
                  <span className="text-muted-foreground">Your Truth</span>
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-4xl">
                  <p className="text-lg lg:text-xl font-medium leading-relaxed text-muted-foreground/80">
                    A cryptographic reputation layer that follows you. We anchor your professional achievements, contributions, and identity on-chain.
                  </p>
                  
                  <div className="flex flex-col items-start gap-6">
                    <Link to="/auth">
                      <Button size="xl" className="h-14 px-8 rounded-none bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold uppercase tracking-widest group relative overflow-hidden">
                        <span className="relative z-10 flex items-center gap-2">
                          Initialize Passport
                          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      </Button>
                    </Link>
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted-foreground/60 border border-border/40 px-3 py-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse-icon" />
                      Network Active
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-20 animate-reveal-up" style={{ animationDelay: '0.3s' }}>
                <ProofStrip />
              </div>
            </div>

            {/* Indicator - Absolute positioned on large screens */}
            <div className="hidden lg:block absolute right-8 top-40 animate-reveal-up" style={{ animationDelay: '0.5s' }}>
              <ReputationIndicator />
            </div>
          </div>
        </div>

        {/* Diagonal Accent */}
        <div className="absolute -right-[20%] top-0 h-[1000px] w-[600px] rotate-[-15deg] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      </section>

      {/* Features Bento Grid */}
      <section className="py-32 relative border-t border-border/20 bg-muted/10">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="mb-20">
            <h2 className="font-heading text-4xl lg:text-6xl font-bold uppercase tracking-tight mb-6">
              Architecture of <br />
              <span className="text-muted-foreground">Trust</span>
            </h2>
            <p className="text-lg text-muted-foreground/80 max-w-xl font-medium">
              We eliminated the noise. Your passport is a permanent, immutable record of what you have actually built and earned.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative">
            {/* Feature 1 - Large spanning */}
            <div className="md:col-span-8 glass-strong rounded-none p-10 lg:p-14 group hover:bg-secondary/5 transition-colors border-l-4 border-l-primary/0 hover:border-l-primary flex flex-col justify-between min-h-[400px]">
              <div>
                <Shield className="h-10 w-10 text-primary mb-8" />
                <h3 className="font-heading text-3xl font-bold uppercase mb-4">Cryptographic<br/>Verification</h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                  We don't rely on trust. Every credential is cryptographically signed, hashed, and anchored to an immutable ledger. Fraud is mathematically impossible.
                </p>
              </div>
              <div className="mt-8 font-mono text-xs uppercase tracking-widest text-primary/60">Node Integrity: 100%</div>
            </div>

            {/* Feature 2 - Small stacked */}
            <div className="md:col-span-4 glass rounded-none p-8 group hover:border-primary/30 transition-colors flex flex-col justify-between min-h-[400px]">
              <div>
                <Globe className="h-8 w-8 text-foreground mb-6" />
                <h3 className="font-heading text-2xl font-bold uppercase mb-4">Absolute<br/>Portability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your reputation is entirely sovereign. Port your verified proof across any platform, protocol, or institution seamlessly.
                </p>
              </div>
            </div>

            {/* Feature 3 - Wide bottom */}
            <div className="md:col-span-12 glass rounded-none p-8 lg:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:border-primary/20 transition-all overflow-hidden relative">
              <div className="relative z-10 max-w-2xl">
                <Sparkles className="h-8 w-8 text-accent mb-6" />
                <h3 className="font-heading text-2xl md:text-4xl font-bold uppercase mb-4">Dynamic Evolution</h3>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Unlike static PDFs or endorsements, your passport is a living artifact that compounds in value in real-time as your network activity updates.
                </p>
              </div>
              <div className="relative z-10 flex-shrink-0">
                <Button variant="outline" className="h-12 w-12 rounded-full p-0 border-border/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                  <ArrowUpRight className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Abstract decorative element */}
              <div className="absolute -right-20 -bottom-20 w-64 h-64 border border-border/30 rounded-full group-hover:scale-110 transition-transform duration-700 opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Cinematic Timeline (How It Works) */}
      <section className="py-32 bg-background relative border-y border-border/10">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            <div>
              <div className="sticky top-32">
                <h2 className="font-heading text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-6">
                  Initialization <br />
                  <span className="text-muted-foreground">Sequence</span>
                </h2>
                <p className="text-lg text-muted-foreground font-medium mb-12">
                  Three steps to establish your verifiable sovereignty.
                </p>
                <Link to="/auth">
                  <Button variant="outline" className="h-12 px-8 rounded-none border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground uppercase tracking-wider font-semibold">
                    Begin Sequence
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative border-l border-border/30 ml-4 lg:ml-0 pl-8 lg:pl-16 space-y-20 py-8">
              {[
                {
                  step: '01',
                  title: 'Data Ingestion',
                  description: 'Connect existing identity vectors: GitHub, Google, LinkedIn. We index your historical footprint.'
                },
                {
                  step: '02',
                  title: 'Cryptographic Anchor',
                  description: 'All valid vectors are hashed and committed to Polygon. We generate your unforgeable NFT passport.'
                },
                {
                  step: '03',
                  title: 'Network Deployment',
                  description: 'Your passport goes live. It becomes a verifiable endpoint for institutions and recruiters to query instantly.'
                },
              ].map((step, i) => (
                <div key={i} className="relative group">
                  {/* Timeline Node */}
                  <div className="absolute -left-[37px] lg:-left-[69px] top-0 h-4 w-4 rounded-none bg-background border-2 border-primary group-hover:bg-primary transition-colors" />
                  
                  <div className="font-mono text-sm text-primary font-bold mb-4 tracking-widest">
                    STEP / {step.step}
                  </div>
                  <h3 className="font-heading text-2xl font-bold uppercase mb-4 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-md">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Counter Row */}
      <section className="py-24 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-30" />
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
            {[
              { value: '14.2K', label: 'Nodes Active' },
              { value: '8.5M', label: 'Hashes Verified' },
              { value: '942', label: 'Linked Institutions' },
              { value: '<1ms', label: 'Query Latency' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col border-l border-background/20 pl-6">
                <div className="font-heading text-5xl md:text-6xl font-bold text-background tracking-tighter mb-4">{stat.value}</div>
                <div className="font-mono text-xs uppercase tracking-[0.2em] text-background/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asymmetric Masonry Testimonials */}
      <section className="py-32 glass-strong">
        <div className="container mx-auto px-6 lg:px-8">
          <h2 className="font-heading text-4xl lg:text-5xl font-bold uppercase tracking-tight mb-20 text-center">
            System Consensus
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Col 1 */}
            <div className="md:col-span-5 space-y-6 lg:space-y-8 mt-[10%]">
              <div className="bg-background/80 backdrop-blur-md border border-border/40 p-8 lg:p-10 rounded-none hover:border-primary/50 transition-colors">
                <div className="flex gap-1 text-primary mb-6">
                  {[...Array(5)].map((_, i) => <Sparkles key={i} className="w-4 h-4" />)}
                </div>
                <p className="text-xl lg:text-2xl font-medium leading-normal mb-8 text-foreground">
                  "The friction is gone. We query the passport, verify the hash, and know instantly if a candidate has the requisite open-source history."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-secondary flex items-center justify-center font-heading font-bold">DR</div>
                  <div>
                    <div className="font-bold uppercase tracking-wider text-sm">Diana R.</div>
                    <div className="font-mono text-xs text-muted-foreground">Head of Eng, Nexus</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 2 */}
            <div className="md:col-span-7 space-y-6 lg:space-y-8">
              <div className="bg-background/80 backdrop-blur-md border border-border/40 p-8 lg:p-12 rounded-none hover:border-primary/50 transition-colors">
                <p className="text-xl lg:text-3xl font-medium leading-relaxed mb-8 text-foreground">
                  "It turns intangible reputation into a concrete, cryptographic asset. I've stopped sending resumes entirely."
                </p>
                <div className="flex items-center gap-4 border-t border-border/30 pt-6">
                  <div className="h-10 w-10 bg-primary/20 text-primary flex items-center justify-center font-heading font-bold">MK</div>
                  <div>
                    <div className="font-bold uppercase tracking-wider text-sm">Marcus K.</div>
                    <div className="font-mono text-xs text-muted-foreground">Protocol Developer</div>
                  </div>
                </div>
              </div>

              <div className="bg-background/80 backdrop-blur-md border border-border/40 p-8 rounded-none md:ml-20 hover:border-accent/50 transition-colors">
                <p className="text-lg font-medium leading-relaxed mb-6 text-muted-foreground">
                  "Validating compliance and audit trails for credentials used to take weeks. Now it's a single API call to the Rep.Pass network."
                </p>
                <div className="font-bold uppercase tracking-wider text-sm">Sarah C. — Auditor</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Split/Bleeding Edge CTA */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden border-t border-border/20">
        <div className="absolute inset-0 bg-secondary/20" />
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-primary/5 hidden lg:block" />
        
        <div className="container mx-auto px-6 lg:px-8 relative z-10 w-full py-24">
          <div className="max-w-4xl">
            <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold uppercase leading-[0.9] tracking-tighter mb-10">
              Establish <br />
              <span className="text-primary italic">Permanence.</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <Link to="/auth">
                <Button size="xl" className="h-16 px-10 rounded-none bg-foreground text-background hover:bg-primary hover:text-primary-foreground text-base font-bold uppercase tracking-widest transition-all">
                  Initialize Now
                </Button>
              </Link>
              <Link to="/recruiter">
                <Button variant="outline" size="xl" className="h-16 px-8 rounded-none border-border hover:bg-secondary/50 text-foreground font-bold uppercase tracking-widest">
                  Query Network
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Footer */}
      <footer className="bg-background border-t-2 border-foreground/10 pt-20 pb-10 relative">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 lg:mb-32">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="inline-flex items-center gap-3 mb-6">
                <div className="flex h-8 w-8 items-center justify-center bg-foreground">
                  <span className="font-heading text-xs font-bold text-background uppercase tracking-tighter">RP</span>
                </div>
                <span className="font-heading text-xl font-bold tracking-tight">REP.PASS</span>
              </Link>
              <p className="text-muted-foreground font-mono text-xs max-w-sm uppercase tracking-wider leading-relaxed">
                A decentralized identity protocol anchoring professional truth to immutable ledgers.
              </p>
            </div>
            
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest mb-6 border-l-2 border-primary pl-3">Network</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li><Link to="/auth" className="hover:text-primary transition-colors">Deploy Passport</Link></li>
                <li><Link to="/recruiter" className="hover:text-primary transition-colors">Verifier Portal</Link></li>
                <li><Link to="/graph" className="hover:text-primary transition-colors">Explorer</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-mono text-xs font-bold uppercase tracking-widest mb-6 border-l-2 border-foreground/30 pl-3">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Security Audit</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Paradigm</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Protocol</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border/40 text-xs font-mono uppercase tracking-widest text-muted-foreground/50">
            <p>© {new Date().getFullYear()} REPUTATION PASSPORT. SYSTEM ACTIVE.</p>
            <p>100% CRYPTOGRAPHIC TRUTH.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
