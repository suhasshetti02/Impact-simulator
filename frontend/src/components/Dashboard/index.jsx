import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Car, Clock, CloudRain, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5001/api/traffic?limit=100')
      .then(res => res.json())
      .then(data => {
        const arr = data.records || data.data;
        if (!arr || !arr.length) return;
        const avg = (key) => arr.reduce((sum, d) => sum + (d[key] || 0), 0) / arr.length;
        setMetrics({
          vol: avg('vehicle_count'),
          spd: avg('avg_speed_kmh'),
          tti: avg('travel_time_min') / 30, // rough TTI proxy
          pol: avg('pollution_index'),
          inc: avg('incident_reports'),
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      id: 1,
      title: 'Avg Network Volume',
      value: metrics ? Math.round(metrics.vol).toLocaleString() : '---',
      unit: 'vehicles',
      icon: Car,
      color: 'text-emerald',
      bg: 'bg-emerald/10',
      border: 'border-emerald/20',
      trend: '+2.4%',
      trendUp: false,
    },
    {
      id: 2,
      title: 'System Travel Time Index',
      value: metrics ? metrics.tti.toFixed(2) : '---',
      unit: 'TTI',
      icon: Clock,
      color: 'text-white/70',
      bg: 'bg-white/5',
      border: 'border-white/10',
      trend: '-1.1%',
      trendUp: true,
    },
    {
      id: 3,
      title: 'Average Flow Speed',
      value: metrics ? metrics.spd.toFixed(1) : '---',
      unit: 'km/h',
      icon: Activity,
      color: 'text-emerald',
      bg: 'bg-emerald/10',
      border: 'border-emerald/20',
      trend: '+5.2%',
      trendUp: true,
    },
    {
      id: 4,
      title: 'Current AQI Proxy',
      value: metrics ? Math.round(metrics.pol) : '---',
      unit: 'index',
      icon: CloudRain,
      color: 'text-white/70',
      bg: 'bg-white/5',
      border: 'border-white/10',
      trend: '-4.8%',
      trendUp: true,
    },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white tracking-tight">Live Network Status</h2>
        {loading && <span className="text-xs text-white/40 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald animate-pulse" /> Syncing...</span>}
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {cards.map((c) => (
          <motion.article
            key={c.id}
            variants={item}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`relative overflow-hidden rounded-2xl border ${c.border} glass-panel p-5 shadow-lg group border-t-2 border-t-emerald/50`}
          >
            {/* Subtle glow effect on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${c.bg} blur-2xl pointer-events-none`} />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${c.bg} ${c.color}`}>
                  <c.icon className="w-4 h-4" />
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-white/5 border border-white/5 ${c.trendUp ? 'text-emerald' : 'text-rose'}`}>
                  {c.trendUp ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {c.trend}
                </div>
              </div>
              
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">{c.title}</h3>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold text-white tracking-tight">{c.value}</span>
                <span className="text-xs font-medium text-white/30">{c.unit}</span>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
