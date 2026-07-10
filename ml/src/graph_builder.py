from collections import Counter
from itertools import combinations
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import pandas as pd
import numpy as np
from ml.src.config import GRAPH_OUTPUT_DIR
from ml.src.utils import setup_logger, Timer, save_json

logger = setup_logger(__name__)

def build_cooccurrence_graph(df: pd.DataFrame, min_cooccurrence: int=2, max_edges: int=500) -> Any:
    import networkx as nx
    logger.info('Building skill co-occurrence graph...')
    with Timer('Graph construction', logger):
        cooccurrence_counter: Counter = Counter()
        skill_counter: Counter = Counter()
        
        for skills in df['extracted_skills']:
            if not isinstance(skills, list) or len(skills) < 2:
                continue
            for skill in skills:
                skill_counter[skill] += 1
            for pair in combinations(sorted(set(skills)), 2):
                cooccurrence_counter[pair] += 1
                
        G = nx.Graph()
        
        # Calculate node properties
        skill_metrics = {}
        for skill in skill_counter:
            matching_jobs = df[df['extracted_skills'].apply(lambda x: skill in x if isinstance(x, list) else False)]
            
            # Salary
            salaries = matching_jobs['salary_val'].dropna()
            avg_salary = float(salaries.mean()) if not salaries.empty else 0.0
            
            # Industries
            all_inds = []
            for inds in matching_jobs['industries'].dropna():
                if isinstance(inds, list):
                    all_inds.extend(inds)
            top_inds = [item for item, _ in Counter(all_inds).most_common(3)]
            
            # Companies
            top_cos = [item for item, _ in Counter(matching_jobs['company'].dropna()).most_common(3)]
            
            # Experience
            exp_counts = matching_jobs['experience'].value_counts()
            total_exp = exp_counts.sum()
            exp_dist = {k: round(v / total_exp * 100, 1) for k, v in exp_counts.items()} if total_exp > 0 else {}
            
            skill_metrics[skill] = {
                'frequency': skill_counter[skill],
                'avg_salary': avg_salary,
                'top_industries': top_inds,
                'top_companies': top_cos,
                'experience_dist': exp_dist
            }
            G.add_node(skill, **skill_metrics[skill])
            
        # Compute Jaccard edge weights
        edges = []
        for (s1, s2), co_occur in cooccurrence_counter.most_common():
            if co_occur < min_cooccurrence:
                continue
            freq1 = skill_counter[s1]
            freq2 = skill_counter[s2]
            jaccard = co_occur / (freq1 + freq2 - co_occur)
            edges.append((s1, s2, jaccard, co_occur))
            
        edges.sort(key=lambda x: x[2], reverse=True)
        if len(edges) > max_edges:
            edges = edges[:max_edges]
            
        for s1, s2, jaccard, co_occur in edges:
            G.add_edge(s1, s2, weight=float(jaccard), co_occurrence=int(co_occur))
            
        # Remove isolated nodes (degree = 0) to avoid noisy single-node communities
        isolated_nodes = list(nx.isolates(G))
        G.remove_nodes_from(isolated_nodes)
            
        logger.info(f'Graph built: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges')
        return G

def compute_centrality(G: Any) -> Dict[str, Dict[str, float]]:
    import networkx as nx
    logger.info('Computing centrality metrics...')
    with Timer('Centrality computation', logger):
        degree_centrality = nx.degree_centrality(G)
        betweenness_centrality = nx.betweenness_centrality(G, weight='weight')
        try:
            eigenvector_centrality = nx.eigenvector_centrality(G, max_iter=1000, weight='weight')
        except nx.PowerIterationFailedConvergence:
            logger.warning('Eigenvector centrality did not converge. Using degree centrality.')
            eigenvector_centrality = degree_centrality
        centrality = {'degree': degree_centrality, 'betweenness': betweenness_centrality, 'eigenvector': eigenvector_centrality}
        return centrality

def detect_communities(G: Any) -> Dict[str, int]:
    import networkx as nx
    from networkx.algorithms.community import greedy_modularity_communities
    logger.info('Detecting communities...')
    with Timer('Community detection', logger):
        try:
            communities = list(greedy_modularity_communities(G, weight='weight'))
        except Exception as e:
            logger.warning(f'Community detection failed: {e}. Using connected components.')
            communities = list(nx.connected_components(G))
        community_map: Dict[str, int] = {}
        for i, community in enumerate(communities):
            for node in community:
                community_map[node] = i
        return community_map

def get_top_connected_skills(G: Any, n: int=20) -> List[Tuple[str, int]]:
    return sorted(G.degree(), key=lambda x: x[1], reverse=True)[:n]

def export_graph_json(G: Any, centrality: Dict[str, Dict[str, float]], community_map: Dict[str, int], output_path: Optional[Path]=None) -> Dict[str, Any]:
    output_path = output_path or GRAPH_OUTPUT_DIR / 'skill_graph.json'
    nodes = []
    for node in G.nodes():
        node_data = {
            'id': node,
            'label': node,
            'frequency': int(G.nodes[node].get('frequency', 0)),
            'avg_salary': float(G.nodes[node].get('avg_salary', 0.0)),
            'top_industries': G.nodes[node].get('top_industries', []),
            'top_companies': G.nodes[node].get('top_companies', []),
            'experience_dist': G.nodes[node].get('experience_dist', {}),
            'degree': G.degree(node),
            'degree_centrality': round(centrality['degree'].get(node, 0), 4),
            'betweenness_centrality': round(centrality['betweenness'].get(node, 0), 4),
            'eigenvector_centrality': round(centrality['eigenvector'].get(node, 0), 4),
            'community': community_map.get(node, 0)
        }
        nodes.append(node_data)
    edges = []
    for u, v, data in G.edges(data=True):
        edge_data = {
            'source': u,
            'target': v,
            'weight': float(data.get('weight', 1.0)),
            'co_occurrence': int(data.get('co_occurrence', 1))
        }
        edges.append(edge_data)
    graph_json = {
        'nodes': sorted(nodes, key=lambda x: x['degree'], reverse=True),
        'edges': sorted(edges, key=lambda x: x['weight'], reverse=True),
        'stats': {
            'total_nodes': G.number_of_nodes(),
            'total_edges': G.number_of_edges(),
            'n_communities': len(set(community_map.values())),
            'density': float(2 * G.number_of_edges() / (G.number_of_nodes() * (G.number_of_nodes() - 1))) if G.number_of_nodes() > 1 else 0
        }
    }
    save_json(graph_json, output_path)
    logger.info(f'Graph JSON exported to: {output_path}')
    return graph_json