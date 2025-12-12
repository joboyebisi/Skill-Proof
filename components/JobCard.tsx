import React from 'react';
import { Job } from '../types';
import { MapPin, Star, ArrowRight, Zap, PlayCircle, Building2 } from 'lucide-react';

interface Props {
  job: Job;
  onClick: () => void;
  onUpskill?: () => void;
}

export const JobCard: React.FC<Props> = ({ job, onClick, onUpskill }) => {
  return (
    <div 
        className="group bg-surface rounded-xl border border-white/10 overflow-hidden hover:border-primary/50 transition-all duration-300 flex flex-col h-full relative"
    >
      {/* Tech Partner Badge */}
      {job.techPartner && job.techPartner !== 'None' && (
          <div className="absolute top-0 right-0 bg-secondary/20 text-secondary text-[10px] font-bold px-2 py-1 rounded-bl-lg border-l border-b border-secondary/30 flex items-center gap-1 z-10">
              <Zap size={10} fill="currentColor" /> Partner: {job.techPartner}
          </div>
      )}

      <div className="p-6 flex-1 cursor-pointer" onClick={onClick}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
             {job.logoUrl ? (
                 <img src={job.logoUrl} className="w-12 h-12 rounded-lg bg-white/5 object-cover" alt={job.company} />
             ) : (
                 <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center text-gray-500">
                     <Building2 size={24} />
                 </div>
             )}
             <div>
                <h3 className="font-semibold text-lg text-white group-hover:text-primary transition-colors leading-tight">
                    {job.company}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin size={12} />
                    {job.location}
                </div>
             </div>
          </div>
        </div>

        <h4 className="text-xl font-medium mb-3 leading-tight text-white">{job.title}</h4>
        <p className="text-sm text-gray-400 line-clamp-2 mb-4">
            {job.description}
        </p>

        <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 3).map(s => (
                <span key={s} className="px-2 py-1 bg-white/5 text-gray-300 text-[10px] uppercase tracking-wider font-mono rounded-md border border-white/5">
                    {s}
                </span>
            ))}
        </div>
      </div>

      <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex gap-2">
            <button 
                onClick={onClick}
                className="text-sm font-bold text-white bg-primary hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors"
            >
                Apply
            </button>
            {job.sponsoredLearning && onUpskill && (
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onUpskill();
                    }}
                    className="text-sm font-medium text-secondary hover:text-white border border-secondary/30 hover:border-secondary px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
                >
                    <PlayCircle size={14} /> Upskill
                </button>
            )}
        </div>
        <span className="text-xs font-mono text-gray-500">
            {job.salaryRange || job.type}
        </span>
      </div>
    </div>
  );
};
