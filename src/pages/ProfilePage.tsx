import { AppLayout } from '@/components/layout/AppLayout';
import { DynamicNFTCard } from '@/components/DynamicNFTCard';
import { ReputationStrip } from '@/components/ReputationPill';
import { ReputationGraph } from '@/components/ReputationGraph';
import { Timeline } from '@/components/Timeline';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfileData';
import { toast } from 'sonner';
import { Shield, Award, TrendingUp, Hash } from 'lucide-react';

export default function ProfilePage() {
  const { user: authUser } = useAuth();

  // Use the logged-in user's ID to fetch profile. The mock login stores the user's MongoDB `id`.
  // Fall back to /me endpoint if we have a JWT token but no user object.
  const profileId = authUser?.id || authUser?.walletAddress || 'me';
  const { data: profile, isLoading } = useProfile(profileId);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </AppLayout>
    );
  }

  // Use fetched profile data, fall back to auth user, then defaults
  const userToDisplay = profile?.user || authUser || {
    displayName: 'Unknown User',
    handle: 'unknown',
    reputationScore: 0,
    tier: 'bronze',
    avatar: '',
    walletAddress: '',
  };

  const tierColors: Record<string, string> = {
    bronze: 'text-amber-600',
    silver: 'text-slate-400',
    gold: 'text-yellow-500',
    platinum: 'text-purple-400',
    diamond: 'text-cyan-400',
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-10">

          {/* Page header */}
          <div>
            <h1 className="font-heading text-3xl font-bold">Your Profile</h1>
            <p className="mt-1 text-muted-foreground">
              Your on-chain reputation passport and achievements
            </p>
          </div>

          {/* ── Main Hero: NFT Card + Stats Side-by-Side ── */}
          <section className="grid gap-8 lg:grid-cols-[auto_1fr]">

            {/* NFT Card */}
            <div className="flex flex-col items-center">
              <DynamicNFTCard
                user={userToDisplay as any}
                onShare={() => toast.success('Profile link copied!')}
                onMint={() => toast.info('SBT minting coming soon!')}
                onExport={() => toast.info('Export feature coming soon!')}
              />
            </div>

            {/* Stats Panel */}
            <div className="flex flex-col justify-center space-y-6">

              {/* User Identity */}
              <div>
                <h2 className="font-heading text-2xl font-bold">{userToDisplay.displayName}</h2>
                <p className="font-mono text-sm text-muted-foreground">@{userToDisplay.handle}</p>
                {userToDisplay.walletAddress && (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {userToDisplay.walletAddress}
                  </p>
                )}
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">Reputation Score</span>
                  </div>
                  <p className="mt-2 font-mono text-3xl font-bold">
                    {userToDisplay.reputationScore || 0}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span className="text-sm">Current Tier</span>
                  </div>
                  <p className={`mt-2 text-3xl font-bold capitalize ${tierColors[userToDisplay.tier] || ''}`}>
                    {userToDisplay.tier || 'bronze'}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">Credentials</span>
                  </div>
                  <p className="mt-2 font-mono text-3xl font-bold">
                    {profile?.credentials?.length || 0}
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span className="text-sm">On-Chain</span>
                  </div>
                  <p className="mt-2 font-mono text-3xl font-bold">
                    {profile?.credentials?.filter((c: any) => c.txHash)?.length || 0}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Reputation Strip ── */}
          <section>
            <ReputationStrip profileData={profile} />
          </section>

          {/* ── Reputation Graph ── */}
          <section>
            <h2 className="mb-4 font-heading text-2xl font-bold">
              Reputation Graph
            </h2>
            <ReputationGraph walletAddress={userToDisplay.walletAddress} />
          </section>

          {/* ── Timeline ── */}
          <section>
            <h2 className="mb-4 font-heading text-2xl font-bold">
              Activity Timeline
            </h2>
            <Timeline credentials={profile?.credentials} />
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
