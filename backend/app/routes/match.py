from fastapi import APIRouter
from pydantic import BaseModel
from backend.app.services import candidate_service

router = APIRouter(prefix='/api/match', tags=['Match'])

class MatchRequest(BaseModel):
    jd_text: str
    top_n: int = 20

@router.post('/rank')
async def rank_candidates(req: MatchRequest):
    return candidate_service.rank_candidates(req.jd_text, req.top_n)
