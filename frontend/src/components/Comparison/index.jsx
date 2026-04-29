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
      <div className="glass rounded-2xl flex items-center justify-center min-h-44 text-sm text-white/35">
        Run a simulation to see the before / after comparison.
      </div>
    );
  }

  const { before, after, deltas, policy_type, location, budget_crore, timeline_months } = result;

  return (
    <section className="glass rounded-2xl p-6" aria-label="Before vs After Comparison">
      {/* Meta badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { label: `📍 ${location}`,                        cls: 'bg-violet/15 text-violet border-violet/30' },
          { label: `₹${budget_crore} Cr`,                  cls: 'bg-amber/15 text-amber border-amber/30' },
          { label: `⏱ ${timeline_months} months`,          cls: 'bg-emerald/12 text-emerald border-emerald/25' },
          { label: policy_type.replace(/_/g, ' '),         cls: 'bg-cyan/12 text-cyan border-cyan/25' },
        ].map((b) => (
          <span
            key={b.label}
            className={`px-3 py-1 rounded-full text-xs font-semibold border capitalize ${b.cls}`}
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
