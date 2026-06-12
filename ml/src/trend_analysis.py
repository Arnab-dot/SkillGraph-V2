from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from ml.src.config import TREND_OUTPUT_DIR
from ml.src.utils import setup_logger, Timer, save_dataframe, save_json, safe_divide
logger = setup_logger(__name__)

def compute_monthly_skill_frequency(df: pd.DataFrame) -> Optional[pd.DataFrame]:
    if 'posted_date' not in df.columns:
        logger.warning("No 'posted_date' column. Skipping trend analysis.")
        return None
    valid_dates = df['posted_date'].notna()
    if valid_dates.sum() < 10:
        logger.warning(f'Only {valid_dates.sum()} valid dates. Trend analysis needs at least 10 dated entries.')
        return None
    logger.info('Computing monthly skill frequencies...')
    with Timer('Monthly frequency computation', logger):
        df_dated = df[valid_dates].copy()
        df_dated['month'] = df_dated['posted_date'].dt.to_period('M').astype(str)
        records = []
        for _, row in df_dated.iterrows():
            skills = row.get('extracted_skills', [])
            if isinstance(skills, list):
                for skill in skills:
                    records.append({'skill': skill, 'month': row['month']})
        if not records:
            logger.warning('No skill-month records found.')
            return None
        freq_df = pd.DataFrame(records)
        freq_df = freq_df.groupby(['skill', 'month']).size().reset_index(name='frequency')
        freq_df = freq_df.sort_values(['skill', 'month']).reset_index(drop=True)
        logger.info(f"Monthly frequencies: {len(freq_df)} entries, {freq_df['skill'].nunique()} unique skills, {freq_df['month'].nunique()} months")
        return freq_df

def compute_growth_scores(monthly_freq: pd.DataFrame, recent_months: int=3, older_months: int=3) -> pd.DataFrame:
    logger.info('Computing growth scores...')
    months = sorted(monthly_freq['month'].unique())
    if len(months) < recent_months + older_months:
        logger.warning(f'Not enough months ({len(months)}) for growth analysis. Need at least {recent_months + older_months}.')
        total_freq = monthly_freq.groupby('skill')['frequency'].sum().reset_index()
        total_freq.columns = ['skill', 'total_frequency']
        total_freq['growth_score'] = 1.0
        total_freq['recent_avg'] = total_freq['total_frequency']
        total_freq['older_avg'] = total_freq['total_frequency']
        total_freq['trend'] = 'stable'
        return total_freq.sort_values('total_frequency', ascending=False)
    recent_period = months[-recent_months:]
    older_period = months[-(recent_months + older_months):-recent_months]
    growth_data = []
    for skill in monthly_freq['skill'].unique():
        skill_data = monthly_freq[monthly_freq['skill'] == skill]
        recent_avg = skill_data[skill_data['month'].isin(recent_period)]['frequency'].mean()
        older_avg = skill_data[skill_data['month'].isin(older_period)]['frequency'].mean()
        recent_avg = recent_avg if not np.isnan(recent_avg) else 0
        older_avg = older_avg if not np.isnan(older_avg) else 0
        growth_score = safe_divide(recent_avg, older_avg, default=1.0)
        if growth_score >= 1.5:
            trend = 'emerging'
        elif growth_score >= 1.1:
            trend = 'growing'
        elif growth_score >= 0.9:
            trend = 'stable'
        elif growth_score >= 0.5:
            trend = 'declining'
        else:
            trend = 'rapidly_declining'
        growth_data.append({'skill': skill, 'growth_score': round(growth_score, 3), 'recent_avg': round(recent_avg, 2), 'older_avg': round(older_avg, 2), 'total_frequency': int(skill_data['frequency'].sum()), 'trend': trend})
    growth_df = pd.DataFrame(growth_data)
    growth_df = growth_df.sort_values('growth_score', ascending=False).reset_index(drop=True)
    trend_counts = growth_df['trend'].value_counts().to_dict()
    logger.info(f'Trend summary: {trend_counts}')
    return growth_df

def get_emerging_skills(growth_df: pd.DataFrame, n: int=10) -> List[Dict[str, Any]]:
    emerging = growth_df[growth_df['trend'].isin(['emerging', 'growing'])]
    return emerging.head(n).to_dict(orient='records')

def get_declining_skills(growth_df: pd.DataFrame, n: int=10) -> List[Dict[str, Any]]:
    declining = growth_df[growth_df['trend'].isin(['declining', 'rapidly_declining'])]
    return declining.head(n).to_dict(orient='records')

def get_stable_high_demand(growth_df: pd.DataFrame, n: int=10) -> List[Dict[str, Any]]:
    stable = growth_df[growth_df['trend'] == 'stable']
    stable = stable.sort_values('total_frequency', ascending=False)
    return stable.head(n).to_dict(orient='records')

def save_trend_results(monthly_freq: Optional[pd.DataFrame], growth_df: pd.DataFrame, output_dir: Optional[Path]=None) -> None:
    output_dir = output_dir or TREND_OUTPUT_DIR
    save_dataframe(growth_df, output_dir / 'skill_trends.csv')
    if monthly_freq is not None:
        save_dataframe(monthly_freq, output_dir / 'monthly_frequencies.csv')
    summary = {'total_skills_analyzed': len(growth_df), 'emerging': get_emerging_skills(growth_df), 'declining': get_declining_skills(growth_df), 'stable_high_demand': get_stable_high_demand(growth_df)}
    save_json(summary, output_dir / 'trend_summary.json')
    logger.info(f'Trend results saved to: {output_dir}')