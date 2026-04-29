import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { runSimulation } from '../../services/simulationService';

const POLICY_OPTIONS = [
  {
    value: 'tunnel',
    label: '🚇 Tunnel Construction',
    desc: 'Underground road — increases capacity by up to 100%',
    param: 'capacity',
  },
  {
    value: 'flyover',
    label: '🌉 Flyover Construction',
    desc: 'Elevated road — diverts traffic across two levels',
    param: 'diversion',
  },
  {
    value: 'road_widening',
    label: '🛣️ Road Widening',
    desc: 'Expand existing lanes — moderate capacity boost',
    param: 'capacity',
  },
  {
    value: 'signal_optimisation',
    label: '🚦 Signal Optimisation',
    desc: 'AI-driven signal timing — 12% throughput improvement',
    param: null,
  },
  {
    value: 'metro_extension',
    label: '🚆 Metro Extension',
    desc: 'Modal shift — 25% vehicles off the road',
    param: null,
  },
];

const LOCATIONS = [
  'Silk Board Junction',
  'Hebbal Flyover',
  'KR Puram Bridge',
  'Electronic City Phase 1',
  'Marathahalli Bridge',
  'Whitefield Main Road',
  'Koramangala 5th Block',
  'Indiranagar 100ft Road',
];

const LABEL = 'block text-[11px] font-semibold text-white/45 uppercase tracking-widest mb-2';
const INPUT = 'w-full bg-white/5 border border-white/10 rounded-xl text-white text-sm px-4 py-2.5 outline-none focus:border-violet/60 focus:ring-2 focus:ring-violet/20 transition-all duration-200 appearance-none';

export default function Simulator({ onResult }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    policy_type: 'tunnel',
    location: LOCATIONS[0],
    capacity_increase_pct: 30,
    diversion_pct: 40,
    budget_crore: 250,
    timeline_months: 24,
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selected  = POLICY_OPTIONS.find(p => p.value === form.policy_type);
  const showCap   = ['tunnel', 'road_widening'].includes(form.policy_type);
  const showDiv   = form.policy_type === 'flyover';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await runSimulation(form);
      onResult?.(result);
      navigate('/results', { state: { result } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-7">
      <h2 className="font-display text-xl font-semibold text-white mb-1">
        Configure Policy
      </h2>
      <p className="text-sm text-white/45 mb-7">
        Adjust parameters below and run the simulation to see the impact.
      </p>

      <form id="simulator-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

        {/* Policy type */}
        <div>
          <label htmlFor="policy-type" className={LABEL}>Policy Type</label>
          <select
            id="policy-type"
            className={INPUT + ' cursor-pointer'}
            value={form.policy_type}
            onChange={e => set('policy_type', e.target.value)}
            style={{ backgroundImage: 'none' }}
          >
            {POLICY_OPTIONS.map(o => (
              <option key={o.value} value={o.value} className="bg-brand-800">
                {o.label}
              </option>
            ))}
          </select>
          {selected && (
            <p className="mt-2 text-xs text-white/35 leading-relaxed">{selected.desc}</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location-select" className={LABEL}>Target Location</label>
          <select
            id="location-select"
            className={INPUT + ' cursor-pointer'}
            value={form.location}
            onChange={e => set('location', e.target.value)}
            style={{ backgroundImage: 'none' }}
          >
            {LOCATIONS.map(l => (
              <option key={l} value={l} className="bg-brand-800">{l}</option>
            ))}
          </select>
        </div>

        {/* Capacity slider */}
        {showCap && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="capacity-slider" className={LABEL + ' mb-0'}>
                Capacity Increase
              </label>
              <span className="text-sm font-bold text-violet">{form.capacity_increase_pct}%</span>
            </div>
            <input
              id="capacity-slider"
              type="range"
              min={5} max={100} step={5}
              value={form.capacity_increase_pct}
              onChange={e => set('capacity_increase_pct', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-white/25 mt-1">
              <span>5%</span><span>100%</span>
            </div>
          </div>
        )}

        {/* Diversion slider */}
        {showDiv && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="diversion-slider" className={LABEL + ' mb-0'}>
                Traffic Diversion
              </label>
              <span className="text-sm font-bold text-cyan">{form.diversion_pct}%</span>
            </div>
            <input
              id="diversion-slider"
              type="range"
              min={10} max={80} step={5}
              value={form.diversion_pct}
              onChange={e => set('diversion_pct', Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-[10px] text-white/25 mt-1">
              <span>10%</span><span>80%</span>
            </div>
          </div>
        )}

        {/* Budget slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="budget-slider" className={LABEL + ' mb-0'}>Budget</label>
            <span className="text-sm font-bold text-amber">₹{form.budget_crore} Cr</span>
          </div>
          <input
            id="budget-slider"
            type="range"
            min={50} max={2000} step={50}
            value={form.budget_crore}
            onChange={e => set('budget_crore', Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-white/25 mt-1">
            <span>₹50 Cr</span><span>₹2000 Cr</span>
          </div>
        </div>

        {/* Timeline slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="timeline-slider" className={LABEL + ' mb-0'}>Timeline</label>
            <span className="text-sm font-bold text-emerald">{form.timeline_months} months</span>
          </div>
          <input
            id="timeline-slider"
            type="range"
            min={6} max={60} step={3}
            value={form.timeline_months}
            onChange={e => set('timeline_months', Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-white/25 mt-1">
            <span>6 mo</span><span>60 mo</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="flex items-start gap-2 bg-rose/10 border border-rose/30 rounded-xl px-4 py-3 text-sm text-rose"
          >
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          id="run-simulation-btn"
          disabled={loading}
          aria-busy={loading}
          className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet to-cyan shadow-[0_4px_18px_rgba(108,99,255,0.45)] hover:shadow-[0_8px_28px_rgba(108,99,255,0.6)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow" />
              Running simulation…
            </>
          ) : (
            <>▶ Run Simulation</>
          )}
        </button>
      </form>
    </div>
  );
}
