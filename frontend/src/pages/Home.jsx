import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import { getHistory } from '../services/simulationService';

export default function Home() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getHistory({ limit: 20 })
      .then(res => {
        const data = res.results || [];
        const unique = [];
        const seen = new Set();
        for (const sim of data) {
          const key = `${sim.location}-${sim.policy_type}-${sim.budget_crore}`;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(sim);
          }
        }
        setHistory(unique.slice(0, 5));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-2">Command Center</h1>
        <p className="text-white/50 text-sm">Real-time traffic overview and recent simulation activity.</p>
      </header>

      <Dashboard />

      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white tracking-tight">Recent Telemetry</h2>
          <Link to="/history" className="text-[11px] uppercase tracking-wider font-semibold text-emerald hover:text-white transition-colors">
            View All →
          </Link>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden border-t-2 border-t-emerald/50">
          {loading ? (
            <div className="p-8 text-center text-white/40 text-sm">Loading telemetry...</div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-white/40 text-sm">
              No simulations run yet.{' '}
              <Link to="/simulator" className="text-emerald hover:text-white underline transition-colors">Run your first simulation.</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0a0a0a]/50 border-b border-white/5 text-[10px] uppercase tracking-wider text-white/40">
                    <th className="p-5 font-semibold">Location</th>
                    <th className="p-5 font-semibold">Policy</th>
                    <th className="p-5 font-semibold">Budget</th>
                    <th className="p-5 font-semibold">ROI Score</th>
                    <th className="p-5 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {history.map((run, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-5 font-medium text-white">{run.location}</td>
                      <td className="p-5 text-white/70">
                        <span className="px-2 py-1 bg-white/5 rounded text-[10px] uppercase tracking-wider border border-white/5">
                          {run.policy_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-5 text-white/70 font-mono">₹{run.budget_crore} Cr</td>
                      <td className="p-5">
                        <span className={`font-bold ${run.roi_score >= 1.0 ? 'text-emerald' : 'text-amber-400'}`}>
                          {run.roi_score?.toFixed(2) || 'N/A'}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <button 
                          onClick={() => navigate('/results', { state: { result: run } })}
                          className="px-3 py-1.5 text-xs font-semibold text-white/60 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          View Impact
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
