import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Shield, Menu, X } from 'lucide-react';
import CityLoader from '../components/CityLoader';
import PageBranding from '../components/PageBranding';

const LandingPage = () => {
  const [showHero, setShowHero] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Public Dashboard', to: '/public-dashboard' },
    { label: 'City Map', to: '/citymap' },
    { label: 'Industry Hub', to: '/register-industry' },
    { label: 'AI Copilot', to: '/ai-copilot' }
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative select-none">
      <PageBranding title="Environmental Intelligence" />
      
      {/* Pure 3D Experience (InfiniTownTS) */}
      <CityLoader onAnimationComplete={() => setShowHero(true)} />

      {/* Cinematic Hero Overlay */}
      <AnimatePresence>
        {showHero && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-20 flex flex-col bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.9)_100%)] backdrop-blur-[3px]"
          >

            {/* Top Navigation Bar */}
            <nav className="w-full px-6 md:px-12 py-6 md:py-8 flex items-center justify-between pointer-events-none sticky top-0 z-50">
              <div className="flex items-center gap-4 pointer-events-auto">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <Shield className="text-white" size={20} />
                </div>
                <span className="font-black text-base md:text-lg tracking-tighter uppercase italic text-white/90">PrithviNet</span>
              </div>

              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center gap-8 pointer-events-auto">
                {navLinks.map((item) => (
                  <Link 
                    key={item.label} 
                    to={item.to} 
                    className="text-[9px] font-black uppercase tracking-[0.3em] text-white/60 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Mobile Menu Toggle */}
              <div className="lg:hidden pointer-events-auto">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 text-white/60 hover:text-white transition-colors"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  className="fixed inset-0 z-40 lg:hidden bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
                >
                  {navLinks.map((item) => (
                    <Link 
                      key={item.label} 
                      to={item.to} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-lg font-black uppercase tracking-[0.4em] text-white/80 hover:text-primary transition-colors italic"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="mt-8 p-4 rounded-full border border-white/10 text-white/60 hover:text-white"
                  >
                    <X size={32} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Hero Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-8 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col items-center w-full"
              >
                <div className="px-4 md:px-5 py-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md mb-6 md:mb-8">
                  <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary animate-pulse">
                    AI-Powered Environmental Intelligence
                  </span>
                </div>

                <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-[-0.05em] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/20 mb-4 md:mb-6 italic">
                  PRITHVINET
                </h1>

                <p className="max-w-xs md:max-w-2xl text-white/50 text-sm md:text-lg font-medium leading-relaxed tracking-wide mb-8 md:mb-12">
                  Real-time monitoring and AI compliance assistance for a sustainable environmental future.
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 pointer-events-auto w-full max-w-xs md:max-w-none">
                  <Link 
                    to="/dashboard"
                    className="w-full md:w-auto group relative px-8 md:px-10 py-4 md:py-5 bg-primary text-black md:text-white text-[10px] md:text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_20px_60px_-15px_rgba(16,185,129,0.4)] md:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.7)] hover:-translate-y-1.5 transition-all flex items-center justify-center gap-3"
                  >
                    Explore Dashboard
                    <div className="hidden md:block w-4 h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Bottom Credits */}
            <div className="w-full px-6 md:px-12 py-6 md:py-10 flex flex-col md:flex-row justify-between items-center md:items-end pointer-events-none gap-4 md:gap-0">
              <div className="flex flex-col items-center md:items-start gap-1 opacity-40">
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-white">System Active | 2026 CECB</span>
                <span className="text-[7px] md:text-[8px] font-medium uppercase tracking-[0.2em] text-white">Lat: 21.25° N | Lon: 81.63° E</span>
              </div>
              
              <div className="opacity-40 animate-pulse text-center md:text-right">
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-white italic">Live Feed Connected</span>
                <div className="text-[7px] md:text-[8px] text-white/60 uppercase tracking-widest mt-1">Status: Stable</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fallback Hidden Link for accessibility before animation ends */}
      {!showHero && (
        <div className="absolute inset-0 z-10 block pointer-events-none">
          <span className="sr-only">Enter PrithviNet</span>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
