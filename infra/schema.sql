-- SAMUDRA-DATA Unified PostgreSQL + PostGIS + TimescaleDB Database Schema
-- Ministry of Earth Sciences / CMLRE Indian EEZ Architecture

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 1. Marine Stations & Oceanographic Buoys
CREATE TABLE stations (
    station_id VARCHAR(32) PRIMARY KEY,
    station_code VARCHAR(16) UNIQUE NOT NULL,
    station_name VARCHAR(128) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    depth_meters NUMERIC(6,1) NOT NULL,
    region VARCHAR(64) NOT NULL,
    station_type VARCHAR(32) NOT NULL,
    distance_from_coast_km NUMERIC(5,1),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_stations_geom ON stations USING GIST(geom);

-- 2. Real-Time Tide Gauge & Wave Telemetry
CREATE TABLE tide_gauge_telemetry (
    time TIMESTAMPTZ NOT NULL,
    station_id VARCHAR(32) REFERENCES stations(station_id),
    water_level_m NUMERIC(4,2) NOT NULL,
    normal_predicted_m NUMERIC(4,2) NOT NULL,
    surge_anomaly_m NUMERIC(4,2) NOT NULL,
    significant_wave_height_m NUMERIC(4,2) NOT NULL,
    wave_period_seconds NUMERIC(4,1),
    wave_direction_deg NUMERIC(5,1),
    flood_risk_level VARCHAR(16) NOT NULL,
    inundation_risk_km2 NUMERIC(5,1)
);
SELECT create_hypertable('tide_gauge_telemetry', 'time');
CREATE INDEX idx_tide_station_time ON tide_gauge_telemetry(station_id, time DESC);

-- 3. Oceanographic Physical & Biogeochemical Timeseries (CF-1.8 Compliant)
CREATE TABLE ocean_physics (
    time TIMESTAMPTZ NOT NULL,
    station_id VARCHAR(32) REFERENCES stations(station_id),
    depth_m NUMERIC(5,1) DEFAULT 0,
    sst_celsius NUMERIC(4,2),
    sst_anomaly NUMERIC(4,2),
    chlorophyll_a_mg_m3 NUMERIC(6,3),
    dissolved_oxygen_mgl NUMERIC(4,2),
    salinity_psu NUMERIC(4,2),
    ph NUMERIC(3,2),
    upwelling_index NUMERIC(6,1)
);
SELECT create_hypertable('ocean_physics', 'time');
CREATE INDEX idx_ocean_station_time ON ocean_physics(station_id, time DESC);

-- 4. Fisheries Commercial Catch & CPUE (Darwin Core Occurrence)
CREATE TABLE fisheries_catches (
    id SERIAL PRIMARY KEY,
    occurrence_id VARCHAR(64) UNIQUE,
    species_common VARCHAR(64) NOT NULL,
    species_scientific VARCHAR(64) NOT NULL,
    aphia_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    region VARCHAR(64) NOT NULL,
    landings_tonnes NUMERIC(8,2) NOT NULL,
    cpue_kg_per_hour NUMERIC(6,1) NOT NULL,
    gear_type VARCHAR(32) NOT NULL,
    stock_status VARCHAR(24) NOT NULL,
    mean_length_cm NUMERIC(4,1)
);
CREATE INDEX idx_fisheries_aphia ON fisheries_catches(aphia_id);
CREATE INDEX idx_fisheries_year_month ON fisheries_catches(year, month);

-- 5. Molecular eDNA Samples & ASV Abundance (MIxS-eDNA Standards)
CREATE TABLE edna_samples (
    sample_id VARCHAR(32) PRIMARY KEY,
    sample_code VARCHAR(32) UNIQUE NOT NULL,
    station_id VARCHAR(32) REFERENCES stations(station_id),
    collection_date DATE NOT NULL,
    depth_meters NUMERIC(5,1) NOT NULL,
    target_gene VARCHAR(16) NOT NULL,
    total_reads INTEGER NOT NULL,
    observed_asvs INTEGER NOT NULL,
    shannon_index NUMERIC(4,2),
    simpson_index NUMERIC(4,2),
    chao1_richness NUMERIC(5,1)
);

CREATE TABLE edna_asv_library (
    asv_id VARCHAR(32) PRIMARY KEY,
    sample_id VARCHAR(32) REFERENCES edna_samples(sample_id),
    taxon_scientific VARCHAR(64) NOT NULL,
    common_name VARCHAR(64),
    aphia_id INTEGER,
    phylum VARCHAR(32) NOT NULL,
    family VARCHAR(32) NOT NULL,
    abundance_reads INTEGER NOT NULL,
    relative_abundance_pct NUMERIC(5,2) NOT NULL,
    sequence_dna TEXT NOT NULL,
    confidence_score NUMERIC(4,3)
);
CREATE INDEX idx_asv_taxon ON edna_asv_library(taxon_scientific);
CREATE INDEX idx_asv_sample ON edna_asv_library(sample_id);
