import json
from fastapi import APIRouter
from backend.app.config import settings
router = APIRouter(prefix='/api/graph', tags=['Graph'])

@router.get('')
async def get_graph():
    path = settings.GRAPH_OUTPUT_DIR / 'skill_graph.json'
    if not path.exists():
        return {'nodes': [], 'edges': [], 'stats': {}}
    with open(path) as f:
        return json.load(f)