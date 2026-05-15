import React from 'react';
import { NavLink } from 'react-router-dom';
import { Globe, Box, Cpu, Activity, Users, BookOpen, Settings } from 'lucide-react';

const LINKS = [
  { path: '/',          label: 'Global Overview',       icon: Globe,     group: 'main' },
  { path: '/history',   label: 'Asset Explorer',        icon: Box,       group: 'main' },
  { path: '/simulator', label: 'Predictive Engine',     icon: Cpu,       group: 'main' },
  { path: '/compare',   label: 'Telemetry Hub',         icon: Activity,  group: 'main' },
  { path: '/results',   label: 'Intelligence Report',   icon: Users,     group: 'intel' },
  { path: '/settings',  label: 'System Settings',       icon: Settings,  group: 'system' },
];

const GROUP_LABELS = { main: 'Workspace', intel: 'Intelligence', system: 'System' };

export default function Sidebar({ isOpen }) {
  const grouped = LINKS.reduce((acc, l) => {
    acc[l.group] = acc[l.group] ?? [];
    acc[l.group].push(l);
    return acc;
  }, {});

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 bg-[#080808] border-r border-white/[0.05] flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-[14px] tracking-tight leading-none">Urban Intel OS</h1>
            <p className="text-[9px] text-white/25 uppercase tracking-[0.15em] mt-0.5">v2.0 · Intelligence Platform</p>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        {Object.entries(grouped).map(([group, links]) => (
          <div key={group}>
            <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/20 px-3 mb-1.5">
              {GROUP_LABELS[group]}
            </div>
            <div className="flex flex-col gap-0.5">
              {links.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-[12.5px] font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-emerald-500/10 text-white border border-emerald-500/20 shadow-[0_0_12px_rgba(52,211,153,0.08)]'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <link.icon
                        className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-white/25'}`}
                        strokeWidth={isActive ? 2 : 1.75}
                      />
                      {link.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer operator badge */}
      <div className="p-4 border-t border-white/[0.05]">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <span className="text-[10px] font-bold text-emerald-400">O1</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white/75 leading-none mb-0.5">Command Center</p>
            <p className="text-[9px] text-white/25 uppercase tracking-widest truncate">Operator 01</p>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        </div>
      </div>
    </aside>
  );
}
