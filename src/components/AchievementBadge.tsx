import { Achievement } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AchievementBadgeProps {
  achievement: Achievement;
}

const rarityColors: Record<string, { bg: string; border: string }> = {
  common: { 
    bg: 'bg-slate-500/20', 
    border: 'border-slate-500/30',
  },
  uncommon: { 
    bg: 'bg-green-500/20', 
    border: 'border-green-500/30',
  },
  rare: { 
    bg: 'bg-blue-500/20', 
    border: 'border-blue-500/30',
  },
  epic: { 
    bg: 'bg-purple-500/20', 
    border: 'border-purple-500/30',
  },
  legendary: { 
    bg: 'bg-yellow-500/20', 
    border: 'border-yellow-500/30',
  },
};

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const colors = rarityColors[achievement.rarity];
  const progress = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-4 transition-colors hover:bg-secondary",
        colors.bg,
        colors.border
      )}
    >
      <div className="relative">
        {/* Icon and rarity badge */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-background/50 text-3xl">
            {achievement.icon}
          </div>
          
          <span className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider",
            {
              'bg-slate-500/30 text-slate-300': achievement.rarity === 'common',
              'bg-green-500/30 text-green-300': achievement.rarity === 'uncommon',
              'bg-blue-500/30 text-blue-300': achievement.rarity === 'rare',
              'bg-purple-500/30 text-purple-300': achievement.rarity === 'epic',
              'bg-yellow-500/30 text-yellow-300': achievement.rarity === 'legendary',
            }
          )}>
            {achievement.rarity}
          </span>
        </div>

        {/* Title and description */}
        <h4 className="font-heading text-lg font-semibold">{achievement.title}</h4>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
          {achievement.description}
        </p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-mono font-medium">
              {achievement.progress}/{achievement.maxProgress}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-background/50">
            <div
              style={{ width: `${progress}%` }}
              className={cn(
                "h-full rounded-full",
                {
                  'bg-slate-500': achievement.rarity === 'common',
                  'bg-green-500': achievement.rarity === 'uncommon',
                  'bg-blue-500': achievement.rarity === 'rare',
                  'bg-purple-500': achievement.rarity === 'epic',
                  'bg-yellow-500': achievement.rarity === 'legendary',
                }
              )}
            />
          </div>
        </div>

        {/* Claim button or earned date */}
        <div className="mt-4">
          {achievement.claimed ? (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Earned {new Date(achievement.earnedAt).toLocaleDateString()}
              </span>
              <span className="text-xs font-medium text-accent">✓ Claimed</span>
            </div>
          ) : (
            <Button 
              size="sm" 
              className="w-full"
              disabled={progress < 100}
            >
              {progress >= 100 ? 'Claim' : 'In Progress'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
