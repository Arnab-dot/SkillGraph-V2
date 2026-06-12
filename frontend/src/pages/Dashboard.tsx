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
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>
          <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SkillGraph AI
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>v2</span>
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '700px' }}>
          Unsupervised Job Market Intelligence & Resume Skill Gap Analyzer
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', maxWidth: '800px', lineHeight: 1.7 }}>
          Analyze job postings using UMAP, HDBSCAN, BERTopic, PyTorch autoencoders, and TensorFlow LSTM
          to discover hidden skill clusters, emerging trends, and resume skill gaps.
        </p>
      </div>

      {}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '2.5rem',
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
          gradient="linear-gradient(135deg, #a855f7, #6366f1)"
          subtitle="Resumes analyzed"
        />
      </div>

      {}
      <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Platform Features</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1rem',
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
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-active)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <h4 style={{ marginBottom: '0.5rem', color: 'var(--accent-blue)' }}>{feature.title}</h4>
            <p style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
