import React from 'react';
import { X, Github, Rocket } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: 'recruiter' | 'candidate') => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in p-4">
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md p-8 relative shadow-2xl shadow-primary/10">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
            <X size={20} />
        </button>

        <div className="text-center mb-8">
            <div className="inline-block p-3 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mb-4 border border-white/5">
                <Rocket className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Sign in to Pye Lab</h2>
            <p className="text-gray-400 text-sm">Access your workspace or recruiting dashboard.</p>
        </div>

        <div className="space-y-6">
            {/* Candidate Flow */}
            <div className="bg-surfaceHighlight/50 p-4 rounded-xl border border-white/5 hover:border-secondary/50 transition-colors group cursor-pointer" onClick={() => onSuccess('candidate')}>
                <div className="flex items-center gap-4">
                    <div className="bg-black p-2 rounded-lg border border-white/10">
                        <Github className="text-white" size={24} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-white group-hover:text-secondary transition-colors">SkillProof (Talent)</h3>
                        <p className="text-xs text-gray-400">Continue with GitHub</p>
                    </div>
                </div>
            </div>

            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">OR</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Recruiter Flow */}
            <div className="bg-surfaceHighlight/50 p-4 rounded-xl border border-white/5 hover:border-primary/50 transition-colors group cursor-pointer" onClick={() => onSuccess('recruiter')}>
                 <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg">
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-white group-hover:text-primary transition-colors">Skill-Recruit (Employer)</h3>
                        <p className="text-xs text-gray-400">Continue with Google</p>
                    </div>
                </div>
            </div>
            
            <p className="text-center text-xs text-gray-600 mt-4">
                Secured by Clerk Authentication
            </p>
        </div>
      </div>
    </div>
  );
};
