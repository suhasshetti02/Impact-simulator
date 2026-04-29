import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import SimulatorPage from './pages/SimulatorPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-brand-900">
        <Navbar />
        <main className="flex-1 pt-16">
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/results"   element={<ResultsPage />} />
            <Route path="*"          element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
