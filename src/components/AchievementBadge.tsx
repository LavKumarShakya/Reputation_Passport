import { Achievement } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Crosshair } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
}

const rarityColors: Record<string, { bg: string; border: string; text: string; fill: string }> = {
  common: { 
    bg: 'bg-slate-500/10', 
    border: 'border-slate-500/50',
    text: 'text-slate-400',
    fill: 'bg-slate-500'
  },
  uncommon: { 
    bg: 'bg-green-500/10', 
    border: 'border-green-500/50',
    text: 'text-green-400',
    fill: 'bg-green-500'
  },
  rare: { 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/50',
    text: 'text-blue-400',
    fill: 'bg-blue-500'
  },
  epic: { 
    bg: 'bg-purple-500/10', 
    border: 'border-purple-500/50',
    text: 'text-purple-400',
    fill: 'bg-purple-500'
  },
  legendary: { 
    bg: 'bg-yellow-500/10', 
    border: 'border-yellow-500/50',
    text: 'text-yellow-400',
    fill: 'bg-yellow-500'
  },
};

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const colors = rarityColors[achievement.rarity];
  const progress = (achievement.progress / achievement.maxProgress) * 100;

  return (
    <div
      className={cn(
        "group relative overflow-hidden border p-5 transition-all duration-300 hover:bg-background z-10",
        colors.bg,
        colors.border
      )}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none z-[-1]" />

      <div className="relative">
        {/* Top Header: Icon and Rarity */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
               "flex h-12 w-12 items-center justify-center border text-2xl bg-background",
               colors.border
            )}>
              {achievement.icon}
            </div>
            
            <div className="flex flex-col">
              <span className={cn(
                "font-mono text-[10px] font-bold uppercase tracking-widest",
                colors.text
              )}>
                CLASS: {achievement.rarity}
              </span>
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                ID: {achievement.id}
              </span>
            </div>
          </div>
          {progress >= 100 && !achievement.claimed && (
            <div className="animate-pulse">
              <ShieldAlert className="h-5 w-5 text-accent" />
            </div>
          )}
        </div>

        {/* Title and description */}
        <h4 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground min-h-[3.5rem] flex items-center">{achievement.title}</h4>
        <p className="mt-2 text-xs font-mono text-muted-foreground uppercase line-clamp-3 min-h-[3rem] leading-relaxed">
          {achievement.description}
        </p>

        {/* Progress System */}
        <div className="mt-6">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <Crosshair className="h-3 w-3" />
            <span>Resolution: {achievement.progress}/{achievement.maxProgress}</span>
            <span className="ml-auto opacity-50">{Math.round(progress)}%</span>
          </div>
          
          <div className="h-2 w-full bg-secondary/50 border border-border/50 relative overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className={cn(
                "absolute top-0 left-0 h-full transition-all duration-1000",
                colors.fill
              )}
            />
          </div>
        </div>

        {/* Execution Block */}
        <div className="mt-6 pt-4 border-t border-border/50">
          {achievement.claimed ? (
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Execution Match</span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {new Date(achievement.earnedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="bg-accent/10 border border-accent/20 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                RESOLVED
              </div>
            </div>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              className={cn(
                "w-full rounded-none font-bold uppercase tracking-widest h-10 transition-colors",
                progress >= 100 
                  ? "border-accent text-accent hover:bg-accent hover:text-accent-foreground" 
                  : "border-border/50 text-muted-foreground bg-secondary/20 hover:bg-secondary/20 cursor-not-allowed opacity-70"
              )}
              disabled={progress < 100}
            >
              {progress >= 100 ? 'Execute Claim' : 'Incomplete'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
