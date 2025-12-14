import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Timeline } from '@/components/Timeline';
import { Button } from '@/components/ui/button';
import { Filter, Download } from 'lucide-react';

export default function TimelinePage() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold">
                Activity Timeline
              </h1>
              <p className="mt-1 text-muted-foreground">
                Your complete history of achievements and verifications
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Timeline */}
          <Timeline />
        </motion.div>
      </div>
    </AppLayout>
  );
}
