/**
 * ContextDrawer — Collapsible right-side intelligence drawer.
 *
 * Shows simulation metadata, model confidence, source count,
 * risk level, and quick export actions.
 * Pattern: Linear right-detail-panel / Vercel deployment detail sidebar.
 */
import React from 'react';
import { Database, Cpu, Shield, AlertTriangle, Hash, Clock, Download, Target } from 'lucide-react';

function MetaRow({ icon: Icon, label, value, valueClass = 'text-white/75' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-2 text-white/30">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-[11px] font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-5">
      <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 mb-2 px-4">{title}</div>
      <div className="px-4">{children}</div>
    </div>
  );
}

const RISK_MAP = {
  strongly_recommended:    { label: 'Low Risk',      color: 'text-emerald-400' },
  proceed_with_conditions: { label: 'Moderate Risk', color: 'text-amber-400' },
  requires_review:         { label: 'High Risk',     color: 'text-orange-400' },
  not_recommended:         { label: 'Critical Risk', color: 'text-red-400' },
};

export default function ContextDrawer({ result, onPrint }) {
  if (!result) return null;

  const reco    = result.planner_summary?.recommendation;
  const risk    = RISK_MAP[reco] || RISK_MAP.proceed_with_conditions;
  const sources = result.evidence?.total_sources ?? 0;
  const community = result.socio_economic?.community_impact_score;
  const envScore  = result.environmental?.impact?.environmental_score;
  const simmedAt  = result.simulated_at
    ? new Date(result.simulated_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div className="w-full h-full bg-[#0c0c0c] overflow-y-auto custom-scrollbar py-4">

      {/* Header */}
      <div className="px-4 mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/20 mb-1">Intelligence Drawer</div>
        <div className="text-[12px] font-semibold text-white/60">Simulation Context</div>
      </div>

      {/* Model */}
      <Section title="ML Model">
        <MetaRow icon={Cpu}    label="Engine"     value="XGBoost + KML Geo" />
        <MetaRow icon={Shield} label="Confidence" value="High" valueClass="text-emerald-400" />
        <MetaRow icon={Hash}   label="Policy"     value={result.policy_type?.replace(/_/g,' ')} />
        <MetaRow icon={Clock}  label="Simulated"  value={simmedAt} />
      </Section>

      {/* Risk */}
      <Section title="Risk Assessment">
        <MetaRow icon={AlertTriangle} label="Risk Level"  value={risk.label} valueClass={risk.color} />
        {community != null && (
          <MetaRow icon={Hash} label="Community Score" value={`${community}/100`}
            valueClass={community >= 70 ? 'text-emerald-400' : community >= 50 ? 'text-amber-400' : 'text-red-400'}
          />
        )}
        {envScore != null && (
          <MetaRow icon={Hash} label="Env. Score" value={`${envScore}/100`} />
        )}
      </Section>

      {/* Evidence */}
      <Section title="Evidence Layer">
        <MetaRow icon={Database} label="Sources"    value={`${sources} cached`} valueClass="text-amber-400" />
        <MetaRow icon={Shield}   label="Cache Hit"  value="100%" valueClass="text-emerald-400" />
        <MetaRow icon={Hash}     label="Live Search" value="Disabled" valueClass="text-white/30" />
      </Section>

      {/* Financial */}
      <Section title="Financial">
        <MetaRow icon={Hash}  label="Budget"   value={`₹${result.budget_crore}Cr`} />
        <MetaRow icon={Hash}  label="ROI"      value={result.roi_score?.toFixed(2)}
          valueClass={result.roi_score >= 1 ? 'text-emerald-400' : 'text-amber-400'}
        />
        <MetaRow icon={Clock} label="Timeline" value={`${result.timeline_months} months`} />
      </Section>

      {/* SDG */}
      {result.sdg_kpis && (
        <Section title="SDG 9 KPIs">
          {Object.entries(result.sdg_kpis).map(([key, kpi]) => {
            let shortLabel = kpi.label;
            if (key === 'congestion_reduction') shortLabel = 'Congestion';
            if (key === 'pollution_reduction') shortLabel = 'Pollution';
            if (key === 'capacity_improvement') shortLabel = 'Capacity';
            if (key === 'speed_improvement') shortLabel = 'Speed';
            
            return (
              <MetaRow
                key={key}
                icon={Target}
                label={shortLabel}
                value={`${kpi.value}${kpi.unit}`}
                valueClass={kpi.value >= kpi.target ? 'text-emerald-400' : 'text-amber-400'}
              />
            );
          })}
        </Section>
      )}

      {/* Export */}
      <div className="px-4 pt-2 mt-2 border-t border-white/5 space-y-2">
        <button onClick={onPrint} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-semibold text-white/50 border border-white/8 hover:border-white/20 hover:text-white/80 transition-all">
          <Download className="w-3 h-3" /> Export PDF
        </button>
        <button onClick={() => {
          const blob = new Blob([JSON.stringify(result, null, 2)], {type: 'application/json'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `simulation_${result.location?.replace(/\s+/g, '_').toLowerCase()}.json`;
          a.click();
        }} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[11px] font-semibold text-white/50 border border-white/8 hover:border-cyan-400/30 hover:text-cyan-400/80 transition-all">
          <Download className="w-3 h-3" /> Export JSON
        </button>
      </div>

    </div>
  );
}
