import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Building2, Plus, Upload, Users, Award, FileCheck, Loader2 } from 'lucide-react';
import { OnChainStatus } from '@/components/OnChainStatus';

const issuedCertificates = [
  { id: '1', title: 'Blockchain Developer Certification', recipient: 'alex.eth', issuedAt: '2024-02-20', status: 'active' },
  { id: '2', title: 'Smart Contract Security', recipient: 'sarah.eth', issuedAt: '2024-01-15', status: 'active' },
  { id: '3', title: 'Web3 Fundamentals', recipient: 'mike.eth', issuedAt: '2024-03-01', status: 'revoked' },
];

export default function InstitutionPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [issueStatus, setIssueStatus] = useState<'idle' | 'hashing' | 'confirming' | 'success'>('idle');

  const handleIssue = async () => {
    setIssueStatus('hashing');
    await new Promise(r => setTimeout(r, 2000));
    setIssueStatus('confirming');
    await new Promise(r => setTimeout(r, 2000));
    setIssueStatus('success');
    await new Promise(r => setTimeout(r, 1500));
    setIssueStatus('idle');
    setIsCreating(false);
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

            <Button variant="hero" onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Issue Certificate
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Award, label: 'Issued', value: '1,247' },
              { icon: Users, label: 'Recipients', value: '892' },
              { icon: FileCheck, label: 'Verified', value: '1,198' },
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
              {issuedCertificates.map(cert => (
                <div key={cert.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{cert.title}</p>
                      <p className="text-sm text-muted-foreground">To: {cert.recipient}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{cert.issuedAt}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      cert.status === 'active' ? 'bg-accent/20 text-accent' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {cert.status}
                    </span>
                    <Button variant="ghost" size="sm">
                      {cert.status === 'active' ? 'Revoke' : 'View'}
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
                      className="h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Recipient Address/ENS</label>
                    <input
                      type="text"
                      placeholder="e.g., alex.eth or 0x..."
                      className="h-12 w-full rounded-xl border border-border bg-secondary/50 px-4 focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Skills/Metadata</label>
                    <input
                      type="text"
                      placeholder="e.g., Solidity, Smart Contracts"
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

                  <OnChainStatus status={issueStatus} txHash="0xissue123...456" />
                </div>

                <div className="mt-6 flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="hero" 
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
