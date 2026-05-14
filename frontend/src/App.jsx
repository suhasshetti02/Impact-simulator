import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Layout/Sidebar';
import TopNav from './components/Layout/TopNav';
import Home from './pages/Home';
import SimulatorPage from './pages/SimulatorPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import ComparePage from './pages/ComparePage';
import SettingsPage from './pages/SettingsPage';

// Wrapper for page transitions
const PageWrapper = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, filter: 'blur(5px)' }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <BrowserRouter>
      {/* Noise Texture Overlay */}
      <div className="bg-noise"></div>
      
      <div className="flex min-h-screen bg-[#0a0a0a] font-sans text-white overflow-hidden relative">
        <Sidebar isOpen={isSidebarOpen} />
        
        <main 
          className={`flex-1 flex flex-col h-screen relative z-10 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}
        >
          <TopNav toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="flex-1 overflow-y-auto p-8 relative">
            <PageWrapper>
              <Routes>
                <Route path="/"          element={<Home />} />
                <Route path="/simulator" element={<SimulatorPage />} />
                <Route path="/results"   element={<ResultsPage />} />
                <Route path="/history"   element={<HistoryPage />} />
                <Route path="/compare"   element={<ComparePage />} />
                <Route path="/settings"  element={<SettingsPage />} />
                <Route path="*"          element={<Navigate to="/" replace />} />
              </Routes>
            </PageWrapper>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
