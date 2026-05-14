import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet icon path issues
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

const LOCATIONS = [
  { name: 'Silk Board Junction', lat: 12.9172, lng: 77.6228, stress: 0.95 },
  { name: 'Hebbal Flyover', lat: 13.0354, lng: 77.5971, stress: 0.88 },
  { name: 'KR Puram Bridge', lat: 13.0068, lng: 77.6946, stress: 0.92 },
  { name: 'Electronic City Phase 1', lat: 12.8452, lng: 77.6602, stress: 0.75 },
  { name: 'Marathahalli Bridge', lat: 12.9569, lng: 77.7011, stress: 0.85 },
  { name: 'Whitefield Main Road', lat: 12.9698, lng: 77.7499, stress: 0.82 },
  { name: 'Koramangala 5th Block', lat: 12.9352, lng: 77.6245, stress: 0.91 },
  { name: 'Indiranagar 100ft Road', lat: 12.9784, lng: 77.6408, stress: 0.89 },
];

const MapFlyTo = ({ activeLocation }) => {
  const map = useMap();
  useEffect(() => {
    if (activeLocation) {
      const target = LOCATIONS.find(l => l.name === activeLocation);
      if (target) {
        map.flyTo([target.lat, target.lng], 14, { duration: 1.5 });
      }
    }
  }, [activeLocation, map]);
  return null;
};

export default function BengaluruMap({ activeLocation }) {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-white/[0.05] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative">
      <div className="absolute top-4 left-4 z-[400] bg-brand-900/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/80">
        Live Traffic Overlay
      </div>
      
      <MapContainer 
        center={[12.9716, 77.5946]} 
        zoom={11} 
        style={{ height: '100%', width: '100%', background: '#030712' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        
        {LOCATIONS.map((loc) => {
          const isActive = loc.name === activeLocation;
          return (
            <CircleMarker
              key={loc.name}
              center={[loc.lat, loc.lng]}
              radius={isActive ? 12 : 6}
              pathOptions={{
                fillColor: isActive ? '#6c63ff' : (loc.stress > 0.9 ? '#ff5c7f' : '#ffb547'),
                fillOpacity: isActive ? 0.8 : 0.5,
                color: isActive ? '#fff' : 'transparent',
                weight: isActive ? 2 : 0
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <div className="font-sans">
                  <strong className="text-slate-900 block">{loc.name}</strong>
                  <span className="text-slate-500 text-xs">Stress Level: {(loc.stress * 100).toFixed(0)}%</span>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
        <MapFlyTo activeLocation={activeLocation} />
      </MapContainer>
    </div>
  );
}
