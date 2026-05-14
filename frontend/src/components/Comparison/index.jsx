import React from 'react';

const METRIC_META = {
  vehicle_count:   { label: 'Vehicle Count',      unit: '',       good: 'lower'  },
  avg_speed_kmh:   { label: 'Avg Speed',          unit: ' km/h',  good: 'higher' },
  travel_time_min: { label: 'Travel Time',        unit: ' min',   good: 'lower'  },
  pollution_index: { label: 'Pollution Index',    unit: '',       good: 'lower'  },
  road_capacity:   { label: 'Road Capacity',      unit: ' veh/h', good: 'higher' },
};

function DeltaChip({ change, pct, good }) {
  const positive  = change > 0;
  const improved  = (good === 'lower' && !positive) || (good === 'higher' && positive);
  const sign      = positive ? '+' : '';

  return (
    <span className={[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold',
      improved
        ? 'bg-emerald/12 text-emerald border border-emerald/25'
        : 'bg-rose/12 text-rose border border-rose/25',
    ].join(' ')}>
      {sign}{Math.abs(pct).toFixed(1)}%
    </span>
  );
}

export default function Comparison({ result }) {
  if (!result) {
    return (
      <div className="glass-panel border-t-2 border-t-emerald/50 rounded-2xl flex items-center justify-center min-h-44 text-sm text-white/35">
        Run a simulation to see the before / after comparison.
      </div>
    );
  }

  const { before, after, deltas, policy_type, location, budget_crore, timeline_months } = result;

  return (
    <section className="glass-panel border-t-2 border-t-emerald/50 rounded-2xl p-6 relative group" aria-label="Before vs After Comparison">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-emerald/5 blur-2xl pointer-events-none" />
      
      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 mb-6 relative z-10">
        {[
          { label: `📍 ${location}`,                        cls: 'bg-[#0a0a0a]/50 text-white/90 border-white/10' },
          { label: `₹${budget_crore} Cr`,                  cls: 'bg-[#0a0a0a]/50 text-white/90 border-white/10' },
          { label: `⏱ ${timeline_months} months`,          cls: 'bg-[#0a0a0a]/50 text-white/90 border-white/10' },
          { label: policy_type.replace(/_/g, ' '),         cls: 'bg-emerald/10 text-emerald border-emerald/20 shadow-[0_0_10px_rgba(0,229,160,0.2)]' },
        ].map((b) => (
          <span
            key={b.label}
            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border ${b.cls}`}
          >
            {b.label}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full text-sm" aria-label="Metric comparison table">
          <thead>
            <tr className="border-b border-white/8">
              {['Metric', 'Before', 'After', 'Change'].map(h => (
                <th
                  key={h}
                  scope="col"
                  className="pb-3 text-left text-[11px] font-semibold text-white/40 uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(METRIC_META).map(([key, meta]) => {
              const d = deltas?.[key];
              if (!d) return null;
              return (
                <tr
                  key={key}
                  className="border-b border-white/5 hover:bg-white/3 transition-colors duration-150"
                >
                  <td className="py-3.5 pr-4 font-medium text-white/80">{meta.label}</td>
                  <td className="py-3.5 pr-4 text-white/50">
                    {Number(d.before).toLocaleString()}{meta.unit}
                  </td>
                  <td className="py-3.5 pr-4 font-semibold text-white">
                    {Number(d.after).toLocaleString()}{meta.unit}
                  </td>
                  <td className="py-3.5">
                    <DeltaChip change={d.change} pct={d.change_pct} good={meta.good} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
