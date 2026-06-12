import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SkillBarChartProps {
  data: { skill: string; frequency: number; category?: string }[];
  title?: string;
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#22d3ee', '#34d399', '#fbbf24', '#f43f5e'];

export default function SkillBarChart({ data, title }: SkillBarChartProps) {
  if (!data?.length) return <p style={{ color: 'var(--text-muted)' }}>No skill data available</p>;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '1.5rem',
    }}>
      {title && <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={Math.max(300, data.length * 28)}>
        <BarChart data={data.slice(0, 20)} layout="vertical" margin={{ left: 80, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
          <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
          <YAxis type="category" dataKey="skill" stroke="var(--text-secondary)" fontSize={11} width={75} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
            }}
          />
          <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
            {data.slice(0, 20).map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
