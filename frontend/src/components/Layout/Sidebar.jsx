import React from 'react';
import { NavLink } from 'react-router-dom';
import { Globe, Box, Cpu, Activity, Settings } from 'lucide-react';

const LINKS = [
  { path: '/', label: 'Global Overview', icon: Globe },
  { path: '/history', label: 'Asset Explorer', icon: Box },
  { path: '/simulator', label: 'Predictive Engine', icon: Cpu },
  { path: '/compare', label: 'Telemetry Hub', icon: Activity },
  { path: '/settings', label: 'System Settings', icon: Settings },
];

export default function Sidebar({ isOpen }) {
  return (
    <aside 
      className={`fixed inset-y-0 left-0 w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-8 pb-4">
        <h1 className="font-display font-bold text-white text-xl tracking-wide">Urban Intel</h1>
      </div>

      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {LINKS.map(link => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3 rounded-md text-[13px] font-medium transition-all duration-200
              ${isActive 
                ? 'bg-emerald text-brand-900 font-bold shadow-[0_0_15px_rgba(0,229,160,0.3)]' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <link.icon className={`w-4 h-4 ${isActive ? 'text-brand-900' : 'text-white/40'}`} strokeWidth={isActive ? 2.5 : 2} />
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center font-display font-bold text-white text-sm">
            O1
          </div>
          <div className="flex-1">
            <h3 className="text-[13px] font-bold text-white leading-tight">Command Center</h3>
            <p className="text-[10px] text-white/50 font-medium tracking-widest uppercase mt-0.5">Operator 01</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
