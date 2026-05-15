import React from 'react';

function PrintBarChart({ label, before, after, unit }) {
  const max = Math.max(before, after) * 1.1;
  const beforePct = (before / max) * 100;
  const afterPct = (after / max) * 100;
  const improved = (label.includes('Time') || label.includes('Count') || label.includes('Pollution')) ? after < before : after > before;
  
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-semibold text-gray-800">{label}</span>
        <span className="text-gray-500">
          <span className="mr-4">Before Policy: {before.toLocaleString()} {unit}</span>
          <span className="font-bold text-gray-900">After Policy Implementation: {after.toLocaleString()} {unit}</span>
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="w-48 text-xs text-gray-500 text-right">Before Policy</div>
          <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
            <div className="h-full bg-gray-400" style={{ width: `${beforePct}%` }}></div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-48 text-xs text-gray-500 text-right">After Policy Implementation</div>
          <div className="flex-1 h-5 bg-gray-100 rounded overflow-hidden">
            <div className={`h-full ${improved ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${afterPct}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrafficReport({ result }) {
  const d = result.deltas;
  const b = result.before;
  const a = result.after;

  return (
    <div className="report-page">
      <div className="report-header">
        <h2>2.0 Traffic Intelligence</h2>
        <div className="report-line"></div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-10">
        <div className="bg-gray-50 p-4 border border-gray-200 rounded">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Time Reduction</p>
          <p className="text-xl font-bold text-emerald-600">{Math.abs(d.travel_time_min?.change_pct).toFixed(1)}%</p>
        </div>
        <div className="bg-gray-50 p-4 border border-gray-200 rounded">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Speed Gain</p>
          <p className="text-xl font-bold text-emerald-600">+{d.avg_speed_kmh?.change_pct.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-50 p-4 border border-gray-200 rounded">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Capacity</p>
          <p className="text-xl font-bold text-emerald-600">+{d.road_capacity?.change_pct.toFixed(1)}%</p>
        </div>
        <div className="bg-gray-50 p-4 border border-gray-200 rounded">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Daily Vehicles</p>
          <p className="text-xl font-bold text-gray-800">{d.vehicle_count?.change_pct > 0 ? '+' : ''}{d.vehicle_count?.change_pct.toFixed(1)}%</p>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-6">Before Policy vs After Policy Implementation Comparison</h3>
      
      <div className="border border-gray-200 rounded-lg p-6 mb-10">
        <PrintBarChart label="Vehicle Count" before={b.vehicle_count} after={a.vehicle_count} unit="veh/day" />
        <PrintBarChart label="Average Speed" before={b.avg_speed_kmh} after={a.avg_speed_kmh} unit="km/h" />
        <PrintBarChart label="Travel Time" before={b.travel_time_min} after={a.travel_time_min} unit="min" />
        <PrintBarChart label="Road Capacity" before={b.road_capacity} after={a.road_capacity} unit="veh" />
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-4">XGBoost Model Insights</h3>
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        The simulation engine applies XGBoost trained on hyper-local urban datasets to predict traffic flow alterations. 
        The primary driving factors for the observed {d.travel_time_min?.change_pct.toFixed(1)}% change in travel time 
        are linked to geometric capacity improvements and intersection conflict reductions.
      </p>

    </div>
  );
}
