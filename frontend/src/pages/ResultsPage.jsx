import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Comparison   from '../components/Comparison';
import Visualization from '../components/Visualization';
import { runSimulation } from '../services/simulationService';

const DEMO_RESULT = {
  policy_type: 'tunnel',
  location: 'Silk Board Junction',
  budget_crore: 250,
  timeline_months: 24,
  before: {
    vehicle_count: 1800, avg_speed_kmh: 22,
    travel_time_min: 35, pollution_index: 180, road_capacity: 2000,
  },
  after: {
    vehicle_count: 1200, avg_speed_kmh: 38,
    travel_time_min: 21, pollution_index: 130, road_capacity: 2600,
  },
  deltas: {
    vehicle_count:   { before: 1800, after: 1200, change: -600,  change_pct: -33.3 },
    avg_speed_kmh:   { before: 22,   after: 38,   change: 16,    change_pct:  72.7 },
    travel_time_min: { before: 35,   after: 21,   change: -14,   change_pct: -40.0 },
    pollution_index: { before: 180,  after: 130,  change: -50,   change_pct: -27.8 },
    road_capacity:   { before: 2000, after: 2600, change:  600,  change_pct:  30.0 },
  },
};

export default function ResultsPage() {
  const { state }   = useLocation();
  const [result, setResult]   = useState(state?.result || DEMO_RESULT);
  const [loading, setLoading] = useState(false);
  const isDemo = !state?.result;

  const rerun = async () => {
    setLoading(true);
    try {
      const fresh = await runSimulation({
        policy_type:     result.policy_type,
        location:        result.location,
        budget_crore:    result.budget_crore,
        timeline_months: result.timeline_months,
      });
      setResult(fresh);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            <span className="text-gradient">Simulation Results</span>
          </h1>
          {isDemo && (
            <p className="mt-1 text-xs text-white/35">
              Showing sample data.{' '}
              <Link to="/simulator" className="text-violet hover:underline">
                Run your own →
              </Link>
            </p>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            id="rerun-btn"
            onClick={rerun}
            disabled={loading}
            aria-busy={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white/60 border border-white/12 hover:border-violet/50 hover:text-white hover:bg-violet/8 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading
              ? <><span className="w-3.5 h-3.5 border-2 border-white/20 border-t-violet rounded-full animate-spin-slow" /> Refreshing…</>
              : '↻ Re-run'}
          </button>
          <Link
            to="/simulator"
            id="new-simulation-btn"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-violet to-cyan shadow-[0_4px_14px_rgba(108,99,255,0.40)] hover:shadow-[0_6px_22px_rgba(108,99,255,0.6)] hover:-translate-y-0.5 transition-all duration-200"
          >
            + New Simulation
          </Link>
        </div>
      </header>

      {/* Summary stat strip */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Travel Time Reduction',
              value: `${Math.abs(result.deltas?.travel_time_min?.change_pct ?? 0).toFixed(1)}%`,
              color: 'text-emerald',
            },
            {
              label: 'Speed Improvement',
              value: `+${(result.deltas?.avg_speed_kmh?.change_pct ?? 0).toFixed(1)}%`,
              color: 'text-violet',
            },
            {
              label: 'Pollution Reduction',
              value: `${Math.abs(result.deltas?.pollution_index?.change_pct ?? 0).toFixed(1)}%`,
              color: 'text-cyan',
            },
            {
              label: 'Capacity Gain',
              value: `+${(result.deltas?.road_capacity?.change_pct ?? 0).toFixed(1)}%`,
              color: 'text-amber',
            },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl p-5 flex flex-col gap-1">
              <span className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</span>
              <span className="text-xs text-white/40 uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Before / After */}
      <section className="mb-8" aria-labelledby="comparison-heading">
        <h2 id="comparison-heading" className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
          Before vs After
        </h2>
        <Comparison result={result} />
      </section>

      {/* Charts */}
      <section aria-labelledby="charts-heading">
        <h2 id="charts-heading" className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
          Live Traffic Data
        </h2>
        <Visualization />
      </section>

    </div>
  );
}
