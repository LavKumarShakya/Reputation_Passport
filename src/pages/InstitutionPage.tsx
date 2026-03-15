import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Upload, Users, Award, FileCheck, Loader2, Link as LinkIcon, Download } from 'lucide-react';
import { OnChainStatus } from '@/components/OnChainStatus';

import { useAuth } from '@/hooks/useAuth';
import { useIssuerCredentials } from '@/hooks/useProfileData';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function InstitutionPage() {
  const { user } = useAuth();
  const issuerWallet = user?.walletAddress || '0xISSUER_DEFAULT'; // Fallback for dev

  const { credentials, isLoading, setCredentials } = useIssuerCredentials(issuerWallet);

  const [isCreating, setIsCreating] = useState(false);
  const [issueStatus, setIssueStatus] = useState<'idle' | 'hashing' | 'confirming' | 'success'>('idle');
  const [formData, setFormData] = useState({ title: '', recipient: '', skills: '' });
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleIssue = async () => {
    if (!formData.title || !formData.recipient) {
      toast.error('TITLE AND RECIPIENT NODE REQUIRED');
      return;
    }

    setIssueStatus('hashing');
    setTxHash(null);

    try {
      // Create data payload
      const payload = {
        userWallet: formData.recipient,
        issuerWallet: issuerWallet,
        category: 'Certificate',
        data: {
          title: formData.title,
          skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
          issuedAt: new Date().toISOString()
        }
      };

      setIssueStatus('confirming');

      const response = await api.post('/credentials/issue', payload);

      setTxHash(response.data.txHash || '0xabc123... (DB only)');
      setIssueStatus('success');

      // Add the new credential to the top of the list
      setCredentials((prev: any) => [response.data.credential, ...prev]);

      // Close modal after success
      setTimeout(() => {
        setIsCreating(false);
        setIssueStatus('idle');
        setFormData({ title: '', recipient: '', skills: '' });
      }, 2000);

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'FAILED TO EXECUTE CONTRACT');
      setIssueStatus('idle');
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary">
        {/* Background Texture */}
        <div className="fixed inset-0 pointer-events-none z-0 bg-grain mix-blend-overlay opacity-30" />
        
        <div className="container mx-auto px-6 py-12 lg:py-20 relative z-10 max-w-7xl">
          
          {/* Top Editorial Header */}
          <div className="mb-12 border-b-2 border-border/40 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[2px] w-12 bg-primary" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-primary">Institution Portal</span>
              </div>
              <h1 className="font-heading text-5xl md:text-7xl font-bold uppercase tracking-tight leading-[0.9]">
                Anchor <br />
                <span className="text-muted-foreground/80">Authority.</span>
              </h1>
            </div>

            <div className="flex flex-col md:items-end gap-4">
              <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2 border border-border/50 px-3 py-1.5 bg-secondary/10">
                <span className="h-1.5 w-1.5 bg-accent rounded-full animate-pulse-icon" /> 
                System Active
              </div>
              <Button variant="hero" className="rounded-none font-bold uppercase tracking-widest h-12 px-6" onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Mint Credential
              </Button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-bold uppercase tracking-wider mb-8 flex items-center gap-2">
               <Building2 className="h-5 w-5 text-muted-foreground" />
               Issuer Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Award, label: 'Artifacts Minted', value: isLoading ? '...' : credentials.length },
                { icon: Users, label: 'Unique Recipient Nodes', value: isLoading ? '...' : new Set(credentials.map(c => c.userWallet)).size },
                { icon: FileCheck, label: 'Verified On-Chain', value: isLoading ? '...' : credentials.filter(c => c.verified).length },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="border border-border/50 bg-secondary/5 p-6 relative overflow-hidden group hover:bg-secondary/10 transition-colors"
                >
                  <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="flex items-center justify-center w-12 h-12 border border-border/50 bg-background group-hover:border-primary/50 transition-colors">
                      <stat.icon className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="font-heading text-5xl font-bold tracking-tighter text-foreground mb-2">{stat.value}</p>
                    <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Issued Certificates Data Table */}
          <section className="border border-border/50 bg-background relative z-10">
            <div className="border-b border-border/50 p-6 flex items-center justify-between bg-secondary/5">
              <h2 className="font-heading text-2xl font-bold uppercase tracking-wider">Credential Ledger</h2>
              <Button variant="outline" size="sm" className="rounded-none border-border font-mono text-[10px] uppercase hover:bg-secondary">
                <Download className="mr-2 h-3 w-3" /> Export CSV
              </Button>
            </div>
            
            <div className="divide-y divide-border/50">
              {isLoading && (
                <div className="p-12 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground animate-pulse">Querying Immutable Ledger...</p>
                </div>
              )}
              {!isLoading && credentials.length === 0 && (
                <div className="p-12 text-center">
                  <p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">No cryptographic proofs minted yet.</p>
                </div>
              )}

              {credentials.map(cert => (
                <div key={cert._id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-background hover:bg-secondary/10 transition-colors group">
                  <div className="flex items-start md:items-center gap-6 mb-4 md:mb-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-border/50 bg-secondary/20 group-hover:border-primary/50 transition-colors">
                      <Award className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-bold uppercase tracking-wide group-hover:text-primary transition-colors">
                        {cert.data?.title || cert.category}
                      </h3>
                      <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-2">
                        <LinkIcon className="h-3 w-3" />
                        NODE: {cert.userWallet.slice(0, 16)}...
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap md:flex-nowrap items-center gap-4 md:gap-8 ml-18 md:ml-0">
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Timestamp</span>
                      <span className="font-mono text-sm uppercase font-bold text-foreground">
                        {new Date(cert.issuedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Network State</span>
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                        cert.verified 
                          ? 'border-green-500 bg-green-500/10 text-green-500' 
                          : 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {cert.verified ? 'On-Chain' : 'Off-Chain'}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-none border-border font-bold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors h-10 w-full md:w-auto mt-2 md:mt-0"
                      onClick={() => cert.txHash && window.open(`https://amoy.polygonscan.com/tx/${cert.txHash}`)}
                      disabled={!cert.txHash}
                    >
                      Audit Tx
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Issue Modal */}
          {isCreating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
              onClick={() => setIsCreating(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-2xl bg-background border border-border shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="bg-secondary/5 border-b border-border/50 p-6 flex justify-between items-end">
                   <div>
                     <div className="font-mono text-[10px] uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                       <Award className="h-3 w-3" /> Cryptographic Generation
                     </div>
                     <h2 className="font-heading text-3xl font-bold uppercase tracking-tight">Mint Artifact</h2>
                   </div>
                   <div className="text-right">
                     <p className="font-mono text-[10px] text-muted-foreground uppercase">Issuer Node</p>
                     <p className="font-mono text-xs text-foreground uppercase truncate w-32">{issuerWallet}</p>
                   </div>
                </div>

                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">Artifact Designation</label>
                    <input
                      type="text"
                      placeholder="E.G., ADVANCED SOLIDITY DEVELOPER"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="h-14 w-full rounded-none border border-border bg-secondary/30 px-4 font-heading text-lg focus:border-primary focus:bg-background focus:outline-none transition-all uppercase placeholder:text-muted-foreground/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">Target Node (Wallet/ENS)</label>
                    <input
                      type="text"
                      placeholder="0X... OR ALEX.ETH"
                      value={formData.recipient}
                      onChange={e => setFormData({ ...formData, recipient: e.target.value })}
                      className="h-14 w-full rounded-none border border-border bg-secondary/30 px-4 font-mono text-sm focus:border-primary focus:bg-background focus:outline-none transition-all placeholder:text-muted-foreground/30 uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">Encoded Metadata (CSV)</label>
                    <input
                      type="text"
                      placeholder="SMART CONTRACTS, AUDITING, DEFI"
                      value={formData.skills}
                      onChange={e => setFormData({ ...formData, skills: e.target.value })}
                      className="h-14 w-full rounded-none border border-border bg-secondary/30 px-4 font-mono text-sm focus:border-primary focus:bg-background focus:outline-none transition-all placeholder:text-muted-foreground/30 uppercase"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="font-mono text-xs font-bold uppercase tracking-widest text-muted-foreground">Batch Protocol (CSV Matrix)</label>
                    <div className="group flex h-32 cursor-pointer items-center justify-center border-2 border-dashed border-border/50 bg-secondary/10 transition-colors hover:border-primary/50 hover:bg-primary/5">
                      <div className="text-center transition-transform group-hover:scale-105">
                        <Upload className="mx-auto h-6 w-6 text-muted-foreground group-hover:text-primary mb-3" />
                        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground group-hover:text-foreground">Inject CSV Payload</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                     <OnChainStatus status={issueStatus} txHash={txHash || "0x..."} />
                  </div>
                </div>

                <div className="flex border-t border-border/50 bg-background">
                  <Button variant="ghost" className="flex-1 rounded-none h-14 font-bold uppercase tracking-widest hover:bg-secondary border-r border-border/50" onClick={() => setIsCreating(false)}>
                    Abort Sequence
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 rounded-none h-14 font-bold uppercase tracking-widest text-background bg-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                    onClick={handleIssue}
                    disabled={issueStatus !== 'idle'}
                  >
                    {issueStatus === 'idle' ? (
                      <>Execute Anchor</>
                    ) : (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                        Processing
                      </>
                    )}
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
