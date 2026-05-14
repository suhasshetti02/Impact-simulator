import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { runSimulation } from '../../services/simulationService';
import { Layers, MapPin, IndianRupee, CalendarClock } from 'lucide-react';

const POLICY_OPTIONS = [
  { value: 'tunnel', label: 'Tunnel Construction', param: 'capacity' },
  { value: 'flyover', label: 'Flyover Construction', param: 'diversion' },
  { value: 'road_widening', label: 'Road Widening', param: 'capacity' },
  { value: 'signal_optimisation', label: 'Signal Optimisation', param: null },
  { value: 'metro_extension', label: 'Metro Extension', param: null },
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

const LABEL = 'flex items-center gap-2 text-[10px] font-semibold text-white/50 uppercase tracking-widest mb-2';
const INPUT = 'w-full bg-slate-900/50 border border-white/10 rounded-xl text-white text-sm px-4 py-3 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all appearance-none shadow-inner';

export default function Simulator({ onResult, onStateChange }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    policy_type: 'tunnel',
    location: LOCATIONS[0],
    capacity_increase_pct: 30,
    diversion_pct: 40,
    modal_shift_pct: 25,
    budget_crore: 250,
    timeline_months: 24,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bubble up state changes
  useEffect(() => {
    if (onStateChange) onStateChange(form);
  }, [form, onStateChange]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const showCap   = ['tunnel', 'road_widening'].includes(form.policy_type);
  const showDiv   = form.policy_type === 'flyover';
  const showModal = form.policy_type === 'metro_extension';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await runSimulation(form);
      onResult?.(result);
      // Let the parent orchestrate the loading screen before navigating
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
      <h2 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
        <Layers className="w-5 h-5 text-emerald" /> Scenario Parameters
      </h2>

      <form id="simulator-form" onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 flex-1">
        {/* Location */}
        <div>
          <label className={LABEL}><MapPin className="w-3 h-3" /> Target Region</label>
          <select
            className={INPUT}
            value={form.location}
            onChange={e => set('location', e.target.value)}
          >
            {LOCATIONS.map(l => <option key={l} value={l} className="bg-[#0a0a0a]">{l}</option>)}
          </select>
        </div>

        {/* Policy type */}
        <div>
          <label className={LABEL}><Layers className="w-3 h-3" /> Infrastructure Policy</label>
          <select
            className={INPUT}
            value={form.policy_type}
            onChange={e => set('policy_type', e.target.value)}
          >
            {POLICY_OPTIONS.map(o => <option key={o.value} value={o.value} className="bg-[#0a0a0a]">{o.label}</option>)}
          </select>
        </div>

        {/* Dynamic Sliders */}
        <div className="space-y-4 pt-2">
          {showCap && (
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-white/70">Capacity Expansion</span>
                <span className="text-xs font-bold text-emerald">+{form.capacity_increase_pct}%</span>
              </div>
              <input type="range" min={5} max={100} step={5} value={form.capacity_increase_pct} onChange={e => set('capacity_increase_pct', Number(e.target.value))} />
            </div>
          )}
          {showDiv && (
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-white/70">Traffic Diversion</span>
                <span className="text-xs font-bold text-cyan-400">{form.diversion_pct}%</span>
              </div>
              <input type="range" min={10} max={80} step={5} value={form.diversion_pct} onChange={e => set('diversion_pct', Number(e.target.value))} />
            </div>
          )}
          {showModal && (
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-xs text-white/70">Modal Shift (Metro)</span>
                <span className="text-xs font-bold text-amber-400">{form.modal_shift_pct}%</span>
              </div>
              <input type="range" min={5} max={60} step={5} value={form.modal_shift_pct} onChange={e => set('modal_shift_pct', Number(e.target.value))} />
            </div>
          )}
        </div>

        {/* Global Sliders */}
        <div className="space-y-4 pt-2 mt-auto">
          <div>
            <div className="flex justify-between mb-2">
              <span className="flex items-center gap-1 text-xs text-white/70"><IndianRupee className="w-3 h-3" /> Capital Budget</span>
              <span className="text-xs font-bold text-white">₹{form.budget_crore} Cr</span>
            </div>
            <input type="range" min={50} max={2000} step={50} value={form.budget_crore} onChange={e => set('budget_crore', Number(e.target.value))} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="flex items-center gap-1 text-xs text-white/70"><CalendarClock className="w-3 h-3" /> Delivery Timeline</span>
              <span className="text-xs font-bold text-white">{form.timeline_months} mo</span>
            </div>
            <input type="range" min={6} max={60} step={3} value={form.timeline_months} onChange={e => set('timeline_months', Number(e.target.value))} />
          </div>
        </div>

        {error && <div className="text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 py-3 bg-emerald hover:bg-emerald/90 text-brand-900 rounded-xl flex items-center justify-center gap-2 font-display uppercase tracking-widest text-xs font-bold shadow-[0_0_15px_rgba(0,229,160,0.3)] transition-all active:scale-[0.98]"
        >
          {loading ? <span className="w-4 h-4 border-2 border-brand-900 border-t-transparent rounded-full animate-spin" /> : 'Execute Simulation'}
        </button>
      </form>
    </div>
  );
}
