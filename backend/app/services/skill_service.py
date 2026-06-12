import json
from typing import Any, Dict, List, Optional
import pandas as pd
from backend.app.config import settings

def get_top_skills(n: int=30) -> Dict[str, Any]:
    path = settings.REPORT_OUTPUT_DIR / 'skill_frequencies.csv'
    if not path.exists():
        return {'total': 0, 'skills': []}
    df = pd.read_csv(path)
    df = df.head(n)
    skills = df.to_dict(orient='records')
    return {'total': len(skills), 'skills': skills}

def search_skills(query: str) -> Dict[str, Any]:
    path = settings.REPORT_OUTPUT_DIR / 'skill_frequencies.csv'
    if not path.exists():
        return {'total': 0, 'skills': []}
    df = pd.read_csv(path)
    mask = df['skill'].str.contains(query, case=False, na=False)
    df = df[mask]
    skills = df.to_dict(orient='records')
    return {'total': len(skills), 'skills': skills}