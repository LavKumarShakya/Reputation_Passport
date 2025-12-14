import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'avatar' | 'button';
}

export function LoadingSkeleton({ className, variant = 'text' }: LoadingSkeletonProps) {
  const variants = {
    text: 'h-4 w-full rounded',
    card: 'h-40 w-full rounded-2xl',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24 rounded-xl',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-muted',
        variants[variant],
        className
      )}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* NFT Card skeleton */}
      <div className="flex justify-center">
        <LoadingSkeleton variant="card" className="h-[300px] w-[420px]" />
      </div>

      {/* Stats strip */}
      <div className="flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingSkeleton key={i} variant="card" className="h-24 flex-1" />
        ))}
      </div>

      {/* Graph */}
      <LoadingSkeleton variant="card" className="h-[500px]" />
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <LoadingSkeleton variant="avatar" className="h-8 w-8" />
          <LoadingSkeleton variant="card" className="h-32 flex-1" />
        </div>
      ))}
    </div>
  );
}
