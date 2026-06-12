import { useEffect, useState } from 'react';
import { getGraph } from '../api/client';
import GraphViewer from '../components/GraphViewer';

export default function SkillGraphPage() {
  const [graphData, setGraphData] = useState<any>(null);

  useEffect(() => {
    getGraph().then(r => setGraphData(r.data)).catch(() => {});
  }, []);

  const stats = graphData?.stats || {};
  const nodes = graphData?.nodes || [];

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Skill Graph</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Interactive skill co-occurrence network — {stats.total_nodes ?? 0} skills, {stats.total_edges ?? 0} connections, {stats.n_communities ?? 0} communities.
      </p>

      <GraphViewer nodes={graphData?.nodes || []} edges={graphData?.edges || []} />

      {}
      {nodes.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--accent-blue)', fontSize: '0.95rem' }}>Most Connected</h3>
            {nodes.slice(0, 10).map((n: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(99,102,241,0.06)', fontSize: '0.8rem' }}>
                <span>{n.label}</span>
                <span style={{ color: 'var(--text-muted)' }}>{n.degree} connections</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>Highest Betweenness</h3>
            {[...nodes].sort((a: any, b: any) => b.betweenness_centrality - a.betweenness_centrality).slice(0, 10).map((n: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(99,102,241,0.06)', fontSize: '0.8rem' }}>
                <span>{n.label}</span>
                <span style={{ color: 'var(--text-muted)' }}>{n.betweenness_centrality?.toFixed(3)}</span>
              </div>
            ))}
          </div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h3 style={{ marginBottom: '0.75rem', color: 'var(--accent-purple)', fontSize: '0.95rem' }}>Communities</h3>
            {Object.entries(
              nodes.reduce((acc: any, n: any) => { acc[n.community] = (acc[n.community] || 0) + 1; return acc; }, {} as Record<number, number>)
            ).map(([cid, count]: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid rgba(99,102,241,0.06)', fontSize: '0.8rem' }}>
                <span>Community {cid}</span>
                <span style={{ color: 'var(--text-muted)' }}>{count} skills</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
