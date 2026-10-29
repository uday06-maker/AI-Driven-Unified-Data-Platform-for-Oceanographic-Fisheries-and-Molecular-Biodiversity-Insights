# SAMUDRA-DATA: Unified Marine, Coastal Surge & Data Mining Platform (K-Means Clustering)

An operational, AI-driven marine data mining and coastal surge intelligence platform bridging **oceanographic physics (tsunami/storm surge, SST, chlorophyll, salinity)**, **fisheries dynamics (CPUE, stock)**, and **molecular eDNA biodiversity**, engineered specifically for **Data Mining** academic evaluation with a dedicated **K-Means Clustering & Unsupervised Learning Suite**.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **Key Academic Requirements Incorporated for Data Mining Subject**:
> 1. **Core Data Mining Algorithm — K-Means Clustering**:
>    - **Oceanographic & Hazard Zone Clustering**: Partitions coastal stations into environmental & surge hazard regimes (e.g., *Active Upwelling Front*, *Hypoxic Inundation Risk Zone*, *Stratified Deep Water*, *High Wave Energy Zone*) using multidimensional features (SST, Chlorophyll-*a*, Dissolved Oxygen, Salinity, Significant Wave Height $H_s$, Bathymetric Depth).
>    - **Molecular eDNA & K-mer Clustering**: Unsupervised K-means clustering of sequence k-mer nucleotide frequency vectors and ASV abundance matrices across stations.
>    - **Fisheries CPUE Profile Clustering**: Groups catch profiles to identify multi-species fishing pressure regimes.
> 2. **Interactive Data Mining Workbench**:
>    - Configurable cluster count slider ($k = 2$ to $k = 7$).
>    - Feature selection checkboxes and standardization toggles (Z-Score Standardization / Min-Max Scaling).
>    - **Elbow Method Curve** (Within-Cluster Sum of Squares / Inertia vs. $k$) to determine the optimal $k$.
>    - **Silhouette Score Analysis** ($s \in [-1, +1]$) quantifying cluster cohesion and separation.
>    - **2D PCA Projection Scatter Plot** showing cluster boundaries, centroids, and real-time station points.
>    - **Cluster Centroid Profiler** (parallel coordinates / radar view) explaining what each cluster physically represents.
>    - **Exportable Python Data Mining Script** (`marine_kmeans_analysis.py`) using `scikit-learn` and `pandas` for direct inclusion in the project submission report.
> 3. **Visual Aesthetics & Experience**:
>    - Immersive real-time coastal surge, tsunami, and flood early-warning theme with live wave telemetry, tide gauges, and dynamic coastal hazard overlays along the Kerala coast (Arabian Sea).
> 4. **AI Priority**:
>    - Natural language cross-domain query engine (text-to-SQL + charts/maps) and RAG literature citations.

---

## 1. Overview & Core Concept

### Data Mining Focus
The platform demonstrates core data mining concepts:
- **Data Preprocessing & Standardization**: Handling missing sensor values, feature scaling (StandardScaler / MinMaxScaler), and multi-domain schema normalization (CF-conventions, Darwin Core).
- **Unsupervised Learning (K-Means)**: Iterative Lloyd's algorithm with k-means++ initialization, convergence monitoring, and centroid updates.
- **Model Validation & Hyperparameter Selection**: Elbow Method (WCSS/Inertia inflection point) and Silhouette Coefficient calculation.
- **Dimensionality Reduction**: Principal Component Analysis (PCA) projecting 6-dimensional oceanographic features onto 2 principal components ($PC_1$, $PC_2$) for 2D visualization.
- **Geographic Mapping of Clusters**: Displaying K-Means cluster labels on the interactive Arabian Sea/Kerala coastal map to reveal spatial spatial autocorrelation.

---

## 2. User Experience & Visual Design (Coastal Surge & Data Mining Console)

### Visual Identity & Theme (Realistic Daylight Coastal Maritime)
- **Dominant Canvas (60%)**: Daylight Maritime Canvas (`#f1f7fa` crisp coastal atmosphere).
- **Structural Surfaces (30%)**: Clean White Surfaces (`#ffffff`) with subtle 1px hairline borders (`#e2e8f0` / `#cbd5e1`) and natural soft shadows.
- **Precision Accents (10%)**:
  - Marine Blue `#0284c7`, Deep Navy `#0f172a`, Coastal Emerald `#059669`, Hazard Amber `#d97706`, Alert Rose `#dc2626`.
  - Realistic nautical map palette with pale coastal sea tones (`#dbeafe` to `#bae6fd`), natural Kerala shoreline vegetation green (`#dcfce7`), and warm sand fringe (`#fef08a`).
  - Strict anti-robotic discipline: No robotic comment headers (`//`), no mechanical HUD jargon, no dark obsidian slabs, no neon pulsing dots. Clean, human-readable institutional design matching MoES / CMLRE / INCOIS and NOAA marine charts.
  - Metric readouts in `font-mono tabular-nums`.

