import { useEffect, useState } from 'react';
import { Users, Brain, Layers, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import StatCard from '../components/StatCard';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface PoolAnalytics {
  total_candidates: number;
  skill_distribution: Record<string, number>;
  top_skills: { skill: string; count: number }[];
  seniority_distribution: Record<string, number>;
  cluster_coverage: Record<string, { total_candidates: number; avg_fit_potential: number }>;
  supply_depth: Record<string, number>;
}

const COLORS = ['#6366f1', '#22d3ee', '#34d399', '#fbbf24', '#f43f5e', '#a855f7', '#ec4899', '#14b8a6'];

const tooltipStyle = {
  backgroundColor: '#1a1a2e',
  border: '1px solid rgba(99, 102, 241, 0.25)',
  borderRadius: '8px',
  fontSize: '0.78rem',
  color: '#e8e8f0',
};

export default function TalentPool() {
  const [data, setData] = useState<PoolAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/pool/analytics`)
      .then(r => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginTop: '4rem' }}>Loading talent pool analytics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ color: '#f43f5e', marginTop: '4rem' }}>
          {error || 'No data available. Run the candidate pipeline first.'}
        </p>
      </div>
    );
  }

  const skillCount = Object.keys(data.skill_distribution).length;
  const clusterCount = Object.keys(data.cluster_coverage).length;

  // Prepare chart data
  const topSkillsData = data.top_skills.slice(0, 15).map(s => ({
    name: s.skill.length > 18 ? s.skill.slice(0, 16) + '…' : s.skill,
    fullName: s.skill,
    count: s.count,
  }));

  const seniorityData = Object.entries(data.seniority_distribution).map(([name, value]) => ({
    name, value,
  }));

  const supplyDepthData = Object.entries(data.supply_depth).map(([cluster, count]) => ({
    name: String(cluster).length > 20 ? String(cluster).slice(0, 18) + '…' : String(cluster),
    fullName: String(cluster),
    candidates: count,
  }));

  const clusterCoverageEntries = Object.entries(data.cluster_coverage);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.3rem' }}>
          <span style={{ background: 'var(--gradient-secondary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Talent Pool Analytics
          </span>
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Aggregated intelligence across your entire candidate pool
        </p>
      </div>

      {/* 1. Summary stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem', marginBottom: '2rem',
      }}>
        <StatCard
          title="Total Candidates"
          value={data.total_candidates}
          icon={<Users size={20} color="white" />}
          gradient="var(--gradient-primary)"
          subtitle="In talent pool"
        />
        <StatCard
          title="Unique Skills"
          value={skillCount}
          icon={<Brain size={20} color="white" />}
          gradient="var(--gradient-secondary)"
          subtitle="Skills discovered"
        />
        <StatCard
          title="Clusters"
          value={clusterCount || '—'}
          icon={<Layers size={20} color="white" />}
          gradient="var(--gradient-success)"
          subtitle="Skill clusters"
        />
      </div>

      {/* 2 & 3: Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Top Skills bar chart */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)', padding: '1.25rem',
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BarChart3 size={18} color="var(--accent-blue)" /> Top Skills
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topSkillsData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" stroke="#6b6b84" fontSize={11} />
              <YAxis type="category" dataKey="name" width={120} stroke="#6b6b84" fontSize={11} tick={{ fill: '#9898b0' }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: any, _: any, props: any) => [value, props.payload?.fullName || '']}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Seniority pie chart */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)', padding: '1.25rem',
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            Seniority Distribution
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={seniorityData}
                cx="50%" cy="45%"
                innerRadius={60} outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={12}
              >
                {seniorityData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '0.75rem', color: '#9898b0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Supply Depth horizontal bar chart */}
      {supplyDepthData.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '2rem',
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            Supply Depth per Cluster
          </h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
            Candidates covering ≥70% of each cluster's core skills
          </p>
          <ResponsiveContainer width="100%" height={Math.max(200, supplyDepthData.length * 35)}>
            <BarChart data={supplyDepthData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" stroke="#6b6b84" fontSize={11} />
              <YAxis type="category" dataKey="name" width={150} stroke="#6b6b84" fontSize={11} tick={{ fill: '#9898b0' }} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: any, _: any, props: any) => [value, props.payload?.fullName || '']}
              />
              <Bar dataKey="candidates" fill="#22d3ee" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 5. Cluster Coverage table */}
      {clusterCoverageEntries.length > 0 && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)', padding: '1.25rem',
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            Cluster Coverage
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem',
            }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ textAlign: 'left', padding: '0.6rem 0.8rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Cluster
                  </th>
                  <th style={{ textAlign: 'right', padding: '0.6rem 0.8rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Candidates
                  </th>
                  <th style={{ textAlign: 'right', padding: '0.6rem 0.8rem', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Avg Fit Potential
                  </th>
                </tr>
              </thead>
              <tbody>
                {clusterCoverageEntries.map(([cluster, info], i) => (
                  <tr key={cluster} style={{
                    borderBottom: i < clusterCoverageEntries.length - 1 ? '1px solid var(--border-color)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '0.6rem 0.8rem', color: 'var(--text-primary)' }}>{cluster}</td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>{info.total_candidates}</td>
                    <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>
                      <span style={{
                        padding: '0.15rem 0.5rem', borderRadius: '4px',
                        background: info.avg_fit_potential >= 0.5 ? 'rgba(52, 211, 153, 0.12)' : 'rgba(251, 191, 36, 0.12)',
                        color: info.avg_fit_potential >= 0.5 ? '#34d399' : '#fbbf24',
                        fontWeight: 600,
                      }}>
                        {(info.avg_fit_potential * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
