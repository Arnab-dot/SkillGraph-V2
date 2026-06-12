from fastapi import APIRouter, Query, UploadFile, File
from typing import Optional
from backend.app.services import job_service
router = APIRouter(prefix='/api/jobs', tags=['Jobs'])

@router.get('')
async def get_jobs(search: Optional[str]=Query(None, description='Search in description'), role: Optional[str]=Query(None, description='Filter by job title'), location: Optional[str]=Query(None, description='Filter by location'), company: Optional[str]=Query(None, description='Filter by company'), limit: int=Query(50, ge=1, le=200), offset: int=Query(0, ge=0)):
    return job_service.get_processed_jobs(search, role, location, company, limit, offset)

@router.post('/upload')
async def upload_jobs(file: UploadFile=File(...)):
    import tempfile, shutil
    from pathlib import Path
    from backend.app.config import settings
    suffix = Path(file.filename).suffix
    upload_path = settings.UPLOAD_DIR / f'uploaded_jobs{suffix}'
    with open(upload_path, 'wb') as f:
        shutil.copyfileobj(file.file, f)
    return {'message': f'File uploaded: {file.filename}', 'total_uploaded': 0, 'path': str(upload_path)}