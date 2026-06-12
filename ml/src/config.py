from pathlib import Path
from dataclasses import dataclass, field
from typing import List, Dict
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
ML_ROOT = PROJECT_ROOT / 'ml'
DATA_DIR = ML_ROOT / 'data'
RAW_DATA_DIR = DATA_DIR / 'raw'
PROCESSED_DATA_DIR = DATA_DIR / 'processed'
SAMPLE_DATA_DIR = DATA_DIR / 'sample'
SAMPLE_DATASET = SAMPLE_DATA_DIR / 'sample_jobs.csv'
MODELS_DIR = ML_ROOT / 'models'
EMBEDDINGS_DIR = MODELS_DIR / 'embeddings'
CLUSTERING_DIR = MODELS_DIR / 'clustering'
TOPIC_MODEL_DIR = MODELS_DIR / 'topic_model'
AUTOENCODER_DIR = MODELS_DIR / 'autoencoder'
FORECASTING_DIR = MODELS_DIR / 'forecasting'
OUTPUTS_DIR = ML_ROOT / 'outputs'
CLUSTER_OUTPUT_DIR = OUTPUTS_DIR / 'clusters'
TREND_OUTPUT_DIR = OUTPUTS_DIR / 'trends'
GRAPH_OUTPUT_DIR = OUTPUTS_DIR / 'graphs'
REPORT_OUTPUT_DIR = OUTPUTS_DIR / 'reports'
for _dir in [RAW_DATA_DIR, PROCESSED_DATA_DIR, SAMPLE_DATA_DIR, EMBEDDINGS_DIR, CLUSTERING_DIR, TOPIC_MODEL_DIR, AUTOENCODER_DIR, FORECASTING_DIR, CLUSTER_OUTPUT_DIR, TREND_OUTPUT_DIR, GRAPH_OUTPUT_DIR, REPORT_OUTPUT_DIR]:
    _dir.mkdir(parents=True, exist_ok=True)
DEFAULT_EMBEDDING_MODEL = 'all-MiniLM-L6-v2'
STRONGER_EMBEDDING_MODEL = 'all-mpnet-base-v2'
EMBEDDING_CACHE_FILE = EMBEDDINGS_DIR / 'job_embeddings.npy'
EMBEDDING_BATCH_SIZE = 64
UMAP_N_NEIGHBORS = 15
UMAP_MIN_DIST = 0.1
UMAP_N_COMPONENTS = 2
UMAP_METRIC = 'cosine'
UMAP_RANDOM_STATE = 42
HDBSCAN_MIN_CLUSTER_SIZE = 5
HDBSCAN_MIN_SAMPLES = 3
HDBSCAN_METRIC = 'euclidean'
KMEANS_N_CLUSTERS = 8
KMEANS_RANDOM_STATE = 42
BERTOPIC_NR_TOPICS = 'auto'
BERTOPIC_TOP_N_WORDS = 10
NMF_N_COMPONENTS = 10

@dataclass
class AutoencoderConfig:
    input_dim: int = 384
    encoder_dims: List[int] = field(default_factory=lambda: [256, 128, 64])
    latent_dim: int = 32
    decoder_dims: List[int] = field(default_factory=lambda: [64, 128, 256])
    learning_rate: float = 0.001
    batch_size: int = 32
    epochs: int = 50
    dropout: float = 0.2
    anomaly_percentile: float = 95.0
    model_save_path: Path = AUTOENCODER_DIR / 'pytorch_autoencoder.pt'
    device: str = 'cpu'

@dataclass
class ForecastingConfig:
    sequence_length: int = 6
    forecast_horizon: int = 3
    lstm_units: int = 64
    dense_units: int = 32
    learning_rate: float = 0.001
    batch_size: int = 16
    epochs: int = 100
    dropout: float = 0.2
    top_n_skills: int = 20
    model_save_path: Path = FORECASTING_DIR / 'tensorflow_lstm.keras'
