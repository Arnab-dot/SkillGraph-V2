import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import pandas as pd
from backend.app.config import settings

def get_processed_jobs(search: Optional[str]=None, role: Optional[str]=None, location: Optional[str]=None, company: Optional[str]=None, limit: int=50, offset: int=0) -> Dict[str, Any]:
    csv_path = settings.PROCESSED_DATA_DIR / 'final_processed.csv'
    if not csv_path.exists():
        csv_path = settings.PROCESSED_DATA_DIR / 'jobs_with_skills.csv'
    if not csv_path.exists():
        return {'total': 0, 'jobs': []}
    df = pd.read_csv(csv_path)
    if search:
        mask = df['description'].str.contains(search, case=False, na=False)
        df = df[mask]
    if role:
        df = df[df['job_title'].str.contains(role, case=False, na=False)]
    if location:
        df = df[df['location'].str.contains(location, case=False, na=False)]
    if company:
        df = df[df['company'].str.contains(company, case=False, na=False)]
    total = len(df)
    df = df.iloc[offset:offset + limit]
    jobs = []
    for idx, row in df.iterrows():
        jobs.append({'id': int(idx), 'job_title': str(row.get('job_title', '')), 'company': str(row.get('company', '')), 'location': str(row.get('location', '')), 'experience': str(row.get('experience', '')), 'salary': str(row.get('salary', '')), 'posted_date': str(row.get('posted_date', '')), 'description': str(row.get('description', ''))[:500], 'cleaned_text': None, 'cluster_id': int(row['cluster_id']) if pd.notna(row.get('cluster_id')) else None})
    return {'total': total, 'jobs': jobs}

def get_dashboard_stats() -> Dict[str, Any]:
    stats: Dict[str, Any] = {'total_jobs': 0, 'total_skills': 0, 'total_clusters': 0, 'top_emerging_skill': 'N/A', 'total_resumes': 0}
    csv_path = settings.PROCESSED_DATA_DIR / 'final_processed.csv'
    if csv_path.exists():
        df = pd.read_csv(csv_path)
        stats['total_jobs'] = len(df)
    skill_path = settings.REPORT_OUTPUT_DIR / 'skill_frequencies.csv'
    if skill_path.exists():
        skills_df = pd.read_csv(skill_path)
        stats['total_skills'] = len(skills_df)
    meta_path = settings.CLUSTER_OUTPUT_DIR / 'cluster_metadata.json'
    if meta_path.exists():
        with open(meta_path) as f:
            meta = json.load(f)
        stats['total_clusters'] = meta.get('n_clusters', 0)
    trend_path = settings.TREND_OUTPUT_DIR / 'trend_summary.json'
    if trend_path.exists():
        with open(trend_path) as f:
            trend_data = json.load(f)
        emerging = trend_data.get('emerging', [])
        if emerging:
            stats['top_emerging_skill'] = emerging[0].get('skill', 'N/A')
    return stats