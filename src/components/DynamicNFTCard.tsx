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
    bronze: 'from-amber-700/40 via-orange-600/40 to-yellow-700/40',
    silver: 'from-slate-400/40 via-gray-300/40 to-zinc-400/40',
    gold: 'from-yellow-500/40 via-amber-400/40 to-yellow-600/40',
    platinum: 'from-purple-500/40 via-violet-400/40 to-fuchsia-500/40',
    diamond: 'from-cyan-400/40 via-blue-400/40 to-teal-400/40',
  };

  const tierAccents: Record<string, string> = {
    bronze: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    silver: 'text-slate-300 bg-slate-400/10 border-slate-400/30',
    gold: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    platinum: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    diamond: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
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
        className="relative cursor-pointer group"
      >
        {/* Glow effect */}
        <div className={cn(
          "absolute -inset-4 rounded-none opacity-30 blur-2xl transition-opacity group-hover:opacity-60",
          `bg-gradient-to-r ${tierGradients[traits.tier] || tierGradients.bronze}`
        )} />
        
        {/* Card container */}
        <div className={cn(
          "relative h-[380px] w-[320px] md:w-[380px] overflow-hidden rounded-none border border-border bg-background shadow-2xl",
        )}>
          {/* Holographic background */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-80",
            tierGradients[traits.tier] || tierGradients.bronze
          )} />
          <div className="absolute inset-0 bg-grain mix-blend-overlay opacity-50" />
          
          {/* Inner border */}
          <div className="absolute inset-2 border border-foreground/10" />

          {/* Animated scanlines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute h-[2px] w-full bg-white/20 blur-[1px]"
              animate={{ y: [-10, 400] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div style={{ transform: "translateZ(30px)" }} className="absolute inset-0 p-6 flex flex-col justify-between">
            {/* Top row */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center bg-background border border-border shadow-md">
                  <Sparkles className="h-6 w-6 text-foreground" />
                </div>
                <div className="bg-background/90 backdrop-blur px-4 py-2 border border-border shadow-md">
                  <span className="font-heading text-2xl font-bold text-foreground">
                    {user.reputationScore}
                  </span>
                </div>
              </div>
              
              <div className={cn(
                "px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest backdrop-blur",
                tierAccents[traits.tier] || tierAccents.bronze
              )}>
                {traits.tier}
              </div>
            </div>

            {/* Middle decorative elements */}
            <div className="flex-1 flex items-center justify-center">
               <div className="relative">
                  <img 
                    src={user.avatar || 'https://github.com/shadcn.png'} 
                    alt={user.displayName}
                    className="h-28 w-28 rounded-full border-4 border-background shadow-2xl grayscale contrast-125"
                  />
                  {user.verified && (
                    <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-none bg-primary text-primary-foreground border-2 border-background">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}
               </div>
            </div>

            {/* Bottom info */}
            <div className="p-4 bg-background/95 backdrop-blur border border-border shadow-lg">
              <h3 className="font-heading text-2xl font-bold uppercase tracking-tight truncate text-foreground">
                {user.displayName}
              </h3>
              <div className="flex items-center justify-between mt-2 font-mono text-xs text-muted-foreground uppercase tracking-widest">
                <span>{user.handle}</span>
                <span className="text-primary font-bold">NODE SYS</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CTA Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-3 w-[320px] md:w-[380px]">
        <Button variant="outline" onClick={onShare} className="rounded-none border-border font-mono text-xs uppercase hover:bg-secondary">
          <Share2 className="mr-2 h-4 w-4" /> Share
        </Button>
        <Button variant="outline" onClick={onExport} className="rounded-none border-border font-mono text-xs uppercase hover:bg-secondary">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
        <Button variant="hero" onClick={onMint} className="col-span-2 rounded-none font-bold uppercase tracking-widest h-12">
          <ExternalLink className="mr-2 h-4 w-4" /> View On-Chain
        </Button>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4"
          onClick={() => setIsExpanded(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-secondary/50 border border-border p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-8 flex items-end justify-between border-b border-border/50 pb-4">
              <h2 className="font-heading text-3xl font-bold uppercase tracking-tight">Passport Telemetry</h2>
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest">Raw Data</div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-background border border-border/50 p-4">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">Tier Class</p>
                <p className={cn("font-heading text-xl font-bold uppercase", tierAccents[traits.tier]?.split(' ')[0])}>
                  {traits.tier}
                </p>
              </div>
              <div className="bg-background border border-border/50 p-4">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">Hash Score</p>
                <p className="font-heading text-xl font-bold">{user.reputationScore}</p>
              </div>
              <div className="bg-background border border-border/50 p-4">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">Resonance</p>
                <p className="font-heading text-xl font-bold">{(traits.glowIntensity * 100).toFixed(0)}%</p>
              </div>
              <div className="bg-background border border-border/50 p-4">
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-2">Artifacts</p>
                <p className="font-heading text-xl font-bold">{traits.badgeCount}</p>
              </div>
            </div>
            
            <Button variant="outline" className="mt-8 w-full rounded-none font-mono uppercase tracking-widest" onClick={() => setIsExpanded(false)}>
              Terminate View
            </Button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
