/**
 * CommunityWorkspace — Urban social impact assessment workspace.
 * Feels like a community impact evaluation system.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HardHat, Footprints, ShoppingBag, Building2, TrendingUp, ChevronRight } from 'lucide-react';
import SocioEconomicPanel from '../../Explainability/SocioEconomicPanel';

const PHASES = ['Pre-Construction', 'Construction', 'Post-Completion'];

const PHASE_COLORS = [
  'border-amber-500/40 bg-amber-500/5',
  'border-orange-500/40 bg-orange-500/5',
  'border-emerald-500/40 bg-emerald-500/5',
];

function PhaseTimeline({ timeline_months }) {
  const [active, setActive] = useState(1);
  const phases = [
    { label: 'Pre-Construction', duration: '1–2 mo', desc: 'Site survey, vendor mapping, permit acquisition, community consultation.' },
    { label: 'Construction',     duration: `${timeline_months} mo`, desc: 'Active disruption zone. Vendor relocation, pedestrian detour, noise/dust management.' },
    { label: 'Post-Completion',  duration: '6–18 mo', desc: 'Vendor return, business recovery, footfall ramp-up, accessibility improvement.' },
  ];

  return (
    <div className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
      <div className="text-[10px] text-white/30 uppercase tracking-widest mb-4">Project Lifecycle</div>
      <div className="flex gap-2 mb-4">
        {phases.map((p, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`flex-1 py-2 px-3 rounded-lg text-[11px] font-semibold border transition-all ${
              active === i
                ? PHASE_COLORS[i] + ' text-white/85'
                : 'border-white/5 bg-transparent text-white/25 hover:text-white/45'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
        <div className="text-[10px] text-white/30 mb-1">Duration: {phases[active].duration}</div>
        <p className="text-xs text-white/55 leading-relaxed">{phases[active].desc}</p>
      </div>
    </div>
  );
}

function StakeholderCard({ icon: Icon, title, score, level, detail, est }) {
  const levelColors = {
    minimal:  'text-emerald-400', low: 'text-green-400',
    moderate: 'text-amber-400',   high: 'text-orange-400', critical: 'text-red-400',
  };
  const barColors = {
    minimal: 'bg-emerald-500', low: 'bg-green-500',
    moderate: 'bg-amber-500',  high: 'bg-orange-500',  critical: 'bg-red-500',
  };
  return (
    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`w-4 h-4 ${levelColors[level] ?? 'text-white/40'}`} />
        <span className="text-xs font-semibold text-white/75">{title}</span>
        <span className={`ml-auto text-[10px] font-bold uppercase ${levelColors[level]}`}>{level}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className={`h-full rounded-full ${barColors[level] ?? 'bg-white/30'}`}
        />
      </div>
      <p className="text-[11px] text-white/40 leading-relaxed mt-2">{detail}</p>
      {est && <div className="mt-2 text-[10px] text-white/25">{est}</div>}
    </div>
  );
}

export default function CommunityWorkspace({ result }) {
  const se = result?.socio_economic;

  if (!se) {
    return (
      <div className="p-6 flex items-center justify-center min-h-48">
        <p className="text-sm text-white/25">Community impact data unavailable.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">

      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-[13px] font-bold text-white/70">Community Impact</h2>
      </div>

      {/* Community score hero */}
      <div className="flex items-center gap-6 p-5 rounded-2xl bg-violet-500/[0.05] border border-violet-500/20">
        <div>
          <div className="text-[10px] text-violet-400/60 uppercase tracking-widest mb-1">Community Impact Score</div>
          <div className={`font-display text-5xl font-bold ${
            se.community_impact_score >= 70 ? 'text-emerald-400' :
            se.community_impact_score >= 50 ? 'text-amber-400' : 'text-red-400'
          }`}>
            {se.community_impact_score}
          </div>
          <div className="text-[10px] text-white/25 mt-1">/ 100 · higher = better for community</div>
        </div>
        <div className="grid grid-cols-3 gap-3 flex-1">
          {[
            { label: 'Vendors Affected', value: se.vendor_impact.affected_vendors_est },
            { label: 'Recovery Months',  value: se.vendor_impact.recovery_months },
            { label: 'Footfall Gain',    value: `+${se.long_term_benefits.footfall_increase_pct}%` },
          ].map(({ label, value }) => (
            <div key={label} className="text-center p-3 rounded-lg bg-white/[0.04]">
              <div className="font-bold text-white/85 text-sm">{value}</div>
              <div className="text-[9px] text-white/25 uppercase tracking-wide mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase timeline */}
      <PhaseTimeline timeline_months={result?.timeline_months ?? 24} />

      {/* Stakeholder cards */}
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-white/20 mb-3">Stakeholder Impact</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <StakeholderCard
            icon={ShoppingBag} title="Street Vendors"
            score={se.vendor_impact.score} level={se.vendor_impact.level}
            detail={se.vendor_impact.description}
            est={`~${se.vendor_impact.affected_vendors_est} vendors · ${se.vendor_impact.recovery_months}mo recovery`}
          />
          <StakeholderCard
            icon={Footprints} title="Pedestrians"
            score={se.pedestrian_impact.score} level={se.pedestrian_impact.level}
            detail={se.pedestrian_impact.description}
            est={se.pedestrian_impact.detour_distance_m > 0 ? `~${se.pedestrian_impact.detour_distance_m}m detour` : 'Minimal detour'}
          />
          <StakeholderCard
            icon={Building2} title="Local Businesses"
            score={se.business_impact.score} level={se.business_impact.level}
            detail={se.business_impact.description}
            est={`Revenue impact: ${se.business_impact.revenue_impact_pct}%`}
          />
        </div>
      </div>

      {/* Construction disturbance + long-term row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <HardHat className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold text-white/70">Construction Disturbance</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { label: 'Duration',   value: `${se.construction_disturbance.duration_months} mo` },
              { label: 'Noise Add',  value: `+${se.construction_disturbance.noise_increase_db} dB` },
              { label: 'Dust',       value: se.construction_disturbance.dust_level },
              { label: 'Work Hrs',   value: se.construction_disturbance.work_hours },
            ].map(({ label, value }) => (
              <div key={label} className="p-2 rounded-lg bg-white/[0.03]">
                <div className="text-xs font-semibold text-white/65">{value}</div>
                <div className="text-[9px] text-white/25 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white/70">Long-Term Benefits</span>
          </div>
          <div className="flex gap-3 mb-3">
            <div className="flex-1 text-center p-2 rounded-lg bg-white/[0.04]">
              <div className="font-bold text-emerald-400">+{se.long_term_benefits.footfall_increase_pct}%</div>
              <div className="text-[9px] text-white/25 uppercase">Footfall</div>
            </div>
            <div className="flex-1 text-center p-2 rounded-lg bg-white/[0.04]">
              <div className="font-bold text-emerald-400">{se.long_term_benefits.accessibility_score}/100</div>
              <div className="text-[9px] text-white/25 uppercase">Accessibility</div>
            </div>
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed">{se.long_term_benefits.description}</p>
        </div>
      </div>

    </div>
  );
}
