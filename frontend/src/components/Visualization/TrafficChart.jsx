import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getVisualizationData } from '../../services/simulationService';

const COLORS = ['#6c63ff', '#00d4ff', '#00e5a0', '#ffb547'];

function buildData(api) {
  if (!api) return [];
  const { labels = [], series = [] } = api;
  return labels.map((label, i) => {
    const pt = { label };
    series.forEach(s => { pt[s.name] = s.data[i] ?? 0; });
    return pt;
  });
}

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-brand-800 border border-white/10 rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="font-semibold text-white mb-1.5 border-b border-white/10 pb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

export default function TrafficChart() {
  const [data, setData]     = useState([]);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVisualizationData({ metric: 'traffic', hours: 24 })
      .then(res => { setSeries(res.series || []); setData(buildData(res)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-white">🚗 Traffic Flow <span className="text-white/35 font-normal text-sm">(24h)</span></h3>
        {loading && (
          <span className="w-5 h-5 border-2 border-white/20 border-t-violet rounded-full animate-spin-slow" />
        )}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            tick={{ fill: 'rgba(240,244,255,0.35)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: 'rgba(240,244,255,0.35)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(240,244,255,0.45)' }} />
          {series.map((s, i) => (
            <Line
              key={s.name}
              type="monotone"
              dataKey={s.name}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
