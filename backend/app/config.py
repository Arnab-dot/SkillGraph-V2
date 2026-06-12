import os
from pathlib import Path
from typing import Optional

class Settings:
    APP_NAME: str = 'SkillGraph AI v2'
    APP_VERSION: str = '2.0.0'
    DEBUG: bool = os.getenv('DEBUG', 'true').lower() == 'true'
    DATABASE_URL: str = os.getenv('DATABASE_URL', 'sqlite:///./skillgraph.db')
    CORS_ORIGINS: list = ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']
    PROJECT_ROOT: Path = Path(__file__).resolve().parent.parent.parent
    ML_OUTPUTS_DIR: Path = PROJECT_ROOT / 'ml' / 'outputs'
    ML_MODELS_DIR: Path = PROJECT_ROOT / 'ml' / 'models'
    ML_DATA_DIR: Path = PROJECT_ROOT / 'ml' / 'data'
    CLUSTER_OUTPUT_DIR: Path = ML_OUTPUTS_DIR / 'clusters'
    TREND_OUTPUT_DIR: Path = ML_OUTPUTS_DIR / 'trends'
    GRAPH_OUTPUT_DIR: Path = ML_OUTPUTS_DIR / 'graphs'
    REPORT_OUTPUT_DIR: Path = ML_OUTPUTS_DIR / 'reports'
    PROCESSED_DATA_DIR: Path = ML_DATA_DIR / 'processed'
    UPLOAD_DIR: Path = PROJECT_ROOT / 'uploads'
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024
settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)