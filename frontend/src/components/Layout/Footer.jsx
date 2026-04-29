import React from 'react';

export default function Footer() {
  return (
    <footer
      role="contentinfo"
      className="border-t border-white/8 bg-brand-900/85 px-6 py-7"
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌐</span>
          <span className="font-display font-bold text-sm text-gradient">PolicySim</span>
        </div>
        <p className="text-xs text-white/35">
          AI-Based Policy Impact Simulator · SDG 9 · RV College of Engineering, Bengaluru
        </p>
        <p className="text-xs text-white/25">
          Mentor: Dr. Vinay Hegde · Flask + React 19 + Tailwind CSS v4
        </p>
      </div>
    </footer>
  );
}
