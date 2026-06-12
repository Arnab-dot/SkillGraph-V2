import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Brain, TrendingUp, FileSearch, Network, Gauge, LineChart } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Gauge },
  { path: '/market', label: 'Market', icon: BarChart3 },
  { path: '/clusters', label: 'Clusters', icon: Brain },
  { path: '/trends', label: 'Trends', icon: TrendingUp },
  { path: '/resume', label: 'Resume', icon: FileSearch },
  { path: '/graph', label: 'Graph', icon: Network },
  { path: '/forecast', label: 'Forecast', icon: LineChart },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(10, 10, 15, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 1.5rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1400px',
        margin: '0 auto',
        height: '64px',
      }}>
        {}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          textDecoration: 'none',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.3)',
          }}>
            <Brain size={20} color="white" />
          </div>
          <span style={{
            fontSize: '1.15rem',
            fontWeight: 700,
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            SkillGraph AI
          </span>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            background: 'var(--gradient-secondary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.05em',
          }}>v2</span>
        </Link>

        {}
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  background: active ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'rgba(99, 102, 241, 0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
