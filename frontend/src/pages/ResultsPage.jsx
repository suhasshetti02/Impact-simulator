import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Comparison        from '../components/Comparison';
import Visualization     from '../components/Visualization';
import SdgKpiPanel       from '../components/SdgKpiPanel';
import FeatureImportance from '../components/Explainability/FeatureImportance';
import ScenarioExplanation from '../components/Explainability/ScenarioExplanation';
import SustainabilityImpact from '../components/Explainability/SustainabilityImpact';
import EnvironmentalPanel from '../components/Visualization/EnvironmentalPanel';
import { runSimulation } from '../services/simulationService';

const DEMO_RESULT = {
  policy_type: 'tunnel',
  location: 'Silk Board Junction',
  budget_crore: 250,
  timeline_months: 24,
  before: {
    vehicle_count: 40832, avg_speed_kmh: 18,
    travel_time_min: 44, pollution_index: 210, road_capacity: 42100,
  },
  after: {
    vehicle_count: 24500, avg_speed_kmh: 34,
    travel_time_min: 28, pollution_index: 158, road_capacity: 54730,
  },
  deltas: {
    vehicle_count:   { before: 40832, after: 24500, change: -16332, change_pct: -40.0 },
    avg_speed_kmh:   { before: 18,    after: 34,    change: 16,     change_pct:  88.9 },
    travel_time_min: { before: 44,    after: 28,    change: -16,    change_pct: -36.4 },
    pollution_index: { before: 210,   after: 158,   change: -52,    change_pct: -24.8 },
    road_capacity:   { before: 42100, after: 54730, change: 12630,  change_pct:  30.0 },
  },
  roi_score: 4.39,
  sdg_kpis: {
    congestion_reduction: { value: 36.4, target: 30, unit: '%', label: 'Urban Congestion Reduction' },
    pollution_reduction:  { value: 24.8, target: 20, unit: '%', label: 'Pollution Index Reduction' },
    capacity_improvement: { value: 30.0, target: 25, unit: '%', label: 'Road Capacity Increase' },
    speed_improvement:    { value: 88.9, target: 20, unit: '%', label: 'Average Speed Improvement' },
  },
  impact: {
    time_saved_hours_day: 3264,
    fuel_saved_liters_day: 1632,
    economic_value_inr_day: 652800,
    sustainability_score: 62.4,
  },
  environmental: {
    before: { pm25_ugm3: 149.0, aqi: 323.1, noise_db: 57.2, noise_category: 'noisy' },
    after:  { pm25_ugm3: 43.0,  aqi: 72.2,  noise_db: 52.8, noise_category: 'moderate' },
    deltas: { pm25_delta: -106.0, pm25_pct: -71.1, aqi_delta: -250.9, aqi_pct: -77.7, noise_delta: -4.4, noise_pct: -7.7 },
    geo_context: { location: 'Silk Board Junction', env_risk_score: 0.822, aqms_dist_km: 0.014, nqms_dist_km: 3.944 },
    impact: { co2_saved_kg_day: 34018, environmental_score: 53.1 },
  },
};

export default function ResultsPage() {
  const { state }                 = useLocation();
  const [result, setResult]       = useState(state?.result || DEMO_RESULT);
  const [loading, setLoading]     = useState(false);
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

  const env = result?.environmental;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">
              Simulation Telemetry
            </h1>
            {/* Model badge */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-cyan-400/10 border border-cyan-400/25 text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              XGBoost · KML Geo
            </span>
          </div>
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
              ? <><span className="w-3.5 h-3.5 border-2 border-emerald/20 border-t-emerald rounded-full animate-spin" /> Refreshing…</>
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

      {/* Summary stat strip — now includes AQI */}
      {result && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: 'Travel Time Reduction',
              value: `${Math.abs(result.deltas?.travel_time_min?.change_pct ?? 0).toFixed(1)}%`,
              color: 'text-emerald', border: 'border-t-emerald/50',
            },
            {
              label: 'Speed Improvement',
              value: `+${(result.deltas?.avg_speed_kmh?.change_pct ?? 0).toFixed(1)}%`,
              color: 'text-white/90', border: 'border-t-white/10',
            },
            {
              label: 'Pollution Reduction',
              value: `${Math.abs(result.deltas?.pollution_index?.change_pct ?? 0).toFixed(1)}%`,
              color: 'text-white/90', border: 'border-t-white/10',
            },
            {
              label: 'Capacity Gain',
              value: `+${(result.deltas?.road_capacity?.change_pct ?? 0).toFixed(1)}%`,
              color: 'text-white/90', border: 'border-t-white/10',
            },
            // NEW: AQI improvement from Environmental Engine
            {
              label: 'AQI Improvement',
              value: env?.deltas?.aqi_pct != null
                ? `${Math.abs(env.deltas.aqi_pct).toFixed(1)}%`
                : 'N/A',
              color: 'text-cyan-400', border: 'border-t-cyan-500/40',
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
            Before vs After — Traffic
          </h2>
          <Comparison result={result} />
        </section>

        <aside className="w-full lg:w-1/3">
          <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
            SDG 9 Sustainability KPIs
          </h2>
          <SdgKpiPanel kpis={result?.sdg_kpis} />
        </aside>
      </div>

      {/* NEW: Environmental Intelligence Panel */}
      {env && (
        <section aria-labelledby="env-heading" className="mb-8">
          <h2 id="env-heading" className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
            Environmental Intelligence — KML Geospatial Analysis
          </h2>
          <EnvironmentalPanel environmental={env} />
        </section>
      )}

      {/* Explainability Section */}
      <section aria-labelledby="explain-heading" className="mb-8">
        <h2 id="explain-heading" className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">
          Simulation Logic &amp; Real-World Impact
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
