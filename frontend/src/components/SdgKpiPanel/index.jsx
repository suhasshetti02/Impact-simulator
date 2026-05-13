import React from 'react';

const SDG_META = {
  congestion_reduction: { icon: '🚦', color: 'violet' },
  pollution_reduction:  { icon: '🌿', color: 'emerald' },
  capacity_improvement: { icon: '🛣️',  color: 'cyan'    },
  speed_improvement:    { icon: '⚡',  color: 'amber'   },
};

const COLOR_MAP = {
  violet:  { text: 'text-emerald',  bg: 'bg-emerald/10',  border: 'border-emerald/20',  bar: '#00e5a0' },
  emerald: { text: 'text-white/90', bg: 'bg-white/5', border: 'border-white/10', bar: '#ffffff' },
  cyan:    { text: 'text-emerald',  bg: 'bg-emerald/10',  border: 'border-emerald/20',  bar: '#00e5a0' },
  amber:   { text: 'text-white/90', bg: 'bg-white/5', border: 'border-white/10', bar: '#ffffff' },
};

function KpiBar({ value, target, color }) {
  const pct     = Math.min((value / target) * 100, 100);
  const achieved = value >= target;
  const c        = COLOR_MAP[color];

  return (
    <div className="mt-3">
      <div className="flex justify-between text-[10px] text-white/40 mb-1">
        <span>0%</span>
        <span className={achieved ? c.text : 'text-white/35'}>
          Target: {target}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
        <div
          className="h-full rounded-full transition-all duration-[1200ms] ease-out shadow-[0_0_10px_rgba(0,229,160,0.5)]"
          style={{ width: `${pct}%`, background: c.bar }}
        />
      </div>
    </div>
  );
}

export default function SdgKpiPanel({ kpis }) {
  if (!kpis) return null;

  return (
    <section
      className="glass-panel rounded-2xl p-6 border-t-2 border-t-emerald/50"
      aria-label="SDG 9 KPI Panel"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">🌐</span>
        <div>
          <h3 className="font-display font-semibold text-white text-base">SDG 9 Impact Targets</h3>
          <p className="text-xs text-white/40 mt-0.5">UN Sustainable Development Goal 9 — Industry, Innovation &amp; Infrastructure</p>
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {Object.entries(kpis).map(([key, kpi]) => {
          const meta     = SDG_META[key] || { icon: '📊', color: 'violet' };
          const c        = COLOR_MAP[meta.color];
          const achieved = kpi.value >= kpi.target;

          return (
            <article
              key={key}
              className={`rounded-xl border p-4 ${c.bg} ${c.border}`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{meta.icon}</span>
                  <span className="text-xs font-semibold text-white/70">{kpi.label}</span>
                </div>
                {achieved && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                    ✓ Met
                  </span>
                )}
              </div>

              <div className={`font-display text-2xl font-bold mt-1 ${c.text}`}>
                {kpi.value}
                <span className="text-sm font-normal text-white/40 ml-1">{kpi.unit}</span>
              </div>

              <KpiBar value={kpi.value} target={kpi.target} color={meta.color} />
            </article>
          );
        })}
      </div>

      <p className="mt-5 text-[11px] text-white/30 text-center">
        Targets aligned with BBMP Smart City Mission benchmarks
      </p>
    </section>
  );
}
