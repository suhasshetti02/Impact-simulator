import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Comparison   from '../components/Comparison';
import Visualization from '../components/Visualization';
import SdgKpiPanel from '../components/SdgKpiPanel';
import FeatureImportance from '../components/Explainability/FeatureImportance';
import ScenarioExplanation from '../components/Explainability/ScenarioExplanation';
import SustainabilityImpact from '../components/Explainability/SustainabilityImpact';
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
            <span className="text-white">Simulation Telemetry</span>
          </h1>
          {isDemo && (
            <p className="mt-1 text-xs text-white/35">
              Showing sample data.{' '}
              <Link to="/simulator" className="text-emerald hover:underline transition-colors">
                Run your own →
              </Link>
            </p>
          )}
          {!isDemo && result.roi_score && (
             <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald/10 border border-emerald/20 shadow-[0_0_15px_rgba(0,229,160,0.1)]">
                <span className="text-[11px] font-semibold text-emerald uppercase tracking-wider">ROI Score</span>
                <span className={`text-sm font-bold ${result.roi_score >= 1.0 ? 'text-emerald' : 'text-amber-400'}`}>
                   {result.roi_score.toFixed(2)}
                </span>
             </div>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            id="rerun-btn"
            onClick={rerun}
            disabled={loading}
            aria-busy={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white/60 border border-white/10 hover:border-emerald/50 hover:text-white hover:bg-emerald/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading
              ? <><span className="w-3.5 h-3.5 border-2 border-emerald/20 border-t-emerald rounded-full animate-spin-slow" /> Refreshing…</>
              : '↻ Re-run Model'}
          </button>
          <Link
            to="/simulator"
            id="new-simulation-btn"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-brand-900 bg-emerald hover:bg-emerald/90 shadow-[0_0_15px_rgba(0,229,160,0.3)] hover:shadow-[0_0_25px_rgba(0,229,160,0.5)] hover:-translate-y-0.5 transition-all duration-200"
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
              border: 'border-t-emerald/50'
            },
            {
              label: 'Speed Improvement',
              value: `+${(result.deltas?.avg_speed_kmh?.change_pct ?? 0).toFixed(1)}%`,
              color: 'text-white/90',
              border: 'border-t-white/10'
            },
            {
              label: 'Pollution Reduction',
              value: `${Math.abs(result.deltas?.pollution_index?.change_pct ?? 0).toFixed(1)}%`,
              color: 'text-white/90',
              border: 'border-t-white/10'
            },
            {
              label: 'Capacity Gain',
              value: `+${(result.deltas?.road_capacity?.change_pct ?? 0).toFixed(1)}%`,
              color: 'text-white/90',
              border: 'border-t-white/10'
            },
          ].map(s => (
            <div key={s.label} className={`glass-panel rounded-2xl p-5 flex flex-col gap-1 border-t-2 ${s.border}`}>
              <span className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</span>
              <span className="text-[10px] text-white/40 uppercase tracking-widest">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Comparison and SDG */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        <section className="flex-1" aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
            Before vs After
          </h2>
          <Comparison result={result} />
        </section>

        <aside className="w-full lg:w-1/3">
          <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
            Sustainability Impact
          </h2>
          <SdgKpiPanel kpis={result?.sdg_kpis} />
        </aside>
      </div>
      
      {/* Explainability Section */}
      <section aria-labelledby="explain-heading" className="mb-8">
        <h2 id="explain-heading" className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
          Simulation Logic & Real-World Impact
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ScenarioExplanation result={result} />
          <SustainabilityImpact impact={result?.impact} />
          <FeatureImportance />
        </div>
      </section>

      {/* Charts */}
      <section aria-labelledby="charts-heading">
        <h2 id="charts-heading" className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
          Simulation Impact Visualization
        </h2>
        <Visualization result={result} />
      </section>

    </div>
  );
}
