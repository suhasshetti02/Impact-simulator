import React from 'react';
import { motion } from 'framer-motion';
import { Users, ShoppingBag, Footprints, Building2, TrendingUp, HardHat } from 'lucide-react';

const LEVEL_CONFIG = {
  minimal:  { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', bar: 'bg-emerald-500' },
  low:      { color: 'text-green-400',   bg: 'bg-green-500/10',   border: 'border-green-500/20',   bar: 'bg-green-500' },
  moderate: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   bar: 'bg-amber-500' },
  high:     { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  bar: 'bg-orange-500' },
  critical: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     bar: 'bg-red-500' },
};

function DisruptionBar({ score, level }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.moderate;
  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-[9px] font-bold uppercase tracking-widest ${cfg.color}`}>{level}</span>
        <span className="text-[9px] text-white/40">{score}/100</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${cfg.bar}`}
        />
      </div>
    </div>
  );
}

function ImpactCard({ icon: Icon, title, score, level, children }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.moderate;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`p-4 rounded-xl border ${cfg.border} ${cfg.bg}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${cfg.color}`} />
        <span className="text-xs font-semibold text-white/80">{title}</span>
      </div>
      <DisruptionBar score={score} level={level} />
      <p className="text-[11px] text-white/50 mt-2 leading-relaxed">{children}</p>
    </motion.div>
  );
}

function StatPill({ label, value, highlight }) {
  return (
    <div className="flex flex-col items-center px-3 py-2 rounded-lg bg-white/[0.04] border border-white/5">
      <span className={`font-bold text-sm ${highlight || 'text-white/80'}`}>{value}</span>
      <span className="text-[9px] text-white/30 uppercase tracking-wide mt-0.5">{label}</span>
    </div>
  );
}

export default function SocioEconomicPanel({ socioEconomic }) {
  if (!socioEconomic) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-white/5 flex items-center justify-center min-h-[120px]">
        <p className="text-xs text-white/25">Community impact analysis unavailable</p>
      </div>
    );
  }

  const {
    vendor_impact, pedestrian_impact, business_impact,
    construction_disturbance, long_term_benefits, community_impact_score,
  } = socioEconomic;

  const communityColor =
    community_impact_score >= 70 ? 'text-emerald-400' :
    community_impact_score >= 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="space-y-4">
      {/* Header stat strip */}
      <div className="glass-panel rounded-2xl p-5 border border-violet-500/20 border-t-2 border-t-violet-500/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-semibold text-white/80">Community Impact Score</span>
            </div>
            <p className="text-[10px] text-white/30 mt-0.5">Composite — higher is better for community</p>
          </div>
          <span className={`font-display text-4xl font-bold ${communityColor}`}>
            {community_impact_score}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <StatPill
            label="Vendors Affected"
            value={vendor_impact.affected_vendors_est}
            highlight="text-amber-400"
          />
          <StatPill
            label="Recovery (mo.)"
            value={vendor_impact.recovery_months}
          />
          <StatPill
            label="Footfall Gain"
            value={`+${long_term_benefits.footfall_increase_pct}%`}
            highlight="text-emerald-400"
          />
        </div>
      </div>

      {/* Three impact cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ImpactCard
          icon={ShoppingBag}
          title="Vendor Disruption"
          score={vendor_impact.score}
          level={vendor_impact.level}
        >
          {vendor_impact.description}
        </ImpactCard>

        <ImpactCard
          icon={Footprints}
          title="Pedestrian Access"
          score={pedestrian_impact.score}
          level={pedestrian_impact.level}
        >
          {pedestrian_impact.description}
        </ImpactCard>

        <ImpactCard
          icon={Building2}
          title="Business Disruption"
          score={business_impact.score}
          level={business_impact.level}
        >
          {business_impact.description}
        </ImpactCard>
      </div>

      {/* Construction + Long-term row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <HardHat className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold text-white/70">Construction Disturbance</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Duration', value: `${construction_disturbance.duration_months} months` },
              { label: 'Noise Added', value: `+${construction_disturbance.noise_increase_db} dB` },
              { label: 'Dust Level', value: construction_disturbance.dust_level },
              { label: 'Work Hours', value: construction_disturbance.work_hours },
            ].map(({ label, value }) => (
              <div key={label} className="text-center p-2 rounded-lg bg-white/[0.03]">
                <div className="text-xs font-semibold text-white/70">{value}</div>
                <div className="text-[9px] text-white/30 uppercase tracking-wide">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-500/[0.05] border border-emerald-500/15">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white/70">Long-term Benefits</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <StatPill
              label="Footfall Increase"
              value={`+${long_term_benefits.footfall_increase_pct}%`}
              highlight="text-emerald-400"
            />
            <StatPill
              label="Accessibility Score"
              value={`${long_term_benefits.accessibility_score}/100`}
              highlight="text-emerald-400"
            />
          </div>
          <p className="text-[11px] text-white/40 leading-relaxed">
            {long_term_benefits.description}
          </p>
        </div>
      </div>
    </div>
  );
}
