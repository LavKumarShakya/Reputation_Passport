import { TrendingUp, Award, GitBranch, Users } from 'lucide-react';

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
      className="flex flex-1 items-center gap-4 rounded-2xl glass p-4 transition-colors hover:bg-secondary"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>

      <div className="flex-1 text-left">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="stat-number text-2xl font-bold">{value}</p>
      </div>
    </button>
  );
}

export function ReputationStrip() {
  const sparklineData = [12, 8, 15, 22, 18, 25, 30, 28, 35, 42, 38, 45];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <ReputationPill
        label="Reputation Score"
        value={847}
        icon="score"
        sparkline={sparklineData}
      />
      <ReputationPill
        label="Verified Certificates"
        value={4}
        icon="certificates"
      />
      <ReputationPill
        label="Projects"
        value={12}
        icon="projects"
      />
      <ReputationPill
        label="Endorsements"
        value={34}
        icon="endorsements"
      />
    </div>
  );
}
