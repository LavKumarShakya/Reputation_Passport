import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Link2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'hashing' | 'confirming' | 'success' | 'error';

interface OnChainStatusProps {
  status: Status;
  txHash?: string;
  error?: string;
}

export function OnChainStatus({ status, txHash, error }: OnChainStatusProps) {
  return (
    <AnimatePresence mode="wait">
      {status === 'idle' && null}
      
      {status === 'hashing' && (
        <motion.div
          key="hashing"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-3 rounded-xl bg-secondary p-4"
        >
          <div className="relative">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          </div>
          <div>
            <p className="font-medium">Hashing data...</p>
            <p className="text-sm text-muted-foreground">Creating cryptographic hash</p>
          </div>
        </motion.div>
      )}

      {status === 'confirming' && (
        <motion.div
          key="confirming"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-3 rounded-xl bg-secondary p-4"
        >
          <div className="relative">
            <Link2 className="h-6 w-6 animate-pulse text-primary" />
          </div>
          <div>
            <p className="font-medium">Confirming on-chain...</p>
            <p className="text-sm text-muted-foreground">~15 seconds remaining</p>
          </div>
        </motion.div>
      )}

      {status === 'success' && (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="rounded-xl border border-accent/30 bg-accent/10 p-4"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <CheckCircle className="h-6 w-6 text-accent" />
            </motion.div>
            <div>
              <p className="font-medium text-accent">Successfully recorded on-chain!</p>
              {txHash && (
                <a 
                  href={`https://polygonscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm text-muted-foreground hover:text-primary"
                >
                  {txHash}
                </a>
              )}
            </div>
          </div>
          
          {/* Confetti effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
          >
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-2 w-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#22C55E', '#3B82F6', '#F59E0B', '#EC4899'][i % 4],
                }}
                initial={{ top: '50%', opacity: 1 }}
                animate={{ 
                  top: `${Math.random() * -100}%`,
                  opacity: 0,
                  rotate: Math.random() * 360,
                }}
                transition={{ 
                  duration: 1,
                  delay: i * 0.05,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}

      {status === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="rounded-xl border border-destructive/30 bg-destructive/10 p-4"
        >
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Transaction failed</p>
              <p className="text-sm text-muted-foreground">{error || 'Please try again'}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
