import { TrendingUp, Award, GitBranch, Users, ArrowUpRight } from 'lucide-react';

interface ReputationPillProps {
  label: string;
  value: number | string;
  icon: 'score' | 'certificates' | 'projects' | 'endorsements';
  sparkline?: number[];
  onClick?: () => void;
}

const icons = {
  score: TrendingUp,
  certificates: Award,
  projects: GitBranch,
  endorsements: Users,
};

export function ReputationPill({ label, value, icon, sparkline, onClick }: ReputationPillProps) {
  const Icon = icons[icon];

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col justify-between border border-border/50 bg-secondary/5 p-6 transition-all hover:bg-secondary/40 hover:border-primary/50 overflow-hidden min-h-[140px] text-left"
    >
      <div className="flex items-start justify-between w-full mb-4">
        <div className="flex h-10 w-10 items-center justify-center border border-border/50 bg-background group-hover:bg-primary/10 group-hover:border-primary/50 transition-colors">
          <Icon className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
        </div>
        <ArrowUpRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
        <p className="font-heading text-3xl font-bold tracking-tight text-foreground">{value}</p>
      </div>

      {/* Decorative scanline on hover */}
      <div className="absolute top-0 right-0 w-1 h-full bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
    </button>
  );
}

export function ReputationStrip({ profileData }: { profileData?: any }) {
  const sparklineData = [12, 8, 15, 22, 18, 25, 30, 28, 35, 42, 38, 45];

  const score = profileData?.user?.reputationScore || 0;
  const credentials = profileData?.credentials || [];
  const certCount = credentials.length;
  
  // Actually count real project and endorsement credentials
  const projectCount = credentials.filter((c: any) => 
    c.category?.toLowerCase().includes('project') || 
    c.category?.toLowerCase().includes('github')
  ).length;

  const endorsementCount = credentials.filter((c: any) => 
    c.category?.toLowerCase().includes('endorsement') || 
    c.category?.toLowerCase().includes('skill')
  ).length;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <ReputationPill
        label="Rep. Score"
        value={score}
        icon="score"
        sparkline={sparklineData}
      />
      <ReputationPill
        label="Verified Proofs"
        value={certCount}
        icon="certificates"
      />
      <ReputationPill
        label="Node Projects"
        value={projectCount}
        icon="projects"
      />
      <ReputationPill
        label="Network Endorses"
        value={endorsementCount}
        icon="endorsements"
      />
    </div>
  );
}
