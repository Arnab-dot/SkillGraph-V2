import json
from typing import Any, Dict, List
import pandas as pd
from backend.app.config import settings

def get_trends() -> Dict[str, Any]:
    path = settings.TREND_OUTPUT_DIR / 'skill_trends.csv'
    if not path.exists():
        return {'total': 0, 'trends': []}
    df = pd.read_csv(path)
    return {'total': len(df), 'trends': df.to_dict(orient='records')}

def get_emerging_skills() -> List[Dict[str, Any]]:
    path = settings.TREND_OUTPUT_DIR / 'trend_summary.json'
    if not path.exists():
        return []
    with open(path) as f:
        data = json.load(f)
    return data.get('emerging', [])

def get_declining_skills() -> List[Dict[str, Any]]:
    path = settings.TREND_OUTPUT_DIR / 'trend_summary.json'
    if not path.exists():
        return []
    with open(path) as f:
        data = json.load(f)
    return data.get('declining', [])

def get_monthly_data() -> List[Dict[str, Any]]:
    path = settings.TREND_OUTPUT_DIR / 'monthly_frequencies.csv'
    if not path.exists():
        return []
    df = pd.read_csv(path)
    return df.to_dict(orient='records')

def get_forecast() -> Dict[str, Any]:
    path = settings.TREND_OUTPUT_DIR / 'forecast_results.json'
    if not path.exists():
        return {'total': 0, 'forecasts': []}
    with open(path) as f:
        data = json.load(f)
    forecasts = data.get('forecasts', [])
    return {'total': len(forecasts), 'forecasts': forecasts}