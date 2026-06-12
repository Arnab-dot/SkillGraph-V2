from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd
from ml.src.utils import setup_logger, save_json
from ml.src.config import REPORT_OUTPUT_DIR
logger = setup_logger(__name__)

def evaluate_clustering(embeddings: np.ndarray, labels: np.ndarray) -> Dict[str, float]:
    from sklearn.metrics import silhouette_score, davies_bouldin_score
    metrics: Dict[str, float] = {}
    valid_mask = labels >= 0
    if valid_mask.sum() < 2:
        logger.warning('Too few non-noise points for clustering evaluation.')
        return {'silhouette_score': -1.0, 'davies_bouldin_score': -1.0}
    valid_embeddings = embeddings[valid_mask]
    valid_labels = labels[valid_mask]
    n_unique = len(np.unique(valid_labels))
    if n_unique < 2:
        logger.warning('Fewer than 2 clusters. Cannot compute metrics.')
        return {'silhouette_score': -1.0, 'davies_bouldin_score': -1.0}
    try:
        sil = silhouette_score(valid_embeddings, valid_labels)
        metrics['silhouette_score'] = round(float(sil), 4)
        logger.info(f'Silhouette score: {sil:.4f}')
    except Exception as e:
        logger.warning(f'Silhouette score failed: {e}')
        metrics['silhouette_score'] = -1.0
    try:
        db = davies_bouldin_score(valid_embeddings, valid_labels)
        metrics['davies_bouldin_score'] = round(float(db), 4)
        logger.info(f'Davies-Bouldin score: {db:.4f}')
    except Exception as e:
        logger.warning(f'Davies-Bouldin score failed: {e}')
        metrics['davies_bouldin_score'] = -1.0
    metrics['n_clusters'] = int(n_unique)
    metrics['n_noise'] = int((labels == -1).sum())
    metrics['noise_ratio'] = round(float(metrics['n_noise'] / len(labels)), 4)
    return metrics

def evaluate_kmeans_clustering(embeddings: np.ndarray, labels: np.ndarray) -> Dict[str, float]:
    from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
    metrics: Dict[str, float] = {}
    n_unique = len(np.unique(labels))
    if n_unique < 2:
        return {'silhouette_score': -1.0}
    try:
        metrics['silhouette_score'] = round(float(silhouette_score(embeddings, labels)), 4)
    except Exception:
        metrics['silhouette_score'] = -1.0
    try:
        metrics['davies_bouldin_score'] = round(float(davies_bouldin_score(embeddings, labels)), 4)
    except Exception:
        metrics['davies_bouldin_score'] = -1.0
    try:
        metrics['calinski_harabasz_score'] = round(float(calinski_harabasz_score(embeddings, labels)), 4)
    except Exception:
        metrics['calinski_harabasz_score'] = -1.0
    return metrics

def evaluate_autoencoder(errors: np.ndarray, anomaly_flags: np.ndarray, threshold: float) -> Dict[str, Any]:
    metrics = {'mean_reconstruction_error': round(float(np.mean(errors)), 6), 'std_reconstruction_error': round(float(np.std(errors)), 6), 'min_error': round(float(np.min(errors)), 6), 'max_error': round(float(np.max(errors)), 6), 'median_error': round(float(np.median(errors)), 6), 'anomaly_threshold': round(float(threshold), 6), 'n_anomalies': int(anomaly_flags.sum()), 'anomaly_ratio': round(float(anomaly_flags.mean()), 4)}
    logger.info(f"Autoencoder evaluation: mean_error={metrics['mean_reconstruction_error']:.6f}, anomalies={metrics['n_anomalies']}")
    return metrics

def evaluate_forecasting(actual: np.ndarray, predicted: np.ndarray) -> Dict[str, float]:
    from sklearn.metrics import mean_absolute_error, mean_squared_error
    metrics: Dict[str, float] = {}
    try:
        mae = mean_absolute_error(actual, predicted)
        metrics['mae'] = round(float(mae), 4)
    except Exception:
        metrics['mae'] = -1.0
    try:
        rmse = float(np.sqrt(mean_squared_error(actual, predicted)))
        metrics['rmse'] = round(rmse, 4)
    except Exception:
        metrics['rmse'] = -1.0
    nonzero_mask = actual != 0
    if nonzero_mask.sum() > 0:
        mape = float(np.mean(np.abs((actual[nonzero_mask] - predicted[nonzero_mask]) / actual[nonzero_mask]))) * 100
        metrics['mape'] = round(mape, 2)
    else:
        metrics['mape'] = -1.0
    logger.info(f"Forecasting evaluation: MAE={metrics['mae']}, RMSE={metrics['rmse']}")
    return metrics

def save_evaluation_report(clustering_metrics: Dict[str, Any], kmeans_metrics: Optional[Dict[str, Any]]=None, autoencoder_metrics: Optional[Dict[str, Any]]=None, forecasting_metrics: Optional[Dict[str, Any]]=None, skill_extraction_stats: Optional[Dict[str, Any]]=None) -> None:
    report = {'hdbscan_clustering': clustering_metrics}
    if kmeans_metrics:
        report['kmeans_baseline'] = kmeans_metrics
    if autoencoder_metrics:
        report['autoencoder_anomaly_detection'] = autoencoder_metrics
    if forecasting_metrics:
        report['tensorflow_forecasting'] = forecasting_metrics
    if skill_extraction_stats:
        report['skill_extraction'] = skill_extraction_stats
    output_path = REPORT_OUTPUT_DIR / 'evaluation_report.json'
    save_json(report, output_path)
    logger.info(f'Evaluation report saved to: {output_path}')