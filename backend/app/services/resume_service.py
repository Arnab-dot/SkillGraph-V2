import sys
from pathlib import Path
from typing import Any, Dict, List
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
from backend.app.config import settings

def parse_and_extract_skills(content: bytes, filename: str) -> Dict[str, Any]:
    from ml.src.resume_parser import parse_resume_bytes
    from ml.src.skill_extractor import SkillExtractor
    text = parse_resume_bytes(content, filename)
    extractor = SkillExtractor()
    skills = extractor.extract_skills(text)
    return {'message': 'Resume parsed successfully', 'filename': filename, 'extracted_skills': skills, 'skill_count': len(skills)}

def analyze_gap(resume_text: str, target_role: str) -> Dict[str, Any]:
    from ml.src.gap_analyzer import GapAnalyzer
    import pandas as pd
    import ast
    job_df = None
    csv_path = settings.PROCESSED_DATA_DIR / 'final_processed.csv'
    if not csv_path.exists():
        csv_path = settings.PROCESSED_DATA_DIR / 'jobs_with_skills.csv'
    if csv_path.exists():
        try:
            job_df = pd.read_csv(csv_path)
            for col in ['extracted_skills', 'industries', 'linkedin_skills']:
                if col in job_df.columns:
                    job_df[col] = job_df[col].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) and x.strip().startswith('[') else (x if isinstance(x, list) else []))
        except Exception:
            pass
    analyzer = GapAnalyzer()
    return analyzer.analyze(resume_text, target_role, job_df)

def get_available_roles() -> List[str]:
    from ml.src.gap_analyzer import GapAnalyzer
    return GapAnalyzer.get_available_roles()