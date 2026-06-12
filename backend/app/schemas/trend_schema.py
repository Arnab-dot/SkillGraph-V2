from pydantic import BaseModel
from typing import Any, Dict, List, Optional

class TrendResponse(BaseModel):
    skill: str
    growth_score: float
    recent_avg: float
    older_avg: float
    total_frequency: Optional[int] = None
    trend: str

class TrendListResponse(BaseModel):
    total: int
    trends: List[TrendResponse]

class MonthlyFrequency(BaseModel):
    skill: str
    month: str
    frequency: int

class ForecastResponse(BaseModel):
    skill: str
    current_demand: float
    forecast_month_1: float
    forecast_month_2: float
    forecast_month_3: float
    avg_forecast: float
    future_growth_score: float

class ForecastListResponse(BaseModel):
    total: int
    forecasts: List[ForecastResponse]