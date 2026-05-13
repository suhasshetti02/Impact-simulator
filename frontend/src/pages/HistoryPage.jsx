import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHistory, clearHistory } from '../services/simulationService';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchHistory = () => {
    setLoading(true);
    getHistory({ limit: 50 })
      .then(res => setHistory(res.results || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to delete all saved simulations?')) {
      clearHistory().then(() => fetchHistory());
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white mb-2">Asset Explorer</h1>
          <p className="text-white/50 text-sm">Review and revisit past policy scenarios and historical inference data.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleClear}
            className="px-4 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-lg transition-colors"
          >
            Clear History
          </button>
          <Link 
            to="/simulator" 
            className="px-4 py-2 text-xs font-semibold text-brand-900 bg-emerald hover:bg-emerald/90 rounded-lg transition-colors shadow-[0_0_15px_rgba(0,229,160,0.2)]"
          >
            + New Simulation
          </Link>
        </div>
      </header>

      <div className="glass-panel rounded-2xl overflow-hidden border-t-2 border-t-emerald/50">
        {loading ? (
          <div className="p-8 text-center text-white/40">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="p-16 text-center text-white/40">
            <div className="text-4xl mb-4 opacity-50">📭</div>
            <p>No telemetry found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a0a0a]/50 border-b border-white/5 text-[10px] uppercase tracking-widest text-white/40">
                  <th className="p-5 font-semibold">Date</th>
                  <th className="p-5 font-semibold">Location</th>
                  <th className="p-5 font-semibold">Policy</th>
                  <th className="p-5 font-semibold">ROI Score</th>
                  <th className="p-5 font-semibold">Time Saved</th>
                  <th className="p-5 font-semibold">Fuel Saved</th>
                  <th className="p-5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5">
                {history.map((run, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-5 text-white/50 text-xs font-mono">
                      {new Date(run.simulated_at).toLocaleDateString()}
                    </td>
                    <td className="p-5 font-medium text-white">{run.location}</td>
                    <td className="p-5 text-white/70">
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] uppercase tracking-wider border border-white/5">
                        {run.policy_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`font-bold ${run.roi_score >= 1.0 ? 'text-emerald' : 'text-amber-400'}`}>
                        {run.roi_score?.toFixed(2) || 'N/A'}
                      </span>
                    </td>
                    <td className="p-5 text-white/70">
                      {run.impact?.time_saved_hours_day?.toLocaleString() || 0} hrs
                    </td>
                    <td className="p-5 text-white/70">
                      {run.impact?.fuel_saved_liters_day?.toLocaleString() || 0} L
                    </td>
                    <td className="p-5 text-right">
                      <button 
                        onClick={() => navigate('/results', { state: { result: run } })}
                        className="px-3 py-1.5 text-xs font-semibold text-white/60 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
