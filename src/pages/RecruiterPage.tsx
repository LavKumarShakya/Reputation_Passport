import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Search, Filter, CheckCircle, ExternalLink, Download, Star, Briefcase, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function RecruiterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  useEffect(() => {
    async function loadCandidates() {
      try {
        const response = await api.get('/users');
        setCandidates(response.data.users);
      } catch (err) {
        console.error("Failed to load candidates", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCandidates();
  }, []);

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
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">Verifier Portal</span>
              </div>
              <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.9]">
                Global <br />
                <span className="text-muted-foreground/80">Talent Hash.</span>
              </h1>
            </div>

            <div className="flex flex-col md:items-end gap-4">
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2 border border-border/50 px-3 py-1.5 bg-secondary/10">
                <span className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse-icon" /> 
                System Active
              </div>
              <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary/10 font-bold uppercase tracking-widest h-12">
                Upgrade Access Tier
              </Button>
            </div>
          </div>

          {/* Search Console */}
          <div className="flex flex-col md:flex-row gap-4 mb-12 bg-secondary/10 p-4 border border-border/50">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-hover:text-primary" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="QUERY NETWORK: SKILL, NODE HASH, OR NAME..."
                className="h-14 w-full rounded-none border border-border bg-background pl-12 pr-4 font-mono text-sm uppercase transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/50"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-muted-foreground bg-secondary/50 px-2 py-1 border border-border/50 hidden md:block">
                ⌘ K
              </div>
            </div>
            <Button variant="outline" size="lg" className="h-14 px-8 rounded-none border-border font-bold uppercase tracking-widest hover:bg-secondary">
              <Filter className="mr-3 h-4 w-4" />
              Parameters
            </Button>
          </div>

          {/* Results Data Table / List */}
          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex flex-col h-64 items-center justify-center border border-dashed border-border/50 bg-secondary/5">
                <div className="h-10 w-10 border-4 border-primary border-t-transparent animate-spin mb-4"></div>
                <div className="font-mono text-xs uppercase tracking-widest text-primary animate-pulse">Scanning Network Nodes...</div>
              </div>
            ) : candidates.length === 0 ? (
               <div className="flex flex-col h-64 items-center justify-center border border-dashed border-border/50 bg-secondary/5 text-muted-foreground font-mono text-sm uppercase tracking-widest">
                No Nodes Identified.
              </div>
            ) : (
              candidates.map((candidate, i) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col xl:flex-row gap-6 border border-border/50 bg-secondary/10 p-6 transition-colors hover:border-primary/40 relative overflow-hidden"
                >
                  {/* Hover Scanline */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  
                  {/* Left: Identity */}
                  <div className="flex items-center gap-6 xl:w-1/3">
                    <img
                      src={candidate.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.handle}`}
                      alt={candidate.name}
                      className="h-16 w-16 border border-border/50 bg-background grayscale contrast-125 group-hover:grayscale-0 transition-all duration-500"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-heading text-2xl font-bold uppercase tracking-tight">{candidate.name || candidate.displayName}</h3>
                        {candidate.verified && (
                          <CheckCircle className="h-4 w-4 text-accent" />
                        )}
                      </div>
                      <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">{candidate.handle}</p>
                    </div>
                  </div>

                  {/* Middle: Data & Skills */}
                  <div className="flex-1 flex flex-col justify-center border-t border-b xl:border-y-0 xl:border-l xl:border-border/50 py-4 xl:py-0 xl:pl-6 space-y-4">
                     <div className="flex flex-wrap gap-2">
                      {candidate.skills?.length ? candidate.skills.map((skill: string) => (
                        <span key={skill} className="bg-background border border-border/50 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground group-hover:border-primary/30 transition-colors">
                          {skill}
                        </span>
                      )) : (
                        <span className="font-mono text-xs text-muted-foreground uppercase">No specified vectors</span>
                      )}
                    </div>
                  </div>

                  {/* Right: Metrics & Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 xl:w-auto xl:justify-end xl:border-l xl:border-border/50 xl:pl-6">
                    <div className="flex gap-6 text-center">
                      <div>
                        <p className="font-heading text-3xl font-bold tracking-tighter">{candidate.score || candidate.reputationScore || 0}</p>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Score</p>
                      </div>
                      <div>
                        <p className="font-heading text-3xl font-bold tracking-tighter">{candidate.certificates || 0}</p>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Proofs</p>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className={cn(
                          "px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest border",
                           candidate.tier === 'platinum' ? 'border-purple-500 bg-purple-500/10 text-purple-400' :
                           candidate.tier === 'gold' ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400' :
                           'border-slate-500 bg-slate-500/10 text-slate-400'
                        )}>
                          {candidate.tier || 'BRNZ'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row xl:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 xl:w-32">
                      <Button variant="outline" size="sm" className="rounded-none border-primary/50 text-foreground hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-wider" onClick={() => setSelectedCandidate(candidate)}>
                        <CheckCircle className="mr-2 h-3 w-3" />
                        Verify
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-none border-border hover:bg-secondary font-bold uppercase tracking-wider">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Profile
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Verification Modal */}
          {selectedCandidate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
              onClick={() => setSelectedCandidate(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-2xl bg-secondary/50 border border-border p-0 overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="bg-background border-b border-border/50 p-6 flex justify-between items-end">
                   <div>
                     <div className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                       <Activity className="h-3 w-3" /> Cryptographic Telemetry
                     </div>
                     <h2 className="font-heading text-3xl font-bold uppercase tracking-tight">Audit Report</h2>
                   </div>
                   <div className="text-right">
                     <p className="font-mono text-xs text-muted-foreground uppercase">{selectedCandidate.handle}</p>
                   </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="flex items-start gap-4 border border-accent/30 bg-accent/5 p-5">
                    <CheckCircle className="h-6 w-6 text-accent shrink-0 mt-0.5" />
                    <div>
                      <p className="font-heading text-lg font-bold uppercase tracking-wide text-foreground mb-1">State: Absolute Verification</p>
                      <p className="text-sm font-medium text-muted-foreground/80">
                        {selectedCandidate.certificates || 0} cryptographic proofs located within the node history. No anomalies detected.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background border border-border/50 p-5">
                      <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-2">Network Hash Score</p>
                      <p className="font-heading text-5xl font-bold">{selectedCandidate.score || selectedCandidate.reputationScore || 0}</p>
                    </div>
                    <div className="bg-background border border-border/50 p-5">
                      <p className="mb-4 font-mono text-xs text-muted-foreground uppercase tracking-widest">Validated Vectors</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidate.skills?.map((skill: string) => (
                          <span key={skill} className="flex items-center gap-1 bg-primary/10 border border-primary/30 px-2 py-1 text-[10px] font-mono font-bold uppercase text-primary">
                            <Star className="h-3 w-3" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-border/50 bg-background">
                  <Button variant="ghost" className="flex-1 rounded-none h-14 font-bold uppercase tracking-widest hover:bg-secondary border-r border-border/50" onClick={() => setSelectedCandidate(null)}>
                    Terminate View
                  </Button>
                  <Button variant="ghost" className="flex-1 rounded-none h-14 font-bold uppercase tracking-widest text-foreground hover:bg-primary/10 hover:text-primary">
                    <Download className="mr-2 h-4 w-4" />
                    Acquire Report
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
