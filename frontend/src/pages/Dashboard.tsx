import { useEffect, useState } from 'react';
import { Brain, BarChart3, Layers, TrendingUp, FileText } from 'lucide-react';
import StatCard from '../components/StatCard';
import { getDashboardStats } from '../api/client';

interface Stats {
  total_jobs: number;
  total_skills: number;
  total_clusters: number;
  top_emerging_skill: string;
  total_resumes: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.data))
      .catch(() => setStats({ total_jobs: 0, total_skills: 0, total_clusters: 0, top_emerging_skill: 'N/A', total_resumes: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
      {/* Decorative cyber grid overlay */}
      <div className="cyber-grid" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.3, zIndex: 0 }} />

      {/* Glassmorphic Header Panel */}
      <div className="glass-claymorphism" style={{
        padding: '2.5rem 2rem',
        marginBottom: '2.5rem',
        textAlign: 'left',
        position: 'relative',
        overflow: 'hidden',
        zIndex: 1,
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 75%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
        
        <h1 style={{ marginBottom: '0.75rem', fontSize: '2.5rem', fontFamily: 'var(--font-sans)', fontWeight: 800 }}>
          <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 30px rgba(188, 59, 240, 0.2)' }}>
            SKILLGRAPH AI
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginLeft: '1rem', letterSpacing: '0.1em' }}>v2 Core Loaded</span>
        </h1>
        <p style={{ fontSize: '1.15rem', color: 'var(--text-primary)', maxWidth: '750px', marginBottom: '0.75rem', fontWeight: 500 }}>
          Unsupervised Job Market Intelligence & Resume Skill Gap Analyzer
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '850px', lineHeight: 1.7 }}>
          Analyze job postings using UMAP dimensional reduction, HDBSCAN clusters, BERTopic modeling, 
          PyTorch autoencoders for anomaly detection, and TensorFlow LSTM networks for temporal trend forecasting.
        </p>
      </div>

      {/* Stats Counter Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '3rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <StatCard
          title="Total Jobs"
          value={loading ? '...' : stats?.total_jobs ?? 0}
          icon={<BarChart3 size={20} color="white" />}
          gradient="var(--gradient-primary)"
          subtitle="Job postings analyzed"
        />
        <StatCard
          title="Unique Skills"
          value={loading ? '...' : stats?.total_skills ?? 0}
          icon={<Brain size={20} color="white" />}
          gradient="var(--gradient-secondary)"
          subtitle="Skills discovered"
        />
        <StatCard
          title="Clusters"
          value={loading ? '...' : stats?.total_clusters ?? 0}
          icon={<Layers size={20} color="white" />}
          gradient="var(--gradient-success)"
          subtitle="HDBSCAN clusters"
        />
        <StatCard
          title="Top Emerging"
          value={loading ? '...' : stats?.top_emerging_skill ?? 'N/A'}
          icon={<TrendingUp size={20} color="white" />}
          gradient="var(--gradient-danger)"
          subtitle="Fastest growing skill"
        />
        <StatCard
          title="Resumes"
          value={loading ? '...' : stats?.total_resumes ?? 0}
          icon={<FileText size={20} color="white" />}
          gradient="linear-gradient(135deg, #bc3bf0, #4f46e5)"
          subtitle="Resumes analyzed"
        />
      </div>

      {/* Platform Features Grid */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', fontFamily: 'var(--font-sans)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          SYSTEM CAPABILITIES
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}>
          {[
            { title: 'UMAP + HDBSCAN Clustering', desc: 'Discover hidden job clusters automatically without specifying cluster count. Visualize high-dimensional job embeddings in 2D scatter plots.' },
            { title: 'BERTopic Modeling', desc: 'Automatically discover topics in job postings using transformer-based embeddings and c-TF-IDF for interpretable topic representations.' },
            { title: 'PyTorch Autoencoder', desc: 'Detect rare and emerging job roles through unsupervised anomaly detection on job embedding vectors.' },
            { title: 'TensorFlow LSTM Forecast', desc: 'Predict future skill demand using LSTM neural networks trained on monthly job-market time series data.' },
            { title: 'Skill Co-occurrence Graph', desc: 'NetworkX-powered graph revealing skill relationships, communities, and central market skills with interactive visualization.' },
            { title: 'Resume Gap Analyzer', desc: 'Upload your resume, choose a target role, and get a personalized learning roadmap with match percentage and priority skills.' },
          ].map((feature, i) => (
            <div key={i} style={{
              background: 'rgba(15, 15, 30, 0.55)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(0, 240, 255, 0.12)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              boxShadow: 'inset 2px 2px 4px rgba(255, 255, 255, 0.05), inset -2px -2px 6px rgba(0, 0, 0, 0.7), 0 4px 15px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.4)';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(255, 255, 255, 0.08), inset -2px -2px 6px rgba(0, 0, 0, 0.7), 0 8px 24px rgba(0,0,0,0.5), 0 0 15px rgba(0, 240, 255, 0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.12)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'inset 2px 2px 4px rgba(255, 255, 255, 0.05), inset -2px -2px 6px rgba(0, 0, 0, 0.7), 0 4px 15px rgba(0,0,0,0.3)';
            }}
            >
              <h4 style={{ marginBottom: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
                {feature.title}
              </h4>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
