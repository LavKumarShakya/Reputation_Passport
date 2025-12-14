import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReputationGraph } from '@/components/ReputationGraph';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function GraphPage() {
  const [mode, setMode] = useState<'force' | 'radial'>('force');

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-6xl space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold">
                Reputation Graph
              </h1>
              <p className="mt-1 text-muted-foreground">
                Visualize the connections between your achievements
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant={mode === 'force' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('force')}
              >
                Force Layout
              </Button>
              <Button
                variant={mode === 'radial' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('radial')}
              >
                Radial
              </Button>
            </div>
          </div>

          {/* Graph */}
          <ReputationGraph mode={mode} />

          {/* Instructions */}
          <div className="rounded-xl glass p-6">
            <h3 className="font-heading text-lg font-semibold">How to use</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Hover</strong> over nodes to see connections</li>
              <li>• <strong>Click</strong> on a node to view details</li>
              <li>• <strong>Filter</strong> by type using the chips above</li>
              <li>• Node size represents importance/value</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
