from pydantic import BaseModel
from typing import List, Optional

class SkillResponse(BaseModel):
    skill: str
    frequency: int
    category: Optional[str] = None
    percentage: Optional[float] = None

    class Config:
        from_attributes = True

class SkillListResponse(BaseModel):
    total: int
    skills: List[SkillResponse]