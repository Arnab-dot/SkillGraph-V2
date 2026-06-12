from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from backend.app.database import Base

class Resume(Base):
    __tablename__ = 'resumes'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    filename = Column(String(255))
    extracted_text = Column(Text, nullable=True)
    extracted_skills = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)