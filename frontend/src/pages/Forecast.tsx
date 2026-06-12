import { useEffect, useState } from 'react';
import { getForecast } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Zap } from 'lucide-react';

export default function Forecast() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    getForecast().then(r => setData(r.data)).catch(() => {});
  }, []);

  const forecasts = data?.forecasts || [];
  const topEmerging = [...forecasts].sort((a: any, b: any) => b.future_growth_score - a.future_growth_score).slice(0, 10);
  const chartData = forecasts.slice(0, 15).map((f: any) => ({
    skill: f.skill,
    current: f.current_demand,
    forecast: f.avg_forecast,
    growth: f.future_growth_score,
  }));

  const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#fbbf24', '#f43f5e', '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#818cf8'];

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Skill Demand Forecast</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        TensorFlow LSTM predictions for next 3 months — {forecasts.length} skills forecasted.
      </p>

      {forecasts.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>No forecast data available. Run the ML pipeline with dated job postings.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
          {}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Current vs Forecasted Demand</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                <XAxis type="number" stroke="var(--text-muted)" fontSize={11} />
                <YAxis type="category" dataKey="skill" stroke="var(--text-secondary)" fontSize={11} width={75} />
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem' }} />
                <Bar dataKey="current" fill="rgba(99,102,241,0.4)" name="Current" radius={[0, 2, 2, 0]} />
                <Bar dataKey="forecast" name="Forecasted" radius={[0, 4, 4, 0]}>
                  {chartData.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
              <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-green)' }}>
                <Zap size={18} /> Predicted Emerging
              </h3>
              {topEmerging.map((f: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                  <span style={{ fontSize: '0.82rem' }}>{f.skill}</span>
                  <span style={{
                    fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '99px', fontWeight: 600,
                    background: f.future_growth_score > 0 ? 'rgba(52,211,153,0.12)' : 'rgba(244,63,94,0.12)',
                    color: f.future_growth_score > 0 ? 'var(--accent-green)' : 'var(--accent-rose)',
                  }}>
                    {f.future_growth_score > 0 ? '+' : ''}{(f.future_growth_score * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>

            {/* Forecast table */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', overflow: 'auto', maxHeight: '300px' }}>
              <h3 style={{ marginBottom: '0.75rem' }}>3-Month Forecast</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Skill', 'M+1', 'M+2', 'M+3'].map(h => (
                      <th key={h} style={{ padding: '0.4rem', textAlign: 'left', color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {forecasts.slice(0, 15).map((f: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                      <td style={{ padding: '0.4rem', fontWeight: 500 }}>{f.skill}</td>
                      <td style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}>{f.forecast_month_1}</td>
                      <td style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}>{f.forecast_month_2}</td>
                      <td style={{ padding: '0.4rem', color: 'var(--text-secondary)' }}>{f.forecast_month_3}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
