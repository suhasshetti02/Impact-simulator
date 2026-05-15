/**
 * PlannerWorkspace — Government decision support workspace.
 * Large typography, narrative focus, minimal charts.
 * Feels like a formal policy advisory document — not a dashboard.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, AlertTriangle, Info, Shield, ChevronDown, ChevronUp, Download } from 'lucide-react';

const RECO_CONFIG = {
  strongly_recommended:    { Icon: ThumbsUp,     color: 'text-emerald-400', bg: 'bg-emerald-500/8',  border: 'border-emerald-500/25', top: 'border-t-emerald-500', label: 'Strongly Recommended' },
  proceed_with_conditions: { Icon: Info,          color: 'text-amber-400',   bg: 'bg-amber-500/8',    border: 'border-amber-500/25',   top: 'border-t-amber-500',   label: 'Proceed with Conditions' },
  requires_review:         { Icon: AlertTriangle, color: 'text-orange-400',  bg: 'bg-orange-500/8',   border: 'border-orange-500/25',  top: 'border-t-orange-500',  label: 'Requires Further Review' },
  not_recommended:         { Icon: AlertTriangle, color: 'text-red-400',     bg: 'bg-red-500/8',      border: 'border-red-500/25',     top: 'border-t-red-500',     label: 'Not Recommended' },
};

function NarrativeParagraph({ text }) {
  return (
    <div className="space-y-3">
      {text.split('\n\n').filter(Boolean).map((para, i) => (
        <p key={i} className={`leading-7 ${i === 0 ? 'text-sm text-white/60 font-medium' : 'text-sm text-white/42'}`}>
          {para}
        </p>
      ))}
    </div>
  );
}

function ListCard({ title, items, positive }) {
  return (
    <div className={`p-5 rounded-xl border ${positive ? 'bg-emerald-500/5 border-emerald-500/15' : 'bg-red-500/5 border-red-500/15'}`}>
      <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${positive ? 'text-emerald-400/70' : 'text-red-400/70'}`}>
        {title}
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-2"
          >
            <span className={`mt-2 w-1.5 h-1.5 rounded-full shrink-0 ${positive ? 'bg-emerald-500' : 'bg-red-500/70'}`} />
            <span className="text-[12px] text-white/60 leading-relaxed">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function AuditTrail({ data }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/25">
          Audit Trail — Inputs Used to Generate This Summary
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5 text-white/15" /> : <ChevronDown className="w-3.5 h-3.5 text-white/15" />}
      </button>
      {open && (
        <div className="px-5 pb-4 grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-white/5">
          {Object.entries(data).map(([key, val]) =>
            val != null ? (
              <div key={key} className="text-center p-2 rounded-lg bg-white/[0.03]">
                <div className="text-[11px] font-mono text-white/55 truncate">{String(val)}</div>
                <div className="text-[9px] text-white/20 truncate">{key.replace(/_/g, ' ')}</div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

export default function PlannerWorkspace({ result, onPrint }) {
  const ps = result?.planner_summary;

  if (!ps) {
    return (
      <div className="p-6 flex items-center justify-center min-h-48">
        <p className="text-sm text-white/25">Planner summary unavailable.</p>
      </div>
    );
  }

  const cfg    = RECO_CONFIG[ps.recommendation] ?? RECO_CONFIG.proceed_with_conditions;
  const RecoIcon = cfg.Icon;

  const EVID_TIER = {
    strong:   { label: 'Strong Evidence',   color: 'text-emerald-400', dot: 'bg-emerald-500' },
    moderate: { label: 'Moderate Evidence', color: 'text-amber-400',   dot: 'bg-amber-500' },
    limited:  { label: 'Limited Evidence',  color: 'text-red-400',      dot: 'bg-red-500' },
  };
  const tierCfg = EVID_TIER[ps.evidence_support_level] ?? EVID_TIER.moderate;

  return (
    <div className="p-6 max-w-3xl space-y-6">

      {/* Recommendation verdict — large, prominent */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl border-t-2 ${cfg.top} border ${cfg.border} ${cfg.bg} p-6`}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
            <RecoIcon className={`w-6 h-6 ${cfg.color}`} />
          </div>
          <div>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${cfg.color} mb-0.5`}>
              Planning Recommendation
            </div>
            <div className={`text-xl font-display font-bold ${cfg.color}`}>{cfg.label}</div>
          </div>
        </div>
        <p className="text-base font-semibold text-white/85 leading-snug">{ps.headline}</p>
      </motion.div>

      {/* Narrative */}
      <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-white/20 mb-4">Planning Advisory</div>
        <NarrativeParagraph text={ps.narrative} />
      </div>

      {/* Risks + Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ListCard title="Key Risks"    items={ps.key_risks    ?? []} positive={false} />
        <ListCard title="Key Benefits" items={ps.key_benefits ?? []} positive={true} />
      </div>

      {/* Confidence row */}
      <div className="flex flex-wrap items-center gap-5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${tierCfg.dot}`} />
          <span className={`text-[11px] font-semibold ${tierCfg.color}`}>{tierCfg.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] text-white/40">
            Simulation confidence:{' '}
            <span className="font-semibold text-cyan-400 capitalize">{ps.simulation_confidence}</span>
          </span>
        </div>
        <div className="text-[10px] text-white/25">
          No language model used — 100% deterministic output
        </div>
      </div>

      {/* Audit trail */}
      {ps.generated_from && <AuditTrail data={ps.generated_from} />}

      {/* Export actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={onPrint} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold text-white/50 border border-white/8 hover:border-white/20 hover:text-white/75 transition-all">
          <Download className="w-3.5 h-3.5" /> Export PDF Report
        </button>
        <button onClick={() => {
          const blob = new Blob([JSON.stringify(result, null, 2)], {type: 'application/json'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `planner_advisory_${result.location?.replace(/\s+/g, '_').toLowerCase()}.json`;
          a.click();
        }} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-semibold text-white/50 border border-white/8 hover:border-cyan-400/30 hover:text-cyan-400/70 transition-all">
          <Download className="w-3.5 h-3.5" /> Export JSON
        </button>
      </div>

      <p className="text-[10px] text-white/15 text-center">
        This advisory is generated deterministically from simulation outputs. Every value is traceable via the audit trail above.
      </p>

    </div>
  );
}
