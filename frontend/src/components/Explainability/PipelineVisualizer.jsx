import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Leaf, Users, BookOpen, FileText, ChevronRight } from 'lucide-react';

const STAGES = [
  {
    id: 'policy',
    icon: FileText,
    label: 'Policy Input',
    sub: 'Location · Type · Budget',
    color: 'text-cyan-400',
    border: 'border-cyan-500/40',
    glow: 'shadow-[0_0_12px_rgba(34,211,238,0.2)]',
  },
  {
    id: 'traffic',
    icon: Cpu,
    label: 'Traffic Engine',
    sub: 'XGBoost · TTI · Speed',
    color: 'text-emerald-400',
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_0_12px_rgba(52,211,153,0.2)]',
  },
  {
    id: 'env',
    icon: Leaf,
    label: 'Environmental Engine',
    sub: 'AQI · PM2.5 · Noise',
    color: 'text-teal-400',
    border: 'border-teal-500/40',
    glow: 'shadow-[0_0_12px_rgba(45,212,191,0.2)]',
  },
  {
    id: 'community',
    icon: Users,
    label: 'Community Engine',
    sub: 'Vendors · Pedestrians · Business',
    color: 'text-violet-400',
    border: 'border-violet-500/40',
    glow: 'shadow-[0_0_12px_rgba(167,139,250,0.2)]',
  },
  {
    id: 'evidence',
    icon: BookOpen,
    label: 'Evidence Layer',
    sub: 'BBMP · NIUA · IISc · KSPCB',
    color: 'text-amber-400',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_12px_rgba(251,191,36,0.2)]',
  },
  {
    id: 'summary',
    icon: FileText,
    label: 'Planner Summary',
    sub: 'Recommendation · Risks · Benefits',
    color: 'text-rose-400',
    border: 'border-rose-500/40',
    glow: 'shadow-[0_0_12px_rgba(251,113,133,0.2)]',
  },
];

export default function PipelineVisualizer() {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5">
      <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest mb-5">
        Simulation Pipeline
      </h3>

      {/* Mobile: vertical stack | Desktop: horizontal row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0">
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <React.Fragment key={stage.id}>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className={`flex-1 flex flex-col items-center text-center p-3 rounded-xl border ${stage.border} ${stage.glow} bg-white/[0.03] min-w-0`}
              >
                <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-2`}>
                  <Icon className={`w-4 h-4 ${stage.color}`} />
                </div>
                <span className={`text-[11px] font-bold ${stage.color} mb-0.5 leading-tight`}>
                  {stage.label}
                </span>
                <span className="text-[9px] text-white/30 leading-tight hidden md:block">
                  {stage.sub}
                </span>
              </motion.div>

              {i < STAGES.length - 1 && (
                <div className="flex items-center justify-center md:px-1 shrink-0">
                  <ChevronRight className="w-3 h-3 text-white/20 rotate-90 md:rotate-0" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <p className="text-[10px] text-white/20 text-center mt-4">
        All engines run in a single API call · New layers add &lt;5ms total latency
      </p>
    </div>
  );
}
