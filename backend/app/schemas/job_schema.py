from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class JobBase(BaseModel):
    job_title: str
    company: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    salary: Optional[str] = None
    posted_date: Optional[date] = None
    description: str

class JobResponse(JobBase):
    id: int
    cleaned_text: Optional[str] = None
    cluster_id: Optional[int] = None

    class Config:
        from_attributes = True

class JobListResponse(BaseModel):
    total: int
    jobs: List[JobResponse]

class JobUploadResponse(BaseModel):
    message: str
    total_uploaded: int