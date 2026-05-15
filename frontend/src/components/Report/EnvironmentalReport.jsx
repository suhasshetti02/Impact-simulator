import React from 'react';

export default function EnvironmentalReport({ result }) {
  const env = result.environmental;
  if (!env) return null;

  return (
    <div className="report-page">
      <div className="report-header">
        <h2>3.0 Environmental Analysis</h2>
        <div className="report-line"></div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-10">
        <div className="report-card">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Environmental Score</p>
          <p className="text-4xl font-bold text-gray-900 mb-2">{env.impact?.environmental_score}/100</p>
          <p className="text-xs text-gray-600">Calculated based on local AQI, PM2.5 delta, and noise disruption indices.</p>
        </div>
        <div className="report-card">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">CO₂ Savings Est.</p>
          <p className="text-4xl font-bold text-emerald-600 mb-2">{env.impact?.co2_saved_kg_day?.toLocaleString()} <span className="text-xl">kg/day</span></p>
          <p className="text-xs text-gray-600">Estimated based on reduction in stop-and-go traffic and idling.</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-6">Metrics Comparison</h3>
      
      <table className="report-table mb-10">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Before Policy</th>
            <th>After Policy Implementation</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Air Quality Index (AQI)</td>
            <td>{env.before?.aqi}</td>
            <td>{env.after?.aqi}</td>
            <td className={env.deltas?.aqi_pct < 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
              {env.deltas?.aqi_pct?.toFixed(1)}%
            </td>
          </tr>
          <tr>
            <td>PM2.5 (µg/m³)</td>
            <td>{env.before?.pm25_ugm3}</td>
            <td>{env.after?.pm25_ugm3}</td>
            <td className={env.deltas?.pm25_pct < 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
              {env.deltas?.pm25_pct?.toFixed(1)}%
            </td>
          </tr>
          <tr>
            <td>Noise Levels (dB)</td>
            <td>{env.before?.noise_db} ({env.before?.noise_category})</td>
            <td>{env.after?.noise_db} ({env.after?.noise_category})</td>
            <td className={env.deltas?.noise_pct < 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
              {env.deltas?.noise_pct?.toFixed(1)}%
            </td>
          </tr>
        </tbody>
      </table>

      {result.sdg_kpis && (
        <>
          <h3 className="text-lg font-bold text-gray-900 mb-4">SDG 9 Alignment</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(result.sdg_kpis).map(([key, kpi]) => (
              <div key={key} className="border border-gray-200 p-4 rounded bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{kpi.label}</p>
                  <p className="text-[10px] text-gray-500 uppercase">Target: {kpi.target}{kpi.unit}</p>
                </div>
                <div className={`text-xl font-bold ${kpi.value >= kpi.target ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {kpi.value}{kpi.unit}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
