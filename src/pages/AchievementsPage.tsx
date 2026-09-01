import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { AchievementBadge } from '@/components/AchievementBadge';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useAchievements } from '@/hooks/useProfileData';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useVerificationSocket } from '@/hooks/useVerificationSocket';
import { Target, Search, Filter, Loader2, Plus, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type TabId = 'badges' | 'submissions';

export default function AchievementsPage() {
  const { user, isAuthenticated } = useAuth();
  const { data: profile } = useProfile(user?.id || '');
  const displayUser = profile?.user || user;

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('badges');
  const [searchQuery, setSearchQuery] = useState('');

  // Gamification achievements
  const { data: rawAchievements = [], isPending: badgesLoading } = useAchievements(user?.id || '');
  const achievements = rawAchievements.map(a => ({
    ...a,
    claimed: true,
    progress: 1,
    maxProgress: 1,
  }));

  // User-submitted achievements (verification pipeline)
  const { data: submissions = [], isPending: submissionsLoading } = useSubmissions();

  // Real-time socket updates — no polling
  useVerificationSocket(isAuthenticated);

  const isLoading = badgesLoading || submissionsLoading;
  
  console.log('[DEBUG] AchievementsPage render:', {
    userId: user?.id,
    badgesLoading,
    submissionsLoading,
    isLoading,
    rawAchievementsLength: rawAchievements.length,
    submissionsLength: submissions.length,
  });

  // Stats
  const verifiedCount = submissions.filter(s => s.status === 'verified').length;
  const pendingCount  = submissions.filter(s => ['pending', 'processing', 'temp_failed'].includes(s.status)).length;
  const rejectedCount = submissions.filter(s => s.status === 'rejected').length;

  // Filtered data
  const filteredAchievements = achievements.filter(a =>
    !searchQuery || a.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredSubmissions = submissions.filter(s =>
    !searchQuery ||
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.issuer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
        <div className="fixed inset-0 pointer-events-none z-0 bg-grain mix-blend-overlay opacity-30" />

        <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10 max-w-7xl">

          {/* Header */}
          <div className="mb-12 border-b-2 border-border/40 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-12 bg-primary" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">Achievement Registry</span>
              </div>
              <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.9]">
                Vector <br />
                <span className="text-muted-foreground/80">Milestones.</span>
              </h1>
            </div>
            <div className="flex flex-col md:items-end gap-4">
              <Button
                onClick={() => navigate('/submit-achievement')}
                className="rounded-none font-bold uppercase tracking-widest h-12 px-6 gap-2"
              >
                <Plus className="h-4 w-4" />
                Submit Achievement
              </Button>
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2 border border-border/50 px-3 py-1.5 bg-secondary/10">
                <Target className="h-4 w-4" />
                Progression Tracked
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Earned Badges',       value: achievements.length },
              { label: 'Verified Achievements', value: verifiedCount, color: 'text-green-400' },
              { label: 'Pending Review',        value: pendingCount,  color: 'text-yellow-400' },
              { label: 'Total Reputation',      value: displayUser?.reputationScore ?? 0, color: 'text-primary' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border border-border/50 bg-secondary/5 p-6 group hover:bg-secondary/20 transition-colors"
              >
                <p className={cn('font-heading text-4xl font-bold tracking-tight mb-2', stat.color || 'text-foreground')}>
                  {stat.value}
                </p>
                <div className="h-px w-8 bg-primary/50 mb-3 group-hover:w-full transition-all duration-500 ease-out" />
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-8 border-b border-border/50">
            {([
              { id: 'badges',      label: 'Earned Badges',         count: achievements.length },
              { id: 'submissions', label: 'Submitted Achievements', count: submissions.length },
            ] as Array<{ id: TabId; label: string; count: number }>).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-6 py-3 font-mono text-xs uppercase tracking-widest border-b-2 transition-all duration-200',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                <span className={cn(
                  'ml-2 px-1.5 py-0.5 font-bold',
                  activeTab === tab.id ? 'bg-primary/20 text-primary' : 'bg-secondary/50 text-muted-foreground'
                )}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-secondary/10 p-4 border border-border/50">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="SEARCH ACHIEVEMENTS..."
                className="h-14 w-full rounded-none border border-border bg-background pl-12 pr-4 font-mono text-sm uppercase transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
              />
            </div>
            <Button variant="outline" size="lg" className="h-14 px-8 w-full md:w-auto rounded-none border-border font-bold uppercase tracking-widest hover:bg-secondary">
              <Filter className="mr-3 h-4 w-4" />
              Sort
            </Button>
          </div>

          {/* ── Badges Tab ── */}
          {activeTab === 'badges' && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Acquired Artifacts</h2>
                <div className="h-px bg-border/50 flex-1" />
                <span className="font-mono text-xs text-primary uppercase font-bold tracking-widest">
                  [{filteredAchievements.length}] MATCHES
                </span>
              </div>
              {filteredAchievements.length === 0 ? (
                <div className="border border-border/40 bg-secondary/5 p-12 text-center">
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">No badges earned yet</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredAchievements.map((achievement, i) => (
                    <motion.div key={achievement.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <AchievementBadge achievement={achievement} />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Submissions Tab ── */}
          {activeTab === 'submissions' && (
            <section>
              {/* Status filter pills */}
              <div className="flex flex-wrap gap-3 mb-8">
                {[
                  { label: 'Verified',   count: verifiedCount, icon: CheckCircle2, color: 'text-green-400 border-green-500/40 bg-green-500/5' },
                  { label: 'Pending',    count: pendingCount,  icon: Clock,         color: 'text-yellow-400 border-yellow-500/40 bg-yellow-500/5' },
                  { label: 'Rejected',   count: rejectedCount, icon: XCircle,       color: 'text-red-400 border-red-500/40 bg-red-500/5' },
                ].map(pill => {
                  const Icon = pill.icon;
                  return (
                    <div key={pill.label} className={cn('flex items-center gap-2 px-3 py-1.5 border font-mono text-xs uppercase tracking-widest', pill.color)}>
                      <Icon className="h-3.5 w-3.5" />
                      {pill.count} {pill.label}
                    </div>
                  );
                })}
              </div>

              {filteredSubmissions.length === 0 ? (
                <div className="border border-border/40 bg-secondary/5 p-16 text-center flex flex-col items-center gap-6">
                  <div className="w-16 h-16 border border-border/50 flex items-center justify-center">
                    <Target className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">No submissions yet</p>
                    <p className="font-mono text-[10px] text-muted-foreground/60 uppercase">Submit an achievement to start building your verified reputation</p>
                  </div>
                  <Button
                    onClick={() => navigate('/submit-achievement')}
                    className="rounded-none font-bold uppercase tracking-widest h-11 px-8 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Submit Achievement
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {filteredSubmissions.map((submission, i) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <AchievementBadge
                        achievement={{
                          id: submission.id,
                          title: submission.title,
                          issuer: submission.issuer,
                          type: submission.type,
                          icon: typeIcon(submission.type),
                          rarity: confidenceToRarity(submission.confidence),
                          status: submission.status,
                          confidence: submission.confidence,
                          confidenceBreakdown: submission.confidenceBreakdown,
                          verificationMessage: submission.verificationMessage,
                          reputationPoints: submission.reputationPoints,
                          earnedAt: submission.createdAt,
                          claimed: true,
                        }}
                        isSubmission={true}
                        onEdit={() => navigate('/submit-achievement')}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </AppLayout>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function typeIcon(type: string): string {
  const map: Record<string, string> = {
    certificate: '🏅', hackathon: '⚡', research: '📄',
    opensource: '💻', workshop: '🎓', competition: '🥇',
  };
  return map[type] || '🏆';
}

function confidenceToRarity(confidence?: number): string {
  if (!confidence) return 'common';
  if (confidence >= 90) return 'legendary';
  if (confidence >= 75) return 'epic';
  if (confidence >= 60) return 'rare';
  if (confidence >= 40) return 'uncommon';
  return 'common';
}
