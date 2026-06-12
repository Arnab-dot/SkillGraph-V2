from collections import Counter
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd
from ml.src.config import TARGET_ROLE_SKILLS
from ml.src.skill_extractor import SkillExtractor
from ml.src.utils import setup_logger, safe_divide

logger = setup_logger(__name__)

ROLE_KEYWORD_MAP = {
    'ML Engineer': ['ml', 'machine learning'],
    'Data Scientist': ['data scientist', 'data science'],
    'AI Engineer': ['ai engineer', 'artificial intelligence'],
    'MLOps Engineer': ['mlops', 'machine learning operations'],
    'Data Analyst': ['data analyst', 'business analyst', 'data analytics'],
    'Backend Developer': ['backend', 'back-end', 'back end'],
    'Data Engineer': ['data engineer', 'data pipeline']
}

class GapAnalyzer:

    def __init__(self, extractor: Optional[SkillExtractor]=None):
        self.extractor = extractor or SkillExtractor()

    def analyze(self, resume_text: str, target_role: str, job_df: Optional[pd.DataFrame]=None) -> Dict[str, Any]:
        logger.info(f'Analyzing resume gap for target role: {target_role}')
        resume_skills = set(self.extractor.extract_skills(resume_text))
        
        matching_jobs = self._get_matching_jobs(target_role, job_df)
        
        required_skills = self._get_required_skills(target_role, matching_jobs)
        required_set = set(required_skills)
        
        matched_skills = resume_skills & required_set
        missing_skills = required_set - resume_skills
        extra_skills = resume_skills - required_set
        
        match_pct = safe_divide(len(matched_skills), len(required_set), default=0.0) * 100
        priority_skills = self._prioritize_missing(missing_skills, target_role, job_df)
        roadmap = self._generate_roadmap(priority_skills, target_role)
        
        market_insights = self._compute_market_insights(matching_jobs, target_role)
        
        result = {
            'target_role': target_role,
            'resume_skills': sorted(resume_skills),
            'required_skills': sorted(required_set),
            'matched_skills': sorted(matched_skills),
            'missing_skills': sorted(missing_skills),
            'extra_skills': sorted(extra_skills),
            'priority_missing_skills': priority_skills,
            'learning_roadmap': roadmap,
            'match_percentage': round(match_pct, 1),
            'market_insights': market_insights,
            'summary': {
                'total_resume_skills': len(resume_skills),
                'total_required_skills': len(required_set),
                'matched_count': len(matched_skills),
                'missing_count': len(missing_skills),
                'extra_count': len(extra_skills)
            }
        }
        return result

    def _get_matching_jobs(self, target_role: str, job_df: Optional[pd.DataFrame]) -> pd.DataFrame:
        if job_df is None or job_df.empty or 'job_title' not in job_df.columns:
            return pd.DataFrame()
            
        keywords = ROLE_KEYWORD_MAP.get(target_role, [target_role.lower()])
        pattern = '|'.join(keywords)
        matching = job_df[job_df['job_title'].str.lower().str.contains(pattern, na=False)]
        return matching

    def _get_required_skills(self, target_role: str, matching_jobs: pd.DataFrame) -> List[str]:
        predefined = TARGET_ROLE_SKILLS.get(target_role, [])
        if matching_jobs.empty or 'extracted_skills' not in matching_jobs.columns:
            return predefined
            
        skill_counter: Counter = Counter()
        for skills in matching_jobs['extracted_skills']:
            if isinstance(skills, list):
                skill_counter.update(skills)
            elif isinstance(skills, str):
                try:
                    import ast
                    parsed = ast.literal_eval(skills)
                    if isinstance(parsed, list):
                        skill_counter.update(parsed)
                except Exception:
                    pass
                    
        threshold = max(2, len(matching_jobs) * 0.1)
        data_skills = [skill for skill, count in skill_counter.most_common(15) if count >= threshold]
        
        combined = list(dict.fromkeys(predefined + data_skills))
        return combined[:15] if combined else predefined

    def _prioritize_missing(self, missing_skills: set, target_role: str, job_df: Optional[pd.DataFrame]) -> List[Dict[str, Any]]:
        predefined = TARGET_ROLE_SKILLS.get(target_role, [])
        priority_order = {skill: i for i, skill in enumerate(predefined)}
        freq_map: Dict[str, int] = {}
        
        if job_df is not None and 'extracted_skills' in job_df.columns:
            for skills in job_df['extracted_skills']:
                if isinstance(skills, list):
                    for skill in skills:
                        freq_map[skill] = freq_map.get(skill, 0) + 1
                elif isinstance(skills, str):
                    try:
                        import ast
                        parsed = ast.literal_eval(skills)
                        if isinstance(parsed, list):
                            for skill in parsed:
                                freq_map[skill] = freq_map.get(skill, 0) + 1
                    except Exception:
                        pass
                        
        priority_list = []
        for skill in missing_skills:
            freq = freq_map.get(skill, 0)
            order = priority_order.get(skill, 999)
            priority_list.append({
                'skill': skill,
                'market_frequency': freq,
                'priority_rank': order if order < 999 else len(predefined),
                'priority': 'high' if order < 5 else 'medium' if order < 10 else 'low'
            })
            
        priority_list.sort(key=lambda x: ({'high': 0, 'medium': 1, 'low': 2}[x['priority']], -x['market_frequency']))
        return priority_list

    def _generate_roadmap(self, priority_skills: List[Dict[str, Any]], target_role: str) -> List[Dict[str, Any]]:
        high = [s for s in priority_skills if s['priority'] == 'high']
        medium = [s for s in priority_skills if s['priority'] == 'medium']
        low = [s for s in priority_skills if s['priority'] == 'low']
        roadmap = []
        if high:
            roadmap.append({'phase': 1, 'title': 'Core Foundations (1-2 months)', 'description': f'Essential skills for {target_role}. Focus here first.', 'skills': [s['skill'] for s in high], 'priority': 'high'})
        if medium:
            roadmap.append({'phase': 2, 'title': 'Intermediate Skills (2-4 months)', 'description': 'Important skills that strengthen your profile.', 'skills': [s['skill'] for s in medium], 'priority': 'medium'})
        if low:
            roadmap.append({'phase': 3, 'title': 'Advanced & Specialization (4-6 months)', 'description': 'Nice-to-have skills for competitive advantage.', 'skills': [s['skill'] for s in low], 'priority': 'low'})
        return roadmap

    def _compute_market_insights(self, matching_jobs: pd.DataFrame, target_role: str) -> Dict[str, Any]:
        if matching_jobs.empty:
            return {
                'avg_salary': 115000.0,
                'top_industries': ['Information Technology', 'Software Engineering'],
                'top_companies': ['Not Specified'],
                'experience_dist': {'Not Specified': 100.0}
            }
            
        salaries = matching_jobs['salary_val'].dropna()
        avg_salary = float(salaries.mean()) if not salaries.empty else 115000.0
        
        all_inds = []
        for inds in matching_jobs['industries'].dropna():
            if isinstance(inds, list):
                all_inds.extend(inds)
            elif isinstance(inds, str):
                try:
                    import ast
                    parsed = ast.literal_eval(inds)
                    if isinstance(parsed, list):
                        all_inds.extend(parsed)
                except Exception:
                    pass
        top_inds = [item for item, _ in Counter(all_inds).most_common(3)]
        if not top_inds:
            top_inds = ['Information Technology', 'Software Engineering']
            
        top_cos = [item for item, _ in Counter(matching_jobs['company'].dropna()).most_common(3)]
        if not top_cos:
            top_cos = ['Not Specified']
            
        exp_counts = matching_jobs['experience'].value_counts()
        total_exp = exp_counts.sum()
        exp_dist = {k: round(v / total_exp * 100, 1) for k, v in exp_counts.items()} if total_exp > 0 else {'Not Specified': 100.0}
        
        return {
            'avg_salary': avg_salary,
            'top_industries': top_inds,
            'top_companies': top_cos,
            'experience_dist': exp_dist
        }

    @staticmethod
    def get_available_roles() -> List[str]:
        return list(TARGET_ROLE_SKILLS.keys())