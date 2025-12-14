// Mock data for the On-Chain Reputation Passport

export interface User {
  id: string;
  displayName: string;
  handle: string;
  avatar: string;
  email: string;
  walletAddress: string;
  ensName: string | null;
  reputationScore: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  joinedAt: string;
  verified: boolean;
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issuerLogo: string;
  issuedAt: string;
  expiresAt: string | null;
  verified: boolean;
  txHash: string;
  metadata: {
    grade?: string;
    skills?: string[];
    duration?: string;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  earnedAt: string;
  progress: number;
  maxProgress: number;
  claimed: boolean;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  commits: number;
  url: string;
}

export interface GitHubStats {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  contributionStreak: number;
  topLanguages: { name: string; percentage: number }[];
  commitHistory: number[];
}

export interface Endorsement {
  id: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  skill: string;
  message: string;
  createdAt: string;
  txHash: string;
}

export interface TimelineEvent {
  id: string;
  type: 'certificate' | 'achievement' | 'endorsement' | 'project' | 'hackathon';
  title: string;
  description: string;
  issuer?: string;
  date: string;
  txHash?: string;
  verified: boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'certificate' | 'project' | 'hackathon' | 'endorsement' | 'skill';
  value: number;
  color: string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

// Current user mock
export const currentUser: User = {
  id: 'user-001',
  displayName: 'Alex Chen',
  handle: 'alexchen.eth',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
  email: 'alex@example.com',
  walletAddress: '0x1234...5678',
  ensName: 'alexchen.eth',
  reputationScore: 847,
  tier: 'gold',
  joinedAt: '2023-06-15',
  verified: true,
};

// Mock certificates
export const certificates: Certificate[] = [
  {
    id: 'cert-001',
    title: 'Introduction to Machine Learning',
    issuer: 'Coursera',
    issuerLogo: '🎓',
    issuedAt: '2024-01-15',
    expiresAt: null,
    verified: true,
    txHash: '0xabc123...def456',
    metadata: {
      grade: 'A+',
      skills: ['Python', 'TensorFlow', 'Neural Networks'],
      duration: '8 weeks',
    },
  },
  {
    id: 'cert-002',
    title: 'Blockchain Developer Certification',
    issuer: 'Ethereum Foundation',
    issuerLogo: '⟠',
    issuedAt: '2024-02-20',
    expiresAt: '2026-02-20',
    verified: true,
    txHash: '0x789abc...123def',
    metadata: {
      skills: ['Solidity', 'Smart Contracts', 'Web3.js'],
      duration: '12 weeks',
    },
  },
  {
    id: 'cert-003',
    title: 'AWS Solutions Architect',
    issuer: 'Amazon Web Services',
    issuerLogo: '☁️',
    issuedAt: '2023-11-10',
    expiresAt: '2026-11-10',
    verified: true,
    txHash: '0xdef789...abc123',
    metadata: {
      grade: 'Professional',
      skills: ['Cloud Architecture', 'EC2', 'Lambda', 'S3'],
    },
  },
  {
    id: 'cert-004',
    title: 'Full Stack Web Development',
    issuer: 'freeCodeCamp',
    issuerLogo: '🔥',
    issuedAt: '2023-08-05',
    expiresAt: null,
    verified: true,
    txHash: '0x456def...789abc',
    metadata: {
      skills: ['React', 'Node.js', 'MongoDB', 'Express'],
      duration: '300 hours',
    },
  },
];

// Mock achievements
export const achievements: Achievement[] = [
  {
    id: 'ach-001',
    title: 'First Commit',
    description: 'Made your first commit on GitHub',
    icon: '🚀',
    rarity: 'common',
    earnedAt: '2023-06-20',
    progress: 1,
    maxProgress: 1,
    claimed: true,
  },
  {
    id: 'ach-002',
    title: 'Open Source Contributor',
    description: 'Contributed to 10+ open source projects',
    icon: '⭐',
    rarity: 'rare',
    earnedAt: '2024-01-10',
    progress: 12,
    maxProgress: 10,
    claimed: true,
  },
  {
    id: 'ach-003',
    title: 'Hackathon Winner',
    description: 'Won first place in a major hackathon',
    icon: '🏆',
    rarity: 'epic',
    earnedAt: '2024-03-15',
    progress: 1,
    maxProgress: 1,
    claimed: true,
  },
  {
    id: 'ach-004',
    title: 'Code Streak Master',
    description: 'Maintained a 100-day coding streak',
    icon: '🔥',
    rarity: 'legendary',
    earnedAt: '2024-02-28',
    progress: 100,
    maxProgress: 100,
    claimed: true,
  },
  {
    id: 'ach-005',
    title: 'Bug Hunter',
    description: 'Found and reported 5 bugs in production',
    icon: '🐛',
    rarity: 'uncommon',
    earnedAt: '2023-12-01',
    progress: 5,
    maxProgress: 5,
    claimed: true,
  },
  {
    id: 'ach-006',
    title: 'Community Leader',
    description: 'Received 50 endorsements from peers',
    icon: '👥',
    rarity: 'rare',
    earnedAt: '',
    progress: 34,
    maxProgress: 50,
    claimed: false,
  },
];

// Mock repositories
export const repositories: Repository[] = [
  {
    id: 'repo-001',
    name: 'defi-protocol',
    description: 'A decentralized finance protocol for lending and borrowing',
    language: 'Solidity',
    stars: 234,
    forks: 45,
    commits: 189,
    url: 'https://github.com/alexchen/defi-protocol',
  },
  {
    id: 'repo-002',
    name: 'ml-pipeline',
    description: 'End-to-end machine learning pipeline with MLflow',
    language: 'Python',
    stars: 156,
    forks: 32,
    commits: 267,
    url: 'https://github.com/alexchen/ml-pipeline',
  },
  {
    id: 'repo-003',
    name: 'react-dashboard',
    description: 'Modern admin dashboard with React and Tailwind',
    language: 'TypeScript',
    stars: 89,
    forks: 21,
    commits: 145,
    url: 'https://github.com/alexchen/react-dashboard',
  },
];

// Mock GitHub stats
export const githubStats: GitHubStats = {
  totalCommits: 1247,
  totalPRs: 89,
  totalIssues: 45,
  contributionStreak: 47,
  topLanguages: [
    { name: 'TypeScript', percentage: 35 },
    { name: 'Python', percentage: 28 },
    { name: 'Solidity', percentage: 20 },
    { name: 'JavaScript', percentage: 12 },
    { name: 'Rust', percentage: 5 },
  ],
  commitHistory: [12, 8, 15, 22, 18, 25, 30, 28, 35, 42, 38, 45],
};

// Mock endorsements
export const endorsements: Endorsement[] = [
  {
    id: 'end-001',
    fromUser: {
      id: 'user-002',
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      verified: true,
    },
    skill: 'Smart Contract Development',
    message: 'Alex built an excellent DeFi protocol. Highly recommend for blockchain work.',
    createdAt: '2024-03-10',
    txHash: '0x111222...333444',
  },
  {
    id: 'end-002',
    fromUser: {
      id: 'user-003',
      name: 'Mike Peters',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      verified: true,
    },
    skill: 'Machine Learning',
    message: 'Outstanding ML engineering skills. Created a production-ready pipeline.',
    createdAt: '2024-02-15',
    txHash: '0x555666...777888',
  },
];

// Mock timeline events
export const timelineEvents: TimelineEvent[] = [
  {
    id: 'event-001',
    type: 'certificate',
    title: 'Blockchain Developer Certification',
    description: 'Completed Ethereum Foundation certification program',
    issuer: 'Ethereum Foundation',
    date: '2024-02-20',
    txHash: '0x789abc...123def',
    verified: true,
  },
  {
    id: 'event-002',
    type: 'hackathon',
    title: 'ETHDenver 2024 Winner',
    description: 'First place in DeFi track with innovative lending protocol',
    issuer: 'ETHDenver',
    date: '2024-03-15',
    txHash: '0xhack123...456',
    verified: true,
  },
  {
    id: 'event-003',
    type: 'certificate',
    title: 'Introduction to Machine Learning',
    description: 'Completed 8-week ML course with distinction',
    issuer: 'Coursera',
    date: '2024-01-15',
    txHash: '0xabc123...def456',
    verified: true,
  },
  {
    id: 'event-004',
    type: 'endorsement',
    title: 'Skill Endorsement',
    description: 'Endorsed for Smart Contract Development by Sarah Johnson',
    date: '2024-03-10',
    txHash: '0x111222...333444',
    verified: true,
  },
  {
    id: 'event-005',
    type: 'project',
    title: 'DeFi Protocol Launch',
    description: 'Launched decentralized lending protocol on Polygon',
    date: '2023-12-01',
    txHash: '0xlaunch...789',
    verified: true,
  },
];

// Mock graph data
export const graphNodes: GraphNode[] = [
  { id: 'center', label: 'Alex Chen', type: 'skill', value: 100, color: '#3B82F6' },
  { id: 'cert-ml', label: 'Machine Learning', type: 'certificate', value: 80, color: '#22C55E' },
  { id: 'cert-blockchain', label: 'Blockchain Dev', type: 'certificate', value: 85, color: '#22C55E' },
  { id: 'cert-aws', label: 'AWS Architect', type: 'certificate', value: 75, color: '#22C55E' },
  { id: 'proj-defi', label: 'DeFi Protocol', type: 'project', value: 90, color: '#8B5CF6' },
  { id: 'proj-ml', label: 'ML Pipeline', type: 'project', value: 70, color: '#8B5CF6' },
  { id: 'hack-eth', label: 'ETHDenver', type: 'hackathon', value: 95, color: '#F59E0B' },
  { id: 'skill-solidity', label: 'Solidity', type: 'skill', value: 60, color: '#EC4899' },
  { id: 'skill-python', label: 'Python', type: 'skill', value: 65, color: '#EC4899' },
  { id: 'skill-react', label: 'React', type: 'skill', value: 55, color: '#EC4899' },
];

export const graphEdges: GraphEdge[] = [
  { source: 'center', target: 'cert-ml', weight: 3 },
  { source: 'center', target: 'cert-blockchain', weight: 4 },
  { source: 'center', target: 'cert-aws', weight: 3 },
  { source: 'center', target: 'proj-defi', weight: 5 },
  { source: 'center', target: 'proj-ml', weight: 3 },
  { source: 'center', target: 'hack-eth', weight: 5 },
  { source: 'cert-blockchain', target: 'proj-defi', weight: 4 },
  { source: 'cert-blockchain', target: 'skill-solidity', weight: 3 },
  { source: 'cert-ml', target: 'proj-ml', weight: 3 },
  { source: 'cert-ml', target: 'skill-python', weight: 2 },
  { source: 'proj-defi', target: 'hack-eth', weight: 4 },
  { source: 'proj-defi', target: 'skill-solidity', weight: 3 },
  { source: 'proj-ml', target: 'skill-python', weight: 2 },
  { source: 'cert-aws', target: 'skill-python', weight: 2 },
];

// Scoring logic (dummy)
export function calculateReputationScore(user: User, certs: Certificate[], achievements: Achievement[]): number {
  let score = 0;
  
  // Base score from certificates
  score += certs.filter(c => c.verified).length * 50;
  
  // Bonus from achievements
  achievements.forEach(a => {
    if (a.claimed) {
      switch (a.rarity) {
        case 'common': score += 10; break;
        case 'uncommon': score += 25; break;
        case 'rare': score += 50; break;
        case 'epic': score += 100; break;
        case 'legendary': score += 200; break;
      }
    }
  });
  
  return Math.min(score, 1000);
}

// Dynamic NFT trait generation
export function generateNFTTraits(user: User, score: number) {
  const tier = score >= 900 ? 'diamond' : score >= 700 ? 'platinum' : score >= 500 ? 'gold' : score >= 300 ? 'silver' : 'bronze';
  
  return {
    tier,
    glowIntensity: score / 1000,
    badgeCount: Math.floor(score / 100),
    backgroundGradient: `nft-gradient-${tier}`,
    animationSpeed: 1 + (score / 500),
    particleCount: Math.floor(score / 50),
  };
}

// Certificate hashing (demo)
export function hashCertificate(cert: Certificate): string {
  const data = JSON.stringify({
    id: cert.id,
    title: cert.title,
    issuer: cert.issuer,
    issuedAt: cert.issuedAt,
  });
  // Simulated hash
  return '0x' + Array.from(data).reduce((hash, char) => {
    return ((hash << 5) - hash + char.charCodeAt(0)) | 0;
  }, 0).toString(16).padStart(64, '0');
}
