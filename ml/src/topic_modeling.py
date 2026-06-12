from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from ml.src.config import BERTOPIC_NR_TOPICS, BERTOPIC_TOP_N_WORDS, NMF_N_COMPONENTS, REPORT_OUTPUT_DIR, TOPIC_MODEL_DIR
from ml.src.utils import setup_logger, Timer, save_dataframe, save_json
logger = setup_logger(__name__)

def run_bertopic(documents: List[str], embeddings: Optional[np.ndarray]=None, nr_topics: Any=BERTOPIC_NR_TOPICS, top_n_words: int=BERTOPIC_TOP_N_WORDS) -> Tuple[List[int], pd.DataFrame]:
    logger.info(f'Running BERTopic on {len(documents)} documents...')
    with Timer('BERTopic', logger):
        try:
            from bertopic import BERTopic
            topic_model = BERTopic(nr_topics=nr_topics, top_n_words=top_n_words, verbose=True, calculate_probabilities=False)
            if embeddings is not None:
                topics, _ = topic_model.fit_transform(documents, embeddings=embeddings)
            else:
                topics, _ = topic_model.fit_transform(documents)
            topic_info = topic_model.get_topic_info()
            logger.info(f'BERTopic found {len(topic_info) - 1} topics')
            model_path = TOPIC_MODEL_DIR / 'bertopic_model'
            try:
                topic_model.save(str(model_path))
                logger.info(f'BERTopic model saved to: {model_path}')
            except Exception as e:
                logger.warning(f'Could not save BERTopic model: {e}')
            return (topics, topic_info)
        except ImportError:
            logger.warning('BERTopic not installed. Falling back to TF-IDF + NMF.')
            return run_tfidf_nmf(documents)
        except Exception as e:
            logger.warning(f'BERTopic failed: {e}. Falling back to TF-IDF + NMF.')
            return run_tfidf_nmf(documents)

def run_tfidf_nmf(documents: List[str], n_components: int=NMF_N_COMPONENTS) -> Tuple[List[int], pd.DataFrame]:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.decomposition import NMF
    logger.info(f'Running TF-IDF + NMF with {n_components} topics...')
    with Timer('TF-IDF + NMF', logger):
        vectorizer = TfidfVectorizer(max_features=5000, stop_words='english', max_df=0.95, min_df=2)
        tfidf_matrix = vectorizer.fit_transform(documents)
        nmf = NMF(n_components=n_components, random_state=42, max_iter=500)
        doc_topics = nmf.fit_transform(tfidf_matrix)
        topics = doc_topics.argmax(axis=1).tolist()
        feature_names = vectorizer.get_feature_names_out()
        topic_info_rows = []
        for topic_idx in range(n_components):
            top_word_indices = nmf.components_[topic_idx].argsort()[-10:][::-1]
            top_words = [feature_names[i] for i in top_word_indices]
            topic_count = sum((1 for t in topics if t == topic_idx))
            topic_info_rows.append({'Topic': topic_idx, 'Count': topic_count, 'Name': f'Topic_{topic_idx}', 'Representation': ', '.join(top_words)})
        topic_info = pd.DataFrame(topic_info_rows)
        logger.info(f'NMF found {n_components} topics')
        return (topics, topic_info)

def save_topic_results(topics: List[int], topic_info: pd.DataFrame, output_dir: Optional[Path]=None) -> None:
    output_dir = output_dir or REPORT_OUTPUT_DIR
    save_dataframe(topic_info, output_dir / 'topics.csv')
    topic_summary = {'n_topics': len(topic_info), 'topics': topic_info.to_dict(orient='records')}
    save_json(topic_summary, output_dir / 'topics.json')
    logger.info(f'Topic results saved to: {output_dir}')