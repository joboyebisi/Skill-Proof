import React from 'react';
import { CandidateProfile } from '../types';
import { SkillRadar } from './RadarChart';
import { Github, ExternalLink, Code2, BrainCircuit, Activity } from 'lucide-react';

interface Props {
  candidate: CandidateProfile;
  onClose: () => void;
  onHire: () => void;
}

export const ProfileCard: React.FC<Props> = ({ candidate, onClose, onHire }) => {
  return (
    <div className="h-full flex flex-col bg-surface border-l border-surfaceHighlight overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b border-surfaceHighlight relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">✕</button>
        <div className="flex items-center gap-4">
          <img src={candidate.avatarUrl} className="w-16 h-16 rounded-full border-2 border-primary" alt="avatar" />
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {candidate.name}
              <a href={`https://github.com/${candidate.handle}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white">
                <Github size={16} />
              </a>
            </h2>
            <p className="text-sm text-primary">@{candidate.handle}</p>
            <div className="mt-2 flex items-center gap-2">
                <div className="bg-green-900/30 text-green-400 px-2 py-1 rounded text-xs border border-green-800 font-mono">
                    {candidate.matchScore}% Match
                </div>
                {candidate.isUpskilling && (
                   <div className="bg-purple-900/30 text-purple-400 px-2 py-1 rounded text-xs border border-purple-800 font-mono flex items-center gap-1">
                      <BrainCircuit size={12} /> Upskilling
                   </div>
                )}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Radar Chart Section */}
        <div className="bg-surfaceHighlight/30 rounded-xl p-4 border border-surfaceHighlight">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-mono">Multi-dimensional Scoring</h3>
            <div className="h-64 w-full">
                <SkillRadar data={candidate.radarData} />
            </div>
            <div className="text-center text-sm text-gray-400 mt-2 italic">
                "Active researcher with publications in AI."
            </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-surfaceHighlight p-3 rounded-lg text-center border border-surfaceHighlight/50">
                <div className="text-gray-400 text-xs uppercase mb-1">Domain</div>
                <div className="text-2xl font-mono text-cyan-400">x{candidate.domainExpertise.score}</div>
                <div className="text-[10px] text-gray-500 leading-tight mt-1">{candidate.domainExpertise.description}</div>
            </div>
            <div className="bg-surfaceHighlight p-3 rounded-lg text-center border border-surfaceHighlight/50">
                <div className="text-gray-400 text-xs uppercase mb-1">Tech</div>
                <div className="text-2xl font-mono text-purple-400">x{candidate.technicalExpertise.score}</div>
                <div className="text-[10px] text-gray-500 leading-tight mt-1">{candidate.technicalExpertise.description}</div>
            </div>
            <div className="bg-surfaceHighlight p-3 rounded-lg text-center border border-surfaceHighlight/50">
                <div className="text-gray-400 text-xs uppercase mb-1">Behavior</div>
                <div className="text-2xl font-mono text-yellow-400">x{candidate.behavioralPatterns.score}</div>
                <div className="text-[10px] text-gray-500 leading-tight mt-1">{candidate.behavioralPatterns.description}</div>
            </div>
        </div>

        {/* Projects */}
        <div>
            <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-4 font-mono flex items-center gap-2">
                <Code2 size={14} /> Proven Work
            </h3>
            <div className="space-y-3">
                {candidate.projects.map((proj, idx) => (
                    <div key={idx} className="group relative pl-4 border-l-2 border-gray-700 hover:border-primary transition-colors">
                        <h4 className="font-semibold text-gray-200">{proj.name}</h4>
                        <p className="text-sm text-gray-400 mt-1">{proj.description}</p>
                        <div className="flex gap-2 mt-2">
                            {proj.techStack.map(t => (
                                <span key={t} className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded">{t}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Recent Activity */}
        <div className="flex items-center gap-3 p-3 bg-blue-900/10 border border-blue-900/30 rounded-lg">
            <Activity size={16} className="text-blue-400" />
            <div className="text-sm text-blue-200 font-mono">
                pushed <span className="font-bold text-white">wagerx</span> ×2
            </div>
        </div>

      </div>

      {/* Footer Actions */}
      <div className="mt-auto p-6 border-t border-surfaceHighlight flex gap-3">
        <button className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 transition">
            Watchlist
        </button>
        <button onClick={onHire} className="flex-[2] py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-500 transition shadow-[0_0_15px_rgba(22,163,74,0.4)]">
            Import to Greenhouse
        </button>
      </div>
    </div>
  );
};
