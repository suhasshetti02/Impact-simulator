import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer,
} from 'recharts';
import { getVisualizationData } from '../../services/simulationService';

const COLORS = ['#ff5c7f', '#ffb547', '#6c63ff', '#00d4ff', '#00e5a0', '#a78bfa'];

function buildBarData(api) {
  if (!api) return [];
  return (api.series || []).map(s => ({
    name: s.name,
    value: s.data.length
      ? Math.round(s.data.reduce((a, b) => a + b, 0) / s.data.length)
      : 0,
  }));
}

const DarkTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-brand-800 border border-white/10 rounded-xl px-4 py-3 shadow-xl text-xs">
      <p className="font-semibold text-white mb-1">{payload[0]?.payload?.name}</p>
      <p style={{ color: '#ffb547' }}>
        Avg Index: <strong>{payload[0]?.value}</strong>
      </p>
    </div>
  );
};

export default function PollutionChart() {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVisualizationData({ metric: 'pollution', hours: 24 })
      .then(res => setData(buildBarData(res)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-white">🌿 Pollution Index <span className="text-white/35 font-normal text-sm">by Location</span></h3>
        {loading && (
          <span className="w-5 h-5 border-2 border-white/20 border-t-emerald rounded-full animate-spin-slow" />
        )}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 16, left: -12, bottom: 40 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: 'rgba(240,244,255,0.35)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            angle={-30}
            textAnchor="end"
          />
          <YAxis
            tick={{ fill: 'rgba(240,244,255,0.35)', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
