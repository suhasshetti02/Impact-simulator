import React from 'react';

export default function SustainabilityImpact({ impact }) {
  if (!impact) return null;

  return (
    <div className="glass-panel rounded-2xl p-6 h-full flex flex-col justify-between border-t-2 border-t-emerald/50 relative group">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-emerald/5 blur-2xl pointer-events-none" />
      
      <div className="mb-5 relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_10px_rgba(0,229,160,0.5)]"></span>
          <h3 className="font-semibold text-white text-sm">Real-World Impact</h3>
        </div>
        <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">
          Estimated daily community benefits
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-5 relative z-10">
        <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1">Time Saved</div>
          <div className="font-display font-bold text-lg text-emerald">
            {impact.time_saved_hours_day.toLocaleString()}<span className="text-xs font-normal text-white/30 ml-1">hrs/d</span>
          </div>
        </div>
        
        <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-3">
          <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1">Fuel Saved</div>
          <div className="font-display font-bold text-lg text-white/90">
            {impact.fuel_saved_liters_day.toLocaleString()}<span className="text-xs font-normal text-white/30 ml-1">L/d</span>
          </div>
        </div>

        <div className="bg-[#0a0a0a]/50 border border-white/10 rounded-xl p-3 col-span-2">
          <div className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-1">Economic Value Generated</div>
          <div className="font-display font-bold text-2xl text-emerald flex items-center gap-2">
            ₹{impact.economic_value_inr_day.toLocaleString()}<span className="text-xs font-normal text-white/30">/day</span>
          </div>
          <p className="text-[9px] text-white/30 mt-1">Calculated via baseline fuel costs (₹100/L) and commuter value of time (₹150/hr).</p>
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-widest font-semibold text-white/60">Sustainability Score</span>
          <span className="text-sm font-bold text-emerald">{impact.sustainability_score} / 100</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden relative shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]">
          <div 
            className="absolute top-0 left-0 h-full bg-emerald shadow-[0_0_10px_rgba(0,229,160,0.8)] transition-all duration-1000"
            style={{ width: `${impact.sustainability_score}%` }}
          />
        </div>
      </div>
    </div>
  );
}
