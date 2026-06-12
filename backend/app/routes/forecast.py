from fastapi import APIRouter
from backend.app.services import trend_service
router = APIRouter(prefix='/api/forecast', tags=['Forecast'])

@router.get('')
async def get_forecast():
    return trend_service.get_forecast()

@router.get('/emerging')
async def get_forecast_emerging():
    data = trend_service.get_forecast()
    forecasts = data.get('forecasts', [])
    emerging = sorted(forecasts, key=lambda x: x.get('future_growth_score', 0), reverse=True)[:10]
    return {'total': len(emerging), 'emerging': emerging}