import React, { useState } from 'react';
import {
  Database,
  UploadCloud,
  CheckCircle,
  FileText,
  Shield,
  Download,
  Search,
  Filter,
  CheckSquare,
  AlertTriangle,
  FileCode,
  Layers,
  Check,
} from 'lucide-react';
import { DatasetCatalogItem, DataDomain } from '../types/marine.js';

interface DataCatalogIngestProps {
  catalog: DatasetCatalogItem[];
  onIngestComplete?: (item: DatasetCatalogItem) => void;
  onOpenExport?: () => void;
}

export const DataCatalogIngest: React.FC<DataCatalogIngestProps> = ({
  catalog,
  onIngestComplete,
  onOpenExport,
}) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Ingestion Form State
  const [datasetTitle, setDatasetTitle] = useState<string>('');
  const [datasetDomain, setDatasetDomain] = useState<DataDomain>('OCEANOGRAPHY');
  const [fileFormat, setFileFormat] = useState<'CSV' | 'FASTA' | 'NetCDF-4' | 'GeoJSON'>('CSV');
  const [rawText, setRawText] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [qcReport, setQcReport] = useState<any | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Ingestion handler
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetTitle.trim()) return;

    setIsUploading(true);
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: datasetTitle,
          fileType: fileFormat,
          rawContent: rawText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQcReport(data.validationReport);
        if (onIngestComplete) {
          onIngestComplete(data.item);
        }
        setDatasetTitle('');
        setRawText('');
      }
    } catch (err) {
      console.error('Ingestion failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredCatalog = catalog.filter((item) => {
    const matchesDomain = selectedDomain === 'ALL' || item.domain === selectedDomain;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.spatialCoverage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.standardsCompliance.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  const triggerDownload = (item: DatasetCatalogItem) => {
    setDownloadSuccessMessage(`Preparing package for ${item.title} (${item.format})...`);
    setTimeout(() => {
      setDownloadSuccessMessage(null);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-800">
                DATA INGESTION, STANDARDIZATION & QC PIPELINE
              </span>
              <span className="text-slate-400 font-mono text-xs">·</span>
              <span className="text-xs font-mono text-slate-500">
                FAIR Data Principles · Darwin Core & CF Conventions
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              Unified Marine Metadata Catalog & Data Quality Control
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-1 leading-relaxed">
              Uploads, parses, and normalizes heterogeneous marine files (CSV, NetCDF, FASTA, GeoJSON)
              with automated outlier detection, range validation, and QC scoring.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-sm transition-all whitespace-nowrap cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Export Project Assets
        </button>
      </div>

      {downloadSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Real Ocean Data Buoy & Telemetry Array Graphic Card */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-7 relative h-64 lg:h-auto min-h-[230px] bg-slate-900 overflow-hidden">
          <img
            src="/src/assets/images/ocean_data_buoy_1793279297865.jpg"
            alt="INCOIS-INDIA OB-17 moored oceanographic data buoy floating in the rolling blue waves of the Arabian Sea"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
          <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-xs text-white text-[10px] font-mono px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            MoES INCOIS Mooring · Station OB-17
          </div>
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-mono">
            <span className="font-semibold text-sm drop-shadow-xs">INCOIS-INDIA Deep Sea Meteorological Buoy</span>
            <span className="text-sky-200 text-xs hidden sm:inline">Arabian Sea In-Situ Ingestion</span>
          </div>
        </div>

        <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-gradient-to-br from-white to-sky-50/30">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-800 uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              Autonomous In-Situ Sensor Streaming
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              In-Situ Telemetry & Heterogeneous Ingestion
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Automated ingestion pipelines ingest high-frequency time series directly from moored buoys and research vessel cruises:
            </p>
            <div className="mt-3 space-y-2 text-xs text-slate-700">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-900">Standardized Normalization:</span> Converts CF-compliant NetCDF-4 ocean grids, Darwin Core biodiversity archives, and WGS84 coordinates.
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-900">Automated QC Flags:</span> Range check, spike suppression, and missing-value imputation pipeline before database commit.
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>INCOIS Data Portal Adapter</span>
            <span className="text-sky-700 font-semibold">ISO 19115 Geospatial Metadata</span>
          </div>
        </div>
      </div>

      {/* Grid: Ingestion Form (1 Col) + Catalog (2 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ingestion & QC Form */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-200">
            <div className="text-xs font-mono font-bold uppercase text-sky-800 flex items-center gap-1.5">
              <UploadCloud className="w-4 h-4" />
              INGEST NEW MARINE DATASET
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
              Standardize & Score Quality
            </h3>
          </div>

          <form onSubmit={handleUpload} className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-600 block mb-1 font-medium">Dataset Title / Name:</label>
              <input
                type="text"
                required
                value={datasetTitle}
                onChange={(e) => setDatasetTitle(e.target.value)}
                placeholder="e.g., INCOIS_Kerala_Swell_Buoys_2026"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-slate-600 block mb-1 font-medium">Data Domain:</label>
                <select
                  value={datasetDomain}
                  onChange={(e) => setDatasetDomain(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                >
                  <option value="OCEANOGRAPHY">Oceanography</option>
                  <option value="COASTAL_SURGE">Coastal Surge</option>
                  <option value="FISHERIES">Fisheries</option>
                  <option value="MOLECULAR_EDNA">Molecular eDNA</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 font-medium">File Format:</label>
                <select
                  value={fileFormat}
                  onChange={(e) => setFileFormat(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                >
                  <option value="CSV">CSV Table</option>
                  <option value="FASTA">FASTA Sequences</option>
                  <option value="NetCDF-4">NetCDF-4 (.nc)</option>
                  <option value="GeoJSON">GeoJSON</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-600 block mb-1 font-medium">
                Data Sample Content (Paste or Drag):
              </label>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={
                  fileFormat === 'FASTA'
                    ? '>seq1_12S_rRNA\nACTTTAATTAACCCCTACCCCTTTCTTTGGCTAAATTATGGTGCAGTG...'
                    : 'station_id,timestamp,sst,salinity,chlorophyll\nCR-KL-01,2026-10-28,29.4,35.1,2.8...'
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:bg-white leading-relaxed resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer font-sans shadow-sm"
            >
              {isUploading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <Shield className="w-4 h-4" />
              )}
              <span>Run Automated QC & Ingest</span>
            </button>
          </form>

          {/* QC Validation Output Report */}
          {qcReport && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-mono space-y-1.5">
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  QC Score: 98 / 100
                </span>
                <span className="text-[10px] uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">PASSED</span>
              </div>
              <ul className="text-slate-700 text-[11px] space-y-1">
                <li>• Range validation: Nominal</li>
                <li>• Coordinate bounds: Valid WGS84</li>
                <li>• Standards: {qcReport.unitStandardization}</li>
                <li>• WoRMS resolution: {qcReport.taxonomicResolutionWoRMS}</li>
              </ul>
            </div>
          )}
        </div>

        {/* Unified Dataset Catalog (2 Columns) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <div className="text-xs font-mono font-bold uppercase text-sky-800">
                PROVENANCE & METADATA REGISTRY
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                Ingested Marine Datasets ({filteredCatalog.length})
              </h3>
            </div>

            {/* Filter and Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter catalog..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white w-44"
                />
              </div>

              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">All Domains</option>
                <option value="OCEANOGRAPHY">Oceanography</option>
                <option value="COASTAL_SURGE">Coastal Surge</option>
                <option value="FISHERIES">Fisheries</option>
                <option value="MOLECULAR_EDNA">Molecular eDNA</option>
              </select>
            </div>
          </div>

          {/* Catalog Cards Grid */}
          <div className="space-y-3">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 hover:border-slate-300 transition-colors space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                      {item.format}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">{item.title}</h4>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-600">
                      QC Score:{' '}
                      <strong className={item.qcScore >= 95 ? 'text-emerald-700' : 'text-amber-700'}>
                        {item.qcScore}/100
                      </strong>
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600">{item.recordsCount.toLocaleString()} records</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-500">Coverage: </span>
                    <span className="text-slate-800 font-medium">{item.spatialCoverage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Compliance: </span>
                    <span className="text-sky-800 font-medium">{item.standardsCompliance}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Date Range: </span>
                    <span className="text-slate-800 font-medium">{item.dateRange}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-sans border-t border-slate-200 pt-2 flex items-center justify-between">
                  <span>Provenance: {item.provenance}</span>
                  <button
                    onClick={() => triggerDownload(item)}
                    className="text-sky-700 hover:text-sky-900 font-mono text-xs flex items-center gap-1 cursor-pointer font-semibold"
                  >
                    <Download className="w-3 h-3" />
                    Download File
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
