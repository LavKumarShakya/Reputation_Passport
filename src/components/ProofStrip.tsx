import { Github, Award, Trophy, Wallet } from 'lucide-react';

function BlinkingCursor() {
  return (
    <span className="inline-block font-mono text-xs ml-1 animate-pulse">_</span>
  );
}

export function ProofStrip() {
  const items = [
    { 
      icon: Github, 
      text: 'GitHub connected — 1,284 commits verified',
      hasPulse: true
    },
    { 
      icon: Award, 
      text: '6 certificates hashed on-chain',
      hasPulse: true
    },
    { 
      icon: Trophy, 
      text: '3 hackathons verified',
      hasPulse: true
    },
    { 
      icon: Wallet, 
      text: 'Wallet-bound identity',
      hasPulse: false
    },
  ];

  return (
    <div className="border-t border-slate-900/10 dark:border-slate-100/10 pt-8">
      <div className="flex flex-wrap items-center gap-6">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isLast = index === items.length - 1;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <Icon 
                className={`h-4 w-4 text-muted-foreground ${item.hasPulse ? 'animate-pulse-icon' : ''}`}
              />
              <span className="font-mono text-xs text-muted-foreground">{item.text}</span>
              {isLast && <BlinkingCursor />}
              {index < items.length - 1 && (
                <div className="h-4 w-px bg-border ml-2" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

