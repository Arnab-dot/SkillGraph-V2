from fastapi import APIRouter
from backend.app.services import candidate_service

router = APIRouter(prefix='/api/candidates', tags=['Candidates'])

@router.get('/{candidate_id}/skill-forecast')
async def get_candidate_skill_forecast(candidate_id: str):
    return candidate_service.get_candidate_skill_forecast(candidate_id)
