import React, { useEffect, useRef, useState } from 'react';

const STATS = [
  {
    id: 'vehicles',
    label: 'Vehicles Monitored',
    value: 128400,
    decimals: 0,
    icon: '🚗',
    accentFrom: '#6c63ff',
    accentTo:   '#a78bfa',
    change: '+4.2%',
    trend: 'up',
  },
  {
    id: 'avg-speed',
    label: 'Avg Speed (km/h)',
    value: 28.4,
    decimals: 1,
    icon: '⚡',
    accentFrom: '#00d4ff',
    accentTo:   '#38bdf8',
    change: '-1.8%',
    trend: 'down',
  },
  {
    id: 'pollution',
    label: 'Pollution Index',
    value: 162,
    decimals: 0,
    icon: '🌿',
    accentFrom: '#ffb547',
    accentTo:   '#fb923c',
    change: '+6.1%',
    trend: 'down',
  },
  {
    id: 'efficiency',
    label: 'Road Efficiency',
    value: 71,
    decimals: 0,
    unit: '%',
    icon: '🛣️',
    accentFrom: '#00e5a0',
    accentTo:   '#34d399',
    change: '+2.9%',
    trend: 'up',
  },
];

function AnimatedNumber({ target, decimals = 0, duration = 1400 }) {
  const [val, setVal] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(parseFloat((eased * target).toFixed(decimals)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, decimals, duration]);

  return <>{val.toLocaleString()}</>;
}

export default function Dashboard() {
  return (
    <section aria-label="Key metrics dashboard">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white">Live Overview</h2>
        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald bg-emerald/10 border border-emerald/25 px-3 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-dot" />
          Live
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s, i) => (
          <article
            key={s.id}
            id={`stat-${s.id}`}
            className="glass glass-hover relative overflow-hidden rounded-2xl p-6 transition-all duration-300 cursor-default"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 inset-x-0 h-0.5"
              style={{ background: `linear-gradient(90deg, ${s.accentFrom}, ${s.accentTo})` }}
            />

            {/* Icon + change */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{s.icon}</span>
              <span
                className={[
                  'text-xs font-bold',
                  s.trend === 'up'   ? 'text-emerald' : 'text-rose',
                ].join(' ')}
              >
                {s.change}
              </span>
            </div>

            {/* Value */}
            <div className="font-display text-3xl font-bold text-white leading-none">
              <AnimatedNumber target={s.value} decimals={s.decimals} />
              {s.unit || ''}
            </div>
            <div className="mt-1 text-xs font-medium text-white/45 uppercase tracking-wider">
              {s.label}
            </div>

            {/* Mini bar */}
            <div className="mt-4 h-1 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-[1500ms] ease-out"
                style={{
                  width: '72%',
                  background: `linear-gradient(90deg, ${s.accentFrom}, ${s.accentTo})`,
                }}
              />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
