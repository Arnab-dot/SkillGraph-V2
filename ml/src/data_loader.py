import re
import pandas as pd
from pathlib import Path
from typing import Union
from ml.src.utils import setup_logger

logger = setup_logger(__name__)

EXPECTED_COLUMNS = ['job_title', 'company', 'location', 'experience', 'salary', 'posted_date', 'description', 'linkedin_skills', 'industries', 'salary_val', 'company_size', 'company_description']

def load_dataset(path: Union[str, Path]) -> pd.DataFrame:
    path = Path(path)
    logger.info(f'Loading dataset from: {path}')
    
    if path.name == 'postings.csv' or path.is_dir():
        downloads = path if path.is_dir() else path.parent
        postings_path = downloads / 'postings.csv' if (downloads / 'postings.csv').exists() else downloads
        
        if postings_path.exists():
            df = pd.read_csv(postings_path)
            logger.info(f'Loaded {len(df)} base postings. Merging with jobs/companies/mappings...')
            
            companies_path = downloads / 'companies' / 'companies.csv'
            job_skills_path = downloads / 'jobs' / 'job_skills.csv'
            skills_path = downloads / 'mappings' / 'skills.csv'
            job_industries_path = downloads / 'jobs' / 'job_industries.csv'
            industries_path = downloads / 'mappings' / 'industries.csv'
            salaries_path = downloads / 'jobs' / 'salaries.csv'
            
            broad_roles = ['developer', 'engineer', 'analyst', 'scientist', 'programmer', 'architect', 'tech', 'software']
            tech_mask = df['title'].str.contains('|'.join(broad_roles), case=False, na=False)
            df = df[tech_mask].copy()
            
            if len(df) > 3000:
                df = df.sample(n=3000, random_state=42).reset_index(drop=True)
                
            if companies_path.exists():
                cos = pd.read_csv(companies_path).rename(columns={
                    'name': 'company_name_co',
                    'description': 'company_description_co',
                    'company_size': 'company_size_co'
                })
                df = df.merge(cos[['company_id', 'company_name_co', 'company_size_co', 'company_description_co']], on='company_id', how='left')
                df['company'] = df['company_name_co'].fillna(df['company_name']).fillna('Unknown')
                df['company_description'] = df['company_description_co'].fillna('')
                df['company_size'] = df['company_size_co'].fillna(-1)
            else:
                df['company'] = df['company_name'].fillna('Unknown')
                df['company_description'] = ''
                df['company_size'] = -1
                
            if job_skills_path.exists() and skills_path.exists():
                js = pd.read_csv(job_skills_path)
                s = pd.read_csv(skills_path)
                js_s = js.merge(s, on='skill_abr', how='inner')
                job_skills_grouped = js_s.groupby('job_id')['skill_name'].apply(list).reset_index()
                df = df.merge(job_skills_grouped, on='job_id', how='left')
                df['linkedin_skills'] = df['skill_name'].fillna('').apply(lambda x: x if isinstance(x, list) else [])
            else:
                df['linkedin_skills'] = [[] for _ in range(len(df))]
                
            if job_industries_path.exists() and industries_path.exists():
                ji = pd.read_csv(job_industries_path)
                ind = pd.read_csv(industries_path)
                ji_ind = ji.merge(ind, on='industry_id', how='inner')
                job_ind_grouped = ji_ind.groupby('job_id')['industry_name'].apply(list).reset_index()
                df = df.merge(job_ind_grouped, on='job_id', how='left')
                df['industries'] = df['industry_name'].fillna('').apply(lambda x: x if isinstance(x, list) else [])
            else:
                df['industries'] = [[] for _ in range(len(df))]
                
            if salaries_path.exists():
                sals = pd.read_csv(salaries_path).drop_duplicates(subset=['job_id']).rename(columns={
                    'max_salary': 'max_salary_sal',
                    'med_salary': 'med_salary_sal',
                    'min_salary': 'min_salary_sal',
                    'pay_period': 'pay_period_sal',
                    'currency': 'currency_sal'
                })
                df = df.merge(sals[['job_id', 'max_salary_sal', 'med_salary_sal', 'min_salary_sal', 'pay_period_sal', 'currency_sal']], on='job_id', how='left')
                df['min_salary'] = df['min_salary'].fillna(df['min_salary_sal'])
                df['max_salary'] = df['max_salary'].fillna(df['max_salary_sal'])
                df['med_salary'] = df['med_salary'].fillna(df['med_salary_sal'])
                df['pay_period'] = df['pay_period'].fillna(df['pay_period_sal']).fillna('YEARLY')
                df['currency'] = df['currency'].fillna(df['currency_sal']).fillna('USD')
            else:
                df['pay_period'] = df['pay_period'].fillna('YEARLY')
                df['currency'] = df['currency'].fillna('USD')
                
            def normalize_to_yearly(row):
                period = str(row.get('pay_period', 'YEARLY')).upper()
                min_val = row.get('min_salary')
                max_val = row.get('max_salary')
                med_val = row.get('med_salary')
                val = med_val if pd.notna(med_val) else ((min_val + max_val)/2 if (pd.notna(min_val) and pd.notna(max_val)) else (min_val if pd.notna(min_val) else max_val))
                if pd.isna(val):
                    return None
                factor = 1
                if period == 'HOURLY':
                    factor = 2000
                elif period == 'WEEKLY':
                    factor = 52
                elif period == 'MONTHLY':
                    factor = 12
                return float(val * factor)
                
            df['salary_val'] = df.apply(normalize_to_yearly, axis=1)
            
            def format_salary_str(row):
                min_val = row.get('min_salary')
                max_val = row.get('max_salary')
                curr = row.get('currency', 'USD')
                period = str(row.get('pay_period', 'YEARLY')).lower()
                if pd.isna(min_val) and pd.isna(max_val):
                    return 'Not Specified'
                if pd.notna(min_val) and pd.notna(max_val):
                    return f"{curr} {int(min_val):,d} - {int(max_val):,d} ({period})"
                elif pd.notna(min_val):
                    return f"From {curr} {int(min_val):,d} ({period})"
                else:
                    return f"Up to {curr} {int(max_val):,d} ({period})"
                    
            df['salary'] = df.apply(format_salary_str, axis=1)
            df['posted_date'] = pd.to_datetime(df['listed_time'], unit='ms', errors='coerce')
            df['experience'] = df['formatted_experience_level'].fillna('Not Specified')
            df['job_title'] = df['title'].fillna('Unknown')
            df['location'] = df['location'].fillna('Unknown')
            df['description'] = df['description'].fillna('')
            
            # Drop temporary merge helper columns
            df = df.drop(columns=[
                'company_name_co', 'company_description_co', 'company_size_co',
                'skill_name', 'industry_name', 'min_salary_sal', 'max_salary_sal',
                'med_salary_sal', 'pay_period_sal', 'currency_sal', 'title'
            ], errors='ignore')
        else:
            raise FileNotFoundError(f'postings.csv not found at: {path}')
    else:
        suffix = path.suffix.lower()
        if suffix == '.csv':
            df = pd.read_csv(path)
        elif suffix == '.json':
            df = pd.read_json(path)
        elif suffix in ('.xlsx', '.xls'):
            df = pd.read_excel(path)
        else:
            raise ValueError(f'Unsupported file format: {suffix}. Supported: .csv, .json, .xlsx, .xls')
            
    df.columns = [_normalize_column_name(col) for col in df.columns]
    
    # Resolve duplicate column names if any
    df = df.loc[:, ~df.columns.duplicated()]
    
    for col in EXPECTED_COLUMNS:
        if col not in df.columns:
            if col == 'posted_date':
                df[col] = pd.NaT
            elif col in ('linkedin_skills', 'industries'):
                df[col] = [[] for _ in range(len(df))]
            elif col == 'salary_val':
                df[col] = None
            elif col == 'company_size':
                df[col] = -1
            else:
                df[col] = ''
                
    if 'posted_date' in df.columns:
        df['posted_date'] = pd.to_datetime(df['posted_date'], errors='coerce')
        
    initial_count = len(df)
    df = df.dropna(subset=['description'])
    df = df[df['description'].str.strip().astype(bool)]
    dropped = initial_count - len(df)
    if dropped > 0:
        logger.warning(f'Dropped {dropped} rows with empty descriptions')
    df = df.reset_index(drop=True)
    logger.info(f'Final dataset: {len(df)} rows')
    return df

def _normalize_column_name(name: str) -> str:
    name = str(name).strip().lower()
    name = re.sub('[^a-z0-9]+', '_', name)
    name = name.strip('_')
    mappings = {'title': 'job_title', 'job': 'job_title', 'role': 'job_title', 'position': 'job_title', 'date': 'posted_date', 'post_date': 'posted_date', 'date_posted': 'posted_date', 'desc': 'description', 'job_description': 'description', 'text': 'description', 'loc': 'location', 'city': 'location', 'exp': 'experience', 'years_experience': 'experience', 'pay': 'salary', 'compensation': 'salary', 'org': 'company', 'organization': 'company', 'employer': 'company'}
    return mappings.get(name, name)

def validate_dataset(df: pd.DataFrame) -> dict:
    summary = {'total_rows': len(df), 'columns': list(df.columns), 'missing_values': df.isnull().sum().to_dict(), 'has_dates': df['posted_date'].notna().any() if 'posted_date' in df.columns else False, 'unique_titles': df['job_title'].nunique() if 'job_title' in df.columns else 0, 'unique_companies': df['company'].nunique() if 'company' in df.columns else 0, 'avg_description_length': df['description'].str.len().mean() if 'description' in df.columns else 0}
    return summary