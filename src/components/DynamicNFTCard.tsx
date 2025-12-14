import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useState, useRef } from 'react';
import { Share2, Sparkles, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User, generateNFTTraits } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface DynamicNFTCardProps {
  user: User;
  onMint?: () => void;
  onShare?: () => void;
  onExport?: () => void;
}

export function DynamicNFTCard({ user, onMint, onShare, onExport }: DynamicNFTCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const traits = generateNFTTraits(user, user.reputationScore);
  
  // Mouse tracking for parallax
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const tierGradients: Record<string, string> = {
    bronze: 'from-amber-700 via-orange-600 to-yellow-700',
    silver: 'from-slate-400 via-gray-300 to-zinc-400',
    gold: 'from-yellow-500 via-amber-400 to-yellow-600',
    platinum: 'from-purple-500 via-violet-400 to-fuchsia-500',
    diamond: 'from-cyan-400 via-blue-400 to-teal-400',
  };

  return (
    <>
      <motion.div
        ref={cardRef}
        onClick={() => setIsExpanded(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        className="relative cursor-pointer"
      >
        {/* Glow effect */}
        <div className={cn(
          "absolute -inset-2 rounded-3xl opacity-50 blur-xl",
          `bg-gradient-to-r ${tierGradients[traits.tier]}`
        )} />
        
        {/* Card container */}
        <div className={cn(
          "relative h-[300px] w-[420px] overflow-hidden rounded-2xl border border-white/10",
          `bg-gradient-to-br ${tierGradients[traits.tier]}`
        )}>
          {/* Glass overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
          
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: traits.particleCount }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-white/40"
                initial={{ 
                  x: Math.random() * 420, 
                  y: Math.random() * 300,
                  opacity: 0 
                }}
                animate={{ 
                  y: [null, -300],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Score ribbon */}
          <motion.div 
            className="absolute left-4 top-4 flex items-center gap-2 rounded-lg bg-black/30 px-3 py-1.5 backdrop-blur-sm"
            style={{ transform: "translateZ(30px)" }}
          >
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="font-mono text-lg font-bold text-white">
              {user.reputationScore}
            </span>
          </motion.div>

          {/* Tier badge */}
          <motion.div 
            className="absolute right-4 top-4 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm"
            style={{ transform: "translateZ(20px)" }}
          >
            {traits.tier}
          </motion.div>

          {/* User info */}
          <motion.div 
            className="absolute bottom-4 left-4 right-4"
            style={{ transform: "translateZ(40px)" }}
          >
            <div className="flex items-end justify-between">
              <div>
                <img 
                  src={user.avatar} 
                  alt={user.displayName}
                  className="mb-2 h-12 w-12 rounded-full border-2 border-white/30"
                />
                <h3 className="font-heading text-xl font-bold text-white">
                  {user.displayName}
                </h3>
                <p className="font-mono text-sm text-white/70">
                  {user.handle}
                </p>
              </div>
              
              {/* Achievement emblems */}
              <div className="flex gap-1">
                {['🏆', '⭐', '🔥'].slice(0, Math.min(traits.badgeCount, 3)).map((emoji, i) => (
                  <motion.div
                    key={i}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-black/30 text-lg backdrop-blur-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Verified badge */}
          {user.verified && (
            <motion.div 
              className="absolute bottom-4 right-4"
              style={{ transform: "translateZ(50px)" }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                ✓
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <div className="mt-6 flex gap-3">
        <Button variant="hero" onClick={onShare} className="flex-1">
          <Share2 className="h-4 w-4" />
          Share Profile
        </Button>
        <Button variant="accent" onClick={onMint}>
          <Sparkles className="h-4 w-4" />
          Mint SBT
        </Button>
        <Button variant="glass" onClick={onExport}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-strong max-w-2xl rounded-2xl p-6"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="mb-4 font-heading text-2xl font-bold">NFT Trait Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Tier</p>
                <p className="font-mono text-lg font-bold capitalize">{traits.tier}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Reputation Score</p>
                <p className="font-mono text-lg font-bold">{user.reputationScore}</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Glow Intensity</p>
                <p className="font-mono text-lg font-bold">{(traits.glowIntensity * 100).toFixed(0)}%</p>
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                <p className="text-sm text-muted-foreground">Badge Count</p>
                <p className="font-mono text-lg font-bold">{traits.badgeCount}</p>
              </div>
            </div>
            <Button variant="glass" className="mt-4 w-full" onClick={() => setIsExpanded(false)}>
              Close
            </Button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
