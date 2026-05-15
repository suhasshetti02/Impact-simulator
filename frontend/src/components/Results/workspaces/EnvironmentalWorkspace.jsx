/**
 * EnvironmentalWorkspace — Geo-environment monitoring workspace.
 * Feels like an environmental intelligence monitoring system.
 */
import React from 'react';
import { motion } from 'framer-motion';
import EnvironmentalPanel  from '../../Visualization/EnvironmentalPanel';
import SustainabilityImpact from '../../Explainability/SustainabilityImpact';
import SdgKpiPanel          from '../../SdgKpiPanel';

function EnvStat({ label, before, after, unit, delta, good = 'down' }) {
  const improved = good === 'down' ? delta < 0 : delta > 0;
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">{label}</div>
      <div className="flex items-end gap-3 mb-2">
        <div>
          <div className="text-[10px] text-white/20 mb-0.5">Before Policy</div>
          <div className="font-mono text-sm text-white/50">{before} {unit}</div>
        </div>
        <div className="text-white/15 mb-1">→</div>
        <div>
          <div className="text-[10px] text-white/20 mb-0.5">After Policy Implementation</div>
          <div className={`font-mono text-sm font-bold ${improved ? 'text-emerald-400' : 'text-red-400'}`}>{after} {unit}</div>
        </div>
      </div>
      <div className={`text-[11px] font-bold ${improved ? 'text-emerald-400' : 'text-red-400'}`}>
        {delta > 0 ? '+' : ''}{delta?.toFixed(1)}%
      </div>
    </div>
  );
}

export default function EnvironmentalWorkspace({ result }) {
  const env = result?.environmental;

  return (
    <div className="p-6 space-y-6 max-w-5xl">

      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-[13px] font-bold text-white/70">Environmental Intelligence</h2>
      </div>

      {/* Key env metrics */}
      {env?.deltas ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <EnvStat label="PM2.5" before={env.before?.pm25_ugm3} after={env.after?.pm25_ugm3} unit="µg/m³" delta={env.deltas.pm25_pct} />
          <EnvStat label="AQI"   before={env.before?.aqi}       after={env.after?.aqi}       unit=""      delta={env.deltas.aqi_pct} />
          <EnvStat label="Noise" before={env.before?.noise_db}  after={env.after?.noise_db}  unit="dB(A)" delta={env.deltas.noise_pct} />
          {env.impact?.co2_saved_kg_day != null && (
            <div className="p-4 rounded-xl bg-teal-500/[0.05] border border-teal-500/20 col-span-2 md:col-span-1">
              <div className="text-[10px] text-teal-400/60 uppercase tracking-wider mb-2">CO₂ Saved</div>
              <div className="font-display text-2xl font-bold text-teal-400">{env.impact.co2_saved_kg_day.toLocaleString()}</div>
              <div className="text-[10px] text-white/30 mt-1">kg/day · ARAI formula</div>
            </div>
          )}
          {env.impact?.environmental_score != null && (
            <div className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Env. Score</div>
              <div className="font-display text-2xl font-bold text-emerald-400">{env.impact.environmental_score}</div>
              <div className="text-[10px] text-white/25 mt-1">/ 100</div>
            </div>
          )}
          {env.geo_context?.env_risk_score != null && (
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Geo Risk Score</div>
              <div className="font-display text-2xl font-bold text-orange-400">{(env.geo_context.env_risk_score * 100).toFixed(0)}</div>
              <div className="text-[10px] text-white/25 mt-1">/ 100 · KML-derived</div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center text-xs text-white/25">
          Environmental data unavailable for this simulation.
        </div>
      )}

      {/* Full environmental panel */}
      {env && (
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-3">Full Geospatial Analysis</div>
          <EnvironmentalPanel environmental={env} />
        </div>
      )}

      {/* Sustainability */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-3">Sustainability Metrics</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SustainabilityImpact impact={result?.impact} />
          <SdgKpiPanel kpis={result?.sdg_kpis} />
        </div>
      </div>

    </div>
  );
}
