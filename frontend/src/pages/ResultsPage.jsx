/**
 * ResultsPage — Urban Intelligence Decision Platform
 *
 * Architecture:
 *   SimulationStatusBar (sticky context strip)
 *   WorkspaceShell      (tab nav + AnimatePresence transitions + ContextDrawer)
 *     ↳ OverviewWorkspace     — executive summary
 *     ↳ TrafficWorkspace      — ML analysis
 *     ↳ EnvironmentalWorkspace— geo-environment
 *     ↳ CommunityWorkspace    — socio-economic
 *     ↳ ResearchWorkspace     — evidence terminal
 *     ↳ PlannerWorkspace      — decision support
 *
 * Key design decisions:
 * - NO long scrolling. Each workspace manages its own layout.
 * - Progressive disclosure: most important info is always visible.
 * - Single API call — the full enriched payload is passed down via props.
 * - All new components are null-safe — any missing data shows a graceful placeholder.
 */

import React, { useState } from 'react';
import { createPortal }     from 'react-dom';
import { useLocation }      from 'react-router-dom';
import { runSimulation }    from '../services/simulationService';

// Layout
import SimulationStatusBar  from '../components/Results/SimulationStatusBar';
import WorkspaceShell       from '../components/Results/WorkspaceShell';
import PrintableReport      from '../components/Report/PrintableReport';

// Workspace panels
import OverviewWorkspace     from '../components/Results/workspaces/OverviewWorkspace';
import TrafficWorkspace      from '../components/Results/workspaces/TrafficWorkspace';
import EnvironmentalWorkspace from '../components/Results/workspaces/EnvironmentalWorkspace';
import CommunityWorkspace    from '../components/Results/workspaces/CommunityWorkspace';
import PlannerWorkspace      from '../components/Results/workspaces/PlannerWorkspace';

// ── Demo fallback ─────────────────────────────────────────────────────────────
// Shown when the user navigates to /results directly without running a simulation.
// Includes all new keys so the full platform UI is always demonstrable.
const DEMO_RESULT = {
  policy_type: 'flyover', location: 'Hebbal Flyover',
  budget_crore: 450, timeline_months: 36,
  before: { vehicle_count: 26533, avg_speed_kmh: 40, travel_time_min: 41, pollution_index: 175, road_capacity: 28530 },
  after:  { vehicle_count: 16200, avg_speed_kmh: 58, travel_time_min: 26, pollution_index: 132, road_capacity: 37000 },
  deltas: {
    vehicle_count:   { before: 26533, after: 16200, change: -10333, change_pct: -38.9 },
    avg_speed_kmh:   { before: 40,    after: 58,    change: 18,     change_pct:  45.0 },
    travel_time_min: { before: 41,    after: 26,    change: -15,    change_pct: -36.6 },
    pollution_index: { before: 175,   after: 132,   change: -43,    change_pct: -24.6 },
    road_capacity:   { before: 28530, after: 37000, change: 8470,   change_pct:  29.7 },
  },
  roi_score: 3.21, traffic_improvement: 28.4,
  sdg_kpis: {
    congestion_reduction: { value: 36.6, target: 30, unit: '%', label: 'Urban Congestion Reduction' },
    pollution_reduction:  { value: 24.6, target: 20, unit: '%', label: 'Pollution Index Reduction' },
    capacity_improvement: { value: 29.7, target: 25, unit: '%', label: 'Road Capacity Increase' },
    speed_improvement:    { value: 45.0, target: 20, unit: '%', label: 'Average Speed Improvement' },
  },
  impact: { time_saved_hours_day: 2580, fuel_saved_liters_day: 1290, economic_value_inr_day: 516000, sustainability_score: 64.2 },
  environmental: {
    before: { pm25_ugm3: 124.0, aqi: 278.0, noise_db: 62.1, noise_category: 'noisy' },
    after:  { pm25_ugm3:  42.0, aqi:  82.0, noise_db: 57.4, noise_category: 'moderate' },
    deltas: { pm25_delta: -82, pm25_pct: -66.1, aqi_delta: -196, aqi_pct: -70.5, noise_delta: -4.7, noise_pct: -7.6 },
    geo_context: { location: 'Hebbal Flyover', env_risk_score: 0.741, aqms_dist_km: 0.43, nqms_dist_km: 2.1 },
    impact: { co2_saved_kg_day: 21440, environmental_score: 58.6 },
  },
  socio_economic: {
    vendor_impact:     { score: 52, level: 'moderate', description: 'Street vendors within the ~500m flyover construction corridor face an estimated 36-month disruption period. Approximately 254 vendors are estimated to be directly affected, with post-construction livelihood recovery expected within 6 months.', affected_vendors_est: 254, recovery_months: 6 },
    pedestrian_impact: { score: 50, level: 'moderate', description: 'Pedestrian routes near the flyover site require detours of approximately 350m during construction. Long-term walkability and accessibility are expected to improve post-completion.', accessibility_change: 'improved_post_construction', detour_distance_m: 350 },
    business_impact:   { score: 48, level: 'moderate', description: 'Local businesses along the corridor are estimated to face a 17% reduction in footfall during the 36-month construction phase. Recovery is expected within 8 months post-completion.', revenue_impact_pct: -16.8, recovery_timeline: '8 months post-completion' },
    construction_disturbance: { duration_months: 36, noise_increase_db: 12, dust_level: 'high', work_hours: '06:00–22:00' },
    long_term_benefits: { footfall_increase_pct: 38, accessibility_score: 82.8, description: 'Post-construction, improved traffic flow and connectivity are projected to increase commercial activity by 38% over 2–3 years, driven by improved pedestrian and transit access.' },
    community_impact_score: 66,
  },
  evidence: {
    query_key: 'flyover_traffic_vendor_aqi',
    cached: true,
    total_sources: 5,
    sources: [
      { title: 'Comprehensive Study of Traffic Congestion at Hebbal Flyover', summary: 'Academic study analyzing traffic flow and bottlenecks, noting that the convergence of multiple lanes into the flyover creates significant congestion.', url: 'https://www.ijstr.org/final-print/nov2019/Comprehensive-Study-Of-Traffic-Congestion-Travel-Time-And-Traffic-Variation-At-Hebbal-Flyover.pdf', domain: 'ijstr.org', source_type: 'research_paper', confidence: 'high', relevance: 0.95, cached: true, concern: 'traffic' },
      { title: 'Predatory Infrastructure: The displacement of Bengaluru street vendors', summary: 'Urban researchers characterize long-duration construction projects as predatory, forcing small businesses and street vendors to relocate and causing livelihood loss.', url: 'https://www.thenewsminute.com/karnataka/bengaluru-street-vendors-eviction-infrastructure', domain: 'thenewsminute.com', source_type: 'case_study', confidence: 'high', relevance: 0.93, cached: true, concern: 'vendor' },
      { title: 'New Hebbal flyover loop expected to reduce congestion by 30%', summary: 'Recent additions, including a 700-meter loop inaugurated to connect Nagawara to Mehkri Circle, were designed to reduce congestion by approximately 30%.', url: 'https://indianexpress.com/article/cities/bangalore/bengaluru-hebbal-flyover-new-loop-inaugurated-9494951/', domain: 'indianexpress.com', source_type: 'official_report', confidence: 'high', relevance: 0.91, cached: true, concern: 'traffic' },
    ],
  },
  planner_summary: {
    recommendation: 'proceed_with_conditions',
    headline: 'Flyover at Hebbal offers strong traffic relief but requires a phased vendor rehabilitation plan.',
    narrative: 'Based on XGBoost simulation results, environmental engine analysis, and cached urban planning evidence:\n\nTravel time is projected to decrease by 36.6%, significantly improving peak-hour throughput at Hebbal Flyover.\n\nThe Environmental Intelligence Engine estimates AQI improvement of 70.5% post-construction, based on CPCB PM2.5 breakpoints and CALINE4-adapted dispersion modelling.\n\nThe 36-month construction timeline introduces moderate disruption to an estimated 254 street vendors and local businesses. This assessment is supported by 3 curated reference sources from institutions including BBMP, NIUA, and IISc. Post-construction vendor and business recovery is projected within 6 months, based on comparable Bengaluru project data.\n\nLong-term commercial footfall is projected to increase by 38% within 2–3 years of completion.\n\nAn ROI score of 3.21 exceeds the break-even threshold of 1.0, indicating a positive return.',
    key_risks: ['Construction-phase vendor displacement (~254 estimated)', '36-month construction timeline increases community exposure to noise and dust', 'Environmental score of 58.6 indicates partial, not full, AQI recovery'],
    key_benefits: ['36.6% travel time reduction at peak hours', '70.5% AQI improvement post-construction', 'ROI score 3.21 exceeds break-even threshold of 1.0', '38% projected long-term footfall increase', 'Sustainability score 64.2/100'],
    evidence_support_level: 'strong',
    simulation_confidence: 'high',
    generated_from: { travel_time_pct: 36.6, speed_pct: 45.0, aqi_pct: 70.5, roi: 3.21, sustainability_score: 64.2, community_score: 66, vendor_est: 254, recovery_months: 6, footfall_pct: 38, sources_count: 3, policy_type: 'flyover', location: 'Hebbal Flyover', budget_crore: 450, timeline: 36 },
  },
  simulated_at: new Date().toISOString(),
};

