from sqlalchemy import Column, Integer, String, Text, Date, Float
from backend.app.database import Base

class Job(Base):
    __tablename__ = 'jobs'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    job_title = Column(String(255), index=True)
    company = Column(String(255), index=True)
    location = Column(String(255))
    experience = Column(String(100))
    salary = Column(String(100))
    posted_date = Column(Date, nullable=True)
    description = Column(Text)
    cleaned_text = Column(Text, nullable=True)
    cluster_id = Column(Integer, nullable=True, index=True)