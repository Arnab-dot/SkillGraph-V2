import json
import logging
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import numpy as np
import pandas as pd
from ml.src.config import LOG_LEVEL, LOG_FORMAT, LOG_DATE_FORMAT

def setup_logger(name: str, level: Optional[str]=None) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(logging.Formatter(LOG_FORMAT, datefmt=LOG_DATE_FORMAT))
        logger.addHandler(handler)
    logger.setLevel(getattr(logging, level or LOG_LEVEL))
    return logger

class NumpyEncoder(json.JSONEncoder):

    def default(self, obj: Any) -> Any:
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if isinstance(obj, np.bool_):
            return bool(obj)
        if isinstance(obj, pd.Timestamp):
            return obj.isoformat()
        return super().default(obj)

def save_json(data: Any, path: Union[str, Path]) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, cls=NumpyEncoder, ensure_ascii=False)

def load_json(path: Union[str, Path]) -> Any:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f'JSON file not found: {path}')
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_dataframe(df: pd.DataFrame, path: Union[str, Path]) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False)

def load_dataframe(path: Union[str, Path]) -> pd.DataFrame:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f'Data file not found: {path}')
    suffix = path.suffix.lower()
    if suffix == '.csv':
        return pd.read_csv(path)
    elif suffix == '.json':
        return pd.read_json(path)
    elif suffix in ('.xlsx', '.xls'):
        return pd.read_excel(path)
    else:
        raise ValueError(f'Unsupported file format: {suffix}. Use CSV, JSON, or Excel.')

def save_numpy(array: np.ndarray, path: Union[str, Path]) -> None:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    np.save(path, array)

def load_numpy(path: Union[str, Path]) -> np.ndarray:
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f'NumPy file not found: {path}')
    return np.load(path)

class Timer:

    def __init__(self, description: str='Operation', logger: Optional[logging.Logger]=None):
        self.description = description
        self.logger = logger or setup_logger('timer')
        self.elapsed: float = 0.0

    def __enter__(self) -> 'Timer':
        self.start = time.perf_counter()
        self.logger.info(f'⏱  Starting: {self.description}')
        return self

    def __exit__(self, *args: Any) -> None:
        self.elapsed = time.perf_counter() - self.start
        self.logger.info(f'✅ Completed: {self.description} ({self.elapsed:.2f}s)')

def flatten_skills(skills_series: pd.Series) -> List[str]:
    all_skills: List[str] = []
    for skills in skills_series.dropna():
        if isinstance(skills, list):
            all_skills.extend(skills)
        elif isinstance(skills, str):
            try:
                parsed = json.loads(skills.replace("'", '"'))
                if isinstance(parsed, list):
                    all_skills.extend(parsed)
            except (json.JSONDecodeError, ValueError):
                all_skills.append(skills)
    return all_skills

def safe_divide(numerator: float, denominator: float, default: float=0.0) -> float:
    if denominator == 0:
        return default
    return numerator / denominator