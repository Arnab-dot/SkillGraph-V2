from fastapi import APIRouter
from backend.app.services import trend_service
router = APIRouter(prefix='/api/trends', tags=['Trends'])

@router.get('')
async def get_trends():
    return trend_service.get_trends()

@router.get('/emerging')
async def get_emerging():
    return trend_service.get_emerging_skills()

@router.get('/declining')
async def get_declining():
    return trend_service.get_declining_skills()

@router.get('/monthly')
async def get_monthly():
    return trend_service.get_monthly_data()