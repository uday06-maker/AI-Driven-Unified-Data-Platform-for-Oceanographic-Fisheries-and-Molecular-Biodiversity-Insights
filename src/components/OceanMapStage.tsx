import React, { useState, useEffect } from 'react';
import {
  Waves,
  Layers,
  Thermometer,
  ShieldAlert,
  Fish,
  Play,
  Pause,
  RotateCcw,
  Info,
  Compass,
} from 'lucide-react';
import { Station, TideGaugeTelemetry } from '../types/marine.js';

interface OceanMapStageProps {
  stations: Station[];
  tideGauges: TideGaugeTelemetry[];
  selectedStationId?: string;
  onSelectStation: (id: string) => void;
}

export const OceanMapStage: React.FC<OceanMapStageProps> = ({
  stations,
  tideGauges,
  selectedStationId,
  onSelectStation,
}) => {
  // Layer toggles
  const [showTsunamiWaves, setShowTsunamiWaves] = useState(true);
  const [showInundation, setShowInundation] = useState(true);
  const [showSstAnomaly, setShowSstAnomaly] = useState(true);
  const [showChlorophyll, setShowChlorophyll] = useState(false);
  const [showPfz, setShowPfz] = useState(true);
  const [isSimulating, setIsSimulating] = useState(true);
  const [waveOffset, setWaveOffset] = useState(0);

  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];
  const selectedGauge = tideGauges.find((g) => g.stationId === selectedStation?.id);

  // Animation loop for wave propagation
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setWaveOffset((prev) => (prev + 1.5) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Transform Lat/Lon to SVG Coordinates for Kerala Coast:
  // Lat: 8.0°N (bottom) to 12.0°N (top) -> Height 600px
  // Lon: 72.5°E (left/deep sea) to 77.5°E (right/coast) -> Width 800px
  const toSvgX = (lon: number) => {
    return ((lon - 72.5) / (77.5 - 72.5)) * 800;
  };
  const toSvgY = (lat: number) => {
    return 600 - ((lat - 8.0) / (12.0 - 8.0)) * 600;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Main Map Stage Canvas (3 Columns) */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm p-4 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
        {/* Top Controls & Telemetry Overlay */}
        <div className="flex flex-wrap items-center justify-between gap-3 z-10 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-sky-800 bg-sky-50 border border-sky-200 px-2.5 py-1 rounded">
              ARABIAN SEA · KERALA SHELF (INCOIS GRID)
            </span>
            <span className="text-xs font-mono text-slate-500">
              Coverage: 72.5°E - 77.5°E | 8.0°N - 12.0°N
            </span>
          </div>

          {/* Layer Visibility Toggles */}
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 p-1 rounded-lg text-xs">
            <button
              onClick={() => setShowTsunamiWaves(!showTsunamiWaves)}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                showTsunamiWaves ? 'bg-white text-sky-800 font-semibold shadow-sm border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Toggle Tsunami & Storm Swell Wave Propagation"
            >
              <Waves className="w-3.5 h-3.5 text-sky-600" />
              Swell Surge
            </button>
            <button
              onClick={() => setShowInundation(!showInundation)}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                showInundation ? 'bg-white text-rose-800 font-semibold shadow-sm border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Toggle Coastal Flood Inundation Vulnerability Polygons"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Flood Hazard
            </button>
            <button
              onClick={() => setShowSstAnomaly(!showSstAnomaly)}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                showSstAnomaly ? 'bg-white text-amber-800 font-semibold shadow-sm border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Toggle Sea Surface Temperature Anomaly Heatmap"
            >
              <Thermometer className="w-3.5 h-3.5 text-amber-600" />
              SST Anomaly
            </button>
            <button
              onClick={() => setShowPfz(!showPfz)}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                showPfz ? 'bg-white text-emerald-800 font-semibold shadow-sm border border-slate-200/80' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Toggle Potential Fishing Zones (PFZ)"
            >
              <Fish className="w-3.5 h-3.5 text-emerald-600" />
              PFZ Zones
            </button>
          </div>
        </div>

        {/* Interactive SVG Nautical Map Visualizer */}
        <div className="relative w-full h-[500px] rounded-lg overflow-hidden border border-slate-200 bg-[#e6f4fa] shadow-inner">
          <svg viewBox="0 0 800 600" className="w-full h-full select-none">
            <defs>
              {/* Realistic Coastal Marine Gradients */}
              <linearGradient id="marineBathymetryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="60%" stopColor="#cbe9f8" />
                <stop offset="85%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#f0f9ff" />
              </linearGradient>

              {/* Thermal Anomaly Heatmap Gradient */}
              <radialGradient id="heatwaveGlow" cx="45%" cy="55%" r="40%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              {/* Chlorophyll Bloom Gradient */}
              <radialGradient id="chlorophyllGlow" cx="75%" cy="50%" r="35%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                <stop offset="50%" stopColor="#059669" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#047857" stopOpacity="0" />
              </radialGradient>

              {/* Fine Nautical Grid Overlay */}
              <pattern id="nauticalGrid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#bae6fd" strokeWidth="0.75" strokeDasharray="3 3" />
              </pattern>
            </defs>

            {/* Ocean Water Background */}
            <rect width="800" height="600" fill="url(#marineBathymetryGrad)" />
            <rect width="800" height="600" fill="url(#nauticalGrid)" opacity="0.6" />

            {/* Bathymetry Depth Isobaths */}
            {/* 2000m Abyssal Contour */}
            <path
              d="M 120 0 Q 180 200 240 400 T 310 600"
              fill="none"
              stroke="#0284c7"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <text x="130" y="30" fill="#0369a1" fontWeight="600" fontSize="10" fontFamily="monospace">
              -2000m Abyssal Plain
            </text>

            {/* 200m Continental Shelf Edge */}
            <path
              d="M 460 0 Q 500 220 540 420 T 630 600"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
            <text x="470" y="50" fill="#0284c7" fontWeight="600" fontSize="10" fontFamily="monospace">
              -200m Continental Shelf Break
            </text>

            {/* SST Heatwave Thermal Anomaly Layer */}
            {showSstAnomaly && (
              <circle cx="500" cy="340" r="180" fill="url(#heatwaveGlow)" />
            )}

            {/* Chlorophyll Plume Upwelling Layer */}
            {showChlorophyll && (
              <circle cx="610" cy="300" r="120" fill="url(#chlorophyllGlow)" />
            )}

            {/* Animated Tsunami & Storm Swell Wave Fronts */}
            {showTsunamiWaves && (
              <g className="opacity-80">
                {[0, 25, 50, 75].map((st) => {
                  const r = ((waveOffset + st) % 100) * 4.5;
                  const alpha = Math.max(0, 0.9 - r / 450);
                  return (
                    <ellipse
                      key={st}
                      cx="240"
                      cy="360"
                      rx={r * 1.5}
                      ry={r}
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                      strokeOpacity={alpha}
                    />
                  );
                })}
              </g>
            )}

            {/* Realistic Kerala Coastline Landmass */}
            {/* Natural warm coastal green & sand fringe */}
            <path
              d="M 640 0 
                 L 635 80 
                 L 625 150 
                 L 610 240 
                 L 615 310 
                 L 630 380 
                 L 645 470 
                 L 695 560 
                 L 720 600 
                 L 800 600 
                 L 800 0 Z"
              fill="#dcfce7"
              stroke="#15803d"
              strokeWidth="2.5"
            />

            {/* Coastal Beach Sand Belt */}
            <path
              d="M 640 0 L 635 80 L 625 150 L 610 240 L 615 310 L 630 380 L 645 470 L 695 560 L 720 600"
              fill="none"
              stroke="#fef08a"
              strokeWidth="4"
              opacity="0.8"
            />

            {/* Low-lying Coastal Flood & Inundation Risk Polygons */}
            {showInundation && (
              <g>
                {/* Alappuzha & Kuttanad Inundation Basin */}
                <path
                  d="M 618 300 Q 640 330 635 375 Q 615 365 615 310 Z"
                  fill="#ef4444"
                  fillOpacity="0.4"
                  stroke="#dc2626"
                  strokeWidth="1.5"
                />
                <text x="645" y="340" fill="#991b1b" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  Flood Basin (28.5 km²)
                </text>

                {/* Kollam / Neendakara Estuary Risk Polygon */}
                <path
                  d="M 632 375 Q 655 410 645 450 Q 630 440 630 385 Z"
                  fill="#f59e0b"
                  fillOpacity="0.4"
                  stroke="#d97706"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {/* Potential Fishing Zones (PFZ) Fronts */}
            {showPfz && (
              <g>
                <path
                  d="M 520 220 Q 560 270 550 330 Q 530 390 560 440"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3.5"
                  strokeDasharray="6 3"
                />
                <text x="440" y="270" fill="#065f46" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  PFZ High Pelagic Front (Sardine/Mackerel)
                </text>
              </g>
            )}

            {/* Major Coastal Cities & Ports */}
            {[
              { name: 'Calicut (Kozhikode)', x: 622, y: 155 },
              { name: 'Kochi (Cochin Port)', x: 612, y: 310 },
              { name: 'Alappuzha (Alleppey)', x: 628, y: 380 },
              { name: 'Kollam (Quilon)', x: 642, y: 465 },
              { name: 'Vizhinjam / Trivandrum', x: 700, y: 560 },
            ].map((city) => (
              <g key={city.name}>
                <circle cx={city.x} cy={city.y} r="3.5" fill="#0f172a" />
                <circle cx={city.x} cy={city.y} r="6" fill="none" stroke="#0f172a" strokeWidth="1" opacity="0.4" />
                <text
                  x={city.x + 8}
                  y={city.y + 4}
                  fill="#0f172a"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  {city.name}
                </text>
              </g>
            ))}

            {/* Stations & Buoy Markers */}
            {stations.map((st) => {
              const x = toSvgX(st.lon);
              const y = toSvgY(st.lat);
              const isSelected = st.id === selectedStationId;
              const gauge = tideGauges.find((g) => g.stationId === st.id);
              const isHazard = gauge?.floodRiskLevel === 'EMERGENCY' || gauge?.floodRiskLevel === 'WARNING';

              return (
                <g
                  key={st.id}
                  onClick={() => onSelectStation(st.id)}
                  className="cursor-pointer group"
                >
                  {/* Outer selection ring */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2"
                      strokeDasharray="2 2"
                      className="animate-pulse"
                    />
                  )}

                  {/* Hazard Pulse ring */}
                  {isHazard && (
                    <circle
                      cx={x}
                      cy={y}
                      r="12"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      opacity="0.8"
                    />
                  )}

                  {/* Main Marker Core */}
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 7 : 5}
                    fill={isHazard ? '#ef4444' : isSelected ? '#0284c7' : '#0ea5e9'}
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all hover:scale-125"
                  />

                  {/* Station Label */}
                  <rect
                    x={x + 8}
                    y={y - 12}
                    width={st.name.length * 6.5 + 16}
                    height="18"
                    rx="4"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    opacity={isSelected ? 1 : 0.9}
                  />
                  <text
                    x={x + 14}
                    y={y + 1}
                    fill="#0f172a"
                    fontSize="9.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {st.id} · {st.name}
                  </text>
                </g>
              );
            })}

            {/* Nautical Compass Rose */}
            <g transform="translate(60, 80)">
              <circle cx="0" cy="0" r="28" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" opacity="0.9" />
              <line x1="0" y1="-26" x2="0" y2="26" stroke="#0284c7" strokeWidth="2" />
              <line x1="-26" y1="0" x2="26" y2="0" stroke="#94a3b8" strokeWidth="1.5" />
              <polygon points="0,-26 5,-8 -5,-8" fill="#0284c7" />
              <polygon points="0,26 5,8 -5,8" fill="#94a3b8" />
              <text x="-4" y="-30" fill="#0284c7" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                N
              </text>
              <text x="30" y="4" fill="#64748b" fontSize="10" fontFamily="sans-serif">
                E
              </text>
            </g>
          </svg>
        </div>

        {/* Bottom Chart Footer Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              PFZ High Pelagic Fronts
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
              Inundation Hazard Zone
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
              SST Anomaly (&gt;+1.2°C)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer transition-colors"
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isSimulating ? 'Pause Waves' : 'Resume Waves'}
            </button>
            <button
              onClick={() => setWaveOffset(0)}
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              title="Reset Wave Animation Phase"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Inspection Column (1 Column) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4 flex flex-col justify-between">
        <div>
          <div className="pb-3 border-b border-slate-200">
            <div className="text-xs font-mono font-bold uppercase text-sky-800 flex items-center justify-between">
              <span>STATION INSPECTION</span>
              <span className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                {selectedStation?.stationType}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight mt-1">
              {selectedStation?.name}
            </h3>
            <div className="text-xs font-mono text-slate-500 mt-0.5">
              ID: {selectedStation?.id} · Depth: {selectedStation?.depthMeters}m
            </div>
          </div>

          {/* Realistic Coastal Surge Visual Monitor Card */}
          <div className="relative rounded-lg overflow-hidden border border-slate-200 shadow-xs group mt-3">
            <div className="h-32 w-full relative">
              <img
                src="/src/assets/images/coastal_ocean_surge_1793210415287.jpg"
                alt="Kerala Coastal Storm Swell and Inundation Monitoring"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>INCOIS Wave Cam · Live</span>
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
                <span className="font-semibold text-[11px] drop-shadow-xs">{selectedStation?.name} Shore</span>
                <span className="font-mono text-[10px] text-sky-200">Hs: {selectedGauge?.significantWaveHeightMeters ?? 1.8}m</span>
              </div>
            </div>
            <div className="bg-slate-50 p-2 text-[11px] text-slate-600 flex items-center justify-between border-t border-slate-200">
              <span>Sensor: Radar Altimeter + Acoustic Buoy</span>
              <span className="font-mono text-sky-700 font-semibold">SW Monsoon</span>
            </div>
          </div>

          {/* Real-time Telemetry Metrics */}
          <div className="mt-3 space-y-2.5">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Tidal Surge Anomaly</div>
              <div className="text-xl font-mono font-bold text-slate-900 mt-0.5 flex items-baseline justify-between">
                <span>
                  {selectedGauge ? `${selectedGauge.surgeAnomalyMeters >= 0 ? '+' : ''}${selectedGauge.surgeAnomalyMeters.toFixed(2)} m` : '--'}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                    selectedGauge?.floodRiskLevel === 'EMERGENCY'
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : selectedGauge?.floodRiskLevel === 'WARNING'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {selectedGauge?.floodRiskLevel || 'NORMAL'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Significant Wave Height (Hs)</div>
              <div className="text-xl font-mono font-bold text-slate-900 mt-0.5 flex items-baseline justify-between">
                <span>{selectedGauge ? `${selectedGauge.significantWaveHeightMeters} m` : '1.8 m'}</span>
                <span className="text-xs text-slate-500 font-mono">Tp: {selectedGauge?.wavePeriodSeconds || 12}s</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Flood Inundation Vulnerability</div>
              <div className="text-sm font-semibold text-slate-900 mt-1">
                {selectedGauge?.inundationRiskAreaKm2 ? `${selectedGauge.inundationRiskAreaKm2} km² Coastal Hazard Basin` : 'Low Risk Zone'}
              </div>
              <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                {selectedGauge?.floodRiskLevel === 'EMERGENCY'
                  ? 'Urgent: Coastal evacuation and traditional craft beaching advisory active.'
                  : 'Nominal monitoring across Kerala continental shelf and estuarine inlets.'}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500 font-medium">Coordinates & Lineage</div>
              <div className="text-xs font-mono text-slate-700 mt-1">
                LAT: {selectedStation?.lat.toFixed(4)}°N
                <br />
                LON: {selectedStation?.lon.toFixed(4)}°E
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-200">
                Moored Data Buoy / Tide Gauge Network (INCOIS-CMLRE).
              </div>
            </div>
          </div>
        </div>

        {/* Quick Station Selector Dropdown */}
        <div className="pt-3 border-t border-slate-200">
          <label className="text-xs font-medium text-slate-700 block mb-1">
            Jump to Station:
          </label>
          <select
            value={selectedStationId}
            onChange={(e) => onSelectStation(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-mono focus:outline-none focus:border-sky-500"
          >
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} - {s.name} ({s.depthMeters}m)
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
