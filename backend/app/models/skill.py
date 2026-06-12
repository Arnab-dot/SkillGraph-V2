from sqlalchemy import Column, Integer, String, Table, ForeignKey
from backend.app.database import Base
job_skills = Table('job_skills', Base.metadata, Column('job_id', Integer, ForeignKey('jobs.id'), primary_key=True), Column('skill_id', Integer, ForeignKey('skills.id'), primary_key=True))

class Skill(Base):
    __tablename__ = 'skills'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), unique=True, index=True)
    category = Column(String(100))
    frequency = Column(Integer, default=0)