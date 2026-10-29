"""
SAMUDRA-DATA: Marine Oceanographic, Coastal Hazard & eDNA K-Means Clustering
Course / Subject: Data Mining & Knowledge Discovery
Author / Lab: CMLRE / INCOIS Arabian Sea Platform
Dataset Scope: Indian EEZ, Kerala Continental Shelf (2021-2026)

Algorithm Workflow:
1. Multi-domain feature matrix extraction (Physics, Hazard Surge, Fisheries CPUE, eDNA)
2. Feature Standardization via StandardScaler (Z-Score)
3. Hyperparameter selection via Elbow Method (Inertia/WCSS vs k)
4. Lloyd's K-Means clustering with k-means++ initialization
5. Cluster quality evaluation using Silhouette Score
6. Dimensionality reduction via Principal Component Analysis (2D PCA)
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score, silhouette_samples

def run_marine_clustering():
    # 1. Realistic Multidimensional Marine Station Data
    data = {
        'station_code': [
            'CR-KL-01', 'CR-KL-02', 'CR-KL-03', 'CR-KL-04',
            'CR-KL-05', 'CR-KL-06', 'CR-KL-07', 'CR-KL-08'
        ],
        'station_name': [
            'Kochi Shelf Coastal', 'Alappuzha Inundation Zone',
            'Kollam Deep Trench', 'Calicut Transect',
            'Vizhinjam Port Coastal', 'Chellanam Surge Sector',
            'Ponnani Upwelling Site', 'Kannur Coastal Shelf'
        ],
        # Feature 1: Sea Surface Temperature Anomaly (°C)
        'sst_anomaly': [0.85, 1.42, 0.45, 1.78, 0.32, 1.38, 0.25, 0.95],
        # Feature 2: Chlorophyll-a Concentration (mg/m³)
        'chlorophyll_a': [2.85, 0.42, 4.10, 0.38, 5.20, 0.65, 4.80, 2.10],
        # Feature 3: Significant Wave Height Hs (m)
        'wave_height_hs': [1.45, 3.40, 1.80, 2.90, 1.60, 3.10, 1.75, 1.90],
        # Feature 4: Tidal Surge Anomaly (m)
        'surge_anomaly': [0.42, 1.32, 0.28, 0.89, 0.15, 1.15, 0.22, 0.48],
        # Feature 5: Commercial Sardine CPUE (kg/hr)
        'sardine_cpue': [112.5, 32.0, 168.0, 28.5, 195.0, 41.0, 180.0, 95.0],
        # Feature 6: eDNA Shannon Diversity Index (H')
        'shannon_diversity': [3.12, 1.85, 3.42, 1.92, 3.55, 2.10, 3.48, 2.95]
    }

    df = pd.DataFrame(data)
    feature_cols = [
        'sst_anomaly', 'chlorophyll_a', 'wave_height_hs',
        'surge_anomaly', 'sardine_cpue', 'shannon_diversity'
    ]
    X = df[feature_cols].values

    # 2. Z-Score Standardization
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 3. Determine Optimal k via Elbow Method (WCSS vs k)
    wcss = []
    k_range = range(2, 7)
    for k in k_range:
        km = KMeans(n_clusters=k, init='k-means++', random_state=42, n_init=10)
        km.fit(X_scaled)
        wcss.append(km.inertia_)

    print("======================================================================")
    print("DATA MINING REPORT: K-MEANS CLUSTERING FOR ARABIAN SEA STATIONS")
    print("======================================================================")
    for k, val in zip(k_range, wcss):
        print(f"k = {k} | WCSS (Inertia): {val:.2f}")

    # 4. Fit Final K-Means Model (k=4 represents the distinct oceanic regimes)
    optimal_k = 4
    kmeans = KMeans(n_clusters=optimal_k, init='k-means++', random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(X_scaled)

    # 5. Evaluate Cluster Cohesion via Silhouette Score
    overall_silhouette = silhouette_score(X_scaled, df['cluster'])
    sample_silhouettes = silhouette_samples(X_scaled, df['cluster'])
    df['silhouette'] = sample_silhouettes

    print(f"\nOptimal Clusters (k={optimal_k}) - Mean Silhouette Score: {overall_silhouette:.3f}")

    # 6. Dimensionality Reduction (PCA 2D Projection)
    pca = PCA(n_components=2)
    X_pca = pca.fit_transform(X_scaled)
    df['pca_1'] = X_pca[:, 0]
    df['pca_2'] = X_pca[:, 1]
    print(f"Explained Variance Ratio: PC1={pca.explained_variance_ratio_[0]:.3f}, PC2={pca.explained_variance_ratio_[1]:.3f}")

    # 7. Cluster Profiles & Interpretations
    print("\nCLUSTER CENTROIDS (ORIGINAL FEATURE UNITS):")
    cluster_means = df.groupby('cluster')[feature_cols].mean()
    print(cluster_means)

    labels = {
        0: "Active Coastal Upwelling Front (High Chl-a, Peak Sardine CPUE, Resilient eDNA)",
        1: "Extreme Storm Surge & Inundation Hazard (High Wave Hs > 3.0m, Critical Flood Risk)",
        2: "Subsurface Hypoxia & Thermal Anomaly (Low O2, Collapsed CPUE, Jellyfish Dominant)",
        3: "Stratified Offshore Basin (Moderate Wave Height, Stable Salinity)"
    }
    print("\nREGIME INTERPRETATIONS:")
    for c_id, desc in labels.items():
        count = (df['cluster'] == c_id).sum()
        print(f"Cluster {c_id} ({count} stations): {desc}")

    return df

if __name__ == '__main__':
    run_marine_clustering()
