import React, { useState } from 'react';
import {
  Waves,
  Brain,
  Dna,
  Fish,
  ShieldAlert,
  Terminal,
  Database,
  ArrowRight,
  TrendingDown,
  Activity,
  Compass,
  BookOpen,
  Info,
  ChevronRight,
  Sparkles,
  Layers,
  Thermometer,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { TideGaugeTelemetry, CoastalHazardAlert, CorrelationMetric } from '../types/marine.js';
import { PWAInstallButton } from './PWAInstallButton.js';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  tideGauges: TideGaugeTelemetry[];
  alerts: CoastalHazardAlert[];
  correlationMetrics: CorrelationMetric[];
  stationsCount: number;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  tideGauges,
  alerts,
  correlationMetrics,
  stationsCount,
}) => {
  const [activeTopic, setActiveTopic] = useState<
    'upwelling' | 'surge' | 'fisheries' | 'edna' | 'mining'
  >('upwelling');

  // Find max wave height and max surge anomaly from live telemetry
  const maxWave = tideGauges.reduce(
    (max, g) => (g.significantWaveHeightMeters > max ? g.significantWaveHeightMeters : max),
    0
  );
  const maxSurge = tideGauges.reduce(
    (max, g) => (g.surgeAnomalyMeters > max ? g.surgeAnomalyMeters : max),
    0
  );
  const totalInundationArea = tideGauges.reduce(
    (sum, g) => sum + (g.inundationRiskAreaKm2 || 0),
    0
  );

  return (
    <div className="space-y-10">
      {/* 1. Realistic Daytime Coastal Hero Section */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-md bg-white min-h-[460px] flex flex-col justify-between">
        {/* Real Coastal Ocean Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/realistic_coastal_ocean_1793211002067.jpg"
            alt="Kerala Coastline and Arabian Sea with Turquoise Waves and Sunny Sandy Shore"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />
          {/* Measured Light Contrast Scrim */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/65 to-slate-900/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-4xl space-y-6">
          {/* Institutional Trust Line */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-white/95 text-sky-800 border border-sky-100 flex items-center gap-1.5 shadow-sm">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              Ministry of Earth Sciences (MoES) · Government of India
            </span>
            <span className="text-sky-200 font-mono text-xs">·</span>
            <span className="text-xs font-medium text-sky-100">
              CMLRE Kochi & INCOIS Hyderabad Sensor Array
            </span>
          </div>

          {/* Main Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Unified Marine Oceanographic, Coastal Surge & Biodiversity Platform
            </h1>
            <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-sans max-w-3xl">
              Welcome to <strong className="text-sky-300">SAMUDRA-DATA</strong> — an integrated scientific platform
              bridging <strong className="text-white">Physical Oceanography</strong>,{' '}
              <strong className="text-white">Coastal Surge & Tsunami Early Warning</strong>,{' '}
              <strong className="text-white">Commercial Fisheries Dynamics</strong>, and{' '}
              <strong className="text-white">Molecular eDNA Genomics</strong> across the Indian Exclusive Economic Zone.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('map')}
              className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-gradient-to-r from-sky-600 to-teal-600 rounded-xl hover:from-sky-700 hover:to-teal-700 shadow-md shadow-sky-950/30 transition-all font-sans cursor-pointer group"
            >
              <span>Explore Live Surge & Map Stage</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('kmeans')}
              className="flex items-center gap-2 px-5 py-3 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm transition-all font-sans cursor-pointer"
            >
              <Brain className="w-4 h-4 text-sky-600" />
              <span>Explore K-Means Data Mining</span>
            </button>

            <button
              onClick={() => onNavigate('ai')}
              className="flex items-center gap-2 px-4 py-3 text-xs font-semibold text-white bg-white/20 hover:bg-white/30 border border-white/40 rounded-xl transition-all font-sans cursor-pointer backdrop-blur-md shadow-xs"
            >
              <Terminal className="w-4 h-4 text-sky-200" />
              <span>Ask AI Assistant (Text-to-SQL)</span>
            </button>
          </div>
        </div>

        {/* Telemetry Status Strip at bottom of Hero */}
        <div className="relative z-10 bg-white/95 backdrop-blur-md border-t border-slate-200/80 p-4 px-6 sm:px-10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">Arabian Sea Stations</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">{stationsCount || 30} Sensor Sites</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">Max Swell Height (Hs)</div>
            <div className="text-lg font-bold text-sky-700 mt-0.5">{maxWave.toFixed(2)} m (Alappuzha)</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">Peak Surge Anomaly</div>
            <div className="text-lg font-bold text-red-600 mt-0.5">+{maxSurge.toFixed(2)} m (High Risk)</div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-500 tracking-wider">Active Hazard Advisories</div>
            <div className="text-lg font-bold text-amber-600 mt-0.5">{alerts.length} Inundation Alerts</div>
          </div>
        </div>
      </div>

      {/* Progressive Web App Install Banner */}
      <PWAInstallButton variant="banner" />

      {/* 2. Scientific Knowledge & Ocean Learning Hub */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-700">
                SCIENTIFIC FOUNDATIONS & OCEAN DYNAMICS
              </span>
              <span className="text-slate-400 font-mono text-xs">·</span>
              <span className="text-xs font-medium text-slate-500">Indian EEZ Marine Ecosystem</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              Understanding the Multi-Domain Marine System
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            Select a topic to explore core oceanographic mechanics
          </span>
        </div>

        {/* Topic Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => setActiveTopic('upwelling')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeTopic === 'upwelling'
                ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-4 h-4 text-sky-600" />
              <span className="text-xs font-bold font-mono">01. Upwelling</span>
            </div>
            <p className="text-[11px] truncate text-slate-500">Ekman Transport & Physics</p>
          </button>

          <button
            onClick={() => setActiveTopic('surge')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeTopic === 'surge'
                ? 'bg-red-50 border-red-400 text-red-900 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Waves className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold font-mono">02. Surges & Floods</span>
            </div>
            <p className="text-[11px] truncate text-slate-500">Tsunami & Tidal Inundation</p>
          </button>

          <button
            onClick={() => setActiveTopic('fisheries')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeTopic === 'fisheries'
                ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Fish className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold font-mono">03. Fisheries</span>
            </div>
            <p className="text-[11px] truncate text-slate-500">Sardine & CPUE Crash</p>
          </button>

          <button
            onClick={() => setActiveTopic('edna')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeTopic === 'edna'
                ? 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Dna className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold font-mono">04. eDNA Genomics</span>
            </div>
            <p className="text-[11px] truncate text-slate-500">Metabarcoding 12S/COI</p>
          </button>

          <button
            onClick={() => setActiveTopic('mining')}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              activeTopic === 'mining'
                ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs'
                : 'bg-slate-50/70 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold font-mono">05. Data Mining</span>
            </div>
            <p className="text-[11px] truncate text-slate-500">K-Means & Clustering</p>
          </button>
        </div>

        {/* Topic Detail Card */}
        <div className="p-6 rounded-xl bg-slate-50/80 border border-slate-200 text-xs leading-relaxed">
          {activeTopic === 'upwelling' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2 text-sky-800 font-mono text-sm font-bold">
                  <Thermometer className="w-4 h-4 text-sky-600" />
                  <span>Topic 1: The Arabian Sea Coastal Upwelling System</span>
                </div>
                <p className="text-slate-700 font-sans text-xs sm:text-sm">
                  During the Southwest Monsoon (June to September), strong equatorward winds blowing along the
                  western coast of India generate offshore <strong>Ekman transport</strong>. Surface waters are pushed
                  westward, forcing deep, cold (21–25°C), nutrient-rich waters (rich in nitrates and phosphates) to rise
                  from the subsurface thermocline to the sunlit photic layer.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Chlorophyll-a Bloom:</span>
                    <div className="text-slate-900 font-bold text-sm mt-0.5">&gt; 3.5 mg/m³ (Phytoplankton)</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Thermocline Shoaling:</span>
                    <div className="text-sky-700 font-bold text-sm mt-0.5">Rises from 80m to 15m Depth</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Ecological Role:</span>
                    <div className="text-emerald-700 font-bold text-sm mt-0.5">Supports 70% of Pelagic Catch</div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 rounded-xl overflow-hidden border border-slate-200 relative h-48 lg:h-56 shadow-sm">
                <img
                  src="/src/assets/images/kmeans_ocean_clusters_1793279282150.jpg"
                  alt="Arabian Sea Upwelling & Thermocline Dynamics"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2 text-white font-mono text-[10px] bg-slate-900/80 px-2 py-1 rounded">
                  Upwelling & Oxygen Minimum Zone (OMZ)
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'surge' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2 text-red-800 font-mono text-sm font-bold">
                  <Waves className="w-4 h-4 text-red-600" />
                  <span>Topic 2: Coastal Surges, Tsunamis & Inundation Hazards</span>
                </div>
                <p className="text-slate-700 font-sans text-xs sm:text-sm">
                  Storm surges are abnormal rises of seawater generated by cyclonic atmospheric pressure drops and
                  intense onshore wind friction. When coupled with high spring tides (perigean spring tides), storm
                  waves overtop coastal seawalls, causing catastrophic seawater inundation across the low-lying
                  coastal zones of Kerala (Alappuzha, Chellanam, Vypeen).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Surge Anomaly Threshold:</span>
                    <div className="text-red-700 font-bold text-sm mt-0.5">&gt; +0.8m Triggers Evacuation</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Inundation Vulnerability:</span>
                    <div className="text-amber-700 font-bold text-sm mt-0.5">28.5 km² Lowland Buffer Zone</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Early Warning Authority:</span>
                    <div className="text-slate-900 font-bold text-sm mt-0.5">INCOIS Tidal Sensor Network</div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 rounded-xl overflow-hidden border border-slate-200 relative h-48 lg:h-56 shadow-sm">
                <img
                  src="/src/assets/images/coastal_ocean_surge_1793210415287.jpg"
                  alt="Kerala Coast Storm Swell & Inundation Wave Breaking"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2 text-white font-mono text-[10px] bg-slate-900/80 px-2 py-1 rounded">
                  Kerala Coastal Wave Surge & Inundation
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'fisheries' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-mono text-sm font-bold">
                  <Fish className="w-4 h-4 text-amber-600" />
                  <span>Topic 3: Fisheries Dynamics & Marine Heatwave Disruptions</span>
                </div>
                <p className="text-slate-700 font-sans text-xs sm:text-sm">
                  The Indian oil sardine (<em>Sardinella longiceps</em>) is the mainstay of Kerala’s artisanal and
                  commercial fisheries. It feeds directly on upwelling-induced diatom phytoplankton. When prolonged
                  marine heatwaves occur (SST &gt; 29.5°C), the upper water column stratifies, suppressing upwelling.
                  Diatoms die off, leading to rapid starvation of larval sardines and causing commercial CPUE to crash
                  by up to 74%.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Pearson Correlation (r):</span>
                    <div className="text-slate-900 font-bold text-sm mt-0.5">-0.782 (Statistically Significant)</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">2023 Heatwave Crash:</span>
                    <div className="text-red-700 font-bold text-sm mt-0.5">-74.2% Commercial Landings</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Management Action:</span>
                    <div className="text-sky-800 font-bold text-sm mt-0.5">CMFRI Ring-Seine Quotas</div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 rounded-xl overflow-hidden border border-slate-200 relative h-48 lg:h-56 shadow-sm">
                <img
                  src="/src/assets/images/sardine_upwelling_kerala_1793279252695.jpg"
                  alt="Schooling Sardinella longiceps in Upwelling Plume"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2 text-white font-mono text-[10px] bg-slate-900/80 px-2 py-1 rounded">
                  Sardinella longiceps Schooling off Kerala
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'edna' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 font-mono text-sm font-bold">
                  <Dna className="w-4 h-4 text-emerald-600" />
                  <span>Topic 4: Environmental DNA (eDNA) Metabarcoding</span>
                </div>
                <p className="text-slate-700 font-sans text-xs sm:text-sm">
                  Traditional fish trawl surveys are invasive and harm fragile habitats. Environmental DNA (eDNA) allows
                  scientists to take a simple 1-liter seawater sample, extract cellular DNA shed by marine life (mucus,
                  scales, feces), amplify universal mitochondrial barcodes (12S rRNA for fish, COI for invertebrates),
                  and sequence them using high-throughput NGS to detect every species present.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Target Gene:</span>
                    <div className="text-emerald-700 font-bold text-sm mt-0.5">MiFish 12S rRNA Barcode</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Taxonomic Database:</span>
                    <div className="text-sky-700 font-bold text-sm mt-0.5">WoRMS AphiaID Standard</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Hypoxia Indicator:</span>
                    <div className="text-amber-700 font-bold text-sm mt-0.5">Aurelia aurita Bloom Detection</div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 rounded-xl overflow-hidden border border-slate-200 relative h-48 lg:h-56 shadow-sm">
                <img
                  src="/src/assets/images/edna_marine_sampling_1793279267636.jpg"
                  alt="Niskin Rosette CTD Water Collection on Research Deck"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2 text-white font-mono text-[10px] bg-slate-900/80 px-2 py-1 rounded">
                  Seawater eDNA Sampling · Sagar Sampada
                </div>
              </div>
            </div>
          )}

          {activeTopic === 'mining' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex items-center gap-2 text-indigo-800 font-mono text-sm font-bold">
                  <Brain className="w-4 h-4 text-indigo-600" />
                  <span>Topic 5: Data Mining & K-Means Unsupervised Machine Learning</span>
                </div>
                <p className="text-slate-700 font-sans text-xs sm:text-sm">
                  In data mining, K-Means clustering partitions observations into $k$ distinct clusters, minimizing
                  the Within-Cluster Sum of Squares (Inertia). In SAMUDRA-DATA, it takes 6 standardized oceanographic
                  dimensions (SST, Chlorophyll, Wave Height, Surge Anomaly, CPUE, Shannon Diversity) and autonomously
                  segments the Arabian Sea into operational environmental regimes.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Optimal Hyperparameter:</span>
                    <div className="text-indigo-700 font-bold text-sm mt-0.5">k = 4 (Elbow Inflection)</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Silhouette Validation:</span>
                    <div className="text-emerald-700 font-bold text-sm mt-0.5">s = 0.68 (Dense Structure)</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-500">Dimensionality Reduction:</span>
                    <div className="text-slate-900 font-bold text-sm mt-0.5">2D PCA (82% Variance)</div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 rounded-xl overflow-hidden border border-slate-200 relative h-48 lg:h-56 shadow-sm">
                <img
                  src="/src/assets/images/marine_research_lab_1793279312787.jpg"
                  alt="Oceanographic Informatics & Computing Workstations"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
                <div className="absolute bottom-2 left-2 right-2 text-white font-mono text-[10px] bg-slate-900/80 px-2 py-1 rounded">
                  Marine Informatics & Computing Lab
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Deep Operational Workspaces Navigator */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Specialized Operational Workspaces
            </h3>
            <p className="text-xs text-slate-500 font-sans">
              Access the core analytical, spatial, and genomic tools of the platform
            </p>
          </div>
          <span className="text-xs font-medium text-sky-700 hidden sm:inline-block">
            6 Specialized Integrated Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Workspace 1: Surge & Spatial Map */}
          <div
            onClick={() => onNavigate('map')}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-500 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div>
              <div className="h-32 w-full rounded-xl overflow-hidden mb-3 relative">
                <img
                  src="/src/assets/images/coastal_ocean_surge_1793210415287.jpg"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Surge & Wave Spatial Monitor"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white bg-slate-900/80 px-2 py-0.5 rounded border border-white/20">
                  Tidal Surge & Waves
                </span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-600 font-semibold">SPATIAL SENSORS</span>
                <span className="text-xs font-semibold text-sky-700 flex items-center gap-1">
                  Open <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">Surge & Spatial Map</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                Interactive Arabian Sea map with live wave propagation, tidal flood inundation contours,
                bathymetric shelf breaks, and station sensors.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>• Live Tide Gauges</span>
              <span className="text-sky-700 font-semibold">Flood Hazards</span>
            </div>
          </div>

          {/* Workspace 2: K-Means Data Mining */}
          <div
            onClick={() => onNavigate('kmeans')}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div>
              <div className="h-32 w-full rounded-xl overflow-hidden mb-3 relative">
                <img
                  src="/src/assets/images/kmeans_ocean_clusters_1793279282150.jpg"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="K-Means Clustering & Stratification"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white bg-slate-900/80 px-2 py-0.5 rounded border border-white/20">
                  3D Water Mass Regimes
                </span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-semibold">DATA MINING LAB</span>
                <span className="text-xs font-semibold text-indigo-700 flex items-center gap-1">
                  Launch <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">K-Means Clustering Suite</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                Unsupervised machine learning suite with interactive hyperparameter tuning ($k=2..6$),
                Elbow curve (WCSS), Silhouette validation, and 2D PCA.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>• Lloyd's Algorithm</span>
              <span className="text-indigo-700 font-semibold">Python Export</span>
            </div>
          </div>

          {/* Workspace 3: Cross-Domain Correlation */}
          <div
            onClick={() => onNavigate('correlation')}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-500 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div>
              <div className="h-32 w-full rounded-xl overflow-hidden mb-3 relative">
                <img
                  src="/src/assets/images/sardine_upwelling_kerala_1793279252695.jpg"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Pelagic Sardine Upwelling Dynamics"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white bg-slate-900/80 px-2 py-0.5 rounded border border-white/20">
                  Indian Oil Sardine Stock
                </span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 font-semibold">FISHERIES CORRELATION</span>
                <span className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                  View <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">Cross-Domain Analytics</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                Dual-axis correlation time series linking thermal marine heatwaves to commercial sardine
                and mackerel CPUE crashes off Kerala.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>• Pearson r = -0.782</span>
              <span className="text-amber-700 font-semibold">2021-2025</span>
            </div>
          </div>

          {/* Workspace 4: Molecular & eDNA Suite */}
          <div
            onClick={() => onNavigate('molecular')}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div>
              <div className="h-32 w-full rounded-xl overflow-hidden mb-3 relative">
                <img
                  src="/src/assets/images/edna_marine_sampling_1793279267636.jpg"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Niskin Rosette eDNA Sampling"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white bg-slate-900/80 px-2 py-0.5 rounded border border-white/20">
                  eDNA Niskin Protocol
                </span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 font-semibold">METABARCODING</span>
                <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  Inspect <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">Molecular & eDNA</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                Analyze FASTA barcodes, compute GC% and 3-mer signatures, explore ASV read tables, and
                calculate Shannon alpha & Bray-Curtis beta diversity.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>• 12S rRNA / COI</span>
              <span className="text-emerald-700 font-semibold">WoRMS AphiaID</span>
            </div>
          </div>

          {/* Workspace 5: AI Query Engine & RAG */}
          <div
            onClick={() => onNavigate('ai')}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-sky-500 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div>
              <div className="h-32 w-full rounded-xl overflow-hidden mb-3 relative">
                <img
                  src="/src/assets/images/marine_research_lab_1793279312787.jpg"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="Marine Research Computing Laboratory"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white bg-slate-900/80 px-2 py-0.5 rounded border border-white/20">
                  Ocean Informatics Lab
                </span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-sky-600 font-semibold">GEMINI 3.8 FLASH</span>
                <span className="text-xs font-semibold text-sky-700 flex items-center gap-1">
                  Chat <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">AI Query & SQL</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                Ask in plain English: converts questions to safe read-only SQL, returns live data tables,
                and synthesizes scientific research answers via RAG.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>• Text-to-SQL</span>
              <span className="text-sky-700 font-semibold">RAG Citations</span>
            </div>
          </div>

          {/* Workspace 6: Data Catalog & Ingestion */}
          <div
            onClick={() => onNavigate('catalog')}
            className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div>
              <div className="h-32 w-full rounded-xl overflow-hidden mb-3 relative">
                <img
                  src="/src/assets/images/ocean_data_buoy_1793279297865.jpg"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  alt="INCOIS Ocean Data Buoy Mooring"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent"></div>
                <span className="absolute bottom-2 left-2 text-[10px] font-mono text-white bg-slate-900/80 px-2 py-0.5 rounded border border-white/20">
                  INCOIS Moored Buoy OB-17
                </span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-600 font-semibold">FAIR PRINCIPLES</span>
                <span className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                  Manage <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">Catalog & Ingest</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed font-sans">
                Upload CSV, NetCDF, FASTA, or GeoJSON files with automated Quality Control (QC) scoring,
                Darwin Core standards compliance, and Docker exports.
              </p>
            </div>
            <div className="text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>• QC Score (0-100)</span>
              <span className="text-blue-700 font-semibold">PostGIS & Docker</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
