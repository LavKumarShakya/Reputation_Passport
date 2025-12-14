import { useState, useEffect } from 'react';
import { ArrowRight, Shield, Globe, Sparkles, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ProofStrip } from '@/components/ProofStrip';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ReputationIndicator } from '@/components/ReputationIndicator';

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [showScrollElement, setShowScrollElement] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setShowScrollElement(currentScrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Subtle background texture */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)
          `,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full glass-strong">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-heading text-sm font-bold text-primary-foreground">RP</span>
            </div>
            <span className="font-heading text-lg font-semibold">
              ReputationPassport
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-muted-foreground md:block">
              Cryptographically verifiable
            </span>
            <Link to="/recruiter" className="hidden text-sm text-muted-foreground hover:text-foreground md:block">
              For Recruiters
            </Link>
            <Link to="/institution" className="hidden text-sm text-muted-foreground hover:text-foreground md:block">
              For Institutions
            </Link>
            <ThemeToggle />
            <Link to="/auth">
              <Button size="sm">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative">
        <div className="container mx-auto px-4">
          {/* 12-Column Grid Layout */}
          <div className="grid grid-cols-12 gap-4 items-start">
            {/* Main Editorial Content - Columns 1-8 */}
            <div className="col-span-12 lg:col-span-8 lg:col-start-1">
              {/* Eyebrow / Trust Label */}
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground opacity-70 mb-8">
                TRUSTED, VERIFIABLE, ON-CHAIN
              </p>

              {/* Headline */}
              <h1 className="font-heading text-4xl lg:text-5xl font-medium leading-[1.2] max-w-2xl mb-6">
                A Verifiable Reputation Layer for Your Career
              </h1>

              {/* Subheadline */}
              <p className="text-lg lg:text-xl leading-relaxed text-muted-foreground max-w-xl mb-10">
                Verified projects, certificates, and activity — cryptographically linked to you and instantly checkable by recruiters and institutions.
              </p>

              {/* Primary CTA Block */}
              <div className="mb-12">
                <Link to="/auth">
                  <Button size="xl" className="px-8 py-6 text-base rounded-lg hover:opacity-90 transition-opacity">
                    Create Your Reputation Passport
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                {/* Supporting Microcopy */}
                <p className="mt-3 text-xs text-muted-foreground">
                  Used by students and developers across verified institutions
                </p>
              </div>

              {/* Proof Strip - Evidence Layer */}
              <ProofStrip />
            </div>

            {/* Vertical Reputation Indicator - Columns 10-12 */}
            <div className="hidden lg:flex col-span-3 col-start-10 justify-center sticky top-32">
              <ReputationIndicator />
            </div>
          </div>
        </div>

        {/* Delayed Secondary Element on Scroll */}
        {showScrollElement && (
          <div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 transition-opacity duration-500"
            style={{ opacity: showScrollElement ? 1 : 0 }}
          >
            <Link 
              to="/recruiter" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              Why recruiters trust Reputation Passport
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Why Choose Reputation Passport?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Build trust with verifiable credentials that follow you throughout your career
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: 'Cryptographically Verified',
                description: 'Every credential is signed and stored on-chain, ensuring authenticity and preventing fraud.'
              },
              {
                icon: Globe,
                title: 'Portable & Universal',
                description: 'Your reputation travels with you. Share your passport across platforms and institutions.'
              },
              {
                icon: Sparkles,
                title: 'Dynamic & Evolving',
                description: 'Your passport grows as you achieve more. Real-time updates reflect your latest accomplishments.'
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="glass rounded-lg p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Connect Your Accounts',
                description: 'Link your GitHub, Google, and wallet. We securely import your achievements and contributions.'
              },
              {
                step: '02',
                title: 'Verify On-Chain',
                description: 'Your credentials are hashed and stored on Polygon. Immutable, verifiable, forever.'
              },
              {
                step: '03',
                title: 'Share & Grow',
                description: 'Your reputation passport evolves as you achieve more. Share with recruiters and institutions.'
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary text-primary-foreground font-heading text-2xl font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '50K+', label: 'Credentials Verified' },
              { value: '500+', label: 'Institutions' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="font-mono text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Trusted by Professionals
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                name: 'Sarah Chen',
                role: 'Software Engineer',
                company: 'Tech Corp',
                content: 'Reputation Passport made it so easy to showcase my verified skills. Recruiters trust it immediately.'
              },
              {
                name: 'Michael Rodriguez',
                role: 'Product Manager',
                company: 'StartupXYZ',
                content: 'Finally, a way to prove my credentials without carrying around physical certificates. Game changer!'
              },
              {
                name: 'Emily Johnson',
                role: 'Data Scientist',
                company: 'AI Labs',
                content: 'The on-chain verification gives me confidence that my achievements are permanent and tamper-proof.'
              },
            ].map((testimonial, i) => (
              <div key={i} className="glass rounded-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role} at {testimonial.company}</div>
                  </div>
                </div>
                <p className="text-muted-foreground">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="glass rounded-2xl p-12 text-center max-w-3xl mx-auto">
            <h2 className="font-heading text-4xl font-bold mb-4">
              Ready to Build Your Reputation?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of professionals who have already created their on-chain reputation passport.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="px-8">
                  Create Your Passport
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/recruiter">
                <Button variant="outline" size="lg" className="px-8">
                  For Recruiters
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>





      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="font-heading text-sm font-bold text-primary-foreground">RP</span>
            </div>
            <span className="font-heading text-lg font-semibold">ReputationPassport</span>
          </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ReputationPassport. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
