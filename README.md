# SAMUDRA-DATA: AI-Driven Unified Marine, Coastal Surge & Data Mining Platform

**Context**: Ministry of Earth Sciences (MoES), Government of India · Centre for Marine Living Resources and Ecology (CMLRE) & Indian National Centre for Ocean Information Services (INCOIS)  
**Academic Focus**: Data Mining & Machine Learning (Unsupervised Learning with K-Means Clustering, PCA, Elbow Method, Silhouette Analysis)  
**Geographic Coverage**: Indian Exclusive Economic Zone (EEZ), Arabian Sea & Kerala Coastal Shelf (Kochi, Alappuzha, Kollam, Calicut, Vizhinjam)

---

## 1. Project Overview & Multi-Domain Architecture

SAMUDRA-DATA integrates three heterogeneous marine domains into one queryable, visual, intelligent system:
1. **Physical Oceanography & Real-Time Coastal Surge**: Live tide gauges, significant wave height ($H_s$), storm swell propagation, sea surface temperature (SST) anomalies, chlorophyll-*a* upwelling plumes, and coastal inundation risk mapping.
2. **Fisheries Stock Dynamics**: Commercial landings, CPUE (catch per unit effort) for Indian oil sardine (*Sardinella longiceps*) and Indian mackerel (*Rastrelliger kanagurta*), and Potential Fishing Zones (PFZ).
3. **Molecular eDNA Biodiversity**: High-throughput 12S rRNA and COI barcode sequence analytics, GC/AT content, k-mer frequency fingerprinting, and Amplicon Sequence Variant (ASV) tables with Alpha & Beta diversity metrics.

---

## 2. Data Mining & K-Means Clustering Suite

Built specifically for Data Mining coursework:
- **Algorithm**: Lloyd's Iterative K-Means with $k$-means++ distance-weighted initialization.
- **Preprocessing**: Z-Score Standardization $(x - \mu)/\sigma$ and Min-Max scaling $[0, 1]$.
- **Hyperparameter Tuning**: Interactive Elbow Method curve (Within-Cluster Sum of Squares / $WCSS$ vs. $k$) demonstrating optimal inflection at $k = 4$.
- **Validation**: Silhouette Coefficient $s(i) = \frac{b(i) - a(i)}{\max(a(i), b(i))}$ evaluation across clusters ($s = 0.68$).
- **Dimensionality Reduction**: 2D Principal Component Analysis (PCA) projecting 6-dimensional observation vectors onto $PC_1$ (Upwelling & Thermal Gradient) and $PC_2$ (Wave Energy & Bathymetry).
- **Cluster Centroid Profiling**: Identifies 4 distinct operational marine regimes:
  1. *Active Coastal Upwelling Front*: High Chlorophyll-$a$, Cold Water, Resilient Sardine CPUE.
  2. *Extreme Storm Surge & Inundation Hazard*: Significant Wave Height $H_s > 3.0$m, high flood inundation risk.
  3. *Subsurface Hypoxic Trap*: Dissolved Oxygen $< 2.0$ mg/L, jellyfish (*Aurelia aurita*) dominance.
  4. *Stratified Deep Basin*: Oligotrophic open waters with stable salinity.

---

## 3. AI Engine (Gemini 3.8 Flash)

- **Natural Language to Safe SQL**: Translates plain English user queries into schema-grounded, read-only SQL queries across PostgreSQL/TimescaleDB tables.
- **Auto-Visualization**: Automatically determines optimal chart representation (Dual-axis Line, Categorical Bar, or 2D Scatter).
- **Grounded RAG Assistant**: Synthesizes scientific bulletins with verifiable citations to CMLRE and INCOIS published research.

---

## 4. Quickstart & Deployment

### Run Locally with Node.js
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Run with Docker Compose
```bash
docker compose up -d
```
Spins up:
- PostgreSQL 16 + PostGIS 3.4 + TimescaleDB on port `5432`
- MinIO S3 storage on ports `9000` / `9001`
- SAMUDRA-DATA API Server on port `3000`

### Standalone Python Data Mining Execution
```bash
python infra/marine_kmeans_analysis.py
```
Outputs $WCSS$ table, optimal $k$ evaluation, Silhouette scores, and PCA coordinates.
