import React, { useState } from 'react';
import {
  AlertTriangle,
  Waves,
  ArrowUpRight,
  ArrowDownRight,
  Radio,
  MapPin,
  Shield,
  Activity,
  Maximize2,
  ChevronRight,
} from 'lucide-react';
import { TideGaugeTelemetry, CoastalHazardAlert } from '../types/marine.js';

interface CoastalSurgeHUDProps {
  tideGauges: TideGaugeTelemetry[];
  hazardAlerts: CoastalHazardAlert[];
  selectedStationId?: string;
  onSelectStation: (id: string) => void;
}

export const CoastalSurgeHUD: React.FC<CoastalSurgeHUDProps> = ({
  tideGauges,
  hazardAlerts,
  selectedStationId,
  onSelectStation,
}) => {
  const [activeAlertIndex, setActiveAlertIndex] = useState(0);

  const currentAlert = hazardAlerts[activeAlertIndex] || hazardAlerts[0];

  return (
    <div className="space-y-4">
      {/* Real-time Coastal Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {tideGauges.map((gauge) => {
          const isSelected = selectedStationId === gauge.stationId;
          const isEmergency = gauge.floodRiskLevel === 'EMERGENCY';
          const isWarning = gauge.floodRiskLevel === 'WARNING';

          return (
            <div
              key={gauge.stationId}
              onClick={() => onSelectStation(gauge.stationId)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-white border-2 border-sky-600 shadow-md shadow-sky-500/10'
                  : 'bg-white border border-slate-200 hover:border-sky-300 hover:shadow-xs'
              }`}
            >
              {/* Top Row: Station Code & Live Status */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-sky-700 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                  {gauge.stationCode}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase font-semibold ${
                    isEmergency
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : isWarning
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {gauge.floodRiskLevel}
                </span>
              </div>

              {/* Station Name */}
              <div className="text-sm font-bold text-slate-900 tracking-tight mb-3 truncate">
                {gauge.stationName}
              </div>

              {/* Metric 1: Water Level & Surge Anomaly */}
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <div className="text-[10px] tracking-wider uppercase font-mono text-slate-500">
                    Water Level
                  </div>
                  <div className="text-2xl font-mono font-extrabold text-slate-900 tracking-tight">
                    {gauge.waterLevelMeters.toFixed(2)}
                    <span className="text-xs font-mono text-slate-500 font-normal ml-1">m</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] tracking-wider uppercase font-mono text-slate-500">
                    Surge Anomaly
                  </div>
                  <div
                    className={`text-sm font-mono font-bold flex items-center justify-end gap-0.5 ${
                      gauge.surgeAnomalyMeters > 1.0
                        ? 'text-red-600'
                        : gauge.surgeAnomalyMeters > 0.5
                        ? 'text-amber-600'
                        : 'text-sky-700'
                    }`}
                  >
                    {gauge.trend === 'RISING' ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    +{gauge.surgeAnomalyMeters.toFixed(2)}m
                  </div>
                </div>
              </div>

              {/* Metric 2: Significant Wave Height (Hs) & Period */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <Waves className="w-3.5 h-3.5 text-sky-500" />
                  Hs: <strong className="text-slate-800">{gauge.significantWaveHeightMeters.toFixed(2)}m</strong>
                </span>
                <span>
                  Tp: <strong className="text-slate-800">{gauge.wavePeriodSeconds}s</strong>
                </span>
                <span>
                  Inundation: <strong className="text-red-600">{gauge.inundationRiskAreaKm2} km²</strong>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Tsunami & Surge Early-Warning Banner */}
      {currentAlert && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200 relative overflow-hidden shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-red-600 shrink-0 mt-0.5 shadow-2xs">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-red-700 tracking-wider uppercase">
                    INCOIS COASTAL HAZARD ADVISORY
                  </span>
                  <span className="text-slate-400 font-mono text-xs">·</span>
                  <span className="text-xs font-mono text-slate-500">{currentAlert.timestamp}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {currentAlert.title}
                </h3>
                <p className="text-xs text-slate-700 max-w-4xl leading-relaxed">
                  {currentAlert.description}
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs">
                  <span className="text-slate-600">
                    Fisheries Impact: <strong className="text-red-700">{currentAlert.affectedFisheries}</strong>
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">
                    Advisory: <strong className="text-sky-800">{currentAlert.recommendedAction}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Alert Switcher */}
            <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
              {hazardAlerts.map((alt, idx) => (
                <button
                  key={alt.id}
                  onClick={() => setActiveAlertIndex(idx)}
                  className={`px-3 py-1.5 text-[11px] font-mono rounded-lg transition-colors cursor-pointer ${
                    activeAlertIndex === idx
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Alert #{idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
