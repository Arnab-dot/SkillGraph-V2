from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from ml.src.config import ForecastingConfig, TREND_OUTPUT_DIR
from ml.src.utils import setup_logger, Timer, save_json
logger = setup_logger(__name__)

def prepare_time_series(monthly_freq: pd.DataFrame, top_n_skills: int=20) -> Dict[str, np.ndarray]:
    logger.info(f'Preparing time series for top {top_n_skills} skills...')
    skill_totals = monthly_freq.groupby('skill')['frequency'].sum()
    top_skills = skill_totals.nlargest(top_n_skills).index.tolist()
    months = sorted(monthly_freq['month'].unique())
    time_series: Dict[str, np.ndarray] = {}
    for skill in top_skills:
        skill_data = monthly_freq[monthly_freq['skill'] == skill]
        series = []
        for month in months:
            freq = skill_data[skill_data['month'] == month]['frequency'].sum()
            series.append(freq)
        time_series[skill] = np.array(series, dtype=np.float32)
    logger.info(f'Prepared {len(time_series)} time series, {len(months)} months each')
    return time_series

def create_sequences(series: np.ndarray, sequence_length: int) -> Tuple[np.ndarray, np.ndarray]:
    X, y = ([], [])
    for i in range(len(series) - sequence_length):
        X.append(series[i:i + sequence_length])
        y.append(series[i + sequence_length])
    return (np.array(X), np.array(y))

def normalize_series(series: np.ndarray) -> Tuple[np.ndarray, float, float]:
    min_val = float(series.min())
    max_val = float(series.max())
    if max_val - min_val == 0:
        return (np.zeros_like(series), min_val, max_val)
    normalized = (series - min_val) / (max_val - min_val)
    return (normalized, min_val, max_val)

def denormalize(value: float, min_val: float, max_val: float) -> float:
    return value * (max_val - min_val) + min_val

def build_lstm_model(sequence_length: int, config: Optional[ForecastingConfig]=None) -> Any:
    config = config or ForecastingConfig()
    import os
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    import tensorflow as tf
    model = tf.keras.Sequential([tf.keras.layers.LSTM(config.lstm_units, input_shape=(sequence_length, 1), return_sequences=True, dropout=config.dropout), tf.keras.layers.LSTM(config.lstm_units // 2, dropout=config.dropout), tf.keras.layers.Dense(config.dense_units, activation='relu'), tf.keras.layers.Dropout(config.dropout), tf.keras.layers.Dense(1)])
    model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=config.learning_rate), loss='mse', metrics=['mae'])
    logger.info(f'LSTM model built: {model.count_params()} parameters')
    return model

def train_forecasting_model(time_series: Dict[str, np.ndarray], config: Optional[ForecastingConfig]=None) -> Tuple[Any, Dict[str, Any]]:
    import os
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    import tensorflow as tf
    config = config or ForecastingConfig()
    logger.info(f'Training LSTM forecasting model on {len(time_series)} skills...')
    with Timer('LSTM training', logger):
        all_X: List[np.ndarray] = []
        all_y: List[float] = []
        normalization_params: Dict[str, Tuple[float, float]] = {}
        for skill, series in time_series.items():
            if len(series) < config.sequence_length + 1:
                logger.warning(f'Skipping {skill}: too few data points ({len(series)})')
                continue
            norm_series, min_val, max_val = normalize_series(series)
            normalization_params[skill] = (min_val, max_val)
            X, y = create_sequences(norm_series, config.sequence_length)
            if len(X) > 0:
                all_X.append(X)
                all_y.extend(y.tolist())
        if not all_X:
            logger.warning('No valid time series for training. Skipping.')
            return (None, {'error': 'insufficient_data'})
        X_train = np.concatenate(all_X, axis=0)
        y_train = np.array(all_y)
        X_train = X_train.reshape(X_train.shape[0], X_train.shape[1], 1)
        logger.info(f'Training data: X={X_train.shape}, y={y_train.shape}')
        model = build_lstm_model(config.sequence_length, config)
        early_stop = tf.keras.callbacks.EarlyStopping(monitor='loss', patience=10, restore_best_weights=True)
        history = model.fit(X_train, y_train, epochs=config.epochs, batch_size=config.batch_size, callbacks=[early_stop], verbose=0)
        config.model_save_path.parent.mkdir(parents=True, exist_ok=True)
        model.save(str(config.model_save_path))
        logger.info(f'LSTM model saved to: {config.model_save_path}')
        training_metadata = {'total_samples': len(y_train), 'n_skills_trained': len(normalization_params), 'epochs_trained': len(history.history['loss']), 'final_loss': float(history.history['loss'][-1]), 'final_mae': float(history.history['mae'][-1]), 'normalization_params': {k: {'min': v[0], 'max': v[1]} for k, v in normalization_params.items()}}
        return (model, training_metadata)

def forecast_skill_demand(model: Any, time_series: Dict[str, np.ndarray], config: Optional[ForecastingConfig]=None) -> pd.DataFrame:
    config = config or ForecastingConfig()
    if model is None:
        logger.warning('No trained model. Returning empty forecast.')
        return pd.DataFrame()
    logger.info(f'Forecasting {config.forecast_horizon} months for {len(time_series)} skills...')
    forecasts = []
    for skill, series in time_series.items():
        if len(series) < config.sequence_length:
            continue
        norm_series, min_val, max_val = normalize_series(series)
        last_seq = norm_series[-config.sequence_length:]
        current_seq = last_seq.copy()
        predictions = []
        for step in range(config.forecast_horizon):
            X_pred = current_seq.reshape(1, config.sequence_length, 1)
            pred = model.predict(X_pred, verbose=0)[0][0]
            pred = float(np.clip(pred, 0, 1))
            predictions.append(denormalize(pred, min_val, max_val))
            current_seq = np.append(current_seq[1:], pred)
        current_demand = float(series[-1]) if len(series) > 0 else 0
        avg_forecast = np.mean(predictions)
        growth = (avg_forecast - current_demand) / max(current_demand, 1)
        forecasts.append({'skill': skill, 'current_demand': round(current_demand, 2), 'forecast_month_1': round(predictions[0], 2) if len(predictions) > 0 else 0, 'forecast_month_2': round(predictions[1], 2) if len(predictions) > 1 else 0, 'forecast_month_3': round(predictions[2], 2) if len(predictions) > 2 else 0, 'avg_forecast': round(avg_forecast, 2), 'future_growth_score': round(growth, 3)})
    forecast_df = pd.DataFrame(forecasts)
    forecast_df = forecast_df.sort_values('future_growth_score', ascending=False)
    forecast_df = forecast_df.reset_index(drop=True)
    logger.info(f'Forecast complete: {len(forecast_df)} skills')
    return forecast_df

def save_forecast_results(forecast_df: pd.DataFrame, training_metadata: Dict[str, Any], output_dir: Optional[Path]=None) -> None:
    output_dir = output_dir or TREND_OUTPUT_DIR
    if not forecast_df.empty:
        forecast_df.to_csv(output_dir / 'skill_forecast.csv', index=False)
    results = {'training': training_metadata, 'forecasts': forecast_df.to_dict(orient='records') if not forecast_df.empty else [], 'top_emerging': forecast_df.head(5).to_dict(orient='records') if not forecast_df.empty else []}
    save_json(results, output_dir / 'forecast_results.json')
    logger.info(f'Forecast results saved to: {output_dir}')