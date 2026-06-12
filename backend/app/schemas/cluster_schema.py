from pydantic import BaseModel
from typing import Any, Dict, List, Optional

class ClusterResponse(BaseModel):
    cluster_id: int
    name: Optional[str] = None
    size: int
    top_skills: List[Dict[str, Any]]
    representative_titles: List[str]

class ClusterListResponse(BaseModel):
    total_clusters: int
    total_noise: int
    clusters: List[ClusterResponse]

class ClusterScatterPoint(BaseModel):
    job_title: str
    company: Optional[str] = None
    cluster_id: int
    umap_x: float
    umap_y: float

class ClusterScatterResponse(BaseModel):
    total: int
    points: List[ClusterScatterPoint]