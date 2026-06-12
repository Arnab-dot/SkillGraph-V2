import { useEffect, useState } from 'react';
import { getTrends, getMonthlyData } from '../api/client';
import TrendLineChart from '../components/TrendLineChart';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function TrendExplorer() {
  const [trends, setTrends] = useState<any[]>([]);
  const [monthly, setMonthly] = useState<any[]>([]);

  useEffect(() => {
    getTrends().then(r => setTrends(r.data.trends || [])).catch(() => {});
    getMonthlyData().then(r => setMonthly(r.data || [])).catch(() => {});
  }, []);

  
  const topSkills = trends.slice(0, 8).map((t: any) => t.skill);
  const months = [...new Set(monthly.map((m: any) => m.month))].sort();
  const chartData = months.map(month => {
    const row: any = { month };
    topSkills.forEach(skill => {
      const entry = monthly.find((m: any) => m.month === month && m.skill === skill);
      row[skill] = entry?.frequency || 0;
    });
    return row;
  });

  const emerging = trends.filter((t: any) => t.trend === 'emerging' || t.trend === 'growing');
  const declining = trends.filter((t: any) => t.trend === 'declining' || t.trend === 'rapidly_declining');
  const stable = trends.filter((t: any) => t.trend === 'stable');


  const pillStyle = (trend: string): React.CSSProperties => ({
    fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: '99px', fontWeight: 600,
    background: trend.includes('declin') ? 'rgba(244,63,94,0.12)' : trend === 'stable' ? 'rgba(152,152,176,0.12)' : 'rgba(52,211,153,0.12)',
    color: trend.includes('declin') ? 'var(--accent-rose)' : trend === 'stable' ? 'var(--text-muted)' : 'var(--accent-green)',
  });

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Trend Explorer</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Track skill demand over time — {emerging.length} emerging, {declining.length} declining, {stable.length} stable.
      </p>

      <TrendLineChart data={chartData} skills={topSkills} title="Monthly Skill Demand" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
        {}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <h3 style={{ color: 'var(--accent-green)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={18} /> Emerging Skills
          </h3>
          {emerging.slice(0, 10).map((t: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
              <span style={{ fontSize: '0.82rem' }}>{t.skill}</span>
              <span style={pillStyle(t.trend)}>{t.growth_score?.toFixed(2)}x</span>
            </div>
          ))}
        </div>
        {}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Minus size={18} /> Stable High-Demand
          </h3>
          {stable.slice(0, 10).map((t: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
              <span style={{ fontSize: '0.82rem' }}>{t.skill}</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.total_frequency} mentions</span>
            </div>
          ))}
        </div>
        {}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
          <h3 style={{ color: 'var(--accent-rose)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingDown size={18} /> Declining Skills
          </h3>
          {declining.slice(0, 10).map((t: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
              <span style={{ fontSize: '0.82rem' }}>{t.skill}</span>
              <span style={pillStyle(t.trend)}>{t.growth_score?.toFixed(2)}x</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
