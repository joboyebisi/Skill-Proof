import { CandidateProfile, Job } from './types';

export const MOCK_JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Senior Distributed Systems Engineer',
    company: 'Nexus Financial',
    location: 'Zurich, CH (Remote)',
    type: 'Full-time',
    salaryRange: '$140k - $180k',
    description: 'Building the next generation of high-frequency trading infrastructure using Rust and Kafka. We need someone who understands low-latency constraints.',
    requirements: ['Rust', 'Kafka', 'System Design', 'Kubernetes'],
    skills: ['Rust', 'Distributed Systems', 'C++'],
    matchRating: 4.9,
    logoUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3dab?w=100&h=100&fit=crop'
  },
  {
    id: 'j2',
    title: 'AI Product Engineer',
    company: 'Generative Dynamics',
    location: 'Berlin, DE',
    type: 'Full-time',
    salaryRange: '€100k - €130k',
    description: 'Integrate LLMs into our core creative suite. You will work closely with research scientists to productize foundation models.',
    requirements: ['Python', 'React', 'LangChain', 'UX Intuition'],
    skills: ['Python', 'TypeScript', 'GenAI'],
    matchRating: 5.0,
    logoUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop'
  },
  {
    id: 'j3',
    title: 'Blockchain Protocol Developer',
    company: 'EtherLink',
    location: 'Zug, CH',
    type: 'Contract',
    salaryRange: '$120/hr',
    description: 'Core protocol development for a Layer 2 scaling solution. Deep understanding of EVM and ZK-rollups required.',
    requirements: ['Solidity', 'Go', 'Cryptography'],
    skills: ['Solidity', 'Go', 'Cryptography'],
    matchRating: 4.7,
    logoUrl: 'https://images.unsplash.com/photo-1622630994105-2026606f3024?w=100&h=100&fit=crop'
  }
];

export const MOCK_CANDIDATES: CandidateProfile[] = [
  {
    id: '1',
    name: 'Matteo Saponati',
    handle: 'matteosaponati',
    avatarUrl: 'https://picsum.photos/200',
    summary: 'Research Scientist in ML and exotic computing at ETH Zürich. Specialist in fine-tuning foundation models for specialized domains.',
    matchScore: 95,
    domainExpertise: { score: 5, description: "LLM Foundation Models" },
    technicalExpertise: { score: 5, description: "Python, PyTorch, CUDA" },
    behavioralPatterns: { score: 4, description: "Fast Follower, Research-oriented" },
    projects: [
      { name: "LSD finetuning post", description: "Finetuned LLMs for psychedelic research papers analysis.", techStack: ["Python", "LLMs"] },
      { name: "Attention Structures", description: "Deep analysis of transformer attention heads visualization.", techStack: ["PyTorch", "D3.js"] }
    ],
    recentActivity: "pushed to transformers",
    radarData: [
        { subject: 'Clarity', A: 90, fullMark: 100 },
        { subject: 'Builder', A: 95, fullMark: 100 },
        { subject: 'Fast Follower', A: 99, fullMark: 100 },
        { subject: 'Early Adopter', A: 90, fullMark: 100 },
        { subject: 'Peer Recog', A: 85, fullMark: 100 },
    ],
    status: 'Pretraining'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    handle: 'schen_dev',
    avatarUrl: 'https://picsum.photos/201',
    summary: 'Systems Architect focused on scalable distributed infrastructure. Contributor to Kubernetes core.',
    matchScore: 92,
    domainExpertise: { score: 5, description: "Cloud Infrastructure" },
    technicalExpertise: { score: 5, description: "Go, Rust, Kubernetes" },
    behavioralPatterns: { score: 3, description: "Builder, Reliability-focused" },
    projects: [
        { name: "K8s-Autoscaler", description: "Custom autoscaler for high-load clusters.", techStack: ["Go", "Kubernetes"] },
        { name: "Distributed Cache", description: "Raft-based consensus caching system.", techStack: ["Rust"] }
    ],
    recentActivity: "merged PR in kubernetes",
    radarData: [
        { subject: 'Clarity', A: 85, fullMark: 100 },
        { subject: 'Builder', A: 98, fullMark: 100 },
        { subject: 'Fast Follower', A: 70, fullMark: 100 },
        { subject: 'Early Adopter', A: 75, fullMark: 100 },
        { subject: 'Peer Recog', A: 95, fullMark: 100 },
    ],
    status: 'Interview'
  }
];
