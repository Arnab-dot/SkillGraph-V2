import json
from typing import Any, Dict, List, Optional
import pandas as pd
from backend.app.config import settings

def get_clusters() -> Dict[str, Any]:
    meta_path = settings.CLUSTER_OUTPUT_DIR / 'cluster_metadata.json'
    if not meta_path.exists():
        return {'total_clusters': 0, 'total_noise': 0, 'clusters': []}
    with open(meta_path) as f:
        meta = json.load(f)
    clusters = []
    cluster_skills = meta.get('cluster_skills', {})
    cluster_titles = meta.get('cluster_titles', {})
    for cid, skills in cluster_skills.items():
        clusters.append({'cluster_id': int(cid), 'name': f'Cluster {cid}', 'size': meta.get('cluster_sizes', {}).get(cid, 0), 'top_skills': skills, 'representative_titles': cluster_titles.get(cid, [])})
    return {'total_clusters': meta.get('n_clusters', 0), 'total_noise': meta.get('n_noise', 0), 'clusters': clusters}

def get_cluster_by_id(cluster_id: int) -> Optional[Dict[str, Any]]:
    data = get_clusters()
    for cluster in data['clusters']:
        if cluster['cluster_id'] == cluster_id:
            return cluster
    return None

def get_scatter_data() -> Dict[str, Any]:
    csv_path = settings.CLUSTER_OUTPUT_DIR / 'cluster_results.csv'
    if not csv_path.exists():
        return {'total': 0, 'points': []}
    df = pd.read_csv(csv_path)
    required = ['job_title', 'cluster_id', 'umap_x', 'umap_y']
    if not all((col in df.columns for col in required)):
        return {'total': 0, 'points': []}
    points = []
    for _, row in df.iterrows():
        points.append({'job_title': str(row.get('job_title', '')), 'company': str(row.get('company', '')), 'cluster_id': int(row['cluster_id']) if pd.notna(row.get('cluster_id')) else -1, 'umap_x': float(row['umap_x']), 'umap_y': float(row['umap_y'])})
    return {'total': len(points), 'points': points}