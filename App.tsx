import React, { useState, useRef, useEffect } from 'react';
import { ViewState, Job, CandidateProfile, User, Application, LearningModule } from './types';
import { generateJobDescription, analyzeCandidate, askGeminiTutor, analyzeVideoContext } from './services/geminiService';
import { ArrowRight, Video, Upload, Github, Layers, PlayCircle, CheckCircle, ChevronLeft, Search, MapPin, Zap, Users, ShieldCheck, Play, Lock, MessageSquare, Send, Check, Plus, X, Sparkles, MonitorPlay } from 'lucide-react';
import { ProfileCard } from './components/ProfileCard';
import { SkillRadar } from './components/RadarChart';
import { Navbar } from './components/Navbar';
import { JobCard } from './components/JobCard';
import { AuthModal } from './components/AuthModal';
import { MOCK_JOBS, MOCK_CANDIDATES } from './data';

// --- LEARNING MODULES DATA ---
const LEARNING_MODULES: LearningModule[] = [
    {
        id: '1',
        title: 'Distributed Systems & Rust',
        description: 'Deep dive into memory safety and concurrency patterns required for high-frequency trading platforms.',
        thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&q=80',
        videoUrl: 'https://www.youtube.com/embed/zOwk_Y2v0b4', // Example ID
        duration: '45 min',
        skills: ['Rust', 'Concurrency'],
        completed: true,
        partner: 'None'
    },
    {
        id: '2',
        title: 'Building on Circle',
        description: 'Learn how to integrate USDC and programmable wallets into your fintech application.',
        thumbnail: 'https://images.unsplash.com/photo-1622630994105-2026606f3024?w=500&q=80',
        videoUrl: 'https://www.youtube.com/embed/aircAruvnKk', // Placeholder
        duration: '60 min',
        skills: ['Blockchain', 'USDC'],
        completed: false,
        partner: 'Circle'
    },
    {
        id: '3',
        title: 'Autodesk Platform Services',
        description: 'Cloud APIs for design and make data. Automate workflows for CAD.',
        thumbnail: 'https://images.unsplash.com/photo-1581094794329-cd1096a78432?w=500&q=80',
        videoUrl: 'https://www.youtube.com/embed/xpDnVSmNFX0', 
        duration: '90 min',
        skills: ['CAD', 'API'],
        completed: false,
        partner: 'Autodesk'
    }
];

