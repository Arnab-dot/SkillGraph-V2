import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Brain, TrendingUp, FileSearch, Network, Gauge, LineChart, UserSearch, Users } from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Gauge },
  { path: '/market', label: 'Market', icon: BarChart3 },
  { path: '/clusters', label: 'Clusters', icon: Brain },
  { path: '/trends', label: 'Trends', icon: TrendingUp },
  { path: '/resume', label: 'Resume', icon: FileSearch },
  { path: '/graph', label: 'Graph', icon: Network },
  { path: '/forecast', label: 'Forecast', icon: LineChart },
  { path: '/recruiter', label: 'Recruiter', icon: UserSearch },
  { path: '/talent-pool', label: 'Talent Pool', icon: Users },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(3, 3, 8, 0.65)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
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
        {/* Brand Logo */}
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
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.35)',
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

        {/* Navigation Links */}
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
                  color: active ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  background: active ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
                  border: active ? '1px solid rgba(0, 240, 255, 0.15)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'rgba(0, 240, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.borderColor = 'transparent';
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
