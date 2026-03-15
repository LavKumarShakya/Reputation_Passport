import { AppLayout } from '@/components/layout/AppLayout';
import { DynamicNFTCard } from '@/components/DynamicNFTCard';
import { ReputationStrip } from '@/components/ReputationPill';
import { ReputationGraph } from '@/components/ReputationGraph';
import { Timeline } from '@/components/Timeline';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useAchievements } from '@/hooks/useProfileData';
import { toast } from 'sonner';
import { 
  Shield, 
  Award, 
  TrendingUp, 
  Hash, 
  Activity,
  Globe,
  ExternalLink,
  Zap,
  Binary
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: authUser } = useAuth();

  // Use the ID from the URL, or 'me' if not present, then fall back to authUser's ID
  const profileId = id || authUser?.id || authUser?.walletAddress || '';
  const { data: profile, isLoading } = useProfile(profileId);

  // Use fetched profile data, fall back to auth user, then defaults
  const userToDisplay = profile?.user || authUser || {
    displayName: 'UNNAMED NODE',
    handle: 'addr.unknown',
    reputationScore: 0,
    tier: 'bronze',
    avatar: '',
    walletAddress: '',
  };

  const { achievements } = useAchievements(userToDisplay._id || userToDisplay.id || '');

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin"></div>
            <div className="font-mono text-xs uppercase tracking-widest text-primary animate-pulse">Syncing Network State...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const tierColors: Record<string, string> = {
    bronze: 'text-amber-500',
    silver: 'text-slate-300',
    gold: 'text-yellow-500',
    platinum: 'text-purple-400',
    diamond: 'text-cyan-400',
  };

  // Calculate "Uptime" (System Longevity) since createdAt
  const getLongevity = (dateString?: string) => {
    if (!dateString) return '99.9%';
    const joined = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'NEW NODE';
    if (diffDays < 30) return `${diffDays}D UPTIME`;
    return `${Math.floor(diffDays / 30)}M UPTIME`;
  };

  const uptime = getLongevity((userToDisplay as any).createdAt || (userToDisplay as any).joinedAt);

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
        {/* Background Texture */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-grain mix-blend-overlay opacity-30" />
        
        <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10 max-w-7xl">
          
          {/* Top Editorial Header */}
          <div className="mb-16 border-b-2 border-border/40 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-12 bg-primary" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">Live Telemetry</span>
              </div>
              <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.9]">
                {userToDisplay.displayName?.split(' ')[0] || 'Sovereign'} <br />
                <span className="text-muted-foreground/80">{userToDisplay.displayName?.split(' ')[1] || 'State.'}</span>
              </h1>
            </div>

            <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest">
              <div className="flex flex-col items-end border-r border-border/50 pr-4">
                <span className="text-muted-foreground">Network Node</span>
                <span className="font-bold">{userToDisplay.handle || 'PENDING'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-muted-foreground">longevity</span>
                <span className="text-accent flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse-icon" /> {uptime}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[auto_1fr] gap-12 lg:gap-16">
            
            {/* Left Column: NFT Card */}
            <div className="flex flex-col items-center xl:items-start group">
              <div className="sticky top-32">
                <DynamicNFTCard
                  user={userToDisplay as any}
                  onShare={() => toast.success('Profile link copied to clipboard')}
                  onMint={() => toast.info('SBT Protocol Initialization pending...')}
                  onExport={() => toast.info('Data export compiling...')}
                />
              </div>
            </div>

            {/* Right Column: Dashboard Data */}
            <div className="flex flex-col space-y-16">
              
              {/* Quick Metrics Grid */}
              <section>
                <div className="mb-8 flex items-center justify-between border-b border-border/30 pb-4">
                  <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Metrics Overview</h2>
                  <Activity className="h-5 w-5 text-muted-foreground" />
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="border border-border/50 bg-secondary/10 p-5 group hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <TrendingUp className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      <span className="font-mono text-[10px] bg-background border px-1.5 py-0.5 text-muted-foreground">SCORE</span>
                    </div>
                    <p className="font-heading text-4xl font-bold tracking-tighter text-foreground mb-1">
                      {userToDisplay.reputationScore || 0}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Global Hash</p>
                  </div>

                  <div className="border border-border/50 bg-secondary/10 p-5 group hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <Award className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      <span className="font-mono text-[10px] bg-background border px-1.5 py-0.5 text-muted-foreground">CLASS</span>
                    </div>
                    <p className={cn("font-heading text-4xl font-bold uppercase tracking-tighter mb-1", tierColors[userToDisplay.tier] || '')}>
                      {userToDisplay.tier || 'BRNZ'}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Protocol Tier</p>
                  </div>

                  <div className="border border-border/50 bg-secondary/10 p-5 group hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <Shield className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      <span className="font-mono text-[10px] bg-background border px-1.5 py-0.5 text-muted-foreground">PROOFS</span>
                    </div>
                    <p className="font-heading text-4xl font-bold tracking-tighter text-foreground mb-1">
                      {profile?.credentials?.length || 0}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Credentials</p>
                  </div>

                  <div className="border border-border/50 bg-secondary/10 p-5 group hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <Hash className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      <span className="font-mono text-[10px] bg-background border px-1.5 py-0.5 text-muted-foreground">TX</span>
                    </div>
                    <p className="font-heading text-4xl font-bold tracking-tighter text-foreground mb-1">
                      {profile?.credentials?.filter((c: any) => c.txHash)?.length || 0}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">On-Chain Links</p>
                  </div>
                </div>
              </section>

              {/* Artifacts Secured Section */}
              {achievements && achievements.length > 0 && (
                <section>
                  <div className="mb-8 flex items-center justify-between border-b border-border/30 pb-4">
                    <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Artifacts Secured</h2>
                    <span className="font-mono text-xs text-primary uppercase tracking-widest">[{achievements.length}] Verified</span>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {achievements.map((ach: any) => (
                      <motion.div
                        key={ach._id}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="group relative flex items-center gap-3 border border-border/50 bg-secondary/5 p-3 hover:bg-secondary/20 transition-all cursor-default"
                      >
                        <div className="flex h-10 w-10 items-center justify-center border border-border/50 bg-background text-xl group-hover:border-primary/50 transition-colors">
                          {ach.icon}
                        </div>
                        <div className="pr-2">
                          <p className="font-heading text-sm font-bold uppercase leading-none mb-1">{ach.title}</p>
                          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-tighter">{ach.rarity}</p>
                        </div>
                        <div className="absolute top-0 right-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-300" />
                      </motion.div>
                    ))}
                  </div>
                </section>
              )}

              {/* Reputation Strip Pills */}
              <section>
                <div className="mb-8 flex items-center justify-between border-b border-border/30 pb-4">
                  <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Network Infrastructure</h2>
                </div>
                <ReputationStrip profileData={profile} />
              </section>

              {/* Graphical Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12">
                <section>
                  <div className="mb-8 flex items-center justify-between border-b border-border/30 pb-4">
                    <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Velocity Curve</h2>
                    <span className="font-mono text-xs text-primary uppercase tracking-widest">Live Updates</span>
                  </div>
                  <div className="border border-border bg-secondary/5 p-6 min-h-[300px]">
                    <ReputationGraph walletAddress={userToDisplay.walletAddress || userToDisplay.handle || userToDisplay._id} />
                  </div>
                </section>
                
                <section>
                  <div className="mb-8 flex items-center justify-between border-b border-border/30 pb-4">
                    <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Event Log</h2>
                  </div>
                  <div className="border border-border bg-secondary/5 p-6 h-full max-h-[500px] overflow-y-auto custom-scrollbar">
                    <Timeline credentials={profile?.credentials} />
                  </div>
                </section>
              </div>

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
