import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Crosshair, CheckCircle2, Clock, XCircle, RefreshCw, Edit2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useResubmit } from '@/hooks/useSubmissions';

type SubmissionStatus = 'pending' | 'processing' | 'verified' | 'rejected' | 'temp_failed';

interface AchievementData {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  rarity?: string;
  earnedAt?: string;
  claimed?: boolean;
  progress?: number;
  maxProgress?: number;
  // Verification fields
  status?: SubmissionStatus;
  confidence?: number;
  confidenceBreakdown?: Record<string, number>;
  verificationMessage?: string;
  reputationPoints?: number;
  issuer?: string;
  type?: string;
}

interface AchievementBadgeProps {
  achievement: AchievementData;
  isSubmission?: boolean; // true → shows verification state UI
}

const rarityColors: Record<string, { bg: string; border: string; text: string; fill: string }> = {
  common:    { bg: 'bg-slate-500/10',  border: 'border-slate-500/50',  text: 'text-slate-400',  fill: 'bg-slate-500' },
  uncommon:  { bg: 'bg-green-500/10',  border: 'border-green-500/50',  text: 'text-green-400',  fill: 'bg-green-500' },
  rare:      { bg: 'bg-blue-500/10',   border: 'border-blue-500/50',   text: 'text-blue-400',   fill: 'bg-blue-500' },
  epic:      { bg: 'bg-purple-500/10', border: 'border-purple-500/50', text: 'text-purple-400', fill: 'bg-purple-500' },
  legendary: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/50', text: 'text-yellow-400', fill: 'bg-yellow-500' },
};

// ── Pending card ──────────────────────────────────────────────────────────────
function PendingCard({ achievement }: { achievement: AchievementData }) {
  return (
    <div className="relative overflow-hidden border border-border/50 bg-secondary/5 p-5">
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-background/30 z-10 flex flex-col items-center justify-center gap-3 p-5">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border border-yellow-500/40 bg-yellow-500/10 flex items-center justify-center">
            <Clock className="h-6 w-6 text-yellow-400" />
          </div>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
        </div>
        <div className="text-center">
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-yellow-400">
            {achievement.status === 'processing' ? '⚙️ Verifying...' : '⏳ Verification Pending'}
          </p>
          <p className="font-mono text-[10px] text-muted-foreground mt-1 uppercase">
            Submitted {new Date(achievement.earnedAt || Date.now()).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Blurred background content */}
      <div className="opacity-30 pointer-events-none select-none">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 border border-border/50 flex items-center justify-center text-2xl">
            {achievement.icon || '🏆'}
          </div>
          <div>
            <div className="h-2 w-20 bg-muted-foreground/30 rounded mb-1" />
            <div className="h-2 w-14 bg-muted-foreground/20 rounded" />
          </div>
        </div>
        <div className="h-3 w-full bg-muted-foreground/20 rounded mb-2" />
        <div className="h-3 w-3/4 bg-muted-foreground/20 rounded mb-2" />
        <div className="h-3 w-1/2 bg-muted-foreground/20 rounded" />
      </div>
    </div>
  );
}

