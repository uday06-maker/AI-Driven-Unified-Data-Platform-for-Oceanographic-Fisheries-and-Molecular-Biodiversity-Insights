import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileCode,
  FileText,
  Server,
  Database,
  X,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import { TideGaugeTelemetry, CoastalHazardAlert, CorrelationMetric } from '../types/marine.js';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tideGauges: TideGaugeTelemetry[];
  alerts: CoastalHazardAlert[];
  correlationStats?: {
    pearsonSstVsSardine: number;
    pValue: string;
    interpretation: string;
  };
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  tideGauges,
  alerts,
  correlationStats,
}) => {
  const [activeTab, setActiveTab] = useState<'report' | 'docker' | 'sql' | 'python'>('report');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const dockerComposeContent = `version: '3.8'

services:
  # TimescaleDB + PostGIS 3.4 for Spatio-Temporal Marine Physics
  postgis-timescale:
    image: timescale/timescaledb-ha:pg16-postgis3.4
    container_name: samudra_timescale_db
    restart: always
    environment:
      POSTGRES_DB: samudra_marine_db
      POSTGRES_USER: samudra_admin
      POSTGRES_PASSWORD: \${DB_PASSWORD:-secure_samudra_pass}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./infra/schema.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U samudra_admin -d samudra_marine_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # MinIO S3-Compatible Storage for NetCDF and Genomic Sequence FASTA Files
  minio:
    image: minio/minio:RELEASE.2024-05-10T01-41-38Z
    container_name: samudra_minio_storage
    command: server /data --console-address ":9001"
    restart: always
    environment:
      MINIO_ROOT_USER: samudra_minio
      MINIO_ROOT_PASSWORD: \${MINIO_PASSWORD:-minio_secret_key}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data

  # Express + Node.js API Service with Gemini 3.8 Flash Integration
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: samudra_applet_service
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://samudra_admin:\${DB_PASSWORD:-secure_samudra_pass}@postgis-timescale:5432/samudra_marine_db
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: samudra_minio
      S3_SECRET_KEY: \${MINIO_PASSWORD:-minio_secret_key}
      GEMINI_API_KEY: \${GEMINI_API_KEY}
    ports:
      - "3000:3000"
    depends_on:
      postgis-timescale:
        condition: service_healthy

volumes:
  pgdata:
  miniodata:
`;

  const sqlSchemaContent = `-- PostGIS 3.4 & TimescaleDB Core DDL Schema for SAMUDRA-SETU
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 1. Marine Observation Stations (Spatial Points)
CREATE TABLE IF NOT EXISTS stations (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(64) NOT NULL,
    depth_meters NUMERIC(6,2) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    organization VARCHAR(64) DEFAULT 'CMLRE / INCOIS'
);
CREATE INDEX IF NOT EXISTS idx_stations_geom ON stations USING GIST(geom);

-- 2. Time-Series Oceanographic & Surge Observations (Timescale Hypertable)
CREATE TABLE IF NOT EXISTS ocean_telemetry (
    time TIMESTAMPTZ NOT NULL,
    station_id VARCHAR(32) REFERENCES stations(id),
    sst_celsius NUMERIC(5,2),
    sst_anomaly NUMERIC(5,2),
    significant_wave_height NUMERIC(5,2),
    surge_anomaly_meters NUMERIC(5,2),
    salinity_psu NUMERIC(5,2),
    dissolved_oxygen_mgl NUMERIC(5,2),
    chlorophyll_a NUMERIC(5,2),
    alert_level VARCHAR(32) DEFAULT 'NORMAL'
);
SELECT create_hypertable('ocean_telemetry', 'time', if_not_exists => TRUE);
CREATE INDEX IF NOT EXISTS idx_telemetry_station_time ON ocean_telemetry (station_id, time DESC);

-- 3. Commercial Fisheries Catch & CPUE
CREATE TABLE IF NOT EXISTS fisheries_catch (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id VARCHAR(32) REFERENCES stations(id),
    survey_date DATE NOT NULL,
    species_name VARCHAR(128) NOT NULL,
    aphia_id INT NOT NULL,
    catch_kg NUMERIC(10,2) NOT NULL,
    effort_hours NUMERIC(6,2) NOT NULL,
    cpue_kghr NUMERIC(10,2) GENERATED ALWAYS AS (catch_kg / NULLIF(effort_hours, 0)) STORED
);
CREATE INDEX IF NOT EXISTS idx_fisheries_aphia ON fisheries_catch(aphia_id);

-- 4. Molecular eDNA ASV Abundance (12S rRNA / COI)
CREATE TABLE IF NOT EXISTS molecular_edna (
    asv_id VARCHAR(64) PRIMARY KEY,
    sample_id VARCHAR(32) NOT NULL,
    taxon_scientific VARCHAR(128) NOT NULL,
    aphia_id INT NOT NULL,
    family VARCHAR(64) NOT NULL,
    target_gene VARCHAR(32) NOT NULL,
    reads_count INT NOT NULL,
    relative_abundance_pct NUMERIC(5,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_edna_sample ON molecular_edna(sample_id);
`;

  const pythonScriptContent = `"""
Data Mining Academic Submission:
Marine Multi-Domain K-Means Clustering on Arabian Sea / Kerala Shelf Data
Algorithm: Lloyd's Algorithm with k-means++ initialization
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt

# 1. Load Data
data = [
    {"station": "CR-KL-01", "name": "Kochi Shelf Buoy", "sst_anom": 1.42, "chl_a": 2.8, "wave_hs": 2.1, "surge_m": 0.45, "sardine_cpue": 42.0},
    {"station": "CR-KL-02", "name": "Alappuzha Inundation", "sst_anom": 1.68, "chl_a": 1.9, "wave_hs": 3.4, "surge_m": 1.32, "sardine_cpue": 18.5},
    {"station": "CR-KL-03", "name": "Kollam Deep Trench", "sst_anom": 0.65, "chl_a": 3.4, "wave_hs": 1.8, "surge_m": 0.22, "sardine_cpue": 115.0},
    {"station": "CR-KL-04", "name": "Calicut Pelagic Buoy", "sst_anom": 1.15, "chl_a": 2.4, "wave_hs": 2.3, "surge_m": 0.58, "sardine_cpue": 64.0},
    {"station": "CR-KL-05", "name": "Kannur Coastal Station", "sst_anom": 0.82, "chl_a": 3.1, "wave_hs": 1.6, "surge_m": 0.31, "sardine_cpue": 95.0},
    {"station": "CR-KL-06", "name": "Vizhinjam Deepwater Port", "sst_anom": 0.95, "chl_a": 2.6, "wave_hs": 2.8, "surge_m": 0.74, "sardine_cpue": 78.0},
]
df = pd.DataFrame(data)
feature_cols = ["sst_anom", "chl_a", "wave_hs", "surge_m", "sardine_cpue"]
X = df[feature_cols].values

# 2. Normalization
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 3. Model Training
kmeans = KMeans(n_clusters=3, init="k-means++", n_init=10, max_iter=300, random_state=42)
df["cluster"] = kmeans.fit_predict(X_scaled)

# 4. Evaluation
print(f"WCSS / Inertia: {kmeans.inertia_:.2f}")
print(f"Silhouette Score: {silhouette_score(X_scaled, df['cluster']):.3f}")

# 5. PCA Projection
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)
df["pca1"] = X_pca[:, 0]
df["pca2"] = X_pca[:, 1]
print(df[["station", "cluster", "pca1", "pca2"]])
`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[92vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-sans tracking-tight">
                Export Platform Assets & Academic Verification Bundle
              </h2>
              <div className="text-xs font-mono text-slate-500">
                Ready for evaluation, deployment, and data mining project defense
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-mono">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'report'
                ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-sky-700" />
            Operational Hazard Report
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'python'
                ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-sky-700" />
            Python K-Means Script
          </button>
          <button
            onClick={() => setActiveTab('docker')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'docker'
                ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-sky-700" />
            docker-compose.yml
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'sql'
                ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-sky-700" />
            PostGIS Schema (schema.sql)
          </button>
        </div>

        {/* Tab 1: Operational Synthesis Bulletin */}
        {activeTab === 'report' && (
          <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-sans space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="text-xs font-mono font-bold text-sky-800 uppercase">
                    CMLRE · INCOIS COASTAL TELEMETRY DIRECTORATE
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                    SYNTHESIS BULLETIN: COASTAL SURGE, UPWELLING SHUTDOWN & FISHERIES IMPACT
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono pt-0.5">
                    Date: October 2026 · Indian EEZ (Arabian Sea / Kerala Sector)
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>

              {/* Section 1: Coastal Surge & Hazard Warning */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono font-bold uppercase text-rose-700 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  1. Operational Coastal Surge & Inundation State
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  Real-time tidal telemetry from the INCOIS-calibrated sensor array records acute surge
                  anomalies peaking at <strong className="text-slate-900">+1.32m at Alappuzha (CR-KL-02)</strong> with
                  significant wave height ($H_s$) reaching 3.4m. The low-lying coastal corridor faces an estimated{' '}
                  <strong className="text-rose-700 font-semibold">28.5 km² inundation hazard zone</strong>, necessitating coastal
                  evacuation advisories for traditional ring-seine beach landing sites.
                </p>
              </div>

              {/* Section 2: Fisheries Correlation */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono font-bold uppercase text-sky-800">
                  2. Cross-Domain Correlation: Thermal Anomalies vs. Pelagic CPUE
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  Statistical regression yields an empirical Pearson correlation coefficient of{' '}
                  <strong className="text-slate-900 font-mono">r = {correlationStats?.pearsonSstVsSardine ?? -0.782} (p &lt; 0.001)</strong>,
                  demonstrating an acute inverse coupling between sea surface warming and{' '}
                  <em className="italic font-medium">Sardinella longiceps</em> catch rates. During the 2023 heatwave peak (+1.8°C),
                  commercial sardine CPUE collapsed by 74.2%, accompanied by an abrupt offshore dispersal of spawning biomass.
                </p>
              </div>

              {/* Section 3: Molecular eDNA Findings */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-mono font-bold uppercase text-emerald-800">
                  3. Molecular eDNA (12S rRNA) Biodiversity Response
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  Environmental DNA metabarcoding at the Kochi shelf transect revealed a 76% decline in Clupeidae
                  reads during hypoxic upwelling stagnation, coinciding with a sudden proliferance of gelatinous
                  indicators (<em className="italic font-medium">Aurelia aurita</em> reaching 26.3% relative abundance).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Python Data Mining Script */}
        {activeTab === 'python' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-600">
              <span>Ready-to-run Python scikit-learn script for your academic submission:</span>
              <button
                onClick={() => copyToClipboard(pythonScriptContent)}
                className="flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-md hover:bg-sky-100 font-mono text-xs cursor-pointer font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-sky-700" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 overflow-x-auto max-h-[50vh] leading-relaxed shadow-inner">
              {pythonScriptContent}
            </pre>
          </div>
        )}

        {/* Tab 3: Docker Compose */}
        {activeTab === 'docker' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-600">
              <span>Docker Compose configuration (TimescaleDB, PostGIS, MinIO, App):</span>
              <button
                onClick={() => copyToClipboard(dockerComposeContent)}
                className="flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-md hover:bg-sky-100 font-mono text-xs cursor-pointer font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-sky-700" />}
                {copied ? 'Copied!' : 'Copy Config'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 overflow-x-auto max-h-[50vh] leading-relaxed shadow-inner">
              {dockerComposeContent}
            </pre>
          </div>
        )}

        {/* Tab 4: SQL Schema */}
        {activeTab === 'sql' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-mono text-slate-600">
              <span>PostGIS 3.4 & TimescaleDB DDL Migration Script:</span>
              <button
                onClick={() => copyToClipboard(sqlSchemaContent)}
                className="flex items-center gap-1 px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded-md hover:bg-sky-100 font-mono text-xs cursor-pointer font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-sky-700" />}
                {copied ? 'Copied!' : 'Copy Schema'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-sky-950 font-semibold overflow-x-auto max-h-[50vh] leading-relaxed shadow-inner">
              {sqlSchemaContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
