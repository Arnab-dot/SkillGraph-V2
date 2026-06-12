from sqlalchemy import Column, Integer, String, Float
from backend.app.database import Base

class Trend(Base):
    __tablename__ = 'trends'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    skill_name = Column(String(255), index=True)
    month = Column(String(20))
    frequency = Column(Integer, default=0)
    growth_score = Column(Float, nullable=True)