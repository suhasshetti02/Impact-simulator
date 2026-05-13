import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Activity, User, ChevronDown, LogOut, Settings, HelpCircle, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopNav({ toggleSidebar }) {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  
  // Close dropdowns when clicking outside
  const navRef = useRef();
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setShowProfile(false);
        setShowNotifs(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header ref={navRef} className="sticky top-0 z-40 w-full backdrop-blur-md bg-brand-900/60 border-b border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.1)] px-8 py-4 flex items-center justify-between">
      
      {/* Title & Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="text-white/60 hover:text-white transition-colors outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-display font-bold text-white text-xl tracking-tight">Urban Intelligence OS</h2>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        
        {/* Live Feed */}
        <div className="flex items-center gap-2 pr-4 border-r border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
          </span>
          <span className="text-[12px] font-mono text-emerald tracking-widest uppercase">Live Feed</span>
        </div>
        
        {/* Search (Visual Only) */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-violet transition-colors" />
          <input 
            type="text" 
            placeholder="Search policies, regions..." 
            className="bg-white/[0.03] border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-violet/50 focus:bg-white/[0.05] transition-all w-64 placeholder:text-white/20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[9px] font-sans bg-white/10 rounded text-white/50 border border-white/5">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[9px] font-sans bg-white/10 rounded text-white/50 border border-white/5">K</kbd>
          </div>
        </div>

        <div className="h-4 w-px bg-white/10"></div>

        {/* Icons */}
        <div className="flex items-center gap-2 relative">
          <button className="p-2 text-white/50 hover:text-white transition-colors rounded-lg hover:bg-white/5 relative" onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }}>
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-400 rounded-full border-2 border-[#0a0a0a]"></span>
          </button>
          
          <AnimatePresence>
            {showNotifs && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-3 w-80 glass-panel rounded-xl border border-white/10 shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-white/5">
                  <h3 className="text-sm font-semibold text-white">System Alerts</h3>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto">
                  <div className="p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                    <p className="text-xs text-white/90">Baseline dataset synchronized successfully with latest traffic arrays.</p>
                    <p className="text-[10px] text-emerald mt-1">2 mins ago</p>
                  </div>
                  <div className="p-3 hover:bg-white/5 rounded-lg cursor-pointer transition-colors">
                    <p className="text-xs text-white/90">High server load detected during last Silk Board inference.</p>
                    <p className="text-[10px] text-amber-400 mt-1">1 hour ago</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative border-l border-white/10 pl-3">
          <button 
            className="flex items-center gap-2 group outline-none"
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
          >
            <div className="w-8 h-8 rounded-full bg-emerald/20 border border-emerald p-[1px] shadow-[0_0_10px_rgba(0,229,160,0.2)]">
              <div className="w-full h-full bg-[#0a0a0a] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-emerald" />
              </div>
            </div>
            <ChevronDown className={`w-3 h-3 text-white/30 transition-transform duration-200 ${showProfile ? 'rotate-180 text-white' : 'group-hover:text-white'}`} />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-3 w-48 glass-panel rounded-xl border border-white/10 shadow-2xl overflow-hidden py-1"
              >
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-semibold text-white">Urban Planner</p>
                  <p className="text-[10px] text-white/40">admin@bbmp.gov.in</p>
                </div>
                <div className="py-1">
                  <button 
                    onClick={() => { setShowProfile(false); window.location.href = '/settings'; }}
                    className="w-full text-left px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" /> Workspace Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                    <HelpCircle className="w-3.5 h-3.5" /> Documentation
                  </button>
                </div>
                <div className="py-1 border-t border-white/5">
                  <button className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 flex items-center gap-2 transition-colors">
                    <LogOut className="w-3.5 h-3.5" /> Log Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}
