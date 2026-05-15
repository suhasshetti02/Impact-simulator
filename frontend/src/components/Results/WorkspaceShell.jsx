/**
 * WorkspaceShell — The tabbed workspace container for the Results page.
 *
 * Renders a sticky tab bar, animates between workspace panels, and
 * hosts the collapsible ContextDrawer on the right.
 * No scrolling: each workspace manages its own layout.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Cpu, Leaf, Users, BookOpen, FileText, PanelRight,
} from 'lucide-react';
import ContextDrawer from './ContextDrawer';

const TABS = [
  { id: 'overview',     label: 'Overview',          icon: LayoutDashboard },
  { id: 'traffic',      label: 'Traffic Intel',      icon: Cpu },
  { id: 'environment',  label: 'Environmental',      icon: Leaf },
  { id: 'community',    label: 'Community Impact',   icon: Users },
  { id: 'planner',      label: 'Planner Summary',    icon: FileText },
];

export default function WorkspaceShell({ result, onPrint, children }) {
  const [activeTab, setActiveTab]     = useState('overview');
  const [drawerOpen, setDrawerOpen]   = useState(true);

  // Expose activeTab to children via render prop
  const workspace = typeof children === 'function'
    ? children(activeTab)
    : children;

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* ── Tab Bar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-0 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-md px-1 relative z-20">
        {TABS.map((tab) => {
          const Icon    = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative flex items-center gap-2 px-4 py-3 text-[12px] font-semibold
                transition-colors duration-150 whitespace-nowrap outline-none group
                ${isActive ? 'text-white' : 'text-white/35 hover:text-white/65'}
              `}
            >
              <Icon className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-emerald-400' : 'text-white/25 group-hover:text-white/50'}`} />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="active-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-400 rounded-t-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}

        {/* Context drawer toggle — pushed to far right */}
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          title="Toggle Intelligence Drawer"
          className={`ml-auto mr-2 p-2 rounded-lg transition-all duration-200 ${drawerOpen ? 'text-cyan-400 bg-cyan-400/10' : 'text-white/30 hover:text-white/60 hover:bg-white/5'}`}
        >
          <PanelRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── Main Area: Workspace + Drawer ──────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Workspace panel */}
        <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6, filter: 'blur(3px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{   opacity: 0, y: -6, filter: 'blur(3px)' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="h-full"
            >
              {workspace}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Context drawer */}
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              key="drawer"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{   width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="shrink-0 overflow-hidden border-l border-white/[0.06]"
            >
              <ContextDrawer result={result} onPrint={onPrint} />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
