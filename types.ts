export interface Job {
  id: string;
  title: string;
  company: string;
  companyDescription?: string;
  location: string;
  description: string;
  requirements: string[];
  videoUrl?: string;
  skills: string[];
  type: 'Full-time' | 'Contract' | 'Remote';
  matchRating?: number;
  salaryRange?: string;
  logoUrl?: string;
  // Ecosystem Fields
  techPartner?: 'Circle' | 'Autodesk' | 'Solana' | 'Stripe' | 'None';
  sponsoredLearning?: boolean;
  learningTracks?: string[]; // IDs of learning modules
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: 'recruiter' | 'candidate' | null;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: 'Applied' | 'Reviewing' | 'Interview' | 'Rejected';
  appliedAt: Date;
}

export interface RadarData {
  subject: string;
  A: number; // Candidate Score
  fullMark: number;
}

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string; // YouTube embed URL
  duration: string;
  skills: string[];
  completed: boolean;
  partner?: string;
}

export interface CandidateProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  summary: string;
  matchScore: number;
  domainExpertise: {
    score: number; // 1-5
    description: string;
  };
  technicalExpertise: {
    score: number; // 1-5
    description: string;
  };
  behavioralPatterns: {
    score: number; // 1-5
    description: string;
  };
  projects: {
    name: string;
    description: string;
    techStack: string[];
  }[];
  recentActivity: string;
  radarData: RadarData[];
  status: 'Pretraining' | 'Inference' | 'Interview' | 'Hired';
  isUpskilling?: boolean;
  learningProgress?: number;
}

export type ViewState = 'landing' | 'recruiter-dashboard' | 'create-job' | 'candidate-onboarding' | 'candidate-dashboard' | 'upskill' | 'job-board' | 'pricing' | 'enterprise' | 'features';
