import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { AchievementBadge } from '@/components/AchievementBadge';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useProfileData';
import { Target, Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AchievementsPage() {
  const { user } = useAuth();
  const { achievements: realAchievements, isLoading } = useAchievements(user?.id || '');

  // Map backend achievements to the frontend rarity/structure
  const achievements = realAchievements.map(a => ({
    ...a,
    claimed: true, // If it exists in the database, it's claimed
    progress: 1,
    maxProgress: 1,
  }));

  const claimedAchievements = achievements;
  // We don't have a list of all possible "unearned" achievements yet, 
  // so we'll just show the earned ones for now to keep it authentic.
  const inProgressAchievements: any[] = [];

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
        {/* Background Texture */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-grain mix-blend-overlay opacity-30" />
        
        <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10 max-w-7xl">
          
          {/* Header */}
          <div className="mb-12 border-b-2 border-border/40 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-12 bg-primary" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">Gamification Subroutine</span>
              </div>
              <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.9]">
                Vector <br />
                <span className="text-muted-foreground/80">Milestones.</span>
              </h1>
            </div>

            <div className="flex flex-col md:items-end gap-4">
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2 border border-border/50 px-3 py-1.5 bg-secondary/10">
                <Target className="h-4 w-4" /> 
                Progression Tracked
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {[
              { label: 'Artifacts Secured', value: claimedAchievements.length },
              { label: 'Active Directives', value: 0 },
              { label: 'Legendary Yield Protocol', value: claimedAchievements.filter(a => a.rarity === 'legendary').length },
              { label: 'Global Completion', value: claimedAchievements.length > 0 ? 'AUTHENTIC' : '0%' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border border-border/50 bg-secondary/5 p-6 group hover:bg-secondary/20 transition-colors"
              >
                <p className="font-heading text-4xl font-bold tracking-tight text-foreground mb-2">{stat.value}</p>
                <div className="h-px w-8 bg-primary/50 mb-3 group-hover:w-full transition-all duration-500 ease-out" />
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 mb-8 bg-secondary/10 p-4 border border-border/50">
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" />
              <input
                type="text"
                placeholder="QUERY ARTIFACTS..."
                className="h-14 w-full rounded-none border border-border bg-background pl-12 pr-4 font-mono text-sm uppercase transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
              />
            </div>
            <Button variant="outline" size="lg" className="h-14 px-8 w-full md:w-auto rounded-none border-border font-bold uppercase tracking-widest hover:bg-secondary">
              <Filter className="mr-3 h-4 w-4" />
              Sort
            </Button>
          </div>

          {/* Claimed achievements */}
          <section className="mb-16">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Acquired Artifacts</h2>
              <div className="h-px bg-border/50 flex-1" />
              <span className="font-mono text-xs text-primary uppercase font-bold tracking-widest">[{claimedAchievements.length}] MATCHES</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {claimedAchievements.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <AchievementBadge achievement={achievement} />
                </motion.div>
              ))}
            </div>
          </section>

          {/* In progress */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Active Directives</h2>
              <div className="h-px bg-border/50 flex-1" />
              <span className="font-mono text-xs text-muted-foreground uppercase font-bold tracking-widest">[{inProgressAchievements.length}] IN QUEUE</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {inProgressAchievements.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <AchievementBadge achievement={achievement} />
                </motion.div>
              ))}
            </div>
          </section>
          
        </div>
      </div>
    </AppLayout>
  );
}
