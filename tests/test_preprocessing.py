import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from ml.src.preprocessing import clean_text, normalize_text, preprocess_dataframe
import pandas as pd

class TestPreprocessing:

    def test_clean_html(self):
        text = '<p>Hello <b>World</b></p>'
        cleaned = clean_text(text)
        assert '<p>' not in cleaned
        assert '<b>' not in cleaned
        assert 'Hello' in cleaned

    def test_clean_urls(self):
        text = 'Visit https://example.com for more info.'
        cleaned = clean_text(text)
        assert 'https://' not in cleaned
        assert 'example.com' not in cleaned

    def test_clean_emails(self):
        text = 'Contact us at jobs@company.com'
        cleaned = clean_text(text)
        assert '@' not in cleaned

    def test_clean_empty(self):
        assert clean_text('') == ''
        assert clean_text(None) == ''

    def test_normalize_sklearn(self):
        assert 'scikit-learn' in normalize_text('Experience with sklearn')

    def test_normalize_aws(self):
        assert 'aws' in normalize_text('Amazon Web Services experience')

    def test_preprocess_dataframe(self):
        df = pd.DataFrame({'description': ['<p>Python and TensorFlow</p>', 'Docker and AWS'], 'job_title': ['ml engineer', 'devops'], 'company': ['google', 'amazon'], 'location': ['sf', 'ny']})
        result = preprocess_dataframe(df)
        assert 'cleaned_text' in result.columns
        assert len(result) == 2
        assert result.iloc[0]['job_title'] == 'Ml Engineer'