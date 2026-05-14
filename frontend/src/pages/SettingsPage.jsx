import React, { useState } from 'react';
import { Settings, Shield, Bell, Key, Database, Cpu } from 'lucide-react';
import { clearHistory } from '../services/simulationService';

export default function SettingsPage() {
  const [autoSave, setAutoSave] = useState(true);
  const [highFidelity, setHighFidelity] = useState(false);

  const handlePurge = () => {
    if (window.confirm('Are you absolutely sure? This will delete all telemetry data permanently.')) {
      clearHistory().then(() => {
        alert('All telemetry data has been purged successfully.');
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <header className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white mb-2">System Settings</h1>
        <p className="text-white/50 text-sm">Configure Urban Intelligence OS parameters, access control, and model telemetry.</p>
      </header>

      <div className="space-y-6 max-w-2xl mx-auto">
        
        {/* Content Area */}
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 border-t-2 border-t-emerald/50 relative group">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-emerald/5 blur-2xl pointer-events-none" />
            <h3 className="font-display font-bold text-white mb-4 border-b border-white/10 pb-4 relative z-10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_10px_rgba(0,229,160,0.5)]"></span>
              Simulation Preferences
            </h3>
            
            <div className="space-y-5 relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Auto-save Scenarios</h4>
                  <p className="text-xs text-white/40">Automatically save every executed simulation to the Asset Explorer.</p>
                </div>
                <div 
                  onClick={() => setAutoSave(!autoSave)}
                  className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${autoSave ? 'bg-emerald shadow-[0_0_10px_rgba(0,229,160,0.5)]' : 'bg-[#0a0a0a] border border-white/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${autoSave ? 'right-1 bg-[#0a0a0a]' : 'left-1 bg-white/40'}`}></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">High-Fidelity Rendering</h4>
                  <p className="text-xs text-white/40">Use WebGL for advanced spatial overlays. May impact performance.</p>
                </div>
                <div 
                  onClick={() => setHighFidelity(!highFidelity)}
                  className={`w-10 h-6 rounded-full relative cursor-pointer transition-colors ${highFidelity ? 'bg-emerald shadow-[0_0_10px_rgba(0,229,160,0.5)]' : 'bg-[#0a0a0a] border border-white/20'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${highFidelity ? 'right-1 bg-[#0a0a0a]' : 'left-1 bg-white/40'}`}></div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-white mb-2">Default Base Map Layer</h4>
                <select className="w-full bg-[#0a0a0a]/50 border border-white/10 rounded-xl text-white text-sm px-4 py-3 outline-none focus:border-emerald/50">
                  <option>CARTO Dark Matter (Default)</option>
                  <option>Mapbox Satellite</option>
                  <option>OpenStreetMap Spatial</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-rose-500/20 relative">
            <h3 className="font-display font-bold text-rose-400 mb-2">Danger Zone</h3>
            <p className="text-xs text-white/40 mb-4">Permanent actions affecting your Urban Intelligence OS workspace.</p>
            <button 
              onClick={handlePurge}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-sm font-semibold transition-colors"
            >
              Purge All Telemetry Data
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
