import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Simulator from '../components/Simulator';
import BengaluruMap from '../components/Simulator/BengaluruMap';
import { Database, Cpu, Globe2, Sparkles } from 'lucide-react';

const ProcessingOverlay = ({ active }) => (
  <AnimatePresence>
    {active && (
      <motion.div 
        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
        exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
        className="absolute inset-0 z-50 bg-[#0a0a0a]/60 flex flex-col items-center justify-center rounded-2xl"
      >
        <div className="w-64">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 mb-6 mx-auto border-2 border-emerald/20 border-t-emerald rounded-full"
          />
          <div className="space-y-3">
            {[
              { icon: Database, text: "Ingesting baseline data..." },
              { icon: Globe2, text: "Applying spatial redistribution..." },
              { icon: Cpu, text: "Running Random Forest inference..." },
              { icon: Sparkles, text: "Calculating explainability insights..." }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.8 }}
                className="flex items-center gap-3 text-sm font-medium text-white/80"
              >
                <step.icon className="w-4 h-4 text-emerald" />
                {step.text}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function SimulatorPage() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleResult = (result) => {
    setIsProcessing(true);
    // Simulate complex processing delay for realism
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/results', { state: { result } });
    }, 3500);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col animate-fade-in">
      <header className="mb-6 shrink-0">
        <h1 className="font-display text-2xl font-bold text-white mb-1">Scenario Studio</h1>
        <p className="text-white/50 text-sm">Configure policy parameters and preview spatial impact before execution.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT: Controls (3 cols) */}
        <div className="lg:col-span-3 h-full overflow-y-auto pr-2 custom-scrollbar">
          <Simulator onStateChange={setFormState} onResult={handleResult} />
        </div>

        {/* CENTER: Interactive Map (6 cols) */}
        <div className="lg:col-span-6 h-full relative">
          <ProcessingOverlay active={isProcessing} />
          <BengaluruMap activeLocation={formState?.location} />
        </div>

        {/* RIGHT: Live Preview (3 cols) */}
        <div className="lg:col-span-3 h-full">
          <div className="glass-panel rounded-2xl p-6 h-full flex flex-col border-t-2 border-t-cyan-500">
            <h3 className="font-display font-bold text-white mb-4">Live Preview</h3>
            
            {formState ? (
              <div className="space-y-6">
                <div>
                  <div className="text-xs text-white/40 mb-1 uppercase tracking-wider">Target Region</div>
                  <div className="text-sm font-medium text-white">{formState.location}</div>
                </div>
                
                <div>
                  <div className="text-xs text-white/40 mb-1 uppercase tracking-wider">Policy Mechanism</div>
                  <div className="text-sm font-medium text-cyan-400">
                    {formState.policy_type.replace('_', ' ').toUpperCase()}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-xs font-semibold text-white/70 mb-2">Estimated Risk Profile</div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-amber-400" 
                      style={{ width: formState.budget_crore > 1000 ? '80%' : '30%' }}
                    />
                  </div>
                  <div className="text-[10px] text-white/40 mt-2">
                    {formState.budget_crore > 1000 ? 'High financial exposure. Ensure maximum modal shift.' : 'Low risk. Favorable ROI anticipated.'}
                  </div>
                </div>
                
                <div className="mt-auto pt-6 border-t border-white/10">
                  <div className="text-xs text-white/40 mb-2">System Status</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-medium text-white/70">ML Engine Ready</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-white/30 text-center">
                Select parameters to view live analysis.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
