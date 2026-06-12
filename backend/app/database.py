from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from backend.app.config import settings
if settings.DATABASE_URL.startswith('sqlite'):
    engine = create_engine(settings.DATABASE_URL, connect_args={'check_same_thread': False})
else:
    engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db() -> None:
    from backend.app.models import job, skill, cluster, trend, resume
    Base.metadata.create_all(bind=engine)