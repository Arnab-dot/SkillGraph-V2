import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
from backend.app.config import settings
from backend.app.database import init_db
from backend.app.routes import jobs, skills, clusters, trends, resume, graph, forecast, match, pool, candidates

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
app = FastAPI(title=settings.APP_NAME, version=settings.APP_VERSION, description='Unsupervised Job Market Intelligence & Resume Skill Gap Analyzer. Analyzes job postings to discover hidden skill clusters, emerging trends, resume skill gaps, and skill relationships.', lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS, allow_credentials=True, allow_methods=['*'], allow_headers=['*'])
app.include_router(jobs.router)
app.include_router(skills.router)
app.include_router(clusters.router)
app.include_router(trends.router)
app.include_router(resume.router)
app.include_router(graph.router)
app.include_router(forecast.router)
app.include_router(match.router)
app.include_router(pool.router)
app.include_router(candidates.router)

@app.get('/api/health', tags=['Health'])
async def health_check():
    from backend.app.services.job_service import get_dashboard_stats
    stats = get_dashboard_stats()
    return {'status': 'healthy', 'app': settings.APP_NAME, 'version': settings.APP_VERSION, **stats}

@app.get('/api/dashboard', tags=['Dashboard'])
async def dashboard():
    from backend.app.services.job_service import get_dashboard_stats
    return get_dashboard_stats()