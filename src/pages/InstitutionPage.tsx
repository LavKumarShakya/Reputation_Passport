import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Upload, Users, Award, FileCheck, Loader2 } from 'lucide-react';
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
      toast.error('Title and recipient are required');
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
      toast.error(error.response?.data?.error || 'Failed to issue certificate');
      setIssueStatus('idle');
    }
  };

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
                <Building2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-primary">Institution Portal</span>
              </div>
              <h1 className="font-heading text-3xl font-bold">
                Issue Certificates
              </h1>
              <p className="mt-1 text-muted-foreground">
                Create and manage verifiable on-chain credentials
              </p>
            </div>

            <Button variant="default" onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Issue Certificate
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Award, label: 'Issued', value: isLoading ? '...' : credentials.length },
              { icon: Users, label: 'Recipients', value: isLoading ? '...' : new Set(credentials.map(c => c.userWallet)).size },
              { icon: FileCheck, label: 'Verified', value: isLoading ? '...' : credentials.filter(c => c.verified).length },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl glass p-6"
              >
                <stat.icon className="h-8 w-8 text-primary" />
                <p className="mt-4 stat-number text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Issued Certificates Table */}
          <div className="rounded-2xl glass overflow-hidden">
            <div className="border-b border-border p-4">
              <h2 className="font-heading text-xl font-semibold">Issued Certificates</h2>
            </div>
            <div className="divide-y divide-border">
              {isLoading && <div className="p-8 text-center text-muted-foreground">Loading...</div>}
              {!isLoading && credentials.length === 0 && <div className="p-8 text-center text-muted-foreground">No certificates issued yet.</div>}

              {credentials.map(cert => (
                <div key={cert._id} className="flex items-center justify-between p-4 bg-card/50 hover:bg-card/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{cert.data?.title || cert.category}</p>
                      <p className="font-mono text-sm text-muted-foreground">To: {cert.userWallet.slice(0, 10)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cert.verified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                      {cert.verified ? 'On-Chain' : 'DB Only'}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => cert.txHash && window.open(`https://amoy.polygonscan.com/tx/${cert.txHash}`)}>
                      View Tx
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Modal */}
          {isCreating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
              onClick={() => setIsCreating(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="w-full max-w-lg rounded-2xl glass-strong p-6"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="font-heading text-2xl font-bold">Issue Certificate</h2>
                <p className="text-muted-foreground">Create a new on-chain credential</p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Certificate Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Blockchain Developer Certification"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Recipient Address/ENS</label>
                    <input
                      type="text"
                      placeholder="e.g., alex.eth or 0x..."
                      value={formData.recipient}
                      onChange={e => setFormData({ ...formData, recipient: e.target.value })}
                      className="h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Skills/Metadata</label>
                    <input
                      type="text"
                      placeholder="e.g., Solidity, Smart Contracts"
                      value={formData.skills}
                      onChange={e => setFormData({ ...formData, skills: e.target.value })}
                      className="h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Batch Upload (CSV)</label>
                    <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/30">
                      <div className="text-center">
                        <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                        <p className="mt-1 text-sm text-muted-foreground">Drop CSV or click to upload</p>
                      </div>
                    </div>
                  </div>

                  <OnChainStatus status={issueStatus} txHash={txHash || "0x..."} />
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1"
                    onClick={handleIssue}
                    disabled={issueStatus !== 'idle'}
                  >
                    {issueStatus === 'idle' ? (
                      <>Issue On-Chain</>
                    ) : (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
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
