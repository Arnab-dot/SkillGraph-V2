from pydantic import BaseModel
from typing import Any, Dict, List, Optional

class ResumeUploadResponse(BaseModel):
    message: str
    filename: str
    extracted_skills: List[str]
    skill_count: int

class GapAnalysisRequest(BaseModel):
    resume_text: str
    target_role: str

class GapAnalysisResponse(BaseModel):
    target_role: str
    resume_skills: List[str]
    required_skills: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    priority_missing_skills: List[Dict[str, Any]]
    learning_roadmap: List[Dict[str, Any]]
    match_percentage: float
    summary: Dict[str, int]

class AvailableRolesResponse(BaseModel):
    roles: List[str]