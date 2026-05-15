import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, AlertTriangle, Info, ChevronDown, ChevronUp, Shield } from 'lucide-react';

const RECOMMENDATION_CONFIG = {
  strongly_recommended: {
    label: 'Strongly Recommended',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    topBorder: 'border-t-emerald-500',
    icon: ThumbsUp,
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]',
  },
  proceed_with_conditions: {
    label: 'Proceed With Conditions',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    topBorder: 'border-t-amber-500',
    icon: Info,
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]',
  },
  requires_review: {
    label: 'Requires Further Review',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    topBorder: 'border-t-orange-500',
    icon: AlertTriangle,
    glow: '',
  },
  not_recommended: {
    label: 'Not Recommended',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    topBorder: 'border-t-red-500',
    icon: AlertTriangle,
    glow: '',
  },
};

const EVIDENCE_TIER_CONFIG = {
  strong:   { label: 'Strong Evidence Support',   color: 'text-emerald-400', dot: 'bg-emerald-500' },
  moderate: { label: 'Moderate Evidence Support', color: 'text-amber-400',   dot: 'bg-amber-500' },
  limited:  { label: 'Limited Evidence Support',  color: 'text-red-400',      dot: 'bg-red-500' },
};

function NarrativeParagraph({ text }) {
  const paragraphs = text.split('\n\n').filter(Boolean);
  return (
    <div className="space-y-3">
      {paragraphs.map((para, i) => (
        <p key={i} className={`text-sm leading-relaxed ${i === 0 ? 'text-white/60 font-medium' : 'text-white/45'}`}>
          {para}
        </p>
      ))}
    </div>
  );
}

function ListSection({ title, items, icon: Icon, itemColor }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={`w-3.5 h-3.5 ${itemColor}`} />
        <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">{title}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-2"
          >
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${itemColor === 'text-emerald-400' ? 'bg-emerald-500' : 'bg-red-500/70'}`} />
            <span className="text-[12px] text-white/60 leading-relaxed">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export default function PlannerSummary({ plannerSummary }) {
  const [auditOpen, setAuditOpen] = useState(false);

  if (!plannerSummary) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-white/5 flex items-center justify-center min-h-[120px]">
        <p className="text-xs text-white/25">Planner summary unavailable</p>
      </div>
    );
  }

  const {
    recommendation, headline, narrative,
    key_risks = [], key_benefits = [],
    evidence_support_level, simulation_confidence,
    generated_from = {},
  } = plannerSummary;

  const cfg      = RECOMMENDATION_CONFIG[recommendation] || RECOMMENDATION_CONFIG.proceed_with_conditions;
  const tierCfg  = EVIDENCE_TIER_CONFIG[evidence_support_level] || EVIDENCE_TIER_CONFIG.moderate;
  const RecoIcon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-panel rounded-2xl border-t-2 ${cfg.topBorder} border ${cfg.border} ${cfg.glow} overflow-hidden`}
    >
      {/* Recommendation badge */}
      <div className={`px-6 pt-5 pb-4 border-b border-white/5 ${cfg.bg}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
            <RecoIcon className={`w-5 h-5 ${cfg.color}`} />
          </div>
          <div>
            <div className={`text-xs font-bold uppercase tracking-widest ${cfg.color}`}>
              Planning Recommendation
            </div>
            <div className={`text-lg font-display font-bold ${cfg.color} mt-0.5`}>
              {cfg.label}
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Headline */}
        <p className="text-base font-semibold text-white/90 leading-snug">{headline}</p>

        {/* Narrative */}
        <NarrativeParagraph text={narrative} />

        <hr className="border-white/5" />

        {/* Risks + Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ListSection
            title="Key Risks"
            items={key_risks}
            icon={AlertTriangle}
            itemColor="text-red-400"
          />
          <ListSection
            title="Key Benefits"
            items={key_benefits}
            icon={ThumbsUp}
            itemColor="text-emerald-400"
          />
        </div>

        <hr className="border-white/5" />

        {/* Evidence + Confidence meta */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${tierCfg.dot}`} />
            <span className={`text-[11px] font-semibold ${tierCfg.color}`}>{tierCfg.label}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span className="text-[11px] text-white/40">
              Simulation confidence: <span className="text-cyan-400 font-semibold capitalize">{simulation_confidence}</span>
            </span>
          </div>
        </div>

        {/* Audit trail (collapsible) */}
        <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
          <button
            onClick={() => setAuditOpen(!auditOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/[0.03] transition-colors"
          >
            <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">
              Audit Trail — Data Used to Generate This Summary
            </span>
            {auditOpen
              ? <ChevronUp className="w-3.5 h-3.5 text-white/20" />
              : <ChevronDown className="w-3.5 h-3.5 text-white/20" />}
          </button>

          {auditOpen && (
            <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(generated_from).map(([key, val]) =>
                val !== null && val !== undefined ? (
                  <div key={key} className="text-center p-2 rounded-lg bg-white/[0.03]">
                    <div className="text-[11px] font-mono text-white/60 truncate">{String(val)}</div>
                    <div className="text-[9px] text-white/25 truncate">{key.replace(/_/g, ' ')}</div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>

        <p className="text-[10px] text-white/20 text-center">
          This summary is generated deterministically from simulation outputs only.
          No language model is involved. Every value above is traceable to the audit trail.
        </p>
      </div>
    </motion.div>
  );
}