SKILL_DICTIONARY: Dict[str, List[str]] = {'programming': ['Python', 'Java', 'C++', 'C', 'C#', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'R', 'SQL', 'Scala', 'Kotlin', 'Swift', 'Ruby', 'PHP', 'MATLAB', 'Julia', 'Perl', 'Shell', 'Bash'], 'ml_dl': ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'scikit-learn', 'XGBoost', 'LightGBM', 'NLP', 'Natural Language Processing', 'Computer Vision', 'Transformers', 'LLM', 'Large Language Model', 'RAG', 'Retrieval Augmented Generation', 'Fine-tuning', 'Hugging Face', 'LangChain', 'LangGraph', 'Agentic AI', 'Neural Network', 'Convolutional Neural Network', 'CNN', 'Recurrent Neural Network', 'RNN', 'LSTM', 'GRU', 'GAN', 'Generative AI', 'Reinforcement Learning', 'Transfer Learning', 'BERT', 'GPT', 'Stable Diffusion', 'Object Detection', 'Image Classification', 'Text Classification', 'Sentiment Analysis', 'Named Entity Recognition', 'NER', 'Speech Recognition', 'Recommendation System'], 'data': ['Pandas', 'NumPy', 'Spark', 'PySpark', 'Hadoop', 'Kafka', 'Airflow', 'ETL', 'Data Warehouse', 'BigQuery', 'Snowflake', 'Databricks', 'Hive', 'Presto', 'Flink', 'dbt', 'Data Pipeline', 'Data Modeling', 'Data Lake', 'Feature Engineering', 'Feature Store'], 'cloud_mlops': ['AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'MLflow', 'Kubeflow', 'CI/CD', 'Linux', 'Git', 'GitHub', 'FastAPI', 'Flask', 'Django', 'Terraform', 'Ansible', 'Jenkins', 'GitHub Actions', 'SageMaker', 'Vertex AI', 'Azure ML', 'Weights & Biases', 'W&B', 'DVC', 'Model Deployment', 'Model Serving', 'API Development'], 'databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Vector Database', 'Pinecone', 'FAISS', 'ChromaDB', 'Weaviate', 'Milvus', 'Neo4j', 'Cassandra', 'DynamoDB', 'SQLite'], 'math_stats': ['Statistics', 'Probability', 'Linear Algebra', 'Optimization', 'A/B Testing', 'Hypothesis Testing', 'Bayesian', 'Calculus', 'Time Series Analysis', 'Regression', 'Classification', 'Clustering', 'Dimensionality Reduction'], 'visualization': ['Tableau', 'Power BI', 'Matplotlib', 'Seaborn', 'Plotly', 'D3.js', 'Grafana', 'Looker'], 'soft_skills': ['Communication', 'Problem Solving', 'Teamwork', 'Leadership', 'Agile', 'Scrum', 'Project Management']}
ALL_SKILLS: List[str] = []
SKILL_TO_CATEGORY: Dict[str, str] = {}
for category, skills in SKILL_DICTIONARY.items():
    for skill in skills:
        ALL_SKILLS.append(skill)
        SKILL_TO_CATEGORY[skill.lower()] = category
TARGET_ROLE_SKILLS: Dict[str, List[str]] = {'ML Engineer': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'scikit-learn', 'SQL', 'Docker', 'AWS', 'Git', 'MLflow', 'Linux', 'NLP', 'Computer Vision', 'Feature Engineering', 'Model Deployment', 'CI/CD', 'Pandas', 'NumPy'], 'Data Scientist': ['Python', 'Machine Learning', 'Statistics', 'SQL', 'Pandas', 'NumPy', 'scikit-learn', 'Deep Learning', 'NLP', 'A/B Testing', 'Tableau', 'R', 'TensorFlow', 'PyTorch', 'Feature Engineering', 'Regression', 'Classification', 'Clustering'], 'AI Engineer': ['Python', 'Deep Learning', 'TensorFlow', 'PyTorch', 'LLM', 'NLP', 'Computer Vision', 'Transformers', 'Hugging Face', 'RAG', 'LangChain', 'Docker', 'AWS', 'FastAPI', 'Git', 'Generative AI', 'Fine-tuning', 'Model Deployment'], 'MLOps Engineer': ['Python', 'Docker', 'Kubernetes', 'MLflow', 'CI/CD', 'AWS', 'GCP', 'Linux', 'Git', 'Terraform', 'Jenkins', 'SageMaker', 'Model Deployment', 'Model Serving', 'Airflow', 'Kubeflow', 'GitHub Actions'], 'Data Analyst': ['SQL', 'Python', 'Tableau', 'Power BI', 'Excel', 'Statistics', 'Pandas', 'NumPy', 'A/B Testing', 'Data Modeling', 'Regression', 'Hypothesis Testing'], 'Backend Developer': ['Python', 'Java', 'SQL', 'FastAPI', 'Flask', 'Django', 'Docker', 'PostgreSQL', 'MongoDB', 'Redis', 'Git', 'Linux', 'CI/CD', 'API Development', 'Kubernetes'], 'Data Engineer': ['Python', 'SQL', 'Spark', 'PySpark', 'Airflow', 'Kafka', 'ETL', 'AWS', 'GCP', 'Docker', 'Data Warehouse', 'BigQuery', 'Snowflake', 'Hadoop', 'Data Pipeline', 'Data Lake', 'PostgreSQL', 'dbt']}
LOG_LEVEL = 'INFO'
LOG_FORMAT = '%(asctime)s | %(levelname)-8s | %(name)s | %(message)s'
LOG_DATE_FORMAT = '%Y-%m-%d %H:%M:%S'