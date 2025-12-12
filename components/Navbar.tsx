import React from 'react';
import { User } from '../types';
import { LogIn, Menu, X, Rocket } from 'lucide-react';

interface Props {
  onLogin: () => void;
  user: User | null;
  setView: (view: any) => void;
  currentView: string;
}

export const Navbar: React.FC<Props> = ({ onLogin, user, setView, currentView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { label: 'Browse Jobs', view: 'job-board' },
    { label: 'Features', view: 'features' },
    { label: 'Pricing', view: 'pricing' },
    { label: 'Enterprise', view: 'enterprise' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView('landing')}
        >
          <div className="w-9 h-9 bg-primary text-white flex items-center justify-center rounded-lg shadow-lg shadow-primary/20 transition-all group-hover:scale-105">
            <Rocket size={18} fill="currentColor" className="text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">
            ChatPye
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <button 
              key={item.label}
              onClick={() => setView(item.view)}
              className={`text-sm font-medium transition-colors hover:text-white ${currentView === item.view ? 'text-white' : 'text-text-muted'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-4">
            <button 
                onClick={() => setView('create-job')}
                className="text-sm font-medium text-white hover:text-primary transition-colors"
            >
                Hire Talents
            </button>
          
          {user ? (
              <div 
                className="flex items-center gap-3 cursor-pointer bg-surfaceHighlight hover:bg-white/10 pl-1 pr-4 py-1 rounded-full border border-white/10 transition-all" 
                onClick={() => setView(user.role === 'recruiter' ? 'recruiter-dashboard' : 'candidate-dashboard')}
              >
                  <img src={user.avatarUrl} className="w-8 h-8 rounded-full border border-white/20" alt="avatar" />
                  <span className="text-sm font-medium text-white">{user.name}</span>
              </div>
          ) : (
              <button 
                onClick={onLogin}
                className="bg-white text-black px-5 py-2.5 text-sm font-bold hover:bg-gray-200 transition-colors duration-300 rounded-lg flex items-center gap-2"
              >
                Login
              </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-surface border-b border-white/10 p-6 flex flex-col gap-4 animate-fade-in">
           {navItems.map((item) => (
            <button 
              key={item.label}
              onClick={() => {
                setView(item.view);
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-lg font-medium text-gray-300 hover:text-white"
            >
              {item.label}
            </button>
          ))}
          <div className="h-px bg-white/10 my-2"></div>
          <button 
             onClick={() => {
                 setView('create-job');
                 setIsMobileMenuOpen(false);
             }}
             className="text-left text-lg font-medium text-primary"
          >
              Hire Talents
          </button>
           {!user && (
              <button 
                onClick={() => {
                    onLogin();
                    setIsMobileMenuOpen(false);
                }}
                className="bg-white text-black py-3 rounded-lg font-bold mt-2"
              >
                Login
              </button>
           )}
        </div>
      )}
    </nav>
  );
};
