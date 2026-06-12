import re
from typing import List, Optional
import pandas as pd
from ml.src.utils import setup_logger
logger = setup_logger(__name__)

def clean_text(text: str) -> str:
    if not isinstance(text, str) or not text.strip():
        return ''
    text = re.sub('<[^>]+>', ' ', text)
    text = re.sub('https?://\\S+|www\\.\\S+', ' ', text)
    text = re.sub('\\S+@\\S+\\.\\S+', ' ', text)
    text = text.encode('ascii', errors='ignore').decode('ascii')
    text = re.sub('[^a-zA-Z0-9\\s\\+\\#\\.\\-\\/\\&]', ' ', text)
    text = re.sub('\\s+', ' ', text).strip()
    return text

def normalize_text(text: str) -> str:
    if not text:
        return ''
    text = text.lower()
    replacements = {'machine learning': 'machine learning', 'deep learning': 'deep learning', 'natural language processing': 'nlp', 'computer vision': 'computer vision', 'artificial intelligence': 'ai', 'data science': 'data science', 'c sharp': 'c#', 'c plus plus': 'c++', 'node.js': 'nodejs', 'react.js': 'react', 'vue.js': 'vue', 'angular.js': 'angular', 'scikit learn': 'scikit-learn', 'sci-kit learn': 'scikit-learn', 'sklearn': 'scikit-learn', 'tensorflow': 'tensorflow', 'tensor flow': 'tensorflow', 'pytorch': 'pytorch', 'py torch': 'pytorch', 'amazon web services': 'aws', 'google cloud platform': 'gcp', 'google cloud': 'gcp', 'microsoft azure': 'azure', 'postgre sql': 'postgresql', 'mongo db': 'mongodb', 'large language model': 'llm', 'large language models': 'llm', 'retrieval augmented generation': 'rag'}
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text

def preprocess_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    logger.info(f'Preprocessing {len(df)} job postings...')
    df['cleaned_text'] = df['description'].apply(clean_text)
    min_length = 50
    short_mask = df['cleaned_text'].str.len() < min_length
    short_count = short_mask.sum()
    if short_count > 0:
        logger.warning(f'Found {short_count} descriptions shorter than {min_length} chars — keeping but flagging')
    if 'job_title' in df.columns:
        df['job_title'] = df['job_title'].apply(lambda x: str(x).strip().title() if pd.notna(x) else 'Unknown')
    if 'company' in df.columns:
        df['company'] = df['company'].apply(lambda x: str(x).strip().title() if pd.notna(x) else 'Unknown')
    if 'location' in df.columns:
        df['location'] = df['location'].apply(lambda x: str(x).strip().title() if pd.notna(x) else 'Unknown')
    logger.info(f"Preprocessing complete. Average cleaned text length: {df['cleaned_text'].str.len().mean():.0f} chars")
    return df

def remove_duplicates(df: pd.DataFrame, subset: Optional[List[str]]=None) -> pd.DataFrame:
    if subset is None:
        subset = ['cleaned_text']
    initial_count = len(df)
    available_subset = [col for col in subset if col in df.columns]
    if not available_subset:
        available_subset = ['cleaned_text'] if 'cleaned_text' in df.columns else None
    if available_subset:
        df = df.drop_duplicates(subset=available_subset).reset_index(drop=True)
    else:
        df = df.drop_duplicates().reset_index(drop=True)
    removed = initial_count - len(df)
    if removed > 0:
        logger.info(f'Removed {removed} duplicate entries')
    return df