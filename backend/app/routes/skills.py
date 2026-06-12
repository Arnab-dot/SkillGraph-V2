from fastapi import APIRouter, Query
from backend.app.services import skill_service
router = APIRouter(prefix='/api/skills', tags=['Skills'])

@router.get('/top')
async def get_top_skills(n: int=Query(30, ge=1, le=100)):
    return skill_service.get_top_skills(n)

@router.get('/search')
async def search_skills(q: str=Query(..., min_length=1)):
    return skill_service.search_skills(q)