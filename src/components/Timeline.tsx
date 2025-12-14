import { motion } from 'framer-motion';
import { Award, GitBranch, Trophy, Users, Folder, ExternalLink, Download, ChevronDown } from 'lucide-react';
import { timelineEvents, TimelineEvent } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  certificate: Award,
  achievement: Trophy,
  endorsement: Users,
  project: Folder,
  hackathon: Trophy,
};

const colorMap: Record<string, string> = {
  certificate: 'bg-accent text-accent-foreground',
  achievement: 'bg-yellow-500 text-yellow-950',
  endorsement: 'bg-pink-500 text-white',
  project: 'bg-purple-500 text-white',
  hackathon: 'bg-orange-500 text-white',
};

interface TimelineItemProps {
  event: TimelineEvent;
  index: number;
}

function TimelineItem({ event, index }: TimelineItemProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[event.type] || Award;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative pl-10"
    >
      {/* Timeline line */}
      <div className="absolute left-4 top-0 h-full w-px bg-border" />
      
      {/* Icon */}
      <div className={cn(
        "absolute left-0 flex h-8 w-8 items-center justify-center rounded-full",
        colorMap[event.type]
      )}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content card */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <time className="font-mono text-xs text-muted-foreground">
                {new Date(event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </time>
              {event.verified && (
                <span className="flex items-center gap-1 rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
                  ✓ Verified
                </span>
              )}
            </div>
            
            <h4 className="font-heading text-lg font-semibold">{event.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
            
            {event.issuer && (
              <p className="mt-2 text-sm">
                <span className="text-muted-foreground">Issued by: </span>
                <span className="font-medium">{event.issuer}</span>
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            className={cn("transition-transform", expanded && "rotate-180")}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 border-t border-border pt-4"
          >
            {event.txHash && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground">Transaction Hash</p>
                <p className="font-mono text-sm">{event.txHash}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              {event.txHash && (
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-1 h-3 w-3" />
                  View on Chain
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Download className="mr-1 h-3 w-3" />
                Download Proof
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export function Timeline() {
  return (
    <div className="space-y-6">
      {timelineEvents.map((event, index) => (
        <TimelineItem key={event.id} event={event} index={index} />
      ))}
    </div>
  );
}
