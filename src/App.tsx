import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.js';
import { HomePage } from './components/HomePage.js';
import { CoastalSurgeHUD } from './components/CoastalSurgeHUD.js';
import { OceanMapStage } from './components/OceanMapStage.js';
import { KMeansDataMining } from './components/KMeansDataMining.js';
import { CrossDomainAnalytics } from './components/CrossDomainAnalytics.js';
import { MolecularEdnaSuite } from './components/MolecularEdnaSuite.js';
import { AiQueryAssistant } from './components/AiQueryAssistant.js';
import { DataCatalogIngest } from './components/DataCatalogIngest.js';
import { ExportModal } from './components/ExportModal.js';
import { OfflineIndicator } from './components/OfflineIndicator.js';

import {
  Station,
  TideGaugeTelemetry,
  CoastalHazardAlert,
  CorrelationMetric,
  MolecularSample,
  ASVRecord,
  DatasetCatalogItem,
} from './types/marine.js';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedStationId, setSelectedStationId] = useState<string>('CR-KL-01');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // Core Data States
  const [stations, setStations] = useState<Station[]>([]);
  const [tideGauges, setTideGauges] = useState<TideGaugeTelemetry[]>([]);
  const [hazardAlerts, setHazardAlerts] = useState<CoastalHazardAlert[]>([]);
  const [correlationMetrics, setCorrelationMetrics] = useState<CorrelationMetric[]>([]);
  const [correlationStats, setCorrelationStats] = useState<any>(null);
  const [molecularSamples, setMolecularSamples] = useState<MolecularSample[]>([]);
  const [asvs, setAsvs] = useState<ASVRecord[]>([]);
  const [catalog, setCatalog] = useState<DatasetCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial Fetch & Live Polling (5s interval for real-time tide gauge experience)
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const [overviewRes, corrRes, molRes] = await Promise.all([
          fetch('/api/data/overview'),
          fetch('/api/data/correlation'),
          fetch('/api/data/molecular'),
        ]);

        const overview = await overviewRes.json();
        const corr = await corrRes.json();
        const mol = await molRes.json();

        setStations(overview.stations || []);
        setTideGauges(overview.tideGauges || []);
        setHazardAlerts(overview.hazardAlerts || []);
        setCatalog(overview.catalog || []);

        setCorrelationMetrics(corr.metrics || []);
        setCorrelationStats(corr.statistics || null);

        setMolecularSamples(mol.samples || []);
        setAsvs(mol.asvs || []);

        if (overview.stations?.length > 0 && !selectedStationId) {
          setSelectedStationId(overview.stations[0].id);
        }
      } catch (err) {
        console.error('Failed to load initial marine data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOverviewData();

    // Subtle real-time gauge telemetry updates every 8 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/data/overview');
        const overview = await res.json();
        if (overview.tideGauges) {
          setTideGauges(overview.tideGauges);
        }
      } catch (e) {
        // quiet fallback
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#f1f7fa] text-slate-800 flex flex-col font-sans selection:bg-sky-500/20 selection:text-sky-900">
      {/* Top Bar Contract (Single Row, 3 Zones) */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenExport={() => setIsExportOpen(true)}
        activeAlertsCount={hazardAlerts.length}
      />

      {/* Main Workspace Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[480px] space-y-3">
            <div className="w-10 h-10 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-xs font-mono text-sky-700">
              Connecting to CMLRE / INCOIS Arabian Sea Sensor Grid...
            </div>
          </div>
        ) : (
          <>
            {/* TAB 0: Educational Oceanic Home Portal */}
            {activeTab === 'home' && (
              <HomePage
                onNavigate={(tab) => setActiveTab(tab)}
                tideGauges={tideGauges}
                alerts={hazardAlerts}
                correlationMetrics={correlationMetrics}
                stationsCount={stations.length}
              />
            )}

            {/* TAB 1: Coastal Surge & Spatial Map */}
            {activeTab === 'map' && (
              <div className="space-y-6">
                <CoastalSurgeHUD
                  tideGauges={tideGauges}
                  hazardAlerts={hazardAlerts}
                  selectedStationId={selectedStationId}
                  onSelectStation={(id) => setSelectedStationId(id)}
                />

                <OceanMapStage
                  stations={stations}
                  tideGauges={tideGauges}
                  selectedStationId={selectedStationId}
                  onSelectStation={(id) => setSelectedStationId(id)}
                />
              </div>
            )}

            {/* TAB 2: K-Means Data Mining Suite */}
            {activeTab === 'kmeans' && (
              <KMeansDataMining
                stations={stations}
                tideGauges={tideGauges}
                metrics={correlationMetrics}
                onSelectStation={(id) => {
                  setSelectedStationId(id);
                  setActiveTab('map');
                }}
              />
            )}

            {/* TAB 3: Cross-Domain Correlation Explorer */}
            {activeTab === 'correlation' && (
              <CrossDomainAnalytics
                metrics={correlationMetrics}
                statistics={correlationStats}
              />
            )}

            {/* TAB 4: Molecular Biodiversity & eDNA Suite */}
            {activeTab === 'molecular' && (
              <MolecularEdnaSuite
                samples={molecularSamples}
                asvs={asvs}
              />
            )}

            {/* TAB 5: AI Query Engine & RAG Assistant */}
            {activeTab === 'ai' && <AiQueryAssistant />}

            {/* TAB 6: Data Catalog & Ingest */}
            {activeTab === 'catalog' && (
              <DataCatalogIngest
                catalog={catalog}
                onIngestComplete={(newItem) => {
                  setCatalog((prev) => [newItem, ...prev]);
                }}
                onOpenExport={() => setIsExportOpen(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Clean Unboxed Footer with FAIR Data & Standards Provenance */}
      <footer className="border-t border-slate-200 bg-white/95 py-6 px-4 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-slate-900">SAMUDRA-DATA</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Ministry of Earth Sciences (MoES)</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>CMLRE Kochi & INCOIS Hyderabad</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Indian EEZ / Arabian Sea & Kerala Sector</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
            <span>Coordinate System: WGS84</span>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <span>Data Mining: K-Means (Lloyd + k-means++)</span>
            <span aria-hidden="true" className="text-slate-300">|</span>
            <span>Model: Gemini 3.8 Flash</span>
          </div>
        </div>
      </footer>

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />

      {/* Export & Project Bundle Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        tideGauges={tideGauges}
        alerts={hazardAlerts}
        correlationStats={correlationStats}
      />
    </div>
  );
}
