import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Point {
  job_title: string;
  company?: string;
  cluster_id: number;
  umap_x: number;
  umap_y: number;
}

interface ClusterScatterProps {
  data: Point[];
  title?: string;
}

const CLUSTER_COLORS = [
  '#6366f1', '#22d3ee', '#34d399', '#fbbf24', '#f43f5e',
  '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#06b6d4',
  '#84cc16', '#e879f9', '#fb923c', '#2dd4bf', '#818cf8',
];

export default function ClusterScatter({ data, title }: ClusterScatterProps) {
  if (!data?.length) return <p style={{ color: 'var(--text-muted)' }}>No cluster data available. Run the ML pipeline first.</p>;

  const getColor = (clusterId: number) => {
    if (clusterId === -1) return '#4b5563'; 
    return CLUSTER_COLORS[clusterId % CLUSTER_COLORS.length];
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '1.5rem',
    }}>
      {title && <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
          <XAxis type="number" dataKey="umap_x" name="UMAP X" stroke="var(--text-muted)" fontSize={10} tick={false} />
          <YAxis type="number" dataKey="umap_y" name="UMAP Y" stroke="var(--text-muted)" fontSize={10} tick={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
            }}
            formatter={(_val: any, _name: any, props: any) => {
              const p = props.payload;
              return [`${p.job_title} — ${p.company || 'N/A'}`, `Cluster ${p.cluster_id}`];
            }}
          />
          <Scatter data={data} fill="#6366f1">
            {data.map((point, i) => (
              <Cell key={i} fill={getColor(point.cluster_id)} fillOpacity={0.7} r={4} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
      {}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
        {Array.from(new Set(data.map(d => d.cluster_id))).sort((a, b) => a - b).map(cid => (
          <span key={cid} style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            fontSize: '0.7rem', color: 'var(--text-secondary)',
          }}>
            <span style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: getColor(cid),
            }} />
            {cid === -1 ? 'Noise' : `Cluster ${cid}`}
          </span>
        ))}
      </div>
    </div>
  );
}
