import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
client = TestClient(app)

class TestAPI:

    def test_health_check(self):
        response = client.get('/api/health')
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'healthy'
        assert 'app' in data
        assert 'version' in data

    def test_dashboard(self):
        response = client.get('/api/dashboard')
        assert response.status_code == 200
        data = response.json()
        assert 'total_jobs' in data

    def test_get_jobs(self):
        response = client.get('/api/jobs')
        assert response.status_code == 200

    def test_get_top_skills(self):
        response = client.get('/api/skills/top')
        assert response.status_code == 200

    def test_search_skills(self):
        response = client.get('/api/skills/search', params={'q': 'Python'})
        assert response.status_code == 200

    def test_get_clusters(self):
        response = client.get('/api/clusters')
        assert response.status_code == 200

    def test_get_trends(self):
        response = client.get('/api/trends')
        assert response.status_code == 200

    def test_get_graph(self):
        response = client.get('/api/graph')
        assert response.status_code == 200

    def test_get_forecast(self):
        response = client.get('/api/forecast')
        assert response.status_code == 200

    def test_get_resume_roles(self):
        response = client.get('/api/resume/roles')
        assert response.status_code == 200
        data = response.json()
        assert 'roles' in data
        assert len(data['roles']) > 0