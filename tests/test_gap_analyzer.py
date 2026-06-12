import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from ml.src.gap_analyzer import GapAnalyzer

class TestGapAnalyzer:

    def setup_method(self):
        self.analyzer = GapAnalyzer()

    def test_analyze_returns_required_fields(self):
        resume = 'Experienced in Python, TensorFlow, Docker, and SQL.'
        result = self.analyzer.analyze(resume, 'ML Engineer')
        assert 'target_role' in result
        assert 'resume_skills' in result
        assert 'required_skills' in result
        assert 'matched_skills' in result
        assert 'missing_skills' in result
        assert 'match_percentage' in result
        assert 'learning_roadmap' in result

    def test_match_percentage_range(self):
        resume = 'Python TensorFlow PyTorch scikit-learn Docker AWS SQL'
        result = self.analyzer.analyze(resume, 'ML Engineer')
        assert 0 <= result['match_percentage'] <= 100

    def test_empty_resume(self):
        result = self.analyzer.analyze('', 'Data Scientist')
        assert result['match_percentage'] == 0
        assert len(result['matched_skills']) == 0

    def test_perfect_match(self):
        from ml.src.config import TARGET_ROLE_SKILLS
        skills = TARGET_ROLE_SKILLS.get('Data Analyst', [])
        resume = ' '.join(skills)
        result = self.analyzer.analyze(resume, 'Data Analyst')
        assert result['match_percentage'] > 50

    def test_available_roles(self):
        roles = GapAnalyzer.get_available_roles()
        assert len(roles) > 0
        assert 'ML Engineer' in roles
        assert 'Data Scientist' in roles

    def test_learning_roadmap_structure(self):
        resume = 'Python basics only.'
        result = self.analyzer.analyze(resume, 'AI Engineer')
        roadmap = result['learning_roadmap']
        if roadmap:
            assert 'phase' in roadmap[0]
            assert 'title' in roadmap[0]
            assert 'skills' in roadmap[0]

    def test_growth_score_formula(self):
        from ml.src.utils import safe_divide
        assert safe_divide(10, 5) == 2.0
        assert safe_divide(0, 0) == 0.0
        assert safe_divide(10, 0, default=1.0) == 1.0