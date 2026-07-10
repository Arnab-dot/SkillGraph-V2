from fastapi import APIRouter
from backend.app.services import candidate_service

router = APIRouter(prefix='/api/pool', tags=['Pool'])

@router.get('/analytics')
async def get_pool_analytics():
    return candidate_service.get_pool_analytics()
