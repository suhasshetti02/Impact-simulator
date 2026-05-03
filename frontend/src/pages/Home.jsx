import React from 'react';
import { Link } from 'react-router-dom';
import Dashboard from '../components/Dashboard';

const FEATURES = [
  {
    icon: '⚙️',
    title: 'Policy Simulation',
    desc: 'Model tunnels, flyovers, signal optimisation and metro extensions in real time.',
    color: '#6c63ff',
  },
  {
    icon: '📊',
    title: 'Before / After View',
    desc: 'Compare traffic, speed, travel time and pollution side by side.',
    color: '#00d4ff',
  },
  {
    icon: '🤖',
    title: 'ML Predictions',
    desc: 'Random Forest and Gradient Boosting trained on Bengaluru traffic data.',
    color: '#00e5a0',
  },
  {
    icon: '🌐',
    title: 'SDG 9 Aligned',
    desc: 'Every simulation maps directly to UN Sustainable Development Goal 9 KPIs.',
    color: '#ffb547',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center text-center px-6 py-28 md:py-40 overflow-hidden"
        aria-label="Hero"
      >
        {/* Glow blobs */}
        <div className="pointer-events-none absolute -top-32 -left-48 w-[600px] h-[600px] rounded-full bg-violet/20 blur-[120px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -right-48 w-[600px] h-[600px] rounded-full bg-cyan/15 blur-[120px]" aria-hidden="true" />

        {/* Badges */}
        

        {/* Headline */}
        <h1
          className="font-display font-bold text-4xl md:text-6xl text-white leading-tight tracking-tight max-w-3xl mb-6 animate-fade-up"
          style={{ animationDelay: '80ms' }}
        >
          AI-Based{' '}
          <span className="text-gradient">Policy Impact</span>
          <br />Simulator
        </h1>

        <p
          className="max-w-xl text-base md:text-lg text-white/50 leading-relaxed mb-10 animate-fade-up"
          style={{ animationDelay: '160ms' }}
        >
          Predict how infrastructure policies — tunnels, flyovers, metro lines — affect
          real-world traffic, pollution and road efficiency using machine learning.
        </p>

        {/* CTAs */}
        <div
          className="flex gap-4 flex-wrap justify-center animate-fade-up"
          style={{ animationDelay: '240ms' }}
        >
          <Link
            to="/simulator"
            id="hero-cta-btn"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet to-cyan shadow-[0_4px_18px_rgba(108,99,255,0.45)] hover:shadow-[0_8px_28px_rgba(108,99,255,0.6)] hover:-translate-y-0.5 transition-all duration-200"
          >
            ▶ Launch Simulator
          </Link>
          <Link
            to="/results"
            id="hero-results-btn"
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm text-white/60 border border-white/12 hover:border-violet/50 hover:text-white hover:bg-violet/8 transition-all duration-200"
          >
            View Sample Results →
          </Link>
        </div>

        {/* Floating chips */}
        <div className="hidden md:block pointer-events-none" aria-hidden="true">
          <span className="absolute top-[22%] left-[7%] animate-float px-4 py-2 rounded-full text-xs font-bold bg-emerald/12 border border-emerald/25 text-emerald" style={{ animationDelay: '0s' }}>
            -32% Travel Time
          </span>
          <span className="absolute top-[38%] right-[8%] animate-float px-4 py-2 rounded-full text-xs font-bold bg-violet/12 border border-violet/25 text-violet" style={{ animationDelay: '1.6s' }}>
            +28% Speed
          </span>
          <span className="absolute bottom-[22%] left-[10%] animate-float px-4 py-2 rounded-full text-xs font-bold bg-cyan/10 border border-cyan/25 text-cyan" style={{ animationDelay: '3s' }}>
            -19% Pollution
          </span>
        </div>
      </section>

      {/* ── Dashboard ─────────────────────────────────────────── */}
      <section className="px-6 pb-20 max-w-6xl mx-auto w-full" aria-label="Dashboard overview">
        <Dashboard />
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section
        className="px-6 py-20 max-w-6xl mx-auto w-full"
        aria-labelledby="features-heading"
      >
        <h2
          id="features-heading"
          className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-12"
        >
          What It Does
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f, i) => (
            <article
              key={f.title}
              className="glass glass-hover rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-semibold text-base text-white">{f.title}</h3>
              <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section
        className="border-y border-white/8 bg-gradient-to-r from-violet/10 to-cyan/5 py-24 px-6"
        aria-label="Call to action"
      >
        <div className="max-w-xl mx-auto flex flex-col items-center gap-5 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            Ready to model a policy?
          </h2>
          <p className="text-sm text-white/45">
            Configure parameters and see predicted impacts in seconds.
          </p>
          <Link
            to="/simulator"
            id="cta-banner-btn"
            className="px-7 py-3.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet to-cyan shadow-[0_4px_18px_rgba(108,99,255,0.40)] hover:shadow-[0_8px_28px_rgba(108,99,255,0.6)] hover:-translate-y-0.5 transition-all duration-200"
          >
            Open Simulator →
          </Link>
        </div>
      </section>

    </div>
  );
}
