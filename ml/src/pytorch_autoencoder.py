from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from ml.src.config import AutoencoderConfig
from ml.src.utils import setup_logger, Timer
logger = setup_logger(__name__)

def build_autoencoder(config: Optional[AutoencoderConfig]=None) -> Tuple[Any, Any, Any]:
    import torch
    import torch.nn as nn
    config = config or AutoencoderConfig()

    class Encoder(nn.Module):

        def __init__(self) -> None:
            super().__init__()
            layers: List[nn.Module] = []
            in_dim = config.input_dim
            for out_dim in config.encoder_dims:
                layers.extend([nn.Linear(in_dim, out_dim), nn.BatchNorm1d(out_dim), nn.ReLU(), nn.Dropout(config.dropout)])
                in_dim = out_dim
            layers.append(nn.Linear(in_dim, config.latent_dim))
            self.network = nn.Sequential(*layers)

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            return self.network(x)

    class Decoder(nn.Module):

        def __init__(self) -> None:
            super().__init__()
            layers: List[nn.Module] = []
            in_dim = config.latent_dim
            for out_dim in config.decoder_dims:
                layers.extend([nn.Linear(in_dim, out_dim), nn.BatchNorm1d(out_dim), nn.ReLU(), nn.Dropout(config.dropout)])
                in_dim = out_dim
            layers.append(nn.Linear(in_dim, config.input_dim))
            self.network = nn.Sequential(*layers)

        def forward(self, x: torch.Tensor) -> torch.Tensor:
            return self.network(x)

    class Autoencoder(nn.Module):

        def __init__(self) -> None:
            super().__init__()
            self.encoder = Encoder()
            self.decoder = Decoder()

        def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
            latent = self.encoder(x)
            reconstructed = self.decoder(latent)
            return (reconstructed, latent)
    model = Autoencoder()
    logger.info(f'Autoencoder built: input={config.input_dim} → encoder{config.encoder_dims} → latent={config.latent_dim} → decoder{config.decoder_dims} → output={config.input_dim}')
    return (model, model.encoder, model.decoder)

def train_autoencoder(embeddings: np.ndarray, config: Optional[AutoencoderConfig]=None) -> Tuple[Any, List[float]]:
    import torch
    import torch.nn as nn
    from torch.utils.data import DataLoader, TensorDataset
    config = config or AutoencoderConfig()
    config.input_dim = embeddings.shape[1]
    logger.info(f'Training autoencoder: {len(embeddings)} samples, dim={config.input_dim}, epochs={config.epochs}')
    with Timer('Autoencoder training', logger):
        model, _, _ = build_autoencoder(config)
        model = model.to(config.device)
        tensor_data = torch.FloatTensor(embeddings).to(config.device)
        dataset = TensorDataset(tensor_data)
        dataloader = DataLoader(dataset, batch_size=config.batch_size, shuffle=True, drop_last=len(dataset) > config.batch_size)
        optimizer = torch.optim.Adam(model.parameters(), lr=config.learning_rate)
        criterion = nn.MSELoss()
        scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode='min', factor=0.5, patience=5)
        loss_history: List[float] = []
        model.train()
        for epoch in range(config.epochs):
            epoch_loss = 0.0
            n_batches = 0
            for batch, in dataloader:
                optimizer.zero_grad()
                reconstructed, _ = model(batch)
                loss = criterion(reconstructed, batch)
                loss.backward()
                optimizer.step()
                epoch_loss += loss.item()
                n_batches += 1
            avg_loss = epoch_loss / n_batches
            loss_history.append(avg_loss)
            scheduler.step(avg_loss)
            if (epoch + 1) % 10 == 0 or epoch == 0:
                logger.info(f'Epoch {epoch + 1}/{config.epochs} — Loss: {avg_loss:.6f}')
        config.model_save_path.parent.mkdir(parents=True, exist_ok=True)
        torch.save({'model_state_dict': model.state_dict(), 'config': {'input_dim': config.input_dim, 'encoder_dims': config.encoder_dims, 'latent_dim': config.latent_dim, 'decoder_dims': config.decoder_dims}, 'loss_history': loss_history}, config.model_save_path)
        logger.info(f'Model saved to: {config.model_save_path}')
    return (model, loss_history)

def detect_anomalies(model: Any, embeddings: np.ndarray, config: Optional[AutoencoderConfig]=None) -> Tuple[np.ndarray, np.ndarray, float]:
    import torch
    config = config or AutoencoderConfig()
    model.eval()
    with torch.no_grad():
        tensor_data = torch.FloatTensor(embeddings).to(config.device)
        reconstructed, _ = model(tensor_data)
        errors = torch.mean((tensor_data - reconstructed) ** 2, dim=1)
        errors = errors.cpu().numpy()
    threshold = float(np.percentile(errors, config.anomaly_percentile))
    anomaly_flags = errors > threshold
    n_anomalies = anomaly_flags.sum()
    logger.info(f'Anomaly detection: threshold={threshold:.6f}, anomalies={n_anomalies}/{len(embeddings)} ({n_anomalies / len(embeddings):.1%})')
    return (errors, anomaly_flags, threshold)

def get_anomalous_jobs(df: pd.DataFrame, errors: np.ndarray, anomaly_flags: np.ndarray, n: int=20) -> pd.DataFrame:
    df = df.copy()
    df['anomaly_score'] = errors
    df['is_anomaly'] = anomaly_flags
    anomalous = df[df['is_anomaly']].sort_values('anomaly_score', ascending=False).head(n)
    logger.info(f'Top {len(anomalous)} anomalous jobs identified')
    return anomalous