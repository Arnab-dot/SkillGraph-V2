import { useEffect, useState } from 'react';
import { getClusters } from '../api/client';
import ClusterScatter from '../components/ClusterScatter';

export default function SkillClusters() {
  const [data, setData] = useState<any>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    getClusters().then(r => setData(r.data)).catch(() => {});
  }, []);

  const clusters = data?.clusters || [];
  const scatter = data?.scatter?.points || [];
  const selectedCluster = clusters.find((c: any) => c.cluster_id === selected);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Skill Clusters</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        UMAP + HDBSCAN unsupervised clustering — {data?.total_clusters ?? 0} clusters discovered, {data?.total_noise ?? 0} noise points.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <ClusterScatter data={scatter} title="UMAP 2D Projection" />

        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3>Clusters</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflow: 'auto' }}>
            {clusters.map((c: any) => (
              <div
                key={c.cluster_id}
                onClick={() => setSelected(c.cluster_id)}
                style={{
                  background: selected === c.cluster_id ? 'rgba(99,102,241,0.15)' : 'var(--bg-card)',
                  border: `1px solid ${selected === c.cluster_id ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Cluster {c.cluster_id}</span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '0.15rem 0.5rem', borderRadius: '99px' }}>
                    {c.size} jobs
                  </span>
                </div>
                {c.representative_titles?.slice(0, 2).map((t: string, i: number) => (
                  <p key={i} style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{t}</p>
                ))}
              </div>
            ))}
          </div>

          {}
          {selectedCluster && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', marginTop: '0.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>Cluster {selectedCluster.cluster_id} — Top Skills</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {selectedCluster.top_skills?.map((s: any, i: number) => (
                  <span key={i} style={{
                    fontSize: '0.72rem', padding: '0.2rem 0.6rem',
                    background: 'rgba(99,102,241,0.12)', borderRadius: '99px',
                    color: 'var(--accent-blue)', fontWeight: 500,
                  }}>
                    {s.skill || s} ({s.count || ''})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
