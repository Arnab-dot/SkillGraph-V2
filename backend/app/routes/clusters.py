from fastapi import APIRouter, HTTPException
from backend.app.services import cluster_service
router = APIRouter(prefix='/api/clusters', tags=['Clusters'])

@router.get('')
async def get_clusters():
    clusters = cluster_service.get_clusters()
    scatter = cluster_service.get_scatter_data()
    return {**clusters, 'scatter': scatter}

@router.get('/{cluster_id}')
async def get_cluster(cluster_id: int):
    cluster = cluster_service.get_cluster_by_id(cluster_id)
    if not cluster:
        raise HTTPException(status_code=404, detail=f'Cluster {cluster_id} not found')
    return cluster