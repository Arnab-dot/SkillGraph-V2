import { type ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  gradient?: string;
  subtitle?: string;
}

export default function StatCard({ title, value, icon, gradient, subtitle }: StatCardProps) {
  const grad = gradient || 'var(--gradient-primary)';
  
  // Extract a color estimate from gradient string for the glow effect
  let glowColor = 'rgba(0, 240, 255, 0.15)';
  if (grad.includes('#a855f7') || grad.includes('danger')) {
    glowColor = 'rgba(255, 0, 85, 0.15)';
  } else if (grad.includes('success')) {
    glowColor = 'rgba(57, 255, 20, 0.15)';
  } else if (grad.includes('secondary')) {
    glowColor = 'rgba(0, 240, 255, 0.15)';
  } else if (grad.includes('primary')) {
    glowColor = 'rgba(188, 59, 240, 0.15)';
  }

  return (
    <div
      style={{
        background: 'rgba(15, 15, 30, 0.65)',
        backdropFilter: 'blur(14px) saturate(150%)',
        WebkitBackdropFilter: 'blur(14px) saturate(150%)',
        border: '1px solid rgba(0, 240, 255, 0.12)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        cursor: 'default',
        boxShadow: `
          inset 2px 2px 4px rgba(255, 255, 255, 0.08),
          inset -2px -2px 6px rgba(0, 0, 0, 0.7),
          0 8px 32px rgba(0, 0, 0, 0.5),
          0 0 10px ${glowColor}
        `,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `
          inset 2px 2px 4px rgba(255, 255, 255, 0.12),
          inset -2px -2px 6px rgba(0, 0, 0, 0.7),
          0 12px 36px rgba(0, 0, 0, 0.6),
          0 0 25px ${glowColor.replace('0.15', '0.35')}
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.12)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `
          inset 2px 2px 4px rgba(255, 255, 255, 0.08),
          inset -2px -2px 6px rgba(0, 0, 0, 0.7),
          0 8px 32px rgba(0, 0, 0, 0.5),
          0 0 10px ${glowColor}
        `;
      }}
    >
      {/* Decorative top accent line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: grad,
        opacity: 0.85,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.6rem',
            fontFamily: 'var(--font-mono)',
          }}>
            {title}
          </p>
          <p style={{
            fontSize: '1.85rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1,
            fontFamily: 'var(--font-mono)',
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-sm)',
          background: grad,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.9,
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
