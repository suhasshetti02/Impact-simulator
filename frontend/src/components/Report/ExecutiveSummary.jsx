import React from 'react';

export default function ExecutiveSummary({ result }) {
  const ps = result.planner_summary;

  return (
    <div className="report-page">
      <div className="report-header">
        <h2>1.0 Executive Summary</h2>
        <div className="report-line"></div>
      </div>

      <div className="mb-10">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{ps?.headline}</h3>
        <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
          {ps?.narrative}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="report-card">
          <h4 className="report-card-title text-emerald-700">Key Benefits</h4>
          <ul className="space-y-3">
            {ps?.key_benefits?.map((b, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="text-emerald-500 mt-1">•</span> {b}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="report-card">
          <h4 className="report-card-title text-red-700">Key Risks</h4>
          <ul className="space-y-3">
            {ps?.key_risks?.map((r, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="text-red-500 mt-1">•</span> {r}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="border border-gray-200 p-5 rounded-md">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Evidence Support</p>
          <p className="text-lg font-bold text-gray-900 capitalize">{ps?.evidence_support_level}</p>
        </div>
        <div className="border border-gray-200 p-5 rounded-md">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Model Confidence</p>
          <p className="text-lg font-bold text-gray-900 capitalize">{ps?.simulation_confidence}</p>
        </div>
        <div className="border border-gray-200 p-5 rounded-md">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Financial Budget</p>
          <p className="text-lg font-bold text-gray-900">₹{result.budget_crore} Cr</p>
        </div>
      </div>
    </div>
  );
}
