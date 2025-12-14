import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { AchievementBadge } from '@/components/AchievementBadge';
import { achievements } from '@/lib/mockData';

export default function AchievementsPage() {
  const claimedAchievements = achievements.filter(a => a.claimed);
  const inProgressAchievements = achievements.filter(a => !a.claimed);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-6xl space-y-8"
        >
          {/* Header */}
          <div>
            <h1 className="font-heading text-3xl font-bold">
              Your Achievements
            </h1>
            <p className="mt-1 text-muted-foreground">
              Badges and milestones you've earned on your journey
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Total Earned', value: claimedAchievements.length },
              { label: 'In Progress', value: inProgressAchievements.length },
              { label: 'Legendary', value: claimedAchievements.filter(a => a.rarity === 'legendary').length },
              { label: 'Completion', value: `${Math.round((claimedAchievements.length / achievements.length) * 100)}%` },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl glass p-4 text-center"
              >
                <p className="stat-number text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Claimed achievements */}
          <section>
            <h2 className="mb-4 font-heading text-xl font-semibold">Earned Achievements</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {claimedAchievements.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
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
            <h2 className="mb-4 font-heading text-xl font-semibold">In Progress</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {inProgressAchievements.map((achievement, i) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <AchievementBadge achievement={achievement} />
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      </div>
    </AppLayout>
  );
}