// ── Workspace router ──────────────────────────────────────────────────────────
function resolveWorkspace(tab, result) {
  switch (tab) {
    case 'overview':     return <OverviewWorkspace      result={result} />;
    case 'traffic':      return <TrafficWorkspace       result={result} />;
    case 'environment':  return <EnvironmentalWorkspace result={result} />;
    case 'community':    return <CommunityWorkspace     result={result} />;
    case 'planner':      return <PlannerWorkspace       result={result} />;
    default:             return <OverviewWorkspace      result={result} />;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const { state }           = useLocation();
  const [result, setResult] = useState(state?.result ?? DEMO_RESULT);
  const [loading, setLoading] = useState(false);
  const isDemo = !state?.result;
  
  const handlePrint = () => {
    // Before printing, ensure the title is updated if needed
    const oldTitle = document.title;
    document.title = `Intelligence_Report_${result.location?.replace(/\s+/g, '_')}`;
    window.print();
    document.title = oldTitle;
  };

  const rerun = async () => {
    setLoading(true);
    try {
      const fresh = await runSimulation({
        policy_type:     result.policy_type,
        location:        result.location,
        budget_crore:    result.budget_crore,
        timeline_months: result.timeline_months,
      });
      setResult(fresh);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  return (
    // Full-height container — NO page scroll. Workspaces scroll internally if needed.
    <div className="flex flex-col h-[calc(100vh-4rem)] -mt-8 -mx-8 animate-fade-in">

      {/* Sticky command bar */}
      <SimulationStatusBar
        result={result}
        isDemo={isDemo}
        onRerun={rerun}
        loading={loading}
        onPrint={handlePrint}
      />

      {/* Workspace system — fills remaining height */}
      <div className="flex-1 min-h-0">
        <WorkspaceShell result={result} onPrint={handlePrint}>
          {(activeTab) => React.cloneElement(resolveWorkspace(activeTab, result), { onPrint: handlePrint })}
        </WorkspaceShell>
      </div>

      {/* Hidden Printable Report injected at document body for clean printing */}
      {createPortal(<PrintableReport result={result} />, document.body)}

    </div>
  );
}
