import React, { useEffect, useState } from 'react';
import { getFeatureImportance } from '../../services/simulationService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

// Colour gradient: top features get brighter emerald, lower ones fade to zinc
const COLORS = ['#00e5a0', '#00c987', '#22d3ee', '#a1a1aa', '#52525b', '#3f3f46', '#27272a'];

const GEO_FEATURES = new Set([
  'env_risk_score', 'aqms_dist_km', 'nqms_dist_km',
  'aqms_proximity_score', 'nqms_proximity_score',
  'urban_density_index', 'traffic_env_pressure',
  'speed_env_interaction', 'congestion_geo_score',
]);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  const isGeo = GEO_FEATURES.has(data.key);
  return (
    <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-emerald/20 rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(0,229,160,0.1)] text-xs max-w-[200px]">
      <p className="font-semibold text-white mb-1">{data.name}</p>
      <p className="text-emerald">
        Influence: <strong>{data.pct?.toFixed(1)}%</strong>
      </p>
      {isGeo && (
        <p className="text-cyan-400 mt-1 text-[10px]">📍 KML Geospatial Feature</p>
      )}
    </div>
  );
};

export default function FeatureImportance() {
  const [data, setData]       = useState([]);
  const [model, setModel]     = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeatureImportance()
      .then(res => {
        if (res?.features) {
          setData(res.features.slice(0, 7));
          setModel(res.model || '');
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!data.length) return null;

  const hasGeo = data.some(d => GEO_FEATURES.has(d.key));

  return (
    <div className="glass-panel rounded-2xl p-6 h-full flex flex-col border-t-2 border-t-emerald/50 relative group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-emerald/5 blur-2xl pointer-events-none" />

      <div className="mb-4 relative z-10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_10px_rgba(0,229,160,0.5)]" />
            AI Model Weights
          </h3>
          {model && (
            <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400/60 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-full">
              {model.split('+')[0].trim()}
            </span>
          )}
        </div>
        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">
          Top variables driving inference
        </p>
        {hasGeo && (
          <p className="text-[10px] text-cyan-400/70 mt-1">
            📍 Cyan bars = KML geospatial features
          </p>
        )}
      </div>

      <div className="flex-1 min-h-[200px] relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace' }}
              width={110}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((entry, i) => (
                <Cell
                  key={`cell-${i}`}
                  fill={GEO_FEATURES.has(entry.key) ? '#22d3ee' : COLORS[i % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
