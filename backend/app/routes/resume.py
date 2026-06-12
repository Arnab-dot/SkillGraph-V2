from fastapi import APIRouter, UploadFile, File, HTTPException
from backend.app.schemas.resume_schema import GapAnalysisRequest
from backend.app.services import resume_service
router = APIRouter(prefix='/api/resume', tags=['Resume'])

@router.post('/upload')
async def upload_resume(file: UploadFile=File(...)):
    allowed = {'.pdf', '.docx', '.txt'}
    from pathlib import Path
    suffix = Path(file.filename).suffix.lower()
    if suffix not in allowed:
        raise HTTPException(400, f'Unsupported format: {suffix}. Use: {allowed}')
    content = await file.read()
    try:
        result = resume_service.parse_and_extract_skills(content, file.filename)
        return result
    except Exception as e:
        raise HTTPException(500, f'Resume parsing failed: {str(e)}')

@router.post('/analyze')
async def analyze_resume(request: GapAnalysisRequest):
    try:
        result = resume_service.analyze_gap(request.resume_text, request.target_role)
        return result
    except Exception as e:
        raise HTTPException(500, f'Gap analysis failed: {str(e)}')

@router.get('/roles')
async def get_roles():
    return {'roles': resume_service.get_available_roles()}