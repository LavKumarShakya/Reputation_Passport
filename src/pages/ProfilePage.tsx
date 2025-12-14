import { AppLayout } from '@/components/layout/AppLayout';
import { CredentialSummary } from '@/components/CredentialSummary';
import { ReputationStrip } from '@/components/ReputationPill';
import { ReputationGraph } from '@/components/ReputationGraph';
import { Timeline } from '@/components/Timeline';
import { currentUser } from '@/lib/mockData';
import { toast } from 'sonner';

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* Page header */}
          <div>
            <h1 className="font-heading text-3xl font-bold">Your Profile</h1>
            <p className="mt-1 text-muted-foreground">
              Your on-chain reputation passport and achievements
            </p>
          </div>

          {/* Credential Summary */}
          <section className="flex justify-center">
            <CredentialSummary
              user={currentUser}
              onShare={() => toast.success('Profile link copied!')}
              onExport={() => toast.info('Export feature coming soon!')}
            />
          </section>

          {/* Reputation Strip */}
          <section>
            <ReputationStrip />
          </section>

          {/* Reputation Graph */}
          <section>
            <h2 className="mb-4 font-heading text-2xl font-bold">
              Reputation Graph
            </h2>
            <ReputationGraph />
          </section>

          {/* Timeline */}
          <section>
            <h2 className="mb-4 font-heading text-2xl font-bold">
              Activity Timeline
            </h2>
            <Timeline />
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
