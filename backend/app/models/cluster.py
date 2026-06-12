from sqlalchemy import Column, Integer, String, Text
from backend.app.database import Base

class Cluster(Base):
    __tablename__ = 'clusters'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    size = Column(Integer, default=0)
    top_skills = Column(Text, nullable=True)
    representative_titles = Column(Text, nullable=True)