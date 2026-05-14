import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// ── AQI Category Helpers ─────────────────────────────────────────────────────
function aqiCategory(aqi) {
  if (aqi <= 50)  return { label: 'Good',        color: '#22c55e', bg: 'bg-green-500/10',  border: 'border-green-500/20'  };
  if (aqi <= 100) return { label: 'Satisfactory', color: '#84cc16', bg: 'bg-lime-500/10',   border: 'border-lime-500/20'   };
  if (aqi <= 200) return { label: 'Moderate',     color: '#eab308', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
  if (aqi <= 300) return { label: 'Poor',         color: '#f97316', bg: 'bg-orange-500/10', border: 'border-orange-500/20' };
  if (aqi <= 400) return { label: 'Very Poor',    color: '#ef4444', bg: 'bg-red-500/10',    border: 'border-red-500/20'    };
  return               { label: 'Severe',         color: '#7c3aed', bg: 'bg-violet-500/10', border: 'border-violet-500/20' };
}

function noiseColor(db) {
  if (db < 45) return '#22c55e';
  if (db < 55) return '#eab308';
  if (db < 65) return '#f97316';
  return '#ef4444';
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-emerald/20 rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(0,229,160,0.1)] text-xs">
      <p className="font-semibold text-white mb-1.5 border-b border-white/10 pb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function EnvironmentalPanel({ environmental }) {
  if (!environmental) return null;

  const { before, after, deltas, geo_context, impact } = environmental;
  const beforeCat = aqiCategory(before.aqi);
  const afterCat  = aqiCategory(after.aqi);

  const chartData = [
    {
      name: 'PM2.5 (µg/m³)',
      Before: before.pm25_ugm3,
      After:  after.pm25_ugm3,
    },
    {
      name: 'AQI',
      Before: before.aqi,
      After:  after.aqi,
    },
    {
      name: 'Noise (dB)',
      Before: before.noise_db,
      After:  after.noise_db,
    },
  ];

  const improved = (v) => v < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel rounded-2xl p-6 border-t-2 border-t-cyan-500/60 relative group"
    >
      {/* Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-cyan-500/5 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]" />
          <h3 className="font-semibold text-white text-sm">
            Environmental Intelligence
            <span className="ml-2 text-[9px] font-bold uppercase tracking-widest text-cyan-400/70 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-full">
              KML · CALINE4 · CPCB
            </span>
          </h3>
        </div>
        {geo_context && (
          <span className="text-[10px] text-white/30 font-mono">
            AMS: {geo_context.aqms_dist_km?.toFixed(2)} km away
          </span>
        )}
      </div>

      {/* AQI Before → After */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        {/* Before AQI */}
        <div className={`rounded-xl p-4 border ${beforeCat.border} ${beforeCat.bg}`}>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Before AQI</div>
          <div className="font-display text-3xl font-bold" style={{ color: beforeCat.color }}>
            {before.aqi.toFixed(0)}
          </div>
          <div className="text-xs font-medium mt-1" style={{ color: beforeCat.color }}>{beforeCat.label}</div>
          <div className="text-[10px] text-white/30 mt-1">PM2.5: {before.pm25_ugm3} µg/m³</div>
        </div>

        {/* After AQI */}
        <div className={`rounded-xl p-4 border ${afterCat.border} ${afterCat.bg}`}>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">After AQI</div>
          <div className="font-display text-3xl font-bold" style={{ color: afterCat.color }}>
            {after.aqi.toFixed(0)}
          </div>
          <div className="text-xs font-medium mt-1" style={{ color: afterCat.color }}>{afterCat.label}</div>
          <div className="text-[10px] text-white/30 mt-1">PM2.5: {after.pm25_ugm3} µg/m³</div>
        </div>
      </div>

      {/* Delta Chips */}
      <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
        {[
          { label: 'PM2.5', value: deltas.pm25_pct,   unit: '%' },
          { label: 'AQI',   value: deltas.aqi_pct,    unit: '%' },
          { label: 'Noise', value: deltas.noise_pct,  unit: '%' },
        ].map(d => (
          <div key={d.label} className="bg-[#0a0a0a]/60 border border-white/8 rounded-xl p-3 text-center">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{d.label}</div>
            <div className={`font-bold text-sm ${improved(d.value) ? 'text-emerald' : 'text-rose-400'}`}>
              {d.value > 0 ? '+' : ''}{d.value?.toFixed(1)}{d.unit}
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart: Before vs After */}
      <div className="relative z-10 mb-6">
        <div className="text-[10px] text-white/30 uppercase tracking-widest mb-3 font-semibold">Before vs After — Environmental Metrics</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false} axisLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 9, fontFamily: 'monospace' }}
              tickLine={false} axisLine={false}
            />
            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="Before" name="Before" fill="#52525b" radius={[4,4,0,0]} />
            <Bar dataKey="After"  name="After"  fill="#22d3ee" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Noise dB */}
      <div className="flex gap-3 mb-6 relative z-10">
        {[
          { label: 'Noise Before', db: before.noise_db, cat: before.noise_category },
          { label: 'Noise After',  db: after.noise_db,  cat: after.noise_category  },
        ].map(n => (
          <div key={n.label} className="flex-1 bg-[#0a0a0a]/50 border border-white/8 rounded-xl p-3">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">{n.label}</div>
            <div className="font-bold text-lg" style={{ color: noiseColor(n.db) }}>
              {n.db.toFixed(1)} <span className="text-xs font-normal text-white/30">dB(A)</span>
            </div>
            <div className="text-[10px] capitalize mt-0.5" style={{ color: noiseColor(n.db) }}>{n.cat}</div>
          </div>
        ))}
      </div>

      {/* CO2 + Env Score */}
      <div className="grid grid-cols-2 gap-3 relative z-10">
        <div className="bg-[#0a0a0a]/50 border border-white/8 rounded-xl p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">CO₂ Offset</div>
          <div className="font-bold text-emerald text-lg">
            {impact?.co2_saved_kg_day?.toLocaleString()}
            <span className="text-xs font-normal text-white/30 ml-1">kg/day</span>
          </div>
        </div>
        <div className="bg-[#0a0a0a]/50 border border-white/8 rounded-xl p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Env Score</div>
          <div className="font-bold text-cyan-400 text-lg">
            {impact?.environmental_score?.toFixed(1)}
            <span className="text-xs font-normal text-white/30 ml-1">/ 100</span>
          </div>
        </div>
      </div>

      {/* Geo Context Badge */}
      {geo_context && (
        <div className="mt-4 relative z-10 flex items-center gap-2 flex-wrap">
          <span className="text-[9px] uppercase tracking-widest text-white/25 font-semibold">Geo Context:</span>
          <span className="text-[9px] bg-cyan-400/10 border border-cyan-400/20 text-cyan-400/70 px-2 py-0.5 rounded-full font-mono">
            Env Risk: {(geo_context.env_risk_score * 100).toFixed(0)}%
          </span>
          <span className="text-[9px] bg-white/5 border border-white/10 text-white/40 px-2 py-0.5 rounded-full font-mono">
            AQMS: {geo_context.aqms_dist_km?.toFixed(2)} km
          </span>
          <span className="text-[9px] bg-white/5 border border-white/10 text-white/40 px-2 py-0.5 rounded-full font-mono">
            NQMS: {geo_context.nqms_dist_km?.toFixed(2)} km
          </span>
        </div>
      )}
    </motion.div>
  );
}
