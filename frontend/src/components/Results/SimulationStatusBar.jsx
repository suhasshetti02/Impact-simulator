/**
 * SimulationStatusBar — Sticky command bar showing live simulation context.
 *
 * Always visible. Answers: "Where am I? What policy? What's the verdict?"
 * Pattern: Palantir Foundry asset context strip.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Zap, Clock, TrendingUp, Download } from 'lucide-react';

const RECOMMENDATION_BADGE = {
  strongly_recommended:    { label: 'Recommended',   color: 'text-emerald-400', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  proceed_with_conditions: { label: 'Conditional',   color: 'text-amber-400',   bg: 'bg-amber-500/15',   border: 'border-amber-500/30',   dot: 'bg-amber-400' },
  requires_review:         { label: 'Under Review',  color: 'text-orange-400',  bg: 'bg-orange-500/15',  border: 'border-orange-500/30',  dot: 'bg-orange-400' },
  not_recommended:         { label: 'Not Advised',   color: 'text-red-400',     bg: 'bg-red-500/15',     border: 'border-red-500/30',     dot: 'bg-red-400' },
};

export default function SimulationStatusBar({ result, isDemo, onRerun, loading, onPrint }) {
  if (!result) return null;

  const recommendation = result.planner_summary?.recommendation;
  const badge = RECOMMENDATION_BADGE[recommendation] || RECOMMENDATION_BADGE.proceed_with_conditions;
  const policy = result.policy_type?.replace(/_/g, ' ').toUpperCase();

  return (
    <div className="shrink-0 flex items-center gap-3 px-6 py-2.5 bg-[#0d0d0d] border-b border-white/[0.06] overflow-x-auto">

      {/* Location */}
      <div className="flex items-center gap-1.5 shrink-0">
        <MapPin className="w-3 h-3 text-white/30" />
        <span className="text-[12px] font-semibold text-white/80">{result.location}</span>
      </div>

      <span className="text-white/10 text-lg font-thin">/</span>

      {/* Policy */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Zap className="w-3 h-3 text-cyan-400/60" />
        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wide">{policy}</span>
      </div>

      <span className="text-white/10 text-lg font-thin">/</span>

      {/* Timeline */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Clock className="w-3 h-3 text-white/25" />
        <span className="text-[11px] text-white/45">{result.timeline_months}mo · ₹{result.budget_crore}Cr</span>
      </div>

      <span className="text-white/10 text-lg font-thin">/</span>

      {/* ROI */}
      <div className="flex items-center gap-1.5 shrink-0">
        <TrendingUp className="w-3 h-3 text-white/25" />
        <span className="text-[11px] text-white/45">ROI</span>
        <span className={`text-[12px] font-bold ${result.roi_score >= 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
          {result.roi_score?.toFixed(2)}
        </span>
      </div>

      {/* Recommendation badge */}
      {recommendation && (
        <>
          <span className="text-white/10 text-lg font-thin">/</span>
          <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${badge.bg} ${badge.border} shrink-0`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${badge.dot}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${badge.color}`}>{badge.label}</span>
          </div>
        </>
      )}

      {/* Demo notice removed as per request */}

      {/* Actions pushed right */}
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <button
          onClick={onRerun}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold text-white/40 border border-white/8 hover:border-white/20 hover:text-white/70 disabled:opacity-30 transition-all"
        >
          {loading
            ? <><span className="w-2.5 h-2.5 border border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" /> Refreshing</>
            : <>↻ Re-run</>}
        </button>
        <button
          title="Export report"
          onClick={onPrint}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold text-white/40 border border-white/8 hover:border-cyan-400/30 hover:text-cyan-400/80 transition-all"
        >
          <Download className="w-3 h-3" />
          Export
        </button>
        <Link
          to="/simulator"
          className="px-3 py-1 rounded-lg text-[11px] font-bold text-[#0a0a0a] bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.3)] transition-all"
        >
          + New
        </Link>
      </div>

    </div>
  );
}
