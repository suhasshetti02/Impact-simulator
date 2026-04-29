import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/',          label: 'Home',      icon: '🏙️' },
  { to: '/simulator', label: 'Simulator', icon: '⚙️' },
  { to: '/results',   label: 'Results',   icon: '📊' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className={[
        'fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 md:px-10 transition-all duration-300',
        scrolled
          ? 'bg-brand-900/90 backdrop-blur-xl border-b border-white/8 shadow-lg'
          : 'bg-transparent',
      ].join(' ')}
    >
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet to-cyan flex items-center justify-center text-lg shadow-[0_0_16px_rgba(108,99,255,0.5)]">
          🌐
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display font-bold text-base text-white tracking-tight">
            PolicySim
          </span>
          
        </div>
      </div>

      {/* Links */}
      <ul className="flex items-center gap-1" role="list">
        {NAV_LINKS.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-violet/15 text-violet'
                    : 'text-white/55 hover:text-white hover:bg-white/5',
                ].join(' ')
              }
              aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            >
              <span className="text-base" aria-hidden="true">{icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      
    </nav>
  );
}
