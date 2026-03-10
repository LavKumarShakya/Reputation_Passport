import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Search, Filter, CheckCircle, ExternalLink, Download, Star, Briefcase } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

// Removed hardcoded mockCandidates array

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
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-6xl space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Recruiter Portal</span>
              </div>
              <h1 className="font-heading text-3xl font-bold">
                Find Talent
              </h1>
              <p className="mt-1 text-muted-foreground">
                Search and verify candidates with on-chain credentials
              </p>
            </div>

            <Button variant="default">
              Upgrade Plan
            </Button>
          </div>

          {/* Search */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by skill, certification, or name..."
                className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-4 text-lg focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <Button variant="outline" size="lg" className="h-14 px-6">
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </Button>
          </div>

          {/* Results */}
          <div className="grid gap-4">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              candidates.map((candidate, i) => (
                <motion.div
                  key={candidate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-6 rounded-2xl glass p-6 transition-colors hover:bg-secondary"
                >
                  {/* Avatar */}
                  <img
                    src={candidate.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.handle}`}
                    alt={candidate.name}
                    className="h-16 w-16 rounded-full border-2 border-border bg-card"
                  />

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-xl font-semibold">{candidate.name || candidate.displayName}</h3>
                      {candidate.verified && (
                        <CheckCircle className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">{candidate.handle}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {candidate.skills?.map((skill: string) => (
                        <span key={skill} className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="stat-number text-2xl font-bold">{candidate.score || candidate.reputationScore}</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                    <div className="text-center">
                      <p className="stat-number text-2xl font-bold">{candidate.certificates}</p>
                      <p className="text-xs text-muted-foreground">Certs</p>
                    </div>
                    <div className="text-center">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${candidate.tier === 'platinum' ? 'bg-purple-500/20 text-purple-300' :
                        candidate.tier === 'gold' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-slate-500/20 text-slate-300'
                        }`}>
                        {candidate.tier || 'bronze'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedCandidate(candidate)}>
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Verify
                    </Button>
                    <Button variant="default" size="sm">
                      View Profile
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Verify Modal */}
          {selectedCandidate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setSelectedCandidate(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="w-full max-w-lg rounded-2xl glass-strong p-6"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="font-heading text-2xl font-bold">Verification Report</h2>
                <p className="text-muted-foreground">On-chain credentials for {selectedCandidate.name}</p>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-3 rounded-xl bg-accent/10 border border-accent/30 p-4">
                    <CheckCircle className="h-6 w-6 text-accent" />
                    <div>
                      <p className="font-medium text-accent">All credentials verified</p>
                      <p className="text-sm text-muted-foreground">{selectedCandidate.certificates} certificates on-chain</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-secondary/50 p-4">
                    <p className="text-sm text-muted-foreground">Reputation Score</p>
                    <p className="stat-number text-3xl font-bold">{selectedCandidate.score}</p>
                  </div>

                  <div className="rounded-xl bg-secondary/50 p-4">
                    <p className="mb-2 text-sm text-muted-foreground">Top Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.skills.map(skill => (
                        <span key={skill} className="flex items-center gap-1 rounded-full bg-primary/20 px-3 py-1 text-sm font-medium">
                          <Star className="h-3 w-3 text-primary" />
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedCandidate(null)}>
                    Close
                  </Button>
                  <Button variant="default" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
