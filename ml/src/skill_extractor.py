import re
from collections import Counter
from typing import Dict, List, Optional, Set, Tuple
import pandas as pd
from ml.src.config import ALL_SKILLS, SKILL_DICTIONARY, SKILL_TO_CATEGORY
from ml.src.utils import setup_logger
logger = setup_logger(__name__)

class SkillExtractor:

    def __init__(self, use_spacy: bool=False):
        self.use_spacy = use_spacy
        self.nlp = None
        self.skill_patterns: Dict[str, re.Pattern] = {}
        self._build_patterns()
        if self.use_spacy:
            self._load_spacy()

    def _build_patterns(self) -> None:
        for skill in ALL_SKILLS:
            escaped = re.escape(skill)
            if skill in ('C', 'R'):
                pattern = re.compile(f'\\b{escaped}\\b(?:\\s+(?:programming|language|code|developer))', re.IGNORECASE)
            elif skill in ('C++', 'C#'):
                pattern = re.compile(f'(?<![a-zA-Z]){escaped}(?![a-zA-Z])', re.IGNORECASE)
            elif skill == 'Go':
                pattern = re.compile(f'\\b{escaped}\\b(?:\\s*(?:lang|programming|developer|engineer)|\\s*\\()', re.IGNORECASE)
            else:
                pattern = re.compile(f'\\b{escaped}\\b', re.IGNORECASE)
            self.skill_patterns[skill] = pattern
        self._extra_patterns = {'REST API': re.compile('\\bREST(?:ful)?\\s*API\\b', re.IGNORECASE), 'GraphQL': re.compile('\\bGraphQL\\b', re.IGNORECASE), 'gRPC': re.compile('\\bgRPC\\b', re.IGNORECASE), 'OAuth': re.compile('\\bOAuth\\b', re.IGNORECASE), 'JWT': re.compile('\\bJWT\\b', re.IGNORECASE), 'WebSocket': re.compile('\\bWeb\\s*Sockets?\\b', re.IGNORECASE), 'Microservices': re.compile('\\bMicro\\s*services?\\b', re.IGNORECASE), 'Data Visualization': re.compile('\\bdata\\s+visualization\\b', re.IGNORECASE), 'ETL Pipeline': re.compile('\\bETL\\s+pipeline\\b', re.IGNORECASE), 'Model Training': re.compile('\\bmodel\\s+training\\b', re.IGNORECASE), 'Prompt Engineering': re.compile('\\bprompt\\s+engineer(?:ing)?\\b', re.IGNORECASE)}
        logger.info(f'Built {len(self.skill_patterns)} dictionary patterns + {len(self._extra_patterns)} regex patterns')

    def _load_spacy(self) -> None:
        try:
            import spacy
            try:
                self.nlp = spacy.load('en_core_web_sm')
                logger.info('spaCy model loaded: en_core_web_sm')
            except OSError:
                logger.warning("spaCy model 'en_core_web_sm' not found. Install with: python -m spacy download en_core_web_sm")
                self.use_spacy = False
        except ImportError:
            logger.warning('spaCy not installed. Disabling NLP extraction.')
            self.use_spacy = False

    def extract_skills(self, text: str) -> List[str]:
        if not isinstance(text, str) or not text.strip():
            return []
        found_skills: Set[str] = set()
        for skill, pattern in self.skill_patterns.items():
            if pattern.search(text):
                found_skills.add(skill)
        for skill, pattern in self._extra_patterns.items():
            if pattern.search(text):
                found_skills.add(skill)
        if self.use_spacy and self.nlp is not None:
            spacy_skills = self._extract_with_spacy(text)
            found_skills.update(spacy_skills)
        return sorted(found_skills)

    def _extract_with_spacy(self, text: str) -> Set[str]:
        if self.nlp is None:
            return set()
        skills: Set[str] = set()
        doc = self.nlp(text[:10000])
        known_lower = {s.lower() for s in ALL_SKILLS}
        for chunk in doc.noun_chunks:
            chunk_text = chunk.text.strip().lower()
            if chunk_text in known_lower:
                for skill in ALL_SKILLS:
                    if skill.lower() == chunk_text:
                        skills.add(skill)
                        break
        return skills

    def extract_from_dataframe(self, df: pd.DataFrame, text_column: str='cleaned_text') -> pd.DataFrame:
        logger.info(f'Extracting skills from {len(df)} documents...')
        df['extracted_skills'] = df[text_column].apply(self.extract_skills)
        df['skill_count'] = df['extracted_skills'].apply(len)
        total_extractions = df['skill_count'].sum()
        avg_skills = df['skill_count'].mean()
        zero_skill_count = (df['skill_count'] == 0).sum()
        logger.info(f'Extraction complete: {total_extractions} total skill mentions, {avg_skills:.1f} avg skills/job, {zero_skill_count} jobs with zero skills')
        return df

    def get_skill_frequencies(self, df: pd.DataFrame) -> pd.DataFrame:
        all_skills: List[str] = []
        for skills in df['extracted_skills']:
            if isinstance(skills, list):
                all_skills.extend(skills)
        counter = Counter(all_skills)
        freq_data = []
        for skill, count in counter.most_common():
            category = SKILL_TO_CATEGORY.get(skill.lower(), 'other')
            freq_data.append({'skill': skill, 'frequency': count, 'category': category, 'percentage': round(count / len(df) * 100, 2)})
        return pd.DataFrame(freq_data)

    def get_top_skills(self, df: pd.DataFrame, n: int=20) -> List[Tuple[str, int]]:
        freq_df = self.get_skill_frequencies(df)
        return list(zip(freq_df['skill'].head(n), freq_df['frequency'].head(n)))