import React, { useEffect, useState } from 'react';
import { getHistory } from '../services/simulationService';

export default function ComparePage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    getHistory({ limit: 50 })
      .then(res => {
        const data = res.results || [];
        // Deduplicate: Keep only the most recent run for a specific location+policy+budget
        const unique = [];
        const seen = new Set();
        for (const sim of data) {
          const key = `${sim.location}-${sim.policy_type}-${sim.budget_crore}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(sim);
          }
        }
        setHistory(unique.slice(0, 20));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleSelect = (sim) => {
    const id = sim.simulated_at; // Using timestamp as unique ID for now
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(i => i !== id));
    } else {
      if (selectedIds.length >= 3) {
        alert("You can only compare up to 3 policies at once.");
        return;
      }
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const selectedSims = history.filter(h => selectedIds.includes(h.simulated_at));

  // Determine the best value for highlighting
  const getBest = (metric, higherIsBetter = true) => {
    if (selectedSims.length === 0) return null;
    const values = selectedSims.map(s => {
      if (metric === 'roi') return s.roi_score || 0;
      if (metric === 'sus') return s.impact?.sustainability_score || 0;
      if (metric === 'time') return s.impact?.time_saved_hours_day || 0;
      if (metric === 'fuel') return s.impact?.fuel_saved_liters_day || 0;
      if (metric === 'eco') return s.impact?.economic_value_inr_day || 0;
      if (metric === 'budget') return s.budget_crore || 0;
      return 0;
    });
    return higherIsBetter ? Math.max(...values) : Math.min(...values);
  };

  const bestROI = getBest('roi', true);
  const bestSus = getBest('sus', true);
  const bestTime = getBest('time', true);
  const bestEco = getBest('eco', true);
  const bestBudget = getBest('budget', false);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-2">Telemetry Hub</h1>
        <p className="text-white/50 text-sm">Select up to 3 saved scenarios from your history to compare their metrics side-by-side.</p>
      </header>

      {/* Selector Area */}
      <section className="mb-8">
        <h2 className="text-[11px] font-semibold text-white/35 uppercase tracking-widest mb-4">Select Scenarios to Compare</h2>
        <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar">
          {loading ? (
             <div className="text-sm text-white/40">Loading scenarios...</div>
          ) : history.length === 0 ? (
             <div className="text-sm text-white/40">No saved scenarios available. Run a simulation first.</div>
          ) : (
            history.map((sim, i) => {
              const isSelected = selectedIds.includes(sim.simulated_at);
              return (
                <button
                  key={i}
                  onClick={() => toggleSelect(sim)}
                  className={`flex-shrink-0 w-64 p-4 rounded-xl border text-left transition-all duration-300 ${
                    isSelected 
                      ? 'bg-emerald/10 border-emerald shadow-[0_0_15px_rgba(0,229,160,0.2)]' 
                      : 'glass-panel border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-white/80">{sim.location}</span>
                    {isSelected && <span className="text-emerald">✓</span>}
                  </div>
                  <div className="text-sm text-white font-semibold mb-1">
                    {sim.policy_type.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-[10px] text-white/40 font-mono">
                    {new Date(sim.simulated_at).toLocaleString()}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Comparison Matrix */}
      {selectedSims.length > 0 && (
        <section className="glass-panel rounded-2xl overflow-hidden border-t-2 border-t-emerald/50">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-xs text-white/50">
                <th className="p-4 w-1/4 font-semibold uppercase tracking-wider">Metric</th>
                {selectedSims.map((sim, i) => (
                  <th key={i} className="p-4 font-semibold">
                    <div className="text-[10px] text-emerald mb-1">{sim.location}</div>
                    <div className="text-sm text-white">{sim.policy_type.replace('_', ' ').toUpperCase()}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              
              {/* ROI & Budget */}
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-white/70">ROI Score</td>
                {selectedSims.map((sim, i) => (
                  <td key={i} className={`p-4 font-bold text-lg ${sim.roi_score === bestROI ? 'text-emerald' : 'text-white'}`}>
                    {sim.roi_score?.toFixed(2)}
                    {sim.roi_score === bestROI && <span className="ml-2 text-xs bg-emerald/20 text-emerald px-2 py-0.5 rounded-full border border-emerald/30">Best</span>}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-white/70">Capital Budget</td>
                {selectedSims.map((sim, i) => (
                  <td key={i} className={`p-4 ${sim.budget_crore === bestBudget ? 'text-emerald font-bold' : 'text-white/80'}`}>
                    ₹{sim.budget_crore} Cr
                  </td>
                ))}
              </tr>

              {/* Impact */}
              <tr className="hover:bg-white/[0.02] bg-white/[0.01]">
                <td className="p-4 font-semibold text-white/70">Sustainability Score</td>
                {selectedSims.map((sim, i) => {
                  const val = sim.impact?.sustainability_score || 0;
                  return (
                    <td key={i} className={`p-4 ${val === bestSus ? 'text-emerald font-bold' : 'text-white/80'}`}>
                      {val} / 100
                    </td>
                  );
                })}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-white/70">Time Saved (Daily)</td>
                {selectedSims.map((sim, i) => {
                  const val = sim.impact?.time_saved_hours_day || 0;
                  return (
                    <td key={i} className={`p-4 ${val === bestTime ? 'text-emerald font-bold' : 'text-white/80'}`}>
                      {val.toLocaleString()} hrs
                    </td>
                  );
                })}
              </tr>
              <tr className="hover:bg-white/[0.02]">
                <td className="p-4 font-semibold text-white/70">Economic Value (Daily)</td>
                {selectedSims.map((sim, i) => {
                  const val = sim.impact?.economic_value_inr_day || 0;
                  return (
                    <td key={i} className={`p-4 ${val === bestEco ? 'text-violet font-bold' : 'text-white/80'}`}>
                      ₹{val.toLocaleString()}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
