/**
 * Core type definitions for SAMUDRA-DATA Platform
 * Domains: Oceanographic Physics, Coastal Surge/Tsunami, Fisheries Stock, Molecular eDNA
 */

export type DataDomain = 'OCEANOGRAPHY' | 'FISHERIES' | 'MOLECULAR_EDNA' | 'COASTAL_SURGE';

export interface Station {
  id: string;
  code: string;
  name: string;
  lat: number;
  lon: number;
  depthMeters: number;
  region: string;
  stationType: 'COASTAL_BUOY' | 'TIDE_GAUGE' | 'RESEARCH_VESSEL' | 'EDNA_SAMPLING_SITE';
  distanceFromCoastKm: number;
  isActive: boolean;
}

export type FloodRiskLevel = 'NORMAL' | 'ADVISORY' | 'WARNING' | 'EMERGENCY';

export interface TideGaugeTelemetry {
  stationId: string;
  stationCode: string;
  stationName: string;
  lat: number;
  lon: number;
  waterLevelMeters: number;
  normalPredictedMeters: number;
  surgeAnomalyMeters: number;
  significantWaveHeightMeters: number;
  wavePeriodSeconds: number;
  waveDirectionDeg: number;
  floodRiskLevel: FloodRiskLevel;
  trend: 'RISING' | 'FALLING' | 'STABLE';
  inundationRiskAreaKm2: number;
  lastUpdated: string;
}

export interface OceanObservation {
  id: string;
  stationId: string;
  timestamp: string;
  year: number;
  month: number;
  sstCelsius: number;
  sstAnomaly: number;
  chlorophyllA: number; // mg/m^3
  dissolvedOxygenMgL: number; // mg/L (<2.0 is hypoxia)
  salinityPsu: number;
  ph: number;
  nitrateUmolL: number;
  seaLevelPressureHpa: number;
  upwellingIndex: number; // Ekman transport index m^3/s/100m
}

export interface CatchRecord {
  id: string;
  speciesCommon: string;
  speciesScientific: string;
  aphiaId: number;
  year: number;
  month: number;
  region: string;
  landingsTonnes: number;
  cpueKgPerHour: number;
  gearType: 'Ring Seine' | 'Trawl' | 'Gillnet' | 'Hook and Line';
  stockStatus: 'SUSTAINABLE' | 'VULNERABLE' | 'DEPLETED' | 'COLLAPSED';
  meanLengthCm: number;
}

export interface MolecularSample {
  id: string;
  sampleCode: string;
  stationId: string;
  stationName: string;
  collectionDate: string;
  depthMeters: number;
  targetGene: '12S rRNA' | 'COI Barcode' | '16S rRNA' | '18S rRNA';
  sequencingPlatform: string;
  totalReads: number;
  observedASVs: number;
  shannonIndex: number;
  simpsonIndex: number;
  chao1Richness: number;
  dominantTaxon: string;
}

export interface ASVRecord {
  asvId: string;
  sampleId: string;
  taxonScientific: string;
  commonName: string;
  aphiaId: number;
  phylum: string;
  family: string;
  abundanceReads: number;
  relativeAbundancePct: number;
  sequenceSnippet: string;
  confidenceScore: number;
}

export interface CoastalHazardAlert {
  id: string;
  title: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  type: 'TSUNAMI_PROPAGATION' | 'STORM_SURGE_FLOOD' | 'MARINE_HEATWAVE' | 'COASTAL_HYPOXIA';
  region: string;
  coordinates: [number, number];
  timestamp: string;
  description: string;
  affectedFisheries: string;
  recommendedAction: string;
}

export interface CorrelationMetric {
  year: number;
  month: number;
  dateStr: string;
  sstAnomaly: number;
  chlorophyllA: number;
  sardineCpue: number;
  mackerelCpue: number;
  tunaCpue: number;
  clupeidAsvAbundance: number;
  carangidAsvAbundance: number;
  shannonDiversity: number;
  surgeAnomalyMeters: number;
}

export interface DatasetCatalogItem {
  id: string;
  title: string;
  domain: DataDomain;
  format: 'NetCDF-4' | 'CSV' | 'FASTA' | 'GeoJSON' | 'JSON-LD';
  recordsCount: number;
  spatialCoverage: string;
  dateRange: string;
  qcScore: number; // 0-100
  standardsCompliance: string;
  provenance: string;
  downloadUrl?: string;
}

export interface RAGDocument {
  id: string;
  title: string;
  authors: string;
  source: string;
  year: number;
  doi: string;
  domain: DataDomain;
  excerpt: string;
  keyFindings: string[];
}

export interface AIQueryResponse {
  query: string;
  sqlQuery: string;
  summary: string;
  data: any[];
  chartRecommendation?: {
    type: 'line' | 'bar' | 'scatter' | 'radar' | 'table';
    xAxis: string;
    yAxis: string;
    seriesName: string;
  };
  spatialFocus?: {
    lat: number;
    lon: number;
    zoom: number;
    highlightStationCode?: string;
  };
  citations: {
    title: string;
    source: string;
    year: number;
    relevance: string;
  }[];
  confidenceScore: number;
}