// ── Confidence breakdown tooltip ──────────────────────────────────────────────
function ConfidenceBreakdown({ breakdown }: { breakdown: Record<string, number> }) {
  const [open, setOpen] = useState(false);
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        Confidence Breakdown
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {open && (
        <div className="mt-2 space-y-1 p-3 border border-border/30 bg-background">
          {Object.entries(breakdown).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="font-mono text-[10px] text-muted-foreground capitalize">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="font-mono text-[10px] font-bold text-foreground">
                +{val} pts
              </span>
            </div>
          ))}
          <div className="border-t border-border/30 pt-1 flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold text-foreground uppercase">Total</span>
            <span className="font-mono text-[10px] font-bold text-primary">{total}/100</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Rejected card ─────────────────────────────────────────────────────────────
function RejectedCard({ achievement, onResubmit }: { achievement: AchievementData; onResubmit?: () => void }) {
  const { mutate: resubmit, isPending } = useResubmit(achievement.id);

  return (
    <div className="relative overflow-hidden border border-red-500/30 bg-secondary/5 p-5 opacity-75">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none z-[-1]" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center border border-red-500/30 bg-red-500/10 text-2xl">
            {achievement.icon || '🏆'}
          </div>
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-400">
              REJECTED
            </span>
            <p className="font-mono text-[10px] text-muted-foreground uppercase">
              {achievement.type || 'Achievement'}
            </p>
          </div>
        </div>
        <XCircle className="h-5 w-5 text-red-400 shrink-0" />
      </div>

      <h4 className="font-heading text-lg font-bold uppercase tracking-tight text-foreground/70 mb-2">
        {achievement.title}
      </h4>

      {achievement.issuer && (
        <p className="font-mono text-xs text-muted-foreground uppercase mb-3">{achievement.issuer}</p>
      )}

      {/* Failure reason */}
      <div className="p-3 border border-red-500/20 bg-red-500/5 mb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-red-400 mb-1">Reason</p>
        <p className="font-mono text-xs text-muted-foreground">
          {achievement.verificationMessage || 'Verification could not be completed.'}
        </p>
      </div>

      {achievement.confidence !== undefined && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Confidence</span>
            <span className="font-mono text-[10px] font-bold text-red-400">{achievement.confidence}%</span>
          </div>
          <div className="h-1.5 w-full bg-secondary/50 border border-border/50">
            <div
              className="h-full bg-red-500/60 transition-all duration-700"
              style={{ width: `${achievement.confidence}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-border/30">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-none font-bold uppercase tracking-widest h-9 border-border/50 hover:bg-secondary"
          onClick={onResubmit}
        >
          <Edit2 className="mr-1.5 h-3 w-3" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1 rounded-none font-bold uppercase tracking-widest h-9 border-primary/50 text-primary hover:bg-primary/10"
          onClick={() => resubmit(undefined)}
          disabled={isPending}
        >
          <RefreshCw className={cn('mr-1.5 h-3 w-3', isPending && 'animate-spin')} />
          Resubmit
        </Button>
      </div>
    </div>
  );
}

// ── Verified card ─────────────────────────────────────────────────────────────
function VerifiedCard({ achievement }: { achievement: AchievementData }) {
  const colors = rarityColors[achievement.rarity || 'common'];
  const progress = ((achievement.progress ?? 1) / (achievement.maxProgress ?? 1)) * 100;

  return (
    <div className={cn(
      'group relative overflow-hidden border p-5 transition-all duration-300 hover:bg-background z-10',
      colors.bg, colors.border
    )}>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none z-[-1]" />

      <div className="relative">
        {/* Top Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-12 w-12 items-center justify-center border text-2xl bg-background', colors.border)}>
              {achievement.icon || '🏆'}
            </div>
            <div className="flex flex-col">
              <span className={cn('font-mono text-[10px] font-bold uppercase tracking-widest', colors.text)}>
                CLASS: {achievement.rarity || 'common'}
              </span>
              <span className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                {achievement.type || 'achievement'}
              </span>
            </div>
          </div>
          {/* Verified badge */}
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 px-2 py-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            <span className="font-mono text-[10px] font-bold uppercase text-green-400">Verified</span>
          </div>
        </div>

        <h4 className="font-heading text-xl font-bold uppercase tracking-tight text-foreground min-h-[2rem] flex items-center">
          {achievement.title}
        </h4>
        {achievement.description && (
          <p className="mt-2 text-xs font-mono text-muted-foreground uppercase line-clamp-2 leading-relaxed">
            {achievement.description}
          </p>
        )}

        {/* Confidence meter (for verified submissions) */}
        {achievement.confidence !== undefined && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Confidence</span>
              <span className={cn('font-mono text-[10px] font-bold', colors.text)}>{achievement.confidence}%</span>
            </div>
            <div className="h-1.5 w-full bg-secondary/50 border border-border/50">
              <div
                className={cn('h-full transition-all duration-700', colors.fill)}
                style={{ width: `${achievement.confidence}%` }}
              />
            </div>
            {achievement.confidenceBreakdown && (
              <ConfidenceBreakdown breakdown={achievement.confidenceBreakdown} />
            )}
          </div>
        )}

        {/* Progress for gamification badges */}
        {achievement.progress !== undefined && achievement.maxProgress !== undefined && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <Crosshair className="h-3 w-3" />
              <span>Resolution: {achievement.progress}/{achievement.maxProgress}</span>
              <span className="ml-auto opacity-50">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 w-full bg-secondary/50 border border-border/50 relative overflow-hidden">
              <div style={{ width: `${progress}%` }} className={cn('absolute top-0 left-0 h-full transition-all duration-1000', colors.fill)} />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-border/50">
          {achievement.claimed !== false ? (
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                  {achievement.reputationPoints ? 'Reputation' : 'Earned'}
                </span>
                <span className="font-mono text-xs font-bold text-foreground">
                  {achievement.reputationPoints
                    ? `+${achievement.reputationPoints} pts`
                    : new Date(achievement.earnedAt || '').toLocaleDateString()
                  }
                </span>
              </div>
              <div className="bg-accent/10 border border-accent/20 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                RESOLVED
              </div>
            </div>
          ) : (
            <Button size="sm" variant="outline" className="w-full rounded-none font-bold uppercase tracking-widest h-10" disabled>
              Incomplete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function AchievementBadge({ achievement, isSubmission = false, onEdit }: AchievementBadgeProps & { onEdit?: () => void }) {
  // If this is a user submission, show verification-aware UI
  if (isSubmission) {
    const status = achievement.status || 'pending';

    if (status === 'pending' || status === 'processing' || status === 'temp_failed') {
      return <PendingCard achievement={achievement} />;
    }
    if (status === 'rejected') {
      return <RejectedCard achievement={achievement} onResubmit={onEdit} />;
    }
    // Verified submission — falls through to VerifiedCard below
    return <VerifiedCard achievement={achievement} />;
  }

  // Gamification badge (existing behaviour)
  return <VerifiedCard achievement={achievement} />;
}
