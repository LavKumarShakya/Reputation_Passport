export function ReputationIndicator() {
  return (
    <div className="flex flex-col items-center gap-2 h-fit">
      <div className="h-16 w-px bg-border" />
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          REPUTATION SCORE
        </span>
        <span className="font-mono text-2xl font-medium">847</span>
        <div className="h-px w-12 bg-border my-1" />
        <span className="text-xs text-muted-foreground">Verified</span>
      </div>
      <div className="h-16 w-px bg-border" />
    </div>
  );
}

