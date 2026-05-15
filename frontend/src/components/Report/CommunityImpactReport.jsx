import React from 'react';

export default function CommunityImpactReport({ result }) {
  const soc = result.socio_economic;
  if (!soc) return null;

  return (
    <div className="report-page">
      <div className="report-header">
        <h2>4.0 Community & Socio-Economic Impact</h2>
        <div className="report-line"></div>
      </div>

      <div className="mb-8">
        <p className="text-sm text-gray-700 leading-relaxed mb-4">
          This section evaluates the non-technical community disruption caused by the proposed {result.timeline_months}-month construction phase, alongside long-term accessibility gains.
        </p>
      </div>

      <div className="space-y-6 mb-10">
        {/* Vendors */}
        {soc.vendor_impact && (
          <div className="border-l-4 border-amber-500 pl-4 py-2">
            <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-2">Street Vendors & Informal Economy</h4>
            <p className="text-sm text-gray-700 mb-2">{soc.vendor_impact.description}</p>
            <div className="flex gap-6 text-xs text-gray-500">
              <span>Affected Est: <strong className="text-gray-900">{soc.vendor_impact.affected_vendors_est}</strong></span>
              <span>Recovery Timeline: <strong className="text-gray-900">{soc.vendor_impact.recovery_months} months</strong></span>
            </div>
          </div>
        )}

        {/* Businesses */}
        {soc.business_impact && (
          <div className="border-l-4 border-red-500 pl-4 py-2">
            <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-2">Local Businesses</h4>
            <p className="text-sm text-gray-700 mb-2">{soc.business_impact.description}</p>
            <div className="flex gap-6 text-xs text-gray-500">
              <span>Revenue Impact: <strong className="text-gray-900">{soc.business_impact.revenue_impact_pct}%</strong></span>
              <span>Recovery: <strong className="text-gray-900">{soc.business_impact.recovery_timeline}</strong></span>
            </div>
          </div>
        )}

        {/* Pedestrians */}
        {soc.pedestrian_impact && (
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-2">Pedestrian Accessibility</h4>
            <p className="text-sm text-gray-700 mb-2">{soc.pedestrian_impact.description}</p>
            <div className="flex gap-6 text-xs text-gray-500">
              <span>Detour Dist: <strong className="text-gray-900">{soc.pedestrian_impact.detour_distance_m}m</strong></span>
              <span className="capitalize">Long-term: <strong className="text-gray-900">{soc.pedestrian_impact.accessibility_change.replace(/_/g, ' ')}</strong></span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg">
          <h4 className="text-sm font-bold text-gray-900 mb-3">Construction Disturbance</h4>
          <table className="w-full text-sm text-left">
            <tbody>
              <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Duration</td><td className="py-2 font-semibold">{soc.construction_disturbance?.duration_months} mo</td></tr>
              <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Noise Add</td><td className="py-2 font-semibold">+{soc.construction_disturbance?.noise_increase_db} dB</td></tr>
              <tr className="border-b border-gray-200"><td className="py-2 text-gray-500">Dust Level</td><td className="py-2 font-semibold capitalize">{soc.construction_disturbance?.dust_level}</td></tr>
              <tr><td className="py-2 text-gray-500">Work Hrs</td><td className="py-2 font-semibold">{soc.construction_disturbance?.work_hours}</td></tr>
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg">
          <h4 className="text-sm font-bold text-gray-900 mb-3">Long-term Socio-Economic Benefits</h4>
          <p className="text-xs text-gray-700 mb-4">{soc.long_term_benefits?.description}</p>
          <div className="flex justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Footfall Gain</p>
              <p className="text-xl font-bold text-emerald-600">+{soc.long_term_benefits?.footfall_increase_pct}%</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase">Accessibility</p>
              <p className="text-xl font-bold text-emerald-600">{soc.long_term_benefits?.accessibility_score}/100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
