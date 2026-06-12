import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from ml.src.skill_extractor import SkillExtractor

class TestSkillExtractor:

    def setup_method(self):
        self.extractor = SkillExtractor(use_spacy=False)

    def test_extracts_python(self):
        text = 'We need someone proficient in Python programming.'
        skills = self.extractor.extract_skills(text)
        assert 'Python' in skills

    def test_extracts_multiple_skills(self):
        text = 'Required: Python, TensorFlow, Docker, and AWS experience.'
        skills = self.extractor.extract_skills(text)
        assert 'Python' in skills
        assert 'TensorFlow' in skills
        assert 'Docker' in skills
        assert 'AWS' in skills

    def test_extracts_ml_terms(self):
        text = 'Deep Learning experience with PyTorch and NLP is required.'
        skills = self.extractor.extract_skills(text)
        assert 'Deep Learning' in skills
        assert 'PyTorch' in skills
        assert 'NLP' in skills

    def test_extracts_cpp(self):
        text = 'Must know C++ and Java.'
        skills = self.extractor.extract_skills(text)
        assert 'C++' in skills
        assert 'Java' in skills

    def test_case_insensitive(self):
        text = 'Experience with tensorflow and pytorch required.'
        skills = self.extractor.extract_skills(text)
        assert 'TensorFlow' in skills
        assert 'PyTorch' in skills

    def test_empty_text_returns_empty(self):
        assert self.extractor.extract_skills('') == []
        assert self.extractor.extract_skills(None) == []

    def test_no_skills_text(self):
        text = 'Looking for a team player with good communication skills.'
        skills = self.extractor.extract_skills(text)
        assert 'Communication' in skills

    def test_llm_and_rag_extraction(self):
        text = 'Build LLM applications using RAG and LangChain.'
        skills = self.extractor.extract_skills(text)
        assert 'LLM' in skills
        assert 'RAG' in skills
        assert 'LangChain' in skills

    def test_skill_frequencies(self):
        import pandas as pd
        df = pd.DataFrame({'extracted_skills': [['Python', 'TensorFlow'], ['Python', 'PyTorch'], ['Python', 'Docker']]})
        freq_df = self.extractor.get_skill_frequencies(df)
        assert len(freq_df) > 0
        assert freq_df.iloc[0]['skill'] == 'Python'
        assert freq_df.iloc[0]['frequency'] == 3