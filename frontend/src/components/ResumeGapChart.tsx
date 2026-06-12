import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResumeGapChartProps {
  matched: string[];
  missing: string[];
  matchPercentage: number;
}

export default function ResumeGapChart({ matched, missing, matchPercentage }: ResumeGapChartProps) {
  const data = [
    ...matched.map(s => ({ skill: s, status: 'matched', value: 1 })),
    ...missing.map(s => ({ skill: s, status: 'missing', value: 1 })),
  ];

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '1.5rem',
    }}>
      {}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `conic-gradient(
            var(--accent-green) ${matchPercentage * 3.6}deg,
            rgba(99, 102, 241, 0.15) ${matchPercentage * 3.6}deg
          )`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-green)' }}>
              {matchPercentage.toFixed(0)}%
            </span>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Match</span>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{matched.length}</span> skills matched
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>{missing.length}</span> skills missing
          </p>
        </div>
      </div>

      {}
      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={Math.max(200, data.length * 24)}>
          <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="skill" stroke="var(--text-secondary)" fontSize={11} width={95} />
            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.status === 'matched' ? '#34d399' : '#f43f5e'} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
