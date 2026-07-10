import { useEffect, useState, useMemo } from 'react';
import { getGraph } from '../api/client';
import GraphViewer from '../components/GraphViewer';

export default function SkillGraphPage() {
  const [graphData, setGraphData] = useState<any>(null);

  useEffect(() => {
    getGraph().then(r => setGraphData(r.data)).catch(() => {});
  }, []);

  const stats = graphData?.stats || {};
  const nodes = graphData?.nodes || [];

  const communitiesData = useMemo(() => {
    const groups: Record<number, { id: number; skills: string[]; count: number }> = {};
    nodes.forEach((n: any) => {
      const cid = n.community;
      if (!groups[cid]) {
        groups[cid] = { id: cid, skills: [], count: 0 };
      }
      groups[cid].skills.push(n.label);
      groups[cid].count += 1;
    });
    return Object.values(groups)
      .filter(g => g.count >= 2)
      .sort((a, b) => b.count - a.count);
  }, [nodes]);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Skill Graph</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Interactive skill co-occurrence network — {stats.total_nodes ?? 0} skills, {stats.total_edges ?? 0} connections, {stats.n_communities ?? 0} communities.
      </p>

      <GraphViewer nodes={graphData?.nodes || []} edges={graphData?.edges || []} />

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
            <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {communitiesData.slice(0, 15).map((g: any, i: number) => {
                const topSkills = g.skills.slice(0, 3).join(', ');
                const suffix = g.skills.length > 3 ? '...' : '';
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', padding: '0.4rem 0', borderBottom: '1px solid rgba(99,102,241,0.06)', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span style={{ color: 'var(--text-primary)' }}>Community {g.id}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{g.count} skills</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.15rem' }}>
                      {topSkills}{suffix}
                    </span>
                  </div>
                );
              })}
              {communitiesData.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '1rem' }}>
                  No significant communities found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
