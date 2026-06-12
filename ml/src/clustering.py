from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from ml.src.config import UMAP_N_NEIGHBORS, UMAP_MIN_DIST, UMAP_N_COMPONENTS, UMAP_METRIC, UMAP_RANDOM_STATE, HDBSCAN_MIN_CLUSTER_SIZE, HDBSCAN_MIN_SAMPLES, HDBSCAN_METRIC, KMEANS_N_CLUSTERS, KMEANS_RANDOM_STATE, CLUSTER_OUTPUT_DIR
from ml.src.utils import setup_logger, Timer, save_dataframe, save_json
logger = setup_logger(__name__)

def reduce_dimensions_umap(embeddings: np.ndarray, n_neighbors: int=UMAP_N_NEIGHBORS, min_dist: float=UMAP_MIN_DIST, n_components: int=UMAP_N_COMPONENTS, metric: str=UMAP_METRIC, random_state: int=UMAP_RANDOM_STATE) -> np.ndarray:
    logger.info(f'Running UMAP: {embeddings.shape} → {n_components}D (n_neighbors={n_neighbors}, min_dist={min_dist})')
    with Timer('UMAP reduction', logger):
        try:
            import umap
            reducer = umap.UMAP(n_neighbors=n_neighbors, min_dist=min_dist, n_components=n_components, metric=metric, random_state=random_state)
            reduced = reducer.fit_transform(embeddings)
            logger.info(f'UMAP complete: {reduced.shape}')
            return reduced
        except ImportError:
            logger.error('umap-learn not installed. Install with: pip install umap-learn')
            raise

def cluster_hdbscan(embeddings_2d: np.ndarray, min_cluster_size: int=HDBSCAN_MIN_CLUSTER_SIZE, min_samples: int=HDBSCAN_MIN_SAMPLES, metric: str=HDBSCAN_METRIC) -> Tuple[np.ndarray, Dict[str, Any]]:
    logger.info(f'Running HDBSCAN: min_cluster_size={min_cluster_size}, min_samples={min_samples}')
    with Timer('HDBSCAN clustering', logger):
        try:
            import hdbscan
            clusterer = hdbscan.HDBSCAN(min_cluster_size=min_cluster_size, min_samples=min_samples, metric=metric, gen_min_span_tree=True)
            labels = clusterer.fit_predict(embeddings_2d)
            n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
            n_noise = (labels == -1).sum()
            metadata = {'algorithm': 'HDBSCAN', 'n_clusters': n_clusters, 'n_noise': int(n_noise), 'noise_ratio': float(n_noise / len(labels)), 'cluster_sizes': {str(k): int(v) for k, v in zip(*np.unique(labels[labels >= 0], return_counts=True))} if n_clusters > 0 else {}}
            logger.info(f"HDBSCAN found {n_clusters} clusters, {n_noise} noise points ({metadata['noise_ratio']:.1%})")
            return (labels, metadata)
        except ImportError:
            logger.error('hdbscan not installed. Install with: pip install hdbscan')
            raise

def cluster_kmeans(embeddings: np.ndarray, n_clusters: int=KMEANS_N_CLUSTERS, random_state: int=KMEANS_RANDOM_STATE) -> Tuple[np.ndarray, Dict[str, Any]]:
    from sklearn.cluster import KMeans
    logger.info(f'Running KMeans: n_clusters={n_clusters}')
    with Timer('KMeans clustering', logger):
        kmeans = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
        labels = kmeans.fit_predict(embeddings)
        metadata = {'algorithm': 'KMeans', 'n_clusters': n_clusters, 'inertia': float(kmeans.inertia_)}
        logger.info(f'KMeans complete: inertia={kmeans.inertia_:.2f}')
        return (labels, metadata)

def cluster_agglomerative(embeddings: np.ndarray, n_clusters: int=KMEANS_N_CLUSTERS) -> Tuple[np.ndarray, Dict[str, Any]]:
    from sklearn.cluster import AgglomerativeClustering
    logger.info(f'Running Agglomerative Clustering: n_clusters={n_clusters}')
    with Timer('Agglomerative clustering', logger):
        agg = AgglomerativeClustering(n_clusters=n_clusters)
        labels = agg.fit_predict(embeddings)
        metadata = {'algorithm': 'Agglomerative', 'n_clusters': n_clusters}
        logger.info(f'Agglomerative complete: {n_clusters} clusters')
        return (labels, metadata)

def get_cluster_details(df: pd.DataFrame, labels: np.ndarray, coords_2d: np.ndarray) -> pd.DataFrame:
    df = df.copy()
    df['cluster_id'] = labels
    df['umap_x'] = coords_2d[:, 0]
    df['umap_y'] = coords_2d[:, 1]
    return df

def get_top_skills_per_cluster(df: pd.DataFrame, n_skills: int=10) -> Dict[int, List[Tuple[str, int]]]:
    from collections import Counter
    cluster_skills: Dict[int, List[Tuple[str, int]]] = {}
    for cluster_id in sorted(df['cluster_id'].unique()):
        if cluster_id == -1:
            continue
        cluster_df = df[df['cluster_id'] == cluster_id]
        all_skills: List[str] = []
        for skills in cluster_df['extracted_skills']:
            if isinstance(skills, list):
                all_skills.extend(skills)
        counter = Counter(all_skills)
        cluster_skills[int(cluster_id)] = counter.most_common(n_skills)
    return cluster_skills

def get_representative_titles(df: pd.DataFrame, n_titles: int=5) -> Dict[int, List[str]]:
    from collections import Counter
    cluster_titles: Dict[int, List[str]] = {}
    for cluster_id in sorted(df['cluster_id'].unique()):
        if cluster_id == -1:
            continue
        cluster_df = df[df['cluster_id'] == cluster_id]
        if 'job_title' in cluster_df.columns:
            counter = Counter(cluster_df['job_title'].tolist())
            cluster_titles[int(cluster_id)] = [title for title, _ in counter.most_common(n_titles)]
        else:
            cluster_titles[int(cluster_id)] = []
    return cluster_titles

def save_cluster_results(df: pd.DataFrame, metadata: Dict[str, Any], cluster_skills: Dict[int, List[Tuple[str, int]]], cluster_titles: Dict[int, List[str]], output_dir: Optional[Path]=None) -> None:
    output_dir = output_dir or CLUSTER_OUTPUT_DIR
    save_dataframe(df, output_dir / 'cluster_results.csv')
    full_metadata = {**metadata, 'cluster_skills': {str(k): [{'skill': s, 'count': c} for s, c in v] for k, v in cluster_skills.items()}, 'cluster_titles': {str(k): v for k, v in cluster_titles.items()}}
    save_json(full_metadata, output_dir / 'cluster_metadata.json')
    logger.info(f'Cluster results saved to: {output_dir}')