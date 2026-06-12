from pathlib import Path
from typing import List, Optional, Union
import numpy as np
import pandas as pd
from ml.src.config import DEFAULT_EMBEDDING_MODEL, EMBEDDING_BATCH_SIZE, EMBEDDING_CACHE_FILE
from ml.src.utils import setup_logger, Timer, save_numpy, load_numpy
logger = setup_logger(__name__)

def generate_embeddings(texts: Union[List[str], pd.Series], model_name: str=DEFAULT_EMBEDDING_MODEL, batch_size: int=EMBEDDING_BATCH_SIZE, cache_path: Optional[Union[str, Path]]=None, force_regenerate: bool=False) -> np.ndarray:
    cache_path = Path(cache_path) if cache_path else EMBEDDING_CACHE_FILE
    if not force_regenerate and cache_path.exists():
        logger.info(f'Loading cached embeddings from: {cache_path}')
        embeddings = load_numpy(cache_path)
        if len(embeddings) == len(texts):
            logger.info(f'Cache hit: {embeddings.shape}')
            return embeddings
        else:
            logger.warning(f'Cache size mismatch ({len(embeddings)} vs {len(texts)}). Regenerating.')
    if isinstance(texts, pd.Series):
        texts = texts.tolist()
    texts = [str(t) if t else '' for t in texts]
    logger.info(f"Generating embeddings for {len(texts)} texts using '{model_name}'...")
    with Timer('Embedding generation', logger):
        try:
            from sentence_transformers import SentenceTransformer
            model = SentenceTransformer(model_name)
            embeddings = model.encode(texts, batch_size=batch_size, show_progress_bar=True, convert_to_numpy=True, normalize_embeddings=True)
            logger.info(f'Embeddings shape: {embeddings.shape}')
        except ImportError:
            logger.error('sentence-transformers not installed. Install with: pip install sentence-transformers')
            raise
        except Exception as e:
            logger.error(f'Embedding generation failed: {e}')
            raise
    save_numpy(embeddings, cache_path)
    logger.info(f'Embeddings cached to: {cache_path}')
    return embeddings

def get_embedding_dim(model_name: str=DEFAULT_EMBEDDING_MODEL) -> int:
    dim_map = {'all-MiniLM-L6-v2': 384, 'all-mpnet-base-v2': 768, 'paraphrase-MiniLM-L6-v2': 384}
    return dim_map.get(model_name, 384)