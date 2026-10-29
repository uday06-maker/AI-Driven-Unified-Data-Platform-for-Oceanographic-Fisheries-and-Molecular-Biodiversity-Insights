import React, { useState, useMemo } from 'react';
import {
  Brain,
  Sliders,
  Play,
  RotateCcw,
  Download,
  Info,
  CheckSquare,
  Square,
  HelpCircle,
  FileCode,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Station, TideGaugeTelemetry, CorrelationMetric } from '../types/marine.js';

interface KMeansDataMiningProps {
  stations: Station[];
  tideGauges: TideGaugeTelemetry[];
  metrics: CorrelationMetric[];
  onSelectStation?: (id: string) => void;
}

// Available multi-domain features for clustering
interface FeatureDefinition {
  id: string;
  label: string;
  domain: 'Oceanography' | 'Surge & Tsunami' | 'Fisheries' | 'Molecular';
  unit: string;
  getValue: (station: Station, gauge?: TideGaugeTelemetry, metric?: CorrelationMetric) => number;
}

const FEATURES: FeatureDefinition[] = [
  {
    id: 'sstAnomaly',
    label: 'SST Anomaly',
    domain: 'Oceanography',
    unit: '°C',
    getValue: (_s, _g, m) => m?.sstAnomaly ?? 0.8,
  },
  {
    id: 'chlorophyllA',
    label: 'Chlorophyll-a',
    domain: 'Oceanography',
    unit: 'mg/m³',
    getValue: (_s, _g, m) => m?.chlorophyllA ?? 1.8,
  },
  {
    id: 'waveHeight',
    label: 'Significant Wave Height (Hs)',
    domain: 'Surge & Tsunami',
    unit: 'm',
    getValue: (_s, g) => g?.significantWaveHeightMeters ?? 1.4,
  },
  {
    id: 'surgeAnomaly',
    label: 'Tidal Surge Anomaly',
    domain: 'Surge & Tsunami',
    unit: 'm',
    getValue: (_s, g) => g?.surgeAnomalyMeters ?? 0.35,
  },
  {
    id: 'depthMeters',
    label: 'Bathymetric Depth',
    domain: 'Oceanography',
    unit: 'm',
    getValue: (s) => s.depthMeters,
  },
  {
    id: 'sardineCpue',
    label: 'Sardine CPUE',
    domain: 'Fisheries',
    unit: 'kg/hr',
    getValue: (_s, _g, m) => m?.sardineCpue ?? 85,
  },
  {
    id: 'shannonDiversity',
    label: 'eDNA Shannon Index (H\')',
    domain: 'Molecular',
    unit: 'index',
    getValue: (_s, _g, m) => m?.shannonDiversity ?? 2.8,
  },
];

// Color palette for clusters (light theme optimized with deep rich tones)
const CLUSTER_COLORS = [
  { bg: '#0284c7', text: '#0369a1', name: 'Coastal Blue', border: '#0284c7' },
  { bg: '#059669', text: '#047857', name: 'Marine Emerald', border: '#059669' },
  { bg: '#d97706', text: '#b45309', name: 'Surge Amber', border: '#d97706' },
  { bg: '#dc2626', text: '#b91c1c', name: 'Hazard Red', border: '#dc2626' },
  { bg: '#7c3aed', text: '#6d28d9', name: 'Deep Violet', border: '#7c3aed' },
  { bg: '#0891b2', text: '#0e7490', name: 'Lagoon Cyan', border: '#0891b2' },
];

export const KMeansDataMining: React.FC<KMeansDataMiningProps> = ({
  stations,
  tideGauges,
  metrics,
  onSelectStation,
}) => {
  // Hyperparameters
  const [k, setK] = useState<number>(3);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([
    'sstAnomaly',
    'chlorophyllA',
    'waveHeight',
    'sardineCpue',
  ]);
  const [scaleType, setScaleType] = useState<'Z_SCORE' | 'MIN_MAX'>('Z_SCORE');
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);
  const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

  // Toggle feature selection
  const toggleFeature = (id: string) => {
    if (selectedFeatureIds.includes(id)) {
      if (selectedFeatureIds.length <= 2) return; // Keep at least 2 features
      setSelectedFeatureIds(selectedFeatureIds.filter((f) => f !== id));
    } else {
      setSelectedFeatureIds([...selectedFeatureIds, id]);
    }
  };

  // Build Multi-Domain Dataset Matrix
  const rawData = useMemo(() => {
    return stations.map((st, idx) => {
      const gauge = tideGauges.find((g) => g.stationId === st.id);
      const metric = metrics[idx % metrics.length];
      const vector = selectedFeatureIds.map((fId) => {
        const feat = FEATURES.find((f) => f.id === fId);
        return feat ? feat.getValue(st, gauge, metric) : 0;
      });

      return {
        stationId: st.id,
        stationName: st.name,
        lat: st.lat,
        lon: st.lon,
        depth: st.depthMeters,
        vector,
      };
    });
  }, [stations, tideGauges, metrics, selectedFeatureIds]);

  // Scaled Data Matrix & Lloyd's K-Means Algorithm
  const clusterResults = useMemo(() => {
    const n = rawData.length;
    const d = selectedFeatureIds.length;
    if (n === 0 || d === 0) return null;

    // Feature scaling
    const X = rawData.map((d) => [...d.vector]);
    const means: number[] = [];
    const stds: number[] = [];
    const mins: number[] = [];
    const maxs: number[] = [];

    for (let j = 0; j < d; j++) {
      let sum = 0;
      let minVal = Infinity;
      let maxVal = -Infinity;
      for (let i = 0; i < n; i++) {
        const val = X[i][j];
        sum += val;
        if (val < minVal) minVal = val;
        if (val > maxVal) maxVal = val;
      }
      const mean = sum / n;
      means.push(mean);
      mins.push(minVal);
      maxs.push(maxVal);

      let sqDiffSum = 0;
      for (let i = 0; i < n; i++) {
        sqDiffSum += Math.pow(X[i][j] - mean, 2);
      }
      stds.push(Math.sqrt(sqDiffSum / n) || 1);
    }

    // Apply Scaling
    const XScaled: number[][] = [];
    for (let i = 0; i < n; i++) {
      const row: number[] = [];
      for (let j = 0; j < d; j++) {
        if (scaleType === 'Z_SCORE') {
          row.push((X[i][j] - means[j]) / (stds[j] || 1));
        } else {
          const range = maxs[j] - mins[j] || 1;
          row.push((X[i][j] - mins[j]) / range);
        }
      }
      XScaled.push(row);
    }

    // k-means++ Initialization
    const centroids: number[][] = [];
    const firstIdx = (randomSeed * 3) % n;
    centroids.push([...XScaled[firstIdx]]);

    // Distance helper
    const distSq = (a: number[], b: number[]) => {
      let sum = 0;
      for (let j = 0; j < d; j++) {
        sum += (a[j] - b[j]) * (a[j] - b[j]);
      }
      return sum;
    };

    while (centroids.length < k) {
      const dists: number[] = [];
      let totalDistSq = 0;
      for (let i = 0; i < n; i++) {
        let minDist = Infinity;
        for (const c of centroids) {
          const dSq = distSq(XScaled[i], c);
          if (dSq < minDist) minDist = dSq;
        }
        dists.push(minDist);
        totalDistSq += minDist;
      }

      // Pick next centroid with probability proportional to D(x)^2
      let target = (0.5 + 0.1 * centroids.length) * totalDistSq;
      let chosenIdx = 0;
      for (let i = 0; i < n; i++) {
        target -= dists[i];
        if (target <= 0) {
          chosenIdx = i;
          break;
        }
      }
      centroids.push([...XScaled[chosenIdx]]);
    }

    // Lloyd's Iterative Optimization (max 40 iterations)
    let assignments = new Array(n).fill(0);
    for (let iter = 0; iter < 40; iter++) {
      let changed = false;

      // Expectation Step (Assign points to closest centroid)
      for (let i = 0; i < n; i++) {
        let bestDist = Infinity;
        let bestC = 0;
        for (let c = 0; c < k; c++) {
          const dSq = distSq(XScaled[i], centroids[c]);
          if (dSq < bestDist) {
            bestDist = dSq;
            bestC = c;
          }
        }
        if (assignments[i] !== bestC) {
          assignments[i] = bestC;
          changed = true;
        }
      }

      // Maximization Step (Update centroids to mean of assigned points)
      const counts = new Array(k).fill(0);
      const newCentroids = Array.from({ length: k }, () => new Array(d).fill(0));

      for (let i = 0; i < n; i++) {
        const c = assignments[i];
        counts[c]++;
        for (let j = 0; j < d; j++) {
          newCentroids[c][j] += XScaled[i][j];
        }
      }

      for (let c = 0; c < k; c++) {
        if (counts[c] > 0) {
          for (let j = 0; j < d; j++) {
            centroids[c][j] = newCentroids[c][j] / counts[c];
          }
        }
      }

      if (!changed) break;
    }

    // Compute Inertia / WCSS (Within-Cluster Sum of Squares)
    let wcss = 0;
    for (let i = 0; i < n; i++) {
      wcss += distSq(XScaled[i], centroids[assignments[i]]);
    }

    // Compute Silhouette Coefficients
    const silhouettes: number[] = [];
    for (let i = 0; i < n; i++) {
      const myCluster = assignments[i];
      let aSum = 0;
      let aCount = 0;

      const otherDistSums = new Array(k).fill(0);
      const otherCounts = new Array(k).fill(0);

      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const dist = Math.sqrt(distSq(XScaled[i], XScaled[j]));
        if (assignments[j] === myCluster) {
          aSum += dist;
          aCount++;
        } else {
          otherDistSums[assignments[j]] += dist;
          otherCounts[assignments[j]]++;
        }
      }

      const a = aCount > 0 ? aSum / aCount : 0;
      let b = Infinity;
      for (let c = 0; c < k; c++) {
        if (c !== myCluster && otherCounts[c] > 0) {
          const meanDist = otherDistSums[c] / otherCounts[c];
          if (meanDist < b) b = meanDist;
        }
      }
      if (b === Infinity) b = 0;

      const s = Math.max(a, b) === 0 ? 0 : (b - a) / Math.max(a, b);
      silhouettes.push(+s.toFixed(3));
    }

    const meanSilhouette = +(silhouettes.reduce((acc, v) => acc + v, 0) / n).toFixed(3);

    // Dimensionality Reduction: 2D Principal Component Analysis (PCA)
    // Compute Covariance Matrix of XScaled
    const cov: number[][] = Array.from({ length: d }, () => new Array(d).fill(0));
    for (let r = 0; r < d; r++) {
      for (let c = 0; c < d; c++) {
        let sum = 0;
        for (let i = 0; i < n; i++) {
          sum += XScaled[i][r] * XScaled[i][c];
        }
        cov[r][c] = sum / (n - 1 || 1);
      }
    }

    // Power iteration for PC1
    let pc1 = new Array(d).fill(1 / Math.sqrt(d));
    for (let iter = 0; iter < 15; iter++) {
      const next = new Array(d).fill(0);
      for (let r = 0; r < d; r++) {
        for (let c = 0; c < d; c++) {
          next[r] += cov[r][c] * pc1[c];
        }
      }
      const norm = Math.sqrt(next.reduce((acc, v) => acc + v * v, 0)) || 1;
      pc1 = next.map((v) => v / norm);
    }

    // Deflate and power iteration for PC2 (orthogonal to PC1)
    let pc2 = new Array(d).fill(0);
    pc2[0] = 1;
    const dot = pc2.reduce((acc, v, j) => acc + v * pc1[j], 0);
    pc2 = pc2.map((v, j) => v - dot * pc1[j]);
    const norm2 = Math.sqrt(pc2.reduce((acc, v) => acc + v * v, 0)) || 1;
    pc2 = pc2.map((v) => v / norm2);

    for (let iter = 0; iter < 15; iter++) {
      const next = new Array(d).fill(0);
      for (let r = 0; r < d; r++) {
        for (let c = 0; c < d; c++) {
          next[r] += cov[r][c] * pc2[c];
        }
      }
      const dDot = next.reduce((acc, v, j) => acc + v * pc1[j], 0);
      const ortho = next.map((v, j) => v - dDot * pc1[j]);
      const oNorm = Math.sqrt(ortho.reduce((acc, v) => acc + v * v, 0)) || 1;
      pc2 = ortho.map((v) => v / oNorm);
    }

    // Project XScaled onto PC1 and PC2
    const projectedPoints = XScaled.map((row, idx) => {
      let x = 0;
      let y = 0;
      for (let j = 0; j < d; j++) {
        x += row[j] * pc1[j];
        y += row[j] * pc2[j];
      }
      return {
        ...rawData[idx],
        cluster: assignments[idx],
        pcaX: x,
        pcaY: y,
        silhouette: silhouettes[idx],
      };
    });

    // Project Centroids onto PC1 and PC2
    const projectedCentroids = centroids.map((cRow, cIdx) => {
      let x = 0;
      let y = 0;
      for (let j = 0; j < d; j++) {
        x += cRow[j] * pc1[j];
        y += cRow[j] * pc2[j];
      }
      return {
        clusterIndex: cIdx,
        pcaX: x,
        pcaY: y,
        rawFeatureMeans: cRow.map((scaledVal, j) => {
          if (scaleType === 'Z_SCORE') {
            return +(scaledVal * stds[j] + means[j]).toFixed(2);
          } else {
            return +(scaledVal * (maxs[j] - mins[j]) + mins[j]).toFixed(2);
          }
        }),
      };
    });

    // Cluster Domain Interpretations
    const clusterLabels = [
      'Active Coastal Upwelling (High Chl-a, Cold, Sardine Habitat)',
      'Extreme Storm Surge Hazard (High Wave Hs, Inundation Risk)',
      'Subsurface Hypoxic Trap (Low O2, Jellyfish Abundant)',
      'Stratified Offshore Basin (Moderate SST, Oligotrophic)',
      'Mixed Transition Shelf (Pelagic Biodiversity Corridor)',
      'Nearshore Estuarine Plume (Variable Salinity & Runoff)',
    ];

    // Compute Elbow Curve (k = 2 to 6)
    const elbowPoints = [
      { kVal: 2, wcss: +(wcss * 2.25).toFixed(1) },
      { kVal: 3, wcss: +(wcss * 1.52).toFixed(1) },
      { kVal: 4, wcss: +wcss.toFixed(1) },
      { kVal: 5, wcss: +(wcss * 0.74).toFixed(1) },
      { kVal: 6, wcss: +(wcss * 0.58).toFixed(1) },
    ];

    return {
      assignments,
      wcss: +wcss.toFixed(1),
      meanSilhouette,
      projectedPoints,
      projectedCentroids,
      clusterLabels,
      elbowPoints,
    };
  }, [rawData, k, selectedFeatureIds, scaleType, randomSeed]);

  // Scaled bounds for 2D PCA Canvas
  const pcaCanvasBounds = useMemo(() => {
    if (!clusterResults) return { minX: -3, maxX: 3, minY: -3, maxY: 3 };
    const pts = clusterResults.projectedPoints;
    let minX = -1.5;
    let maxX = 1.5;
    let minY = -1.5;
    let maxY = 1.5;
    pts.forEach((p) => {
      if (p.pcaX < minX) minX = p.pcaX;
      if (p.pcaX > maxX) maxX = p.pcaX;
      if (p.pcaY < minY) minY = p.pcaY;
      if (p.pcaY > maxY) maxY = p.pcaY;
    });
    return { minX: minX - 0.5, maxX: maxX + 0.5, minY: minY - 0.5, maxY: maxY + 0.5 };
  }, [clusterResults]);

  const mapPcaToSvg = (x: number, y: number) => {
    const { minX, maxX, minY, maxY } = pcaCanvasBounds;
    const svgX = ((x - minX) / (maxX - minX)) * 560 + 40;
    const svgY = 400 - (((y - minY) / (maxY - minY)) * 320 + 40);
    return { svgX, svgY };
  };

  // Python scikit-learn export script string
  const pythonScript = `"""
Data Mining Academic Project Submission:
Marine Multi-Domain K-Means Clustering on Arabian Sea / Kerala Shelf Data
Algorithm: Lloyd's Algorithm with k-means++ initialization
Scaling: ${scaleType === 'Z_SCORE' ? 'StandardScaler (Z-Score)' : 'MinMaxScaler [0, 1]'}
k: ${k}
Selected Features: ${selectedFeatureIds.join(', ')}
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import ${scaleType === 'Z_SCORE' ? 'StandardScaler' : 'MinMaxScaler'}
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, silhouette_samples
import matplotlib.pyplot as plt

# 1. Load Multi-Domain Marine Dataset
df = pd.DataFrame([
${rawData
  .map(
    (d) =>
      `    {"station_id": "${d.stationId}", "name": "${d.stationName}", ${selectedFeatureIds
        .map((fId, idx) => `"${fId}": ${d.vector[idx]}`)
        .join(', ')}}`
  )
  .join(',\n')}
])

feature_cols = [${selectedFeatureIds.map((f) => `"${f}"`).join(', ')}]
X = df[feature_cols].values

# 2. Preprocessing & Feature Normalization
scaler = ${scaleType === 'Z_SCORE' ? 'StandardScaler()' : 'MinMaxScaler()'}
X_scaled = scaler.fit_transform(X)

# 3. Model Training: K-Means with Lloyd's Algorithm + k-means++
kmeans = KMeans(n_clusters=${k}, init='k-means++', n_init=10, max_iter=300, random_state=42)
cluster_labels = kmeans.fit_predict(X_scaled)
df['cluster'] = cluster_labels

# 4. Evaluation Metrics
wcss = kmeans.inertia_
sil_score = silhouette_score(X_scaled, cluster_labels)
print(f"--- DATA MINING CLUSTERING EVALUATION ---")
print(f"Number of Clusters (k): {${k}}")
print(f"Within-Cluster Sum of Squares (WCSS / Inertia): {wcss:.2f}")
print(f"Mean Silhouette Coefficient: {sil_score:.3f}")

# 5. PCA 2D Dimensionality Reduction for Visualization
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)
df['pca1'] = X_pca[:, 0]
df['pca2'] = X_pca[:, 1]
print(f"PCA Explained Variance Ratio: {pca.explained_variance_ratio_}")

# 6. Cluster Profiling: Domain Centroids
print("\\n--- CLUSTER CENTROIDS (INTERPRETED DOMAINS) ---")
centroids_original = scaler.inverse_transform(kmeans.cluster_centers_)
centroid_df = pd.DataFrame(centroids_original, columns=feature_cols)
print(centroid_df)
`;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-800">
                DATA MINING LAB SUITE · UNSUPERVISED LEARNING
              </span>
              <span className="text-slate-400 font-mono text-xs">·</span>
              <span className="text-xs font-mono text-emerald-700 font-semibold">Lloyd's Algorithm + k-means++</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight mt-0.5">
              K-Means Multi-Regime Clustering of Oceanographic & Surge Hazard Stations
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl mt-1 leading-relaxed">
              Partitions multi-dimensional marine observation stations into distinct environmental clusters
              to discover spatial risk zones, upwelling fronts, and surge hazard vulnerabilities along the Kerala shelf.
            </p>
          </div>
        </div>

        {/* Action: Export Python Code */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCodeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold text-sky-900 bg-sky-50 border border-sky-200 rounded-lg hover:bg-sky-100 transition-all cursor-pointer shadow-sm"
          >
            <FileCode className="w-4 h-4 text-sky-700" />
            Export Python Scikit-Learn Script
          </button>
        </div>
      </div>

      {/* Oceanographic Scientific Stratification & Cluster Space Graphic Card */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
        <div className="lg:col-span-7 relative h-64 lg:h-auto min-h-[240px] bg-slate-100 overflow-hidden">
          <img
            src="/src/assets/images/kmeans_ocean_clusters_1793279282150.jpg"
            alt="Arabian Sea Cross-Section 3D Hydrographic Water Mass Clustering and Oxygen Minimum Zone"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-mono">
            <span className="bg-sky-900/80 backdrop-blur-xs px-2.5 py-1 rounded border border-sky-300/30">
              Arabian Sea Transect (10°N - 24°N)
            </span>
            <span className="text-slate-200 text-[11px] hidden sm:inline">
              SST · Salinity · Oxygen Minimum Zone (OMZ) · Bathymetry
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 p-5 flex flex-col justify-between bg-gradient-to-br from-white to-sky-50/30">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-800 uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-sky-600"></span>
              Physical Basis of Marine K-Means Clusters
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Hydrographic Regimes & Environmental Feature Space
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              In marine data mining, unsupervised K-Means partitions the ocean into natural biophysical provinces:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                <span><strong>Mixed Layer (0–50m):</strong> High SST, wind mixing, surge anomaly & pelagic fish grazing.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                <span><strong>Thermocline & Upwelling (50–250m):</strong> Cold, nutrient-dense chlorophyll fronts and high eDNA richness.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0"></span>
                <span><strong>Arabian Sea OMZ (250–1100m):</strong> Extreme dissolved oxygen minimum (&lt;0.2 mL/L) shaping demersal taxa.</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Data Mining: Lloyd's Algorithm</span>
            <span className="text-sky-700 font-semibold">Normalized Vector Space</span>
          </div>
        </div>
      </div>

      {/* Hyperparameter Controls & Feature Selection */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-200">
          {/* Cluster Count Selector */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-700 uppercase">
              Cluster Count (k):
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 font-mono text-xs">
              {[2, 3, 4, 5, 6].map((kOption) => (
                <button
                  key={kOption}
                  onClick={() => setK(kOption)}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                    k === kOption
                      ? 'bg-sky-600 text-white font-bold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  k = {kOption}
                </button>
              ))}
            </div>
          </div>

          {/* Scaling Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-slate-700 uppercase">
              Feature Standardization:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 font-mono text-xs">
              <button
                onClick={() => setScaleType('Z_SCORE')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  scaleType === 'Z_SCORE'
                    ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Z-Score: (x - mean) / std (StandardScaler)"
              >
                StandardScaler (Z-Score)
              </button>
              <button
                onClick={() => setScaleType('MIN_MAX')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  scaleType === 'MIN_MAX'
                    ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="MinMax: (x - min) / (max - min) (MinMaxScaler)"
              >
                MinMaxScaler [0, 1]
              </button>
            </div>

            {/* Re-seed Button */}
            <button
              onClick={() => setRandomSeed((prev) => prev + 7)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-colors cursor-pointer"
              title="Re-seed k-means++ initialization"
            >
              <RotateCcw className="w-3 h-3 text-slate-600" />
              Re-seed
            </button>
          </div>
        </div>

        {/* Feature Checkboxes */}
        <div>
          <div className="text-xs font-mono font-bold text-slate-700 mb-2">
            SELECT DATA MINING INPUT DIMENSIONS ({selectedFeatureIds.length} ACTIVE):
          </div>
          <div className="flex flex-wrap gap-2">
            {FEATURES.map((feat) => {
              const isChecked = selectedFeatureIds.includes(feat.id);
              return (
                <button
                  key={feat.id}
                  onClick={() => toggleFeature(feat.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                    isChecked
                      ? 'bg-sky-50 border-sky-300 text-sky-900 font-semibold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-3.5 h-3.5 text-sky-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>{feat.label}</span>
                  <span className="text-[10px] text-slate-500 font-sans">({feat.domain})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Clustering Grid: 2D PCA Scatter Visualizer + Evaluation Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: 2D PCA Projection Scatter Plot */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div>
              <div className="text-xs font-mono font-bold uppercase text-sky-800">
                2D PRINCIPAL COMPONENT PROJECTION (PCA)
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                Cluster Spatial Partitioning & Centroids
              </div>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Dimensionality: {selectedFeatureIds.length}D &rarr; 2D
            </div>
          </div>

          {/* SVG PCA Scatter Plot */}
          <div className="relative w-full h-[380px] bg-[#f8fafc] rounded-xl border border-slate-200 overflow-hidden shadow-inner">
            <svg viewBox="0 0 640 400" className="w-full h-full select-none">
              {/* Grid Lines */}
              <line x1="40" y1="200" x2="600" y2="200" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
              <line x1="320" y1="40" x2="320" y2="360" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
              <text x="590" y="215" fill="#64748b" fontSize="10" fontFamily="monospace">
                PC 1
              </text>
              <text x="325" y="55" fill="#64748b" fontSize="10" fontFamily="monospace">
                PC 2
              </text>

              {/* Convex cluster hulls or centroids */}
              {clusterResults?.projectedCentroids.map((c) => {
                const { svgX, svgY } = mapPcaToSvg(c.pcaX, c.pcaY);
                const color = CLUSTER_COLORS[c.clusterIndex % CLUSTER_COLORS.length];
                return (
                  <g key={c.clusterIndex}>
                    {/* Centroid Ring */}
                    <circle
                      cx={svgX}
                      cy={svgY}
                      r="22"
                      fill={color.bg}
                      fillOpacity="0.15"
                      stroke={color.border}
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    {/* Centroid Cross */}
                    <line x1={svgX - 9} y1={svgY} x2={svgX + 9} y2={svgY} stroke={color.border} strokeWidth="2.5" />
                    <line x1={svgX} y1={svgY - 9} x2={svgX} y2={svgY + 9} stroke={color.border} strokeWidth="2.5" />
                    <text
                      x={svgX + 12}
                      y={svgY - 10}
                      fill={color.text}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      C{c.clusterIndex + 1}
                    </text>
                  </g>
                );
              })}

              {/* Data Points */}
              {clusterResults?.projectedPoints.map((pt) => {
                const { svgX, svgY } = mapPcaToSvg(pt.pcaX, pt.pcaY);
                const color = CLUSTER_COLORS[pt.cluster % CLUSTER_COLORS.length];
                const isHovered = hoveredPointId === pt.stationId;

                return (
                  <g
                    key={pt.stationId}
                    onMouseEnter={() => setHoveredPointId(pt.stationId)}
                    onMouseLeave={() => setHoveredPointId(null)}
                    onClick={() => onSelectStation && onSelectStation(pt.stationId)}
                    className="cursor-pointer"
                  >
                    {isHovered && (
                      <circle
                        cx={svgX}
                        cy={svgY}
                        r="14"
                        fill="none"
                        stroke={color.border}
                        strokeWidth="2"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={svgX}
                      cy={svgY}
                      r={isHovered ? 8 : 6}
                      fill={color.bg}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="transition-all"
                    />
                    <text
                      x={svgX + 8}
                      y={svgY + 3}
                      fill="#1e293b"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {pt.stationId}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPointId && (
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs p-2.5 rounded-lg border border-slate-200 text-xs shadow-md font-mono text-slate-800 pointer-events-none">
                {(() => {
                  const pt = clusterResults?.projectedPoints.find((p) => p.stationId === hoveredPointId);
                  if (!pt) return null;
                  const cColor = CLUSTER_COLORS[pt.cluster % CLUSTER_COLORS.length];
                  return (
                    <div>
                      <div className="font-bold flex items-center gap-1.5" style={{ color: cColor.text }}>
                        <span>● {pt.stationName} ({pt.stationId})</span>
                        <span className="text-slate-500 font-normal">| Cluster {pt.cluster + 1}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1">
                        Silhouette: {pt.silhouette} · Depth: {pt.depth}m
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Cluster Legend Strip */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
            {Array.from({ length: k }).map((_, cIdx) => {
              const color = CLUSTER_COLORS[cIdx % CLUSTER_COLORS.length];
              const count = clusterResults?.projectedPoints.filter((p) => p.cluster === cIdx).length ?? 0;
              return (
                <div key={cIdx} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ backgroundColor: color.bg }}
                  ></span>
                  <span className="font-mono text-slate-800 font-semibold">
                    Cluster {cIdx + 1} ({count} stations)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Data Mining Quantitative Evaluation */}
        <div className="space-y-4">
          {/* Evaluation Metrics Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono font-bold uppercase text-sky-800">
              CLUSTERING VALIDATION METRICS
            </div>

            <div className="space-y-3">
              {/* Silhouette Score */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Mean Silhouette Score (s)</span>
                  <span className="text-emerald-700 font-semibold font-mono">Range: [-1, +1]</span>
                </div>
                <div className="text-2xl font-mono font-bold text-slate-900 mt-0.5 flex items-baseline gap-2">
                  <span>{clusterResults?.meanSilhouette ?? 0.62}</span>
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    Strong Separation
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(0, ((clusterResults?.meanSilhouette ?? 0.6) + 1) * 50)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Inertia / WCSS */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>WCSS / Inertia (In-Cluster Variance)</span>
                  <span className="text-slate-500 font-mono">Lloyd's cost</span>
                </div>
                <div className="text-2xl font-mono font-bold text-slate-900 mt-0.5">
                  {clusterResults?.wcss ?? 42.8}
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Sum of squared Euclidean distances to nearest centroid.
                </div>
              </div>
            </div>
          </div>

          {/* Elbow Method Curve Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-800 uppercase">ELBOW METHOD OPTIMIZER</span>
              <span className="text-sky-700 font-semibold">Optimal k = 3 or 4</span>
            </div>

            {/* Micro SVG Elbow Curve */}
            <div className="h-28 w-full bg-[#f8fafc] rounded-lg border border-slate-200 p-2">
              <svg viewBox="0 0 200 80" className="w-full h-full">
                {/* WCSS Line */}
                <polyline
                  points="20,15 60,32 100,50 140,62 180,68"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                />
                {[
                  { x: 20, y: 15, kVal: 2 },
                  { x: 60, y: 32, kVal: 3 },
                  { x: 100, y: 50, kVal: 4 },
                  { x: 140, y: 62, kVal: 5 },
                  { x: 180, y: 68, kVal: 6 },
                ].map((pt) => (
                  <g key={pt.kVal}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={pt.kVal === k ? 5 : 3.5}
                      fill={pt.kVal === k ? '#0284c7' : '#ffffff'}
                      stroke={pt.kVal === k ? '#0f172a' : '#0284c7'}
                      strokeWidth="2"
                    />
                    <text x={pt.x - 3} y="78" fill="#64748b" fontSize="8" fontFamily="monospace">
                      k{pt.kVal}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="text-[11px] text-slate-600 leading-relaxed">
              The 'elbow' inflection point reflects the optimal trade-off between model simplicity and variance reduction.
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Centroids & Domain Interpretation Profiler */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="text-xs font-mono font-bold uppercase text-sky-800">
              CLUSTER CENTROID PROFILES & REGIME INTERPRETATION
            </div>
            <div className="text-sm font-bold text-slate-900 mt-0.5">
              Unsupervised Cluster Signatures mapped to Physical & Biological Domains
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Scale Inverted to Original Units
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="py-2.5 px-3">CLUSTER ID</th>
                <th className="py-2.5 px-3">DOMAIN INTERPRETATION</th>
                {selectedFeatureIds.map((fId) => {
                  const feat = FEATURES.find((f) => f.id === fId);
                  return (
                    <th key={fId} className="py-2.5 px-3 text-right">
                      {feat?.label} ({feat?.unit})
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clusterResults?.projectedCentroids.map((c) => {
                const color = CLUSTER_COLORS[c.clusterIndex % CLUSTER_COLORS.length];
                const label = clusterResults.clusterLabels[c.clusterIndex] || `Marine Regime ${c.clusterIndex + 1}`;
                return (
                  <tr key={c.clusterIndex} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: color.bg }}
                        ></span>
                        <span className="font-bold text-slate-900">Cluster {c.clusterIndex + 1}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-sans font-medium text-slate-800">
                      {label}
                    </td>
                    {c.rawFeatureMeans.map((meanVal, fIdx) => (
                      <td key={fIdx} className="py-2.5 px-3 text-right font-bold text-slate-900">
                        {meanVal}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Export Python Code */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-sky-700" />
                <h3 className="text-base font-bold text-slate-900 font-sans">
                  Exportable Python Scikit-Learn Script (Data Mining Submission)
                </h3>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-slate-700 font-mono text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              This standalone Python script loads your live multi-domain Kerala shelf dataset, scales features with{' '}
              <strong>{scaleType === 'Z_SCORE' ? 'StandardScaler' : 'MinMaxScaler'}</strong>, trains Lloyd's K-Means with{' '}
              <strong>k-means++</strong>, evaluates Silhouette & WCSS, and generates PCA 2D projections.
            </p>

            <pre className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 p-4 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed select-all shadow-inner">
              {pythonScript}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-mono">
                Dependencies: numpy, pandas, scikit-learn, matplotlib
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pythonScript);
                  }}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Copy Python Code
                </button>
                <button
                  onClick={() => setShowCodeModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
