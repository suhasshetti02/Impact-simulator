import React, { useEffect, useState } from 'react';
import { getFeatureImportance } from '../../services/simulationService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const COLORS = ['#00e5a0', '#ffffff', '#a1a1aa', '#52525b', '#27272a'];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-emerald/20 rounded-xl px-4 py-3 shadow-[0_0_20px_rgba(0,229,160,0.1)] text-xs">
      <p className="font-semibold text-white mb-1">{data.name}</p>
      <p className="text-emerald">
        Influence Score: <strong>{data.pct}%</strong>
      </p>
    </div>
  );
};

export default function FeatureImportance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeatureImportance()
      .then(res => {
        if (res?.features) {
          // Take top 5 features for clean visualization
          setData(res.features.slice(0, 5));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!data.length) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 h-full flex flex-col border-t-2 border-t-emerald/50 relative group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-emerald/5 blur-2xl pointer-events-none" />
      
      <div className="mb-4 relative z-10">
        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_10px_rgba(0,229,160,0.5)]"></span>
          AI Model Weights
        </h3>
        <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest">
          Top variables driving inference
        </p>
      </div>
      
      <div className="flex-1 min-h-[180px] relative z-10">
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
              width={100}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="pct" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((_, i) => (
                <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
