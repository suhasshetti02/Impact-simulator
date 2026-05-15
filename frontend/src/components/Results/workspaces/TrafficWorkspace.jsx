/**
 * TrafficWorkspace — Technical ML analysis workspace.
 * Feels like a transport intelligence lab.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import ScenarioExplanation from '../../Explainability/ScenarioExplanation';
import FeatureImportance   from '../../Explainability/FeatureImportance';
import PipelineVisualizer  from '../../Explainability/PipelineVisualizer';
import Visualization       from '../../Visualization';

function ExpandableSection({ title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/[0.07] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[12px] font-semibold text-white/75">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-white/25" /> : <ChevronDown className="w-4 h-4 text-white/25" />}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="p-5 border-t border-white/5"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

function MetricTable({ result }) {
  if (!result) return null;
  const rows = [
    { label: 'Vehicle Count',   before: result.before.vehicle_count,   after: result.after.vehicle_count,   unit: 'veh/day', pct: result.deltas.vehicle_count.change_pct },
    { label: 'Average Speed',   before: result.before.avg_speed_kmh,   after: result.after.avg_speed_kmh,   unit: 'km/h',    pct: result.deltas.avg_speed_kmh.change_pct },
    { label: 'Travel Time',     before: result.before.travel_time_min, after: result.after.travel_time_min, unit: 'min',     pct: result.deltas.travel_time_min.change_pct },
    { label: 'Road Capacity',   before: result.before.road_capacity,   after: result.after.road_capacity,   unit: 'veh',     pct: result.deltas.road_capacity.change_pct },
    { label: 'Pollution Index', before: result.before.pollution_index, after: result.after.pollution_index, unit: 'AQI',     pct: result.deltas.pollution_index.change_pct },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-[10px] text-white/30 uppercase tracking-wider border-b border-white/5">
            <th className="text-left pb-2 font-semibold">Metric</th>
            <th className="text-right pb-2 font-semibold">Before Policy</th>
            <th className="text-right pb-2 font-semibold">After Policy Implementation</th>
            <th className="text-right pb-2 font-semibold">Δ %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const improved = (r.label === 'Vehicle Count' || r.label === 'Travel Time' || r.label === 'Pollution Index')
              ? r.pct < 0 : r.pct > 0;
            return (
              <tr key={r.label} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="py-2.5 text-white/60 text-xs">{r.label}</td>
                <td className="py-2.5 text-right text-white/50 text-xs font-mono">{r.before.toLocaleString()} {r.unit}</td>
                <td className="py-2.5 text-right text-white/80 text-xs font-mono font-semibold">{r.after.toLocaleString()} {r.unit}</td>
                <td className={`py-2.5 text-right text-xs font-bold ${improved ? 'text-emerald-400' : 'text-red-400'}`}>
                  {r.pct > 0 ? '+' : ''}{r.pct?.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function TrafficWorkspace({ result }) {
  return (
    <div className="p-6 space-y-4 max-w-5xl">

      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-[13px] font-bold text-white/70">Traffic Intelligence</h2>
      </div>

      {/* Quick stat row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Traffic Improvement', value: `${result?.traffic_improvement?.toFixed(1) ?? '—'}%` },
          { label: 'ROI Score',           value: result?.roi_score?.toFixed(2) ?? '—' },
          { label: 'Model Confidence',    value: 'High' },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
            <div className="font-display text-xl font-bold text-white mb-1">{s.value}</div>
            <div className="text-[10px] text-white/30 uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      <ExpandableSection title="Before Policy / After Policy Implementation Metrics" badge="Detail Table" defaultOpen>
        <MetricTable result={result} />
      </ExpandableSection>

      <ExpandableSection title="Causal Analysis" badge="ML Explanation" defaultOpen>
        <ScenarioExplanation result={result} />
      </ExpandableSection>

      <ExpandableSection title="Feature Importance" badge="XGBoost">
        <FeatureImportance />
      </ExpandableSection>

      <ExpandableSection title="Impact Charts" badge="Visualization">
        <Visualization result={result} />
      </ExpandableSection>

      <ExpandableSection title="Simulation Pipeline">
        <PipelineVisualizer />
      </ExpandableSection>

    </div>
  );
}
