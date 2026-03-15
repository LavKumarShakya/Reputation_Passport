import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { ReputationGraph } from '@/components/ReputationGraph';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Network, Search, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export default function GraphPage() {
  const [mode, setMode] = useState<'force' | 'radial'>('force');
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
        {/* Background Texture */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-grain mix-blend-overlay opacity-30" />
        
        <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10 max-w-7xl">
          
          {/* Header */}
          <div className="mb-12 border-b-2 border-border/40 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-12 bg-primary" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">Node Topology</span>
              </div>
              <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.9]">
                Vector <br />
                <span className="text-muted-foreground/80">Graph.</span>
              </h1>
            </div>

            <div className="flex flex-col md:items-end gap-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2 border border-border/50 px-3 py-1.5 bg-secondary/10">
                <Network className="h-4 w-4" /> 
                Entity Resolution Mapping
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Controls */}
            <div className="lg:w-72 shrink-0 space-y-6">
              <div className="border border-border/50 bg-secondary/5 p-6 space-y-6">
                <div>
                   <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Layout Algorithm</p>
                   <div className="flex flex-col gap-2">
                    <Button
                      variant={mode === 'force' ? 'default' : 'outline'}
                      className={cn(
                        "rounded-none w-full justify-start font-mono text-xs font-bold uppercase tracking-widest h-10 transition-colors",
                         mode === 'force' ? '' : 'border-border/50 text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
                      )}
                      onClick={() => setMode('force')}
                    >
                      <Crosshair className="mr-3 h-4 w-4" />
                      Force Directed
                    </Button>
                    <Button
                      variant={mode === 'radial' ? 'default' : 'outline'}
                      className={cn(
                        "rounded-none w-full justify-start font-mono text-xs font-bold uppercase tracking-widest h-10 transition-colors",
                         mode === 'radial' ? '' : 'border-border/50 text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
                      )}
                      onClick={() => setMode('radial')}
                    >
                      <Search className="mr-3 h-4 w-4" />
                      Radial Plot
                    </Button>
                   </div>
                </div>

                <div className="pt-6 border-t border-border/50">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Telemetry Legends</p>
                  <ul className="space-y-3 font-mono text-[10px] uppercase tracking-widest text-foreground">
                    <li className="flex items-start gap-2">
                       <div className="w-3 h-3 border border-border/50 bg-primary/20 shrink-0 mt-0.5" />
                       Node weight correlates to systemic influence.
                    </li>
                    <li className="flex items-start gap-2">
                       <div className="w-3 h-3 border border-border/50 bg-accent/20 shrink-0 mt-0.5" />
                       Hover vectors to decode pathways.
                    </li>
                    <li className="flex items-start gap-2">
                       <div className="w-3 h-3 border border-border/50 bg-destructive/20 shrink-0 mt-0.5" />
                       Click nodes to isolate sub-graphs.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Graph Container */}
            <div className="flex-1 border border-border bg-secondary/5 min-h-[600px] relative overflow-hidden group">
               {/* Scanlines Overlay */}
               <div className="absolute inset-0 pointer-events-none opacity-20 z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_4px]" />
               <div className="absolute inset-0 pointer-events-none opacity-10 z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_100%]" />
               
               <div className="absolute bottom-4 right-4 z-20 font-mono text-[10px] uppercase tracking-widest text-primary font-bold opacity-70">
                 Executing: {mode.toUpperCase()} Layout
               </div>

                <div className="absolute inset-0 z-0">
                  <ReputationGraph 
                    mode={mode} 
                    walletAddress={user?.walletAddress || user?.handle} 
                  />
                </div>
              </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
