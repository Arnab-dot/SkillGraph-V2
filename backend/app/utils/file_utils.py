import os
from pathlib import Path
from typing import Optional

def ensure_dir(path: str) -> Path:
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p

def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()

def is_allowed_file(filename: str, allowed: set) -> bool:
    return get_file_extension(filename) in allowed