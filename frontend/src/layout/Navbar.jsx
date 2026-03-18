import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, Settings, HelpCircle, Menu, X } from 'lucide-react';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useAuth();

  return (
    <div className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-primary/10 bg-background/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary transition-all active:scale-90 shadow-lg shadow-primary/5"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden sm:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/10 w-64 lg:w-96 shadow-inner">
          <Search size={18} className="text-text-muted" />
          <input 
            type="text" 
            placeholder="Search telemetry..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-text-muted text-white font-medium"
          />
        </div>

      </div>

        <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden md:flex items-center gap-4">
          <button className="relative text-text-muted hover:text-primary transition-colors">
            <Bell size={20} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full border-2 border-background"></span>
          </button>
          <button className="text-text-muted hover:text-primary transition-colors">
            <Settings size={20} />
          </button>
        </div>
        
        <div className="hidden md:block h-8 w-[1px] bg-white/10 mx-2"></div>

        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold leading-none text-white">{user?.name}</p>
            <p className="text-[10px] text-text-muted font-black mt-1 leading-none uppercase tracking-[0.2em]">{user?.role}</p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-primary/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
