import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TrendLineChartProps {
  data: { month: string; [skill: string]: any }[];
  skills: string[];
  title?: string;
}

const LINE_COLORS = ['#6366f1', '#22d3ee', '#34d399', '#fbbf24', '#f43f5e', '#a855f7', '#ec4899', '#14b8a6'];

export default function TrendLineChart({ data, skills, title }: TrendLineChartProps) {
  if (!data?.length) return <p style={{ color: 'var(--text-muted)' }}>No trend data available</p>;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '1.5rem',
    }}>
      {title && <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>{title}</h3>}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
          <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
          <YAxis stroke="var(--text-muted)" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
          {skills.slice(0, 8).map((skill, i) => (
            <Line
              key={skill}
              type="monotone"
              dataKey={skill}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
