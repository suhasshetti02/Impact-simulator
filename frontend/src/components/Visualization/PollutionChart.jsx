import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-emerald/20 rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(0,229,160,0.1)] text-xs">
      <p className="font-semibold text-white mb-1.5 border-b border-white/10 pb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

export default function PollutionChart({ result }) {
  if (!result) {
     return (
        <div className="glass-panel rounded-2xl p-6 flex items-center justify-center min-h-[300px] text-sm text-white/35 border-t-2 border-t-emerald/50">
           Run a simulation to see sustainability impacts.
        </div>
     );
  }

  const data = [
    {
      name: 'Before',
      'Pollution Index': result.before.pollution_index,
      'Avg Speed (km/h)': result.before.avg_speed_kmh,
    },
    {
      name: 'After',
      'Pollution Index': result.after.pollution_index,
      'Avg Speed (km/h)': result.after.avg_speed_kmh,
    }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border-t-2 border-t-emerald/50 relative group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-emerald/5 blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_10px_rgba(0,229,160,0.5)]"></span>
          Sustainability & Speed <span className="text-white/35 font-normal text-xs uppercase tracking-widest">(Before vs After)</span>
        </h3>
      </div>
      <div className="relative z-10">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'monospace' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }} />
            <Bar dataKey="Pollution Index" fill="#a1a1aa" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Avg Speed (km/h)" fill="#00e5a0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