export default function App() {
  const [view, setView] = useState<ViewState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Data State
  const [candidates, setCandidates] = useState<CandidateProfile[]>(MOCK_CANDIDATES);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [applications, setApplications] = useState<Application[]>([]);
  
  // Selection State
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateProfile | null>(null);
  const [activeLearningModule, setActiveLearningModule] = useState<LearningModule>(LEARNING_MODULES[1]);

  // --- SMART JD CREATOR WIZARD STATE ---
  const [jdStep, setJdStep] = useState<1 | 2 | 3 | 4>(1); // 1: Input, 2: Analysis, 3: Partner/Details, 4: Final
  const [jobVideoUrl, setJobVideoUrl] = useState('');
  const [jobDescriptionText, setJobDescriptionText] = useState('');
  const [videoAnalysis, setVideoAnalysis] = useState<any>(null);
  const [generatedJob, setGeneratedJob] = useState<Partial<Job> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Job Detail Fields
  const [jobSalary, setJobSalary] = useState('');
  const [jobLocationType, setJobLocationType] = useState('Remote');
  const [jobRegion, setJobRegion] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<string>('None');
  const [enableSponsoredLearning, setEnableSponsoredLearning] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Candidate Flow State
  const [githubHandle, setGithubHandle] = useState('');
  const [myProfile, setMyProfile] = useState<Partial<CandidateProfile> | null>(null);
  const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<{sender: 'user'|'bot', text: string}[]>([{sender: 'bot', text: 'Hi! I\'m ChatPye. Ask me anything about this video.'}]);
  const [chatInput, setChatInput] = useState('');

  // --- AUTH HANDLERS ---
  const handleLoginSuccess = (role: 'recruiter' | 'candidate') => {
      setUser({
          id: role === 'recruiter' ? 'rec-1' : 'cand-1',
          name: role === 'recruiter' ? 'Sarah Recruiter' : 'Alex Talent',
          email: 'demo@chatpye.com',
          avatarUrl: role === 'recruiter' 
            ? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
            : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
          role
      });
      setShowAuthModal(false);
      if (role === 'recruiter') setView('recruiter-dashboard');
      else setView('candidate-dashboard');
  };

  // --- JD CREATOR LOGIC ---

  const handleStep1Analysis = async () => {
      if(!jobVideoUrl && !jobDescriptionText) return;
      setIsProcessing(true);
      const analysis = await analyzeVideoContext(jobVideoUrl + "\n" + jobDescriptionText);
      setVideoAnalysis(analysis);
      setJdStep(2);
      setIsProcessing(false);
  };

  const handleStep2Confirm = () => {
      setJdStep(3);
  };

  const handleStep3Generate = async () => {
      setIsProcessing(true);
      const jobDraft = await generateJobDescription(videoAnalysis, jobDescriptionText);
      setGeneratedJob({
          ...jobDraft,
          location: jobRegion || 'Global',
          type: jobLocationType as any,
          salaryRange: jobSalary || 'Competitive',
          techPartner: selectedPartner as any,
          sponsoredLearning: enableSponsoredLearning
      });
      setJdStep(4);
      setIsProcessing(false);
  };

  const handlePublishJob = () => {
    if (generatedJob) {
        setJobs(prev => [{...generatedJob, id: `job-${Date.now()}`, matchRating: 0, logoUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop'} as Job, ...prev]);
        setView('recruiter-dashboard');
        // Reset Wizard
        setJdStep(1);
        setJobVideoUrl('');
        setJobDescriptionText('');
        setGeneratedJob(null);
    }
  };
  
  const handleRemoveSkill = (skill: string) => {
      if (generatedJob && generatedJob.skills) {
          setGeneratedJob({
              ...generatedJob,
              skills: generatedJob.skills.filter(s => s !== skill)
          });
      }
  };

  const handleAddSkill = () => {
      if (generatedJob && generatedJob.skills && newSkillInput.trim()) {
          setGeneratedJob({
              ...generatedJob,
              skills: [...generatedJob.skills, newSkillInput.trim()]
          });
          setNewSkillInput('');
      }
  };

  // --- CANDIDATE LOGIC ---

  const handleAnalyzeProfile = async () => {
    if (!githubHandle) return;
    setIsAnalyzingProfile(true);
    // Simulate Gemini Analysis
    const rawDataMock = `User: ${githubHandle}. Name: John Developer. Public Repos: 50. Top languages: TypeScript, Solidity. Recent commits in 'defi-aggregator'. Resume text: Senior Engineer at FinTech startup.`;
    const profile = await analyzeCandidate(githubHandle, rawDataMock);
    
    // Fix: Ensure name is extracted or falls back, but doesn't blindly use handle
    const realName = profile.name || githubHandle;
    
    const newProfile = { 
        ...profile, 
        id: 'cand-new',
        handle: githubHandle, 
        name: realName, 
        avatarUrl: `https://github.com/${githubHandle}.png` 
    };
    setMyProfile(newProfile);
    setIsAnalyzingProfile(false);
    
    // Auto login as this candidate
    setUser({
        id: 'cand-new',
        name: realName,
        email: `${githubHandle}@github.com`,
        avatarUrl: `https://github.com/${githubHandle}.png`,
        role: 'candidate'
    });
    
    setView('candidate-dashboard');
  };

  const handleApply = (jobId: string) => {
      if (!user || user.role !== 'candidate') {
          setShowAuthModal(true);
          return;
      }
      if (!myProfile) {
          setView('candidate-onboarding');
          return;
      }
      
      const newApp: Application = {
          id: `app-${Date.now()}`,
          jobId,
          candidateId: user.id === 'cand-new' && myProfile ? myProfile.id! : '1', 
          status: 'Applied',
          appliedAt: new Date()
      };
      
      setApplications(prev => [...prev, newApp]);
      
      if (myProfile && user.id === 'cand-new') {
          setCandidates(prev => {
              if (prev.find(c => c.id === myProfile.id)) return prev;
              return [myProfile as CandidateProfile, ...prev];
          });
      }

      alert("Application Submitted! The recruiter will see your Gemini Skill Score.");
  };

  const handleUpskillToApply = (job: Job) => {
      // Logic to find relevant module based on partner
      let module = LEARNING_MODULES[0];
      if (job.techPartner === 'Circle') module = LEARNING_MODULES[1];
      if (job.techPartner === 'Autodesk') module = LEARNING_MODULES[2];
      
      setActiveLearningModule(module);
      setView('upskill');
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const userMsg = chatInput;
      setChatMessages(prev => [...prev, {sender: 'user', text: userMsg}]);
      setChatInput('');

      const botResponse = await askGeminiTutor(userMsg, activeLearningModule.title + " " + activeLearningModule.description);
      setChatMessages(prev => [...prev, {sender: 'bot', text: botResponse}]);
  };

  // --- VIEWS ---

  const renderLanding = () => (
    <div className="min-h-screen pt-20">
      <main className="pt-20 pb-16 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
             <div className="lg:col-span-7 flex flex-col gap-8 animate-slide-up">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 w-fit">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-xs font-mono text-primary uppercase tracking-wider">
                        AI-Native Recruiting Ecosystem
                    </span>
                </div>

                <h1 className="md:text-7xl leading-[1.05] text-5xl font-bold text-white tracking-tight font-display">
                    Precision matching for <br />
                    <span className="gradient-text">Modern Engineering.</span>
                </h1>

                <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                    ChatPye connects elite builders with visionary companies. 
                    Stop filtering resumes. Start analyzing code.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    {/* Recruiter CTA */}
                    <button 
                        onClick={() => setView('create-job')}
                        className="group relative h-40 bg-surfaceHighlight border border-white/5 rounded-2xl p-6 flex flex-col justify-between text-left transition-all hover:border-primary hover:shadow-[0_0_20px_rgba(79,70,229,0.2)]"
                    >
                        <div>
                             <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                Skill-Recruit <Layers size={18} className="text-primary"/>
                             </h3>
                             <p className="text-sm text-gray-400">Source builders, not resume writers.</p>
                        </div>
                        <div className="mt-4 bg-primary text-white py-2 px-4 rounded-lg text-center text-sm font-bold opacity-90 group-hover:opacity-100 transition">
                            Start Hiring
                        </div>
                    </button>

                    {/* Candidate CTA */}
                    <button 
                        onClick={() => {
                            setShowHowItWorks(true);
                            setView('candidate-onboarding');
                        }}
                        className="group relative h-40 bg-surfaceHighlight border border-white/5 rounded-2xl p-6 flex flex-col justify-between text-left transition-all hover:border-accent hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                    >
                        <div>
                             <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                                SkillProof <ShieldCheck size={18} className="text-accent"/>
                             </h3>
                             <p className="text-sm text-gray-400">Prove your code quality & Get Hired.</p>
                        </div>
                         <div className="mt-4 bg-white text-black py-2 px-4 rounded-lg text-center text-sm font-bold opacity-90 group-hover:opacity-100 transition">
                            Get Verified
                        </div>
                    </button>
                </div>
             </div>

             <div className="lg:col-span-5 relative h-[500px] hidden lg:block animate-fade-in">
                 <div className="absolute inset-0 bg-surfaceHighlight rounded-2xl overflow-hidden border border-white/5 shadow-2xl shadow-primary/10">
                    <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2940&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 mix-blend-overlay" alt="code" />
                    
                    <div className="absolute bottom-8 left-8 right-8 glass-panel p-6 rounded-xl shadow-2xl">
                         <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="text-xs font-mono text-primary mb-1">CANDIDATE ANALYSIS</div>
                                <div className="font-bold text-white text-lg">Matteo Saponati</div>
                            </div>
                            <div className="bg-success/20 text-success px-2 py-1 rounded text-xs font-mono border border-success/30">98% MATCH</div>
                         </div>
                         <div className="space-y-3">
                             <div className="space-y-1">
                                 <div className="flex justify-between text-xs text-gray-400">
                                     <span>Rust Architecture</span>
                                     <span>Top 1%</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                     <div className="h-full bg-primary w-[99%]"></div>
                                 </div>
                             </div>
                             <div className="space-y-1">
                                 <div className="flex justify-between text-xs text-gray-400">
                                     <span>System Design</span>
                                     <span>Top 5%</span>
                                 </div>
                                 <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                     <div className="h-full bg-secondary w-[95%]"></div>
                                 </div>
                             </div>
                         </div>
                    </div>
                 </div>
             </div>
          </div>
      </main>

      <section className="border-t border-white/5 bg-surface/50">
          <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="flex items-end justify-between mb-8">
                  <div>
                      <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Latest Opportunities</h2>
                      <p className="text-gray-500 text-sm">Premium engineering roles matched by code.</p>
                  </div>
                  <button onClick={() => setView('job-board')} className="text-sm font-medium text-white hover:text-primary flex items-center gap-1 transition-colors">
                      View all jobs <ArrowRight size={14} />
                  </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jobs.slice(0, 3).map(job => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        onClick={() => handleApply(job.id)} 
                        onUpskill={() => handleUpskillToApply(job)}
                      />
                  ))}
              </div>
          </div>
      </section>
    </div>
  );

  const renderCreateJob = () => (
    <div className="max-w-6xl mx-auto py-28 px-4">
        <button onClick={() => setView('landing')} className="mb-8 flex items-center text-gray-500 hover:text-white"><ChevronLeft size={16}/> Back</button>
        
        {/* WIZARD PROGRESS */}
        <div className="flex justify-between mb-8 max-w-2xl mx-auto">
            {[1, 2, 3, 4].map(step => (
                <div key={step} className={`flex items-center gap-2 ${step === jdStep ? 'text-primary' : step < jdStep ? 'text-success' : 'text-gray-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border ${step === jdStep ? 'border-primary bg-primary/20' : step < jdStep ? 'border-success bg-success/20' : 'border-gray-600'}`}>
                        {step < jdStep ? <Check size={16} /> : step}
                    </div>
                    <span className="text-sm hidden md:block">
                        {step === 1 && "Input"}
                        {step === 2 && "Analysis"}
                        {step === 3 && "Details"}
                        {step === 4 && "Review"}
                    </span>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
                {/* STEP 1: INPUT */}
                {jdStep === 1 && (
                    <div className="bg-surfaceHighlight p-6 rounded-xl border border-white/5 animate-fade-in">
                        <h2 className="text-3xl font-bold mb-2 text-white font-display">Deep Research JD</h2>
                        <p className="text-gray-400 mb-8">Paste a product walkthrough video. Our AI identifies the Category, Tech Stack, and compatible Tech Partners.</p>
                        
                        <label className="block text-sm text-gray-400 mb-2">Product Walkthrough URL (YouTube)</label>
                        <input 
                            type="text" 
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none placeholder-gray-600 mb-4"
                            placeholder="https://youtube.com/watch?v=..."
                            value={jobVideoUrl}
                            onChange={(e) => setJobVideoUrl(e.target.value)}
                        />
                        
                        <label className="block text-sm text-gray-400 mb-2">Context / Transcript</label>
                        <textarea 
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white h-32 focus:border-primary focus:outline-none mb-6 placeholder-gray-600"
                            placeholder="We are building a decentralized exchange on Solana..."
                            value={jobDescriptionText}
                            onChange={(e) => setJobDescriptionText(e.target.value)}
                        />

                        <button 
                            onClick={handleStep1Analysis}
                            disabled={isProcessing}
                            className="w-full bg-primary hover:bg-indigo-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
                        >
                            {isProcessing ? "Analyzing Video..." : <><Sparkles size={18} /> Analyze with AI</>}
                        </button>
                    </div>
                )}

                {/* STEP 2: CONFIRM ANALYSIS */}
                {jdStep === 2 && videoAnalysis && (
                    <div className="bg-surfaceHighlight p-6 rounded-xl border border-white/5 animate-fade-in">
                        <h2 className="text-2xl font-bold mb-4 text-white">AI Analysis Result</h2>
                        <div className="space-y-4 mb-6">
                            <div className="p-3 bg-black/30 rounded-lg">
                                <span className="text-xs text-gray-500 uppercase">Detected Category</span>
                                <div className="text-white font-bold">{videoAnalysis.category}</div>
                            </div>
                            <div className="p-3 bg-black/30 rounded-lg">
                                <span className="text-xs text-gray-500 uppercase">Inferred Tech Stack</span>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {videoAnalysis.inferredTechStack?.map((t: string) => (
                                        <span key={t} className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">{t}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 bg-black/30 rounded-lg">
                                <span className="text-xs text-gray-500 uppercase">Summary</span>
                                <div className="text-gray-300 text-sm">{videoAnalysis.summary}</div>
                            </div>
                        </div>
                        <button onClick={handleStep2Confirm} className="w-full bg-success text-white font-bold py-3 rounded-lg">Confirm & Continue</button>
                    </div>
                )}

                {/* STEP 3: DETAILS & PARTNER */}
                {jdStep === 3 && (
                    <div className="bg-surfaceHighlight p-6 rounded-xl border border-white/5 animate-fade-in">
                         <h2 className="text-2xl font-bold mb-4 text-white">Ecosystem Settings</h2>
                         
                         {/* Partner Selection */}
                         <div className="mb-6">
                             <label className="block text-sm text-gray-400 mb-2">Tech Partner Tagging</label>
                             <select 
                                className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white"
                                value={selectedPartner}
                                onChange={(e) => setSelectedPartner(e.target.value)}
                             >
                                 <option value="None">None</option>
                                 <option value="Circle">Circle (USDC/Web3)</option>
                                 <option value="Autodesk">Autodesk (APS/CAD)</option>
                                 <option value="Solana">Solana (Blockchain)</option>
                                 <option value="Stripe">Stripe (Payments)</option>
                             </select>
                             <p className="text-xs text-gray-500 mt-2">Tagging a partner enables "Upskill to Apply" flows with partner content.</p>
                         </div>

                         {/* Sponsored Learning */}
                         <div className="flex items-center gap-3 mb-6 p-3 bg-black/30 rounded-lg border border-white/5">
                             <input 
                                type="checkbox" 
                                className="w-5 h-5 accent-primary"
                                checked={enableSponsoredLearning}
                                onChange={e => setEnableSponsoredLearning(e.target.checked)}
                             />
                             <div>
                                 <div className="text-white font-medium">Sponsor Learning Plan</div>
                                 <div className="text-xs text-gray-500">Allow candidates to watch videos to qualify.</div>
                             </div>
                         </div>

                         {/* Standard Fields */}
                         <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Salary</label>
                                <input type="text" className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white" value={jobSalary} onChange={e => setJobSalary(e.target.value)} placeholder="$140k" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Region</label>
                                <input type="text" className="w-full bg-black/50 border border-gray-700 rounded-lg p-2 text-white" value={jobRegion} onChange={e => setJobRegion(e.target.value)} placeholder="US / Remote" />
                            </div>
                         </div>

                         <button onClick={handleStep3Generate} disabled={isProcessing} className="w-full bg-primary text-white font-bold py-3 rounded-lg">
                             {isProcessing ? "Drafting JD..." : "Generate Final JD"}
                         </button>
                    </div>
                )}
            </div>

            {/* PREVIEW AREA */}
            <div className="relative">
                {generatedJob ? (
                    <div className="bg-surface border border-white/10 p-6 rounded-xl animate-fade-in h-full overflow-y-auto max-h-[800px] shadow-2xl flex flex-col gap-6">
                        
                        {/* Header */}
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-2xl font-bold text-white font-display">{generatedJob.title}</h3>
                                <div className="flex gap-2 mt-2">
                                    <span className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded border border-blue-800/50">{generatedJob.type}</span>
                                    {generatedJob.techPartner && generatedJob.techPartner !== 'None' && (
                                        <span className="bg-purple-900/30 text-purple-300 text-xs px-2 py-1 rounded border border-purple-800/50 flex items-center gap-1">
                                            <Zap size={10} /> {generatedJob.techPartner}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Editable Company Description */}
                        <div>
                             <label className="block text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">About Us</label>
                             <textarea 
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-gray-300 text-sm leading-relaxed min-h-[80px] focus:border-primary focus:outline-none"
                                value={generatedJob.companyDescription || ''}
                                onChange={(e) => setGeneratedJob({...generatedJob, companyDescription: e.target.value})}
                             />
                        </div>

                        {/* Editable Description */}
                        <div>
                             <label className="block text-xs text-gray-400 mb-2 uppercase font-bold tracking-wider">Role Description</label>
                             <textarea 
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-gray-300 text-sm leading-relaxed min-h-[200px] focus:border-primary focus:outline-none"
                                value={generatedJob.description || ''}
                                onChange={(e) => setGeneratedJob({...generatedJob, description: e.target.value})}
                             />
                        </div>
                        
                        {/* Editable Skills */}
                        <div>
                            <h4 className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Required Skills</h4>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {generatedJob.skills?.map(s => (
                                    <div key={s} className="bg-surfaceHighlight px-3 py-1.5 rounded-full text-xs text-gray-300 border border-white/10 flex items-center gap-2 group">
                                        {s}
                                        <button onClick={() => handleRemoveSkill(s)} className="hover:text-red-400"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                                    placeholder="Add skill..."
                                    value={newSkillInput}
                                    onChange={(e) => setNewSkillInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                />
                                <button onClick={handleAddSkill} className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white">
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        <button onClick={handlePublishJob} className="w-full bg-success hover:bg-emerald-600 text-white py-3 rounded-lg font-bold shadow-lg shadow-success/20 transition-all mt-auto">
                            Publish to Skill-Recruit
                        </button>
                    </div>
                ) : (
                    <div className="h-full border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-600 flex-col min-h-[400px]">
                        {isProcessing ? (
                             <div className="text-center">
                                 <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                                 <p className="animate-pulse">Deep Researching...</p>
                             </div>
                        ) : (
                            <>
                                <Upload size={48} className="mb-4 opacity-50" />
                                <p>AI Analysis Preview</p>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );

  const renderCandidateOnboarding = () => (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-xl w-full relative z-10 text-center">
            <h1 className="text-4xl font-bold mb-4 font-display text-white">Verify your Engineering Skill</h1>
            <p className="text-gray-400 mb-8">
                Connect your GitHub to generate a verified skill profile. 
                Our Gemini AI analyzes code quality, architectural patterns, and contribution consistency.
            </p>

            <div className="bg-surface border border-white/10 p-2 rounded-xl flex gap-2 shadow-2xl mb-8">
                <div className="bg-black/50 flex items-center justify-center px-4 rounded-lg border border-white/5">
                    <Github className="text-white" size={20} />
                </div>
                <input 
                    type="text" 
                    className="bg-transparent flex-1 text-white p-3 focus:outline-none placeholder-gray-600"
                    placeholder="github_username"
                    value={githubHandle}
                    onChange={(e) => setGithubHandle(e.target.value)}
                />
                <button 
                    onClick={handleAnalyzeProfile}
                    disabled={isAnalyzingProfile || !githubHandle}
                    className="bg-primary hover:bg-indigo-500 text-white px-6 rounded-lg font-bold transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {isAnalyzingProfile ? 'Analyzing...' : <>Analyze <ArrowRight size={16} /></>}
                </button>
            </div>
            
            <button onClick={() => setView('landing')} className="text-sm text-gray-500 hover:text-white">Cancel</button>
        </div>
      </div>
  );

  const renderCandidateDashboard = () => (
    <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-8">
              {/* Sidebar Profile */}
              <div className="lg:col-span-4 space-y-6">
                 <div className="bg-surface border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <img src={user?.avatarUrl} className="w-16 h-16 rounded-full border-2 border-white/10" alt="me" />
                        <div>
                            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                            <p className="text-sm text-primary">Full-Stack Engineer</p>
                        </div>
                    </div>
                    
                    {myProfile && myProfile.radarData && (
                        <>
                            <div className="h-64 mb-6">
                                <SkillRadar data={myProfile.radarData} color="#4f46e5" />
                            </div>
                            <div className="space-y-4">
                                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="text-xs text-gray-400 uppercase mb-1">Top Skill</div>
                                    <div className="font-bold text-white">System Design (98th percentile)</div>
                                </div>
                            </div>
                        </>
                    )}
                 </div>

                 <button onClick={() => setView('upskill')} className="w-full py-4 bg-secondary/10 border border-secondary/20 rounded-xl text-secondary font-bold hover:bg-secondary/20 transition flex items-center justify-center gap-2">
                    <PlayCircle size={20} /> Open Learning Plan
                 </button>
              </div>

              {/* Main Feed */}
              <div className="lg:col-span-8 space-y-8">
                  <div>
                      <h2 className="text-2xl font-bold text-white mb-6">Recommended Roles</h2>
                      <div className="grid gap-4">
                          {jobs.slice(0, 3).map(job => (
                              <JobCard 
                                key={job.id} 
                                job={job} 
                                onClick={() => handleApply(job.id)}
                                onUpskill={() => handleUpskillToApply(job)}
                              />
                          ))}
                      </div>
                  </div>
                  
                  {applications.length > 0 && (
                      <div>
                          <h2 className="text-2xl font-bold text-white mb-6">Active Applications</h2>
                           <div className="bg-surface border border-white/10 rounded-xl overflow-hidden">
                               <table className="w-full text-left">
                                   <thead className="bg-white/5 text-gray-400 text-sm">
                                       <tr>
                                           <th className="p-4">Role</th>
                                           <th className="p-4">Company</th>
                                           <th className="p-4">Status</th>
                                           <th className="p-4">Date</th>
                                       </tr>
                                   </thead>
                                   <tbody className="text-gray-300 text-sm">
                                       {applications.map(app => {
                                           const job = jobs.find(j => j.id === app.jobId);
                                           return (
                                               <tr key={app.id} className="border-t border-white/5 hover:bg-white/5">
                                                   <td className="p-4 font-medium text-white">{job?.title}</td>
                                                   <td className="p-4">{job?.company}</td>
                                                   <td className="p-4">
                                                       <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded text-xs border border-blue-800">
                                                           {app.status}
                                                       </span>
                                                   </td>
                                                   <td className="p-4">{app.appliedAt.toLocaleDateString()}</td>
                                               </tr>
                                           )
                                       })}
                                   </tbody>
                               </table>
                           </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
  );

  const renderRecruiterDashboard = () => (
      <div className="min-h-screen pt-24 pb-12 px-6 max-w-[1600px] mx-auto h-screen flex flex-col box-border">
          <div className="flex justify-between items-center mb-8 shrink-0">
              <div>
                <h1 className="text-3xl font-bold text-white">Recruiting Dashboard</h1>
                <p className="text-gray-400">AI-Ranked Candidates for your active roles.</p>
              </div>
              <button onClick={() => setView('create-job')} className="bg-primary hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition shadow-lg shadow-primary/20">
                  <Video size={18} /> New AI Job Post
              </button>
          </div>

          <div className="flex gap-6 flex-1 overflow-hidden min-h-0">
              {/* Candidates List */}
              <div className={`bg-surface border border-white/10 rounded-xl flex flex-col overflow-hidden transition-all duration-300 ${selectedCandidate ? 'w-2/3' : 'w-full'}`}>
                   <div className="p-4 border-b border-white/10 flex gap-4 shrink-0">
                       <div className="relative flex-1">
                           <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                           <input type="text" placeholder="Filter by skill, role, or score..." className="w-full bg-black/30 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary" />
                       </div>
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 space-y-3">
                       {candidates.map(candidate => (
                           <div 
                                key={candidate.id}
                                onClick={() => setSelectedCandidate(candidate)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center gap-4 group ${selectedCandidate?.id === candidate.id ? 'bg-primary/10 border-primary' : 'bg-surfaceHighlight border-transparent hover:border-white/20'}`}
                           >
                               <img src={candidate.avatarUrl} className="w-12 h-12 rounded-full bg-gray-800" alt="avatar" />
                               <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-center mb-1">
                                       <h3 className="font-bold text-white truncate">{candidate.name}</h3>
                                       <span className="text-green-400 font-mono text-sm font-bold bg-green-900/20 px-2 py-0.5 rounded border border-green-900/50">{candidate.matchScore}%</span>
                                   </div>
                                   <p className="text-xs text-gray-400 truncate mb-2">{candidate.summary}</p>
                                   <div className="flex gap-2">
                                       {candidate.projects?.[0]?.techStack.slice(0, 3).map(t => (
                                           <span key={t} className="text-[10px] bg-black/40 text-gray-300 px-1.5 py-0.5 rounded">{t}</span>
                                       ))}
                                   </div>
                               </div>
                               <ArrowRight size={16} className={`text-gray-600 transition-transform ${selectedCandidate?.id === candidate.id ? 'text-primary translate-x-1' : 'group-hover:text-white'}`} />
                           </div>
                       ))}
                   </div>
              </div>

              {/* Detail View */}
              {selectedCandidate && (
                  <div className="w-1/3 animate-slide-in-right h-full overflow-hidden">
                      <ProfileCard 
                        candidate={selectedCandidate} 
                        onClose={() => setSelectedCandidate(null)}
                        onHire={() => alert(`Imported ${selectedCandidate.name} to ATS!`)}
                      />
                  </div>
              )}
          </div>
      </div>
  );

  const renderJobBoard = () => (
      <div className="min-h-screen pt-24 pb-12 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-12">
               <h1 className="text-4xl font-bold text-white mb-4">Explore Opportunities</h1>
               <p className="text-gray-400 max-w-2xl mx-auto">Find roles where your actual coding skills matter more than your resume keywords.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onClick={() => handleApply(job.id)} 
                    onUpskill={() => handleUpskillToApply(job)}
                  />
              ))}
          </div>
      </div>
  );

  const renderUpskill = () => {
    const completed = LEARNING_MODULES.filter(m => m.completed).length;
    const total = LEARNING_MODULES.length;
    const upskillProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return (
    <div className="max-w-7xl mx-auto py-28 px-4">
        <div className="flex justify-between items-center mb-6">
            <button onClick={() => setView('candidate-dashboard')} className="flex items-center text-gray-500 hover:text-white w-fit"><ChevronLeft size={16}/> Back to Dashboard</button>
            <div className="text-right">
              <div className="text-2xl font-mono text-secondary font-bold">{upskillProgress}%</div>
              <div className="text-xs text-gray-500">Total Progress</div>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Player */}
            <div className="lg:col-span-8 space-y-4">
                 <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                     <iframe 
                        width="100%" 
                        height="100%" 
                        src={activeLearningModule.videoUrl} 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                     ></iframe>
                 </div>
                 <div>
                     <h1 className="text-2xl font-bold text-white mb-2">{activeLearningModule.title}</h1>
                     <p className="text-gray-400 leading-relaxed">{activeLearningModule.description}</p>
                     
                     {/* Partner Badge */}
                     {activeLearningModule.partner && activeLearningModule.partner !== 'None' && (
                         <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 bg-secondary/10 border border-secondary/20 rounded-lg text-secondary text-sm font-bold">
                             <Zap size={14} /> Powered by {activeLearningModule.partner}
                         </div>
                     )}
                 </div>
            </div>

            {/* Chat & Playlist Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                {/* AI Chat */}
                <div className="bg-surface border border-white/10 rounded-xl flex flex-col h-[400px]">
                    <div className="p-3 border-b border-white/10 bg-white/5 font-bold flex items-center gap-2">
                        <MessageSquare size={16} /> ChatPye Tutor
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white/10 text-gray-200'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleChatSubmit} className="p-3 border-t border-white/10 flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
                            placeholder="Ask about the video..."
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                        />
                        <button type="submit" className="bg-primary p-2 rounded-lg text-white hover:bg-indigo-500">
                            <Send size={16} />
                        </button>
                    </form>
                </div>

                {/* Playlist */}
                <div className="bg-surface border border-white/10 rounded-xl p-4">
                    <h3 className="text-sm font-bold mb-3 text-gray-400 uppercase">Up Next</h3>
                    <div className="space-y-2">
                        {LEARNING_MODULES.map((module, idx) => (
                            <div 
                                key={module.id} 
                                onClick={() => setActiveLearningModule(module)}
                                className={`flex gap-3 p-2 rounded-lg cursor-pointer transition-colors ${activeLearningModule.id === module.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                                <div className="text-xs text-gray-500 mt-1 w-4">{idx + 1}</div>
                                <div className="flex-1">
                                    <h4 className={`text-sm font-medium line-clamp-1 ${activeLearningModule.id === module.id ? 'text-secondary' : 'text-gray-300'}`}>
                                        {module.title}
                                    </h4>
                                    <span className="text-xs text-gray-500">{module.duration}</span>
                                </div>
                                {module.completed && <CheckCircle size={14} className="text-success" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
  };

  const renderGenericPage = (title: string, content: React.ReactNode) => (
      <div className="min-h-screen pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold font-display mb-6 text-white">{title}</h1>
              <div className="text-gray-400 space-y-4 leading-relaxed">
                  {content}
              </div>
              <button onClick={() => setView('landing')} className="mt-8 text-primary hover:text-white transition flex items-center gap-2">
                  <ArrowRight size={16} className="rotate-180" /> Back Home
              </button>
          </div>
      </div>
  );

  return (
    <>
        <Navbar 
            user={user} 
            onLogin={() => setShowAuthModal(true)} 
            setView={setView} 
            currentView={view}
        />
        <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)}
            onSuccess={handleLoginSuccess}
        />
        
        {view === 'landing' && renderLanding()}
        {view === 'create-job' && renderCreateJob()}
        {view === 'candidate-onboarding' && renderCandidateOnboarding()}
        {view === 'candidate-dashboard' && renderCandidateDashboard()}
        {view === 'upskill' && renderUpskill()}
        {view === 'recruiter-dashboard' && renderRecruiterDashboard()}
        {view === 'job-board' && renderJobBoard()}
        
        {view === 'pricing' && renderGenericPage('Pricing Plans', (
            <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
                {/* PRO TIER */}
                <div className="p-8 bg-surface border-2 border-primary/50 rounded-2xl hover:border-primary transition relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">RECOMMENDED</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Pro Tier</h3>
                    <p className="text-gray-400 text-sm mb-4">For Growing Teams</p>
                    <div className="text-4xl font-bold mb-6 text-primary">$299<span className="text-lg text-gray-500 font-normal">/month</span></div>
                    
                    <ul className="space-y-4 text-sm text-gray-300 mb-8">
                        <li className="flex items-center gap-3"><Check size={18} className="text-success"/> 10 Team Seats</li>
                        <li className="flex items-center gap-3"><Check size={18} className="text-success"/> Standard SkillProof Verification</li>
                        <li className="flex items-center gap-3"><Check size={18} className="text-success"/> Talent Shortlist Dashboard</li>
                        <li className="flex items-center gap-3"><Check size={18} className="text-success"/> AI Job Description Creator</li>
                    </ul>
                    <button className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-primary/20">
                        Get Started
                    </button>
                </div>

                {/* ENTERPRISE */}
                <div className="p-8 bg-surface border border-white/10 rounded-2xl hover:border-white/30 transition">
                    <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
                    <p className="text-gray-400 text-sm mb-4">For Large Organizations</p>
                    <div className="text-4xl font-bold mb-6 text-white">Custom</div>
                    
                    <ul className="space-y-4 text-sm text-gray-300 mb-8">
                        <li className="flex items-center gap-3"><Check size={18} className="text-gray-400"/> Unlimited Seats</li>
                        <li className="flex items-center gap-3"><Check size={18} className="text-gray-400"/> API Integration & SSO</li>
                        <li className="flex items-center gap-3"><Check size={18} className="text-gray-400"/> Dedicated Talent Pools</li>
                        <li className="flex items-center gap-3"><Check size={18} className="text-gray-400"/> Custom Tech Partner Learning Tracks</li>
                    </ul>
                    <button className="w-full py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition">
                        Contact Sales
                    </button>
                </div>
            </div>
        ))}
        
        {view === 'features' && renderGenericPage('Platform Features', (
             <div className="grid md:grid-cols-2 gap-8 mt-8">
                 <div className="p-6 bg-surfaceHighlight rounded-xl">
                     <h3 className="text-xl font-bold text-white mb-2">Video-to-JD</h3>
                     <p>Paste a YouTube link or Loom video. Our AI watches it, extracts the tech stack, and writes a perfect job description.</p>
                 </div>
                 <div className="p-6 bg-surfaceHighlight rounded-xl">
                     <h3 className="text-xl font-bold text-white mb-2">GitHub Deep Analysis</h3>
                     <p>We don't just count commits. We analyze code quality, architectural patterns, and consistency to score candidates.</p>
                 </div>
                 <div className="p-6 bg-surfaceHighlight rounded-xl">
                     <h3 className="text-xl font-bold text-white mb-2">Upskill to Apply</h3>
                     <p>Candidates can watch curated content to fill skill gaps. Our AI tutor helps them learn faster.</p>
                 </div>
             </div>
        ))}
        {view === 'enterprise' && renderGenericPage('Enterprise Solutions', (
            <div className="bg-surfaceHighlight p-8 rounded-xl border border-white/10 text-center">
                <h3 className="text-2xl font-bold text-white mb-4">Custom Integration</h3>
                <p className="max-w-lg mx-auto mb-6">Connect ChatPye directly to Greenhouse, Lever, or Workday. We offer SSO, dedicated support, and custom AI model fine-tuning.</p>
                <button className="bg-white text-black px-6 py-3 rounded-lg font-bold">Contact Sales</button>
            </div>
        ))}
    </>
  );
}