import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Timeline } from '@/components/Timeline';
import { Button } from '@/components/ui/button';
import { Filter, Download, Activity } from 'lucide-react';

export default function TimelinePage() {
  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
        {/* Background Texture */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-grain mix-blend-overlay opacity-30" />
        
        <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10 max-w-5xl">
          
          {/* Header */}
          <div className="mb-12 border-b-2 border-border/40 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-12 bg-primary" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">Immutable History</span>
              </div>
              <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.9]">
                Event <br />
                <span className="text-muted-foreground/80">Log.</span>
              </h1>
            </div>

            <div className="flex flex-col md:items-end gap-4">
               <div className="flex gap-2">
                 <Button variant="outline" className="rounded-none border-border font-mono text-xs uppercase tracking-widest hover:bg-secondary h-10">
                   <Filter className="mr-2 h-4 w-4" /> Parameters
                 </Button>
                 <Button variant="outline" className="rounded-none border-border font-mono text-xs uppercase tracking-widest hover:bg-secondary h-10">
                   <Download className="mr-2 h-4 w-4" /> Download Raw
                 </Button>
               </div>
            </div>
          </div>

          <div className="border border-border/50 bg-secondary/5 p-6 md:p-12 relative overflow-hidden group">
            {/* Edge line */}
            <div className="absolute top-0 right-0 w-1 h-full bg-primary/20" />
            
            <div className="mb-8 flex items-center justify-between border-b border-border/30 pb-4">
              <h2 className="font-heading text-2xl font-bold uppercase tracking-wider flex items-center gap-3">
                 <Activity className="h-5 w-5 text-muted-foreground" />
                 Network Chronology
              </h2>
              <span className="font-mono text-xs text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 border border-primary/20">Syncing</span>
            </div>
            
            {/* Timeline Wrapper to give it depth */}
            <div className="px-4">
              <Timeline />
            </div>
          </div>
          
        </div>
      </div>
    </AppLayout>
  );
}
