import { Share2, Download, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/mockData';
import { formatDistanceToNow } from 'date-fns';

interface CredentialSummaryProps {
  user: User;
  onShare?: () => void;
  onExport?: () => void;
}

export function CredentialSummary({ user, onShare, onExport }: CredentialSummaryProps) {
  const onChainHash = '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  const verificationTimestamp = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const lastUpdated = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-lg border border-border bg-card p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold">Credential Summary</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              On-chain verification status
            </p>
          </div>
          {user.verified && (
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Verified</span>
            </div>
          )}
        </div>

        {/* Reputation Score */}
        <div className="mb-6 border-b border-border pb-6">
          <div className="flex items-baseline gap-3">
            <span className="text-sm text-muted-foreground">Reputation Score</span>
            <span className="font-mono text-3xl font-bold">{user.reputationScore}</span>
          </div>
        </div>

        {/* Verification Details */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Verification Timestamp</span>
            <span className="font-mono text-sm">
              {formatDistanceToNow(verificationTimestamp, { addSuffix: true })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">On-Chain Hash</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">
                {onChainHash.slice(0, 8)}...{onChainHash.slice(-6)}
              </span>
              <a
                href={`https://polygonscan.com/tx/${onChainHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Updated</span>
            <span className="font-mono text-sm">
              {formatDistanceToNow(lastUpdated, { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 border-t border-border pt-6">
          <Button variant="outline" onClick={onShare} className="flex-1">
            <Share2 className="h-4 w-4" />
            Share Profile
          </Button>
          <Button variant="outline" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}