### Top Bar Contract
Single-row, 3-zone layout:
1. **Brand Zone**: `SAMUDRA-DATA` · `Marine Data Mining & Coastal Surge Command`
2. **Nav Links**: `Surge & Map` · `K-Means Data Mining` · `Cross-Domain Analytics` · `Molecular & eDNA` · `AI Query Engine`
3. **Primary Action**: `Export Project Report & Python Code`

---

## 3. Data Mining Suite Specifications

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DATA MINING WORKBENCH: K-MEANS CLUSTERING                       │
├─────────────────────────┬───────────────────────────────────────────┬──────────────────┤
│ CLUSTER HYPERPARAMETERS │ 2D PCA PROJECTION & SCATTER PLOT          │ CLUSTER PROFILES │
│                         │                                           │                  │
│ Number of Clusters (k): │ 10.0 ┼               (C1: Upwelling Zone) │ C1: High Chl-a   │
│ [ 2 | 3 | (4) | 5 | 6 ] │      │       ● ●                          │     Low SST      │
│                         │  5.0 ┼      ● C1 ●   (C2: Hypoxic Surge)  │     High Sardine │
│ Selected Features:      │      │                ▲ ▲                 ├──────────────────┤
│ [x] Sea Surface Temp    │  0.0 ┼ ───┼───┼───────▲ C2 ▲───────────── │ C2: Surge Risk   │
│ [x] Chlorophyll-a       │      │        ■ ■                         │     High Wave Hs │
│ [x] Dissolved Oxygen    │ -5.0 ┼       ■ C3 ■  (C3: Deep Basin)     │     Tidal Flood  │
│ [x] Wave Height (Hs)    │      │                                    ├──────────────────┤
│ [x] Sardine CPUE        │-10.0 ┼─────────────────────────────────── │ Inertia: 142.8   │
│ Scaling: [ Z-Score ]    │     -10.0   -5.0    0.0     5.0    10.0   │ Silhouette: 0.68 │
├─────────────────────────┴───────────────────────────────────────────┴──────────────────┤
│ ELBOW METHOD (WCSS vs k)                    CLUSTER CENTROIDS RADAR / BREAKDOWN        │
│ [Inertia curve showing optimal elbow at k=4] [Multivariate normalized feature means]   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Technical Architecture & Component Hierarchy

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FRONTEND UI (React 19)                                 │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Top Bar (Brand · 5 Navigation Sections · Export Report & Python Script)          │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────┬────────────────────────────────────────────────────┐  │
│  │ REAL-TIME COASTAL HUD       │ INTERACTIVE SPATIAL & WAVE STAGE                   │  │
│  │ • Live Tide Gauges (Kochi)  │ • MapLibre/Leaflet Satellite, Bathymetry & Surge   │  │
│  │ • Wave Buoys (Hs, Swell)    │ • Station Markers color-coded by K-Means Cluster   │  │
│  │ • Tsunami Wave Propagation  │ • Inundation Flood Zone & Upwelling Front Layer    │  │
│  └─────────────────────────────┴────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────┬──────────────────────────┬─────────────────────────┐  │
│  │ K-MEANS DATA MINING ENGINE  │ MOLECULAR & eDNA SUITE   │ NATURAL LANGUAGE AI     │  │
│  │ • K-Means (Lloyd + k-means++)│ • ASV Table & Sunburst   │ • Text-to-SQL Engine    │  │
│  │ • PCA 2D Projection         │ • K-mer Sequence Cluster │ • Auto Chart Generator  │  │
│  │ • Elbow Method & Silhouette │ • Alpha & Beta Diversity │ • RAG Literature Ground │  │
│  └─────────────────────────────┴──────────────────────────┴─────────────────────────┘  │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │ REST API (/api/*)
┌────────────────────────────────────────▼───────────────────────────────────────────────┐
│                           EXPRESS SERVER BACKEND                                       │
│  ┌───────────────────────┬──────────────────────────────┬───────────────────────────┐  │
│  │ Ingestion & QC Engine │ Unified Marine Data Store    │ AI Gemini Engine Proxy    │  │
│  │ • NetCDF/CSV/FASTA/Geo│ • Spatial Stations & Buoys   │ • @google/genai SDK       │  │
│  │ • Range & QC Scoring  │ • Multi-Year Time Series     │ • Schema-grounded SQL     │  │
│  │ • Data Mining Preproc │ • eDNA ASV & Taxonomy Tables │ • Citations & Anomaly AI  │  │
│  └───────────────────────┴──────────────────────────────┴───────────────────────────┘  │
└────────────────────────────────────────┬───────────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼───────────────────────────────────────────────┐
│                    EXPORTABLE INFRASTRUCTURE (DOCKER / CI)                             │
│  • marine_kmeans_analysis.py: Ready-to-run Python scikit-learn data mining script      │
│  • docker-compose.yml: PostgreSQL 16 + PostGIS 3.4 + TimescaleDB + pgvector            │
│  • seed_data/: Kerala coast oceanographic, fisheries, and FASTA sequence fixtures    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Execution Plan (Phase-by-Phase)

### Phase 1: Architecture, Scaffolding & Data Mining Foundations (Current Turn)
- Scaffold Express full-stack architecture with Vite.
- Build realistic multi-domain dataset generator for the Kerala coastal shelf (30 sampling stations across Kochi, Alappuzha, Kollam, Calicut, and offshore transects).
- Implement mathematical K-Means algorithm (k-means++ initialization, Euclidean distance, centroid updates, WCSS inertia calculation, Silhouette metric, and PCA 2D projection).
- Create exportable Python `marine_kmeans_analysis.py` scikit-learn script for academic report inclusion.

### Phase 2: Coastal Surge & Real-Time Oceanographic HUD
- Build the Coastal Hazard & Surge HUD featuring live tide gauges, wave buoy sensors, and storm surge alert levels.
- Interactive map with bathymetry, SST heat overlays, chlorophyll plumes, coastal inundation risk zones, and scientific sampling stations color-coded by K-Means cluster.
- Tsunami & wave propagation simulation overlay on the Arabian Sea canvas.

### Phase 3: Dedicated K-Means Data Mining Workbench
- Interactive hyperparameter controls ($k = 2..7$, feature toggles, Z-score scaling).
- Elbow Method interactive plot (Inertia vs $k$) with automated optimal $k$ detection.
- Silhouette Score gauge and cluster cohesion summary.
- 2D PCA Projection with scatter points, centroid markers, and hover inspection.
- Cluster Centroid Radar/Bar Chart breaking down each cluster's physical meaning.

### Phase 4: Molecular Biodiversity & eDNA Pipeline
- Taxonomic resolver integrated with WoRMS AphiaID database.
- Sequence analyzer: GC%, k-mer frequency fingerprinting, and sequence alignment similarity.
- K-mer frequency clustering and ASV community diversity indices (Shannon, Simpson, Chao1, Bray-Curtis).

### Phase 5: AI Engine (Natural Language Query, Text-to-SQL & RAG)
- Natural language query interface converting plain English into safe SQL queries against the marine database.
- Multi-modal chart and map response renderer based on query results.
- RAG research assistant grounded in CMLRE/INCOIS cruise bulletins with clickable citations.

### Phase 6: Ingestion Pipeline, QC Scoring & Executive Project Report
- File uploader supporting CSV, NetCDF metadata, FASTA, and GeoJSON with automatic quality score (0–100).
- Executive Synthesis & Data Mining Report generator exportable to PDF/HTML, complete with cluster analysis and academic methodology.

### Phase 7: Verification, Performance Pass & Complete Documentation
- Verify clean compilation with `compile_applet`.
- Complete README.md documentation with data mining algorithms, mathematical equations (Euclidean distance, WCSS, Silhouette), Docker setup, and presentation demo script.

### Phase 8: Full-Site Realistic Marine & Scientific Graphics Integration (Completed)
- Integrated high-fidelity, authentic oceanographic photographs and scientific graphics across **every single workspace tab**:
  1. **Surge & Spatial Map (`OceanMapStage.tsx`)**: Realistic coastal storm swell & inundation wave cam monitor card (`coastal_ocean_surge_1793210415287.jpg`) paired with live tidal telemetry and radar altimetry.
  2. **K-Means Data Mining (`KMeansDataMining.tsx`)**: High-resolution 3D Arabian Sea hydrographic cross-section graphic card (`kmeans_ocean_clusters_1793279282150.jpg`) illustrating the physical oceanographic layers (Mixed Layer 0-50m, Thermocline 50-250m, Oxygen Minimum Zone OMZ 250-1100m, and Abyssal Bathymetry) that form the mathematical feature space for K-Means unsupervised clustering.
  3. **Cross-Domain Fisheries Analytics (`CrossDomainAnalytics.tsx`)**: Realistic underwater photograph of a shimmering school of Indian oil sardines in turquoise upwelling waters (`sardine_upwelling_kerala_1793279252695.jpg`), detailing thermal disruption of pelagic grazing.
  4. **Molecular & eDNA Suite (`MolecularEdnaSuite.tsx`)**: Documentary photograph of marine oceanographers on research vessel deck operating a CTD Niskin water sampling rosette for environmental DNA collection (`edna_marine_sampling_1793279267636.jpg`).
  5. **AI Query & Text-to-SQL Engine (`AiQueryAssistant.tsx`)**: Realistic oceanographic research computing laboratory with dual GIS and bathymetric workstations aboard MoES Vessel Sagar Nidhi (`marine_research_lab_1793279312787.jpg`).
  6. **Data Catalog & Ingestion (`DataCatalogIngest.tsx`)**: Realistic INCOIS-INDIA OB-17 moored ocean meteorological data buoy floating in rolling Arabian Sea waves (`ocean_data_buoy_1793279297865.jpg`).
  7. **Home & Educational Portal (`HomePage.tsx`)**: Realistic daytime coastal ocean hero section (`realistic_coastal_ocean_1793211002067.jpg`), interactive visual photo panels for all 5 scientific topics, and thumbnail previews on each of the 6 workspace launchpad cards.
