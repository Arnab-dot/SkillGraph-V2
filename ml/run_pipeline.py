import argparse
import sys
from pathlib import Path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
from ml.src.config import AutoencoderConfig, ForecastingConfig, PROCESSED_DATA_DIR, CLUSTER_OUTPUT_DIR, TREND_OUTPUT_DIR, REPORT_OUTPUT_DIR
from ml.src.utils import setup_logger, Timer, save_dataframe
logger = setup_logger('pipeline')

def run_pipeline(input_path: str, skip_heavy: bool=False) -> None:
    logger.info('=' * 60)
    logger.info('🚀 SkillGraph AI v2 — ML Pipeline')
    logger.info('=' * 60)
    with Timer('Complete pipeline', logger):
        logger.info('\n📂 Step 1/12: Loading dataset...')
        from ml.src.data_loader import load_dataset, validate_dataset
        df = load_dataset(input_path)
        validation = validate_dataset(df)
        logger.info(f'Dataset loaded: {len(df)} rows')
        logger.info('\n🧹 Step 2/12: Preprocessing text...')
        from ml.src.preprocessing import preprocess_dataframe, remove_duplicates
        df = preprocess_dataframe(df)
        df = remove_duplicates(df)
        save_dataframe(df, PROCESSED_DATA_DIR / 'processed_jobs.csv')
        logger.info(f'Preprocessed: {len(df)} jobs')
        logger.info('\n🔍 Step 3/12: Extracting skills...')
        from ml.src.skill_extractor import SkillExtractor
        extractor = SkillExtractor(use_spacy=False)
        df = extractor.extract_from_dataframe(df)
        skill_freq_df = extractor.get_skill_frequencies(df)
        top_skills = extractor.get_top_skills(df, n=30)
        save_dataframe(df, PROCESSED_DATA_DIR / 'jobs_with_skills.csv')
        save_dataframe(skill_freq_df, REPORT_OUTPUT_DIR / 'skill_frequencies.csv')
        logger.info(f'Top 10 skills: {top_skills[:10]}')
        logger.info('\n🧠 Step 4/12: Generating embeddings...')
        from ml.src.embedding_generator import generate_embeddings
        embeddings = generate_embeddings(df['cleaned_text'], force_regenerate=not skip_heavy)
        logger.info(f'Embeddings: {embeddings.shape}')
        logger.info('\n📉 Step 5/12: UMAP dimensionality reduction...')
        from ml.src.clustering import reduce_dimensions_umap
        coords_2d = reduce_dimensions_umap(embeddings)
        logger.info(f'UMAP 2D coords: {coords_2d.shape}')
        logger.info('\n🔮 Step 6/12: HDBSCAN clustering...')
        from ml.src.clustering import cluster_hdbscan, cluster_kmeans, get_cluster_details, get_top_skills_per_cluster, get_representative_titles, save_cluster_results
        hdbscan_labels, hdbscan_meta = cluster_hdbscan(coords_2d)
        df = get_cluster_details(df, hdbscan_labels, coords_2d)
        cluster_skills = get_top_skills_per_cluster(df)
        cluster_titles = get_representative_titles(df)
        save_cluster_results(df, hdbscan_meta, cluster_skills, cluster_titles)
        kmeans_labels, kmeans_meta = cluster_kmeans(coords_2d)
        logger.info(f"HDBSCAN: {hdbscan_meta['n_clusters']} clusters, KMeans baseline: {kmeans_meta['n_clusters']} clusters")
        logger.info('\n📝 Step 7/12: Topic modeling...')
        from ml.src.topic_modeling import run_bertopic, save_topic_results
        documents = df['cleaned_text'].tolist()
        topics, topic_info = run_bertopic(documents, embeddings=embeddings)
        save_topic_results(topics, topic_info)
        logger.info(f'Topics discovered: {len(topic_info)}')
        logger.info('\n🕸️  Step 8/12: Building skill co-occurrence graph...')
        from ml.src.graph_builder import build_cooccurrence_graph, compute_centrality, detect_communities, export_graph_json
        graph = build_cooccurrence_graph(df)
        centrality = compute_centrality(graph)
        communities = detect_communities(graph)
        graph_json = export_graph_json(graph, centrality, communities)
        logger.info(f'Graph: {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges')
        logger.info('\n📈 Step 9/12: Analyzing skill trends...')
        from ml.src.trend_analysis import compute_monthly_skill_frequency, compute_growth_scores, save_trend_results
        monthly_freq = compute_monthly_skill_frequency(df)
        if monthly_freq is not None:
            growth_df = compute_growth_scores(monthly_freq)
            save_trend_results(monthly_freq, growth_df)
            logger.info(f'Trends: {len(growth_df)} skills analyzed')
        else:
            logger.warning('⚠️  Trend analysis skipped (no dates available)')
            growth_df = None
        logger.info('\n🔮 Step 10/12: TensorFlow skill demand forecasting...')
        from ml.src.tensorflow_forecasting import prepare_time_series, train_forecasting_model, forecast_skill_demand, save_forecast_results
        forecast_df = None
        forecast_meta = {'status': 'skipped'}
        if monthly_freq is not None:
            try:
                time_series = prepare_time_series(monthly_freq)
                tf_model, forecast_meta = train_forecasting_model(time_series)
                if tf_model is not None:
                    forecast_df = forecast_skill_demand(tf_model, time_series)
                    save_forecast_results(forecast_df, forecast_meta)
                    logger.info(f'Forecast: {len(forecast_df)} skills forecasted')
                else:
                    logger.warning('⚠️  Forecasting model training returned None')
            except Exception as e:
                logger.warning(f'⚠️  Forecasting failed: {e}')
                forecast_meta = {'status': 'failed', 'error': str(e)}
        else:
            logger.warning('⚠️  Forecasting skipped (no trend data)')
        logger.info('\n🤖 Step 11/12: PyTorch autoencoder anomaly detection...')
        from ml.src.pytorch_autoencoder import train_autoencoder, detect_anomalies, get_anomalous_jobs
        ae_config = AutoencoderConfig(input_dim=embeddings.shape[1])
        ae_model, ae_losses = train_autoencoder(embeddings, ae_config)
        ae_errors, ae_flags, ae_threshold = detect_anomalies(ae_model, embeddings, ae_config)
        anomalous_jobs = get_anomalous_jobs(df, ae_errors, ae_flags)
        df['anomaly_score'] = ae_errors
        df['is_anomaly'] = ae_flags
        save_dataframe(anomalous_jobs[['job_title', 'company', 'anomaly_score']], REPORT_OUTPUT_DIR / 'anomalous_jobs.csv')
        logger.info(f'Anomalies: {ae_flags.sum()} unusual job postings detected')
        logger.info('\n📊 Step 12/12: Evaluating results...')
        from ml.src.evaluation import evaluate_clustering, evaluate_kmeans_clustering, evaluate_autoencoder, save_evaluation_report
        clustering_metrics = evaluate_clustering(coords_2d, hdbscan_labels)
        kmeans_eval = evaluate_kmeans_clustering(coords_2d, kmeans_labels)
        ae_eval = evaluate_autoencoder(ae_errors, ae_flags, ae_threshold)
        save_evaluation_report(clustering_metrics=clustering_metrics, kmeans_metrics=kmeans_eval, autoencoder_metrics=ae_eval, skill_extraction_stats={'total_jobs': len(df), 'total_skill_mentions': int(df['skill_count'].sum()), 'avg_skills_per_job': round(float(df['skill_count'].mean()), 2), 'unique_skills_found': int(skill_freq_df['skill'].nunique())})
        save_dataframe(df, PROCESSED_DATA_DIR / 'final_processed.csv')
    logger.info('\n' + '=' * 60)
    logger.info('✅ Pipeline Complete!')
    logger.info('=' * 60)
    logger.info(f'📊 Jobs processed:       {len(df)}')
    logger.info(f"🔍 Unique skills found:  {skill_freq_df['skill'].nunique()}")
    logger.info(f"🔮 Clusters found:       {hdbscan_meta['n_clusters']}")
    logger.info(f'📝 Topics discovered:    {len(topic_info)}')
    logger.info(f'🕸️  Graph nodes:          {graph.number_of_nodes()}')
    logger.info(f'🕸️  Graph edges:          {graph.number_of_edges()}')
    logger.info(f'🤖 Anomalies detected:   {ae_flags.sum()}')
    if forecast_df is not None and (not forecast_df.empty):
        logger.info(f'🔮 Skills forecasted:    {len(forecast_df)}')
    logger.info(f'\n📁 Outputs saved to: ml/outputs/')
    logger.info(f'📁 Models saved to:  ml/models/')

def main() -> None:
    parser = argparse.ArgumentParser(description='SkillGraph AI v2 — ML Pipeline', formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--input', '-i', type=str, required=True, help='Path to the input dataset (CSV, JSON, or Excel)')
    parser.add_argument('--skip-heavy', action='store_true', help='Skip heavy computation (uses cached embeddings if available)')
    args = parser.parse_args()
    run_pipeline(args.input, args.skip_heavy)
if __name__ == '__main__':
    main()