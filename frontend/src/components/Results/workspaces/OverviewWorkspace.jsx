/**
 * OverviewWorkspace — Executive command view.
 *
 * Progressive disclosure: KPI strip → verdict → key metrics → one chart.
 * Answers: "What happened overall? What should I decide?"
 * Pattern: Palantir Object Explorer overview panel.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, AlertTriangle, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Comparison from '../../Comparison';

const RECO_CONFIG = {
  strongly_recommended:    { Icon: ThumbsUp,     color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/25', label: 'Strongly Recommended' },
  proceed_with_conditions: { Icon: Info,          color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/25',   label: 'Proceed with Conditions' },
  requires_review:         { Icon: AlertTriangle, color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/25',  label: 'Requires Review' },
  not_recommended:         { Icon: AlertTriangle, color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/25',     label: 'Not Recommended' },
};

function KpiCell({ label, value, delta, unit = '', delay = 0 }) {
  const isPositive = delta > 0;
  const DeltaIcon  = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:border-white/15 transition-colors"
    >
      <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">{label}</div>
      <div className="font-display text-2xl font-bold text-white mb-1">
        {value}{unit}
      </div>
      {delta != null && (
        <div className={`flex items-center gap-1 text-[11px] font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
          <DeltaIcon className="w-3 h-3" />
          {isPositive ? '+' : ''}{delta.toFixed(1)}%
        </div>
      )}
    </motion.div>
  );
}

export default function OverviewWorkspace({ result }) {
  if (!result) return null;

  const { deltas, roi_score, impact, environmental, planner_summary, sdg_kpis } = result;
  const reco   = planner_summary?.recommendation;
  const cfg    = RECO_CONFIG[reco] || RECO_CONFIG.proceed_with_conditions;
  const RecoIcon = cfg.Icon;

  const kpis = [
    { label: 'Travel Time Reduction', value: `${Math.abs(deltas?.travel_time_min?.change_pct ?? 0).toFixed(1)}`, unit: '%', delta: deltas?.travel_time_min?.change_pct },
    { label: 'Speed Improvement',     value: `+${(deltas?.avg_speed_kmh?.change_pct ?? 0).toFixed(1)}`,         unit: '%', delta: deltas?.avg_speed_kmh?.change_pct },
    { label: 'AQI Improvement',       value: environmental?.deltas?.aqi_pct != null ? `${Math.abs(environmental.deltas.aqi_pct).toFixed(1)}` : 'N/A', unit: '%', delta: environmental?.deltas?.aqi_pct ? -environmental.deltas.aqi_pct : null },
    { label: 'ROI Score',             value: roi_score?.toFixed(2) ?? '—', unit: '', delta: null },
    { label: 'Sustainability Score',  value: impact?.sustainability_score?.toFixed(0) ?? '—', unit: '/100', delta: null },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">

      {/* Verdict card */}
      {planner_summary && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`flex items-start gap-4 p-5 rounded-2xl border ${cfg.bg} ${cfg.border}`}
        >
          <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center shrink-0`}>
            <RecoIcon className={`w-5 h-5 ${cfg.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-[10px] font-bold uppercase tracking-widest ${cfg.color} mb-1`}>
              Planning Verdict
            </div>
            <p className="text-sm font-semibold text-white/90 mb-2 leading-snug">
              {planner_summary.headline}
            </p>
            <div className="flex flex-wrap gap-3">
              {planner_summary.key_benefits?.slice(0, 2).map((b, i) => (
                <span key={i} className="text-[10px] text-emerald-400/80 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-400" />{b}
                </span>
              ))}
            </div>
          </div>
          <div className={`shrink-0 text-xs font-bold px-3 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            {cfg.label}
          </div>
        </motion.div>
      )}

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((k, i) => (
          <KpiCell key={k.label} {...k} delay={i * 0.06} />
        ))}
      </div>

      {/* Before / After comparison chart — the only chart on this tab */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-3">
          Before Policy vs After Policy Implementation — Traffic Metrics
        </div>
        <Comparison result={result} />
      </div>

      {/* SDG KPI targets */}
      {sdg_kpis && (
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-3">
            SDG 9 Targets
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(sdg_kpis).map(([key, kpi]) => {
              const pct = Math.min((kpi.value / kpi.target) * 100, 100);
              return (
                <div key={key} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <div className="text-[10px] text-white/30 mb-1 truncate">{kpi.label}</div>
                  <div className={`text-lg font-bold mb-1 ${kpi.value >= kpi.target ? 'text-emerald-400' : 'text-white/70'}`}>
                    {kpi.value}{kpi.unit}
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full ${kpi.value >= kpi.target ? 'bg-emerald-500' : 'bg-amber-500'}`}
                    />
                  </div>
                  <div className="text-[9px] text-white/25 mt-1">Target: {kpi.target}{kpi.unit}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
