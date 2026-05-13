import React from 'react';

export default function ScenarioExplanation({ result }) {
  if (!result) return null;

  const { policy_type, deltas } = result;
  
  let explanation = "";
  let primaryDriver = "";
  
  const volDrop = deltas.vehicle_count.change_pct;
  const capInc  = deltas.road_capacity.change_pct;
  const spdInc  = deltas.avg_speed_kmh.change_pct;

  if (policy_type === 'metro_extension') {
    primaryDriver = "Modal Shift";
    explanation = `The introduction of the metro caused a ${Math.abs(volDrop)}% drop in surface vehicle volume. This reduction in the Volume-to-Capacity ratio fundamentally eased congestion, allowing the remaining vehicles to travel ${spdInc}% faster.`;
  } else if (policy_type === 'tunnel' || policy_type === 'road_widening') {
    primaryDriver = "Physical Capacity Expansion";
    explanation = `By increasing physical road capacity by ${capInc}%, the policy absorbed the existing vehicle volume much more efficiently. The model predicts this will lower the density of cars per lane, directly driving the ${spdInc}% increase in average speeds.`;
  } else if (policy_type === 'flyover') {
    primaryDriver = "Traffic Diversion";
    explanation = `The elevated flyover diverted ${Math.abs(volDrop)}% of traffic away from the surface junction. The Machine Learning model heavily weights surface volume; removing this bottleneck is the primary driver behind the improved Travel Time Index.`;
  } else if (policy_type === 'signal_optimisation') {
    primaryDriver = "Flow Efficiency";
    explanation = `Despite no physical capacity being added, AI signal timing reduced stop-and-go cycles. The model recognizes this efficiency, predicting a ${spdInc}% speed increase and a corresponding drop in idling emissions.`;
  } else {
    primaryDriver = "Feature Interaction";
    explanation = "The ML model predicted this outcome based on the interaction between volume, capacity, and historical congestion patterns for this specific area.";
  }

  return (
    <div className="glass-panel rounded-2xl p-6 h-full border-t-2 border-t-emerald/50 flex flex-col justify-center relative group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-emerald/5 blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-2 relative z-10">
        <span className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_10px_rgba(0,229,160,0.5)]"></span>
        <h3 className="font-semibold text-white text-sm">Causal Analysis</h3>
      </div>
      <p className="text-xs text-white/70 leading-relaxed mb-3 relative z-10">
        {explanation}
      </p>
      <div className="mt-auto relative z-10">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30 block mb-1">Primary Driver</span>
        <span className="inline-block px-2 py-1 bg-emerald/10 border border-emerald/20 rounded-md text-[11px] uppercase tracking-wider text-emerald font-bold">
          {primaryDriver}
        </span>
      </div>
    </div>
  );
}
