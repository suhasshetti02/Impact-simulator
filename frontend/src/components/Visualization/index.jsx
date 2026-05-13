import React from 'react';
import TrafficChart  from './TrafficChart';
import PollutionChart from './PollutionChart';

export default function Visualization({ result }) {
  return (
    <div className="flex flex-col gap-5">
      <TrafficChart result={result} />
      <PollutionChart result={result} />
    </div>
  );
}
