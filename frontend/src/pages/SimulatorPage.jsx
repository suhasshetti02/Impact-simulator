import React from 'react';
import Simulator from '../components/Simulator';
import Visualization from '../components/Visualization';

export default function SimulatorPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Page header */}
      <header className="mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
          <span className="text-gradient">Policy Simulator</span>
        </h1>
        <p className="mt-2 text-sm text-white/45 max-w-xl">
          Configure an infrastructure policy, adjust parameters, and instantly see the
          predicted impact on Bengaluru's traffic network.
        </p>
      </header>

      {/* Two-column layout: form | charts */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Left – sticky form */}
        <aside className="w-full lg:w-96 lg:sticky lg:top-20 shrink-0">
          <Simulator />
        </aside>

        {/* Right – live charts */}
        <section className="flex-1 min-w-0" aria-label="Live data charts">
          <Visualization />
        </section>

      </div>
    </div>
  );
}
