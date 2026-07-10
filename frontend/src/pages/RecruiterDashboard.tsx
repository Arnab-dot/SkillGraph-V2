import { useState, useEffect } from 'react';
import { Search, Users, Sparkles, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, Zap, Target, AlertTriangle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface JdProfile {
  explicit_skills: string[];
  implied_skills: string[];
  seniority: string;
  domain_cluster: string;
}

interface FitCard {
  overall_fit: string;
  strengths: string[];
  gaps: { skill: string; transferable: boolean }[];
  trajectory_note: string;
  graph_coverage_pct: number;
}

interface RankedCandidate {
  candidate_id: string;
  name: string;
  total_score: number;
  semantic_score: number;
  graph_alignment_score: number;
  trajectory_score: number;
  transferability_score: number;
  matched_skills: string[];
  missing_skills: string[];
  experience_years: number;
  top_job_titles: string[];
  non_traditional: boolean;
  fit_card: FitCard;
}

interface SkillForecast {
  skill: string;
  trend: 'rising' | 'stable' | 'declining';
  growth_score: number;
}

const fitColors: Record<string, string> = {
  Strong: '#34d399',
  Moderate: '#fbbf24',
  Weak: '#f43f5e',
};

function SkillTag({ skill, muted = false }: { skill: string; muted?: boolean }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.2rem 0.55rem',
      borderRadius: '6px',
      fontSize: '0.72rem',
      fontWeight: 500,
      background: muted ? 'rgba(152, 152, 176, 0.12)' : 'rgba(99, 102, 241, 0.15)',
      color: muted ? 'var(--text-muted)' : 'var(--accent-blue)',
      border: `1px solid ${muted ? 'rgba(152, 152, 176, 0.15)' : 'rgba(99, 102, 241, 0.25)'}`,
      margin: '0.15rem',
    }}>
      {skill}
    </span>
  );
}

function SeniorityBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Junior: '#22d3ee', Mid: '#6366f1', Senior: '#a855f7', Lead: '#f43f5e',
  };
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.25rem 0.7rem',
      borderRadius: '20px',
      fontSize: '0.72rem',
      fontWeight: 600,
      background: `${colors[level] || '#6366f1'}22`,
      color: colors[level] || '#6366f1',
      border: `1px solid ${colors[level] || '#6366f1'}44`,
    }}>
      {level}
    </span>
  );
}

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div style={{
      width: '100%', height: '6px', borderRadius: '3px',
      background: 'rgba(255,255,255,0.06)',
    }}>
      <div style={{
        width: `${Math.min(value, 100)}%`, height: '100%',
        borderRadius: '3px', background: color,
        transition: 'width 0.6s ease',
      }} />
    </div>
  );
}

function SkillForecastWidget({ candidateId }: { candidateId: string }) {
  const [forecasts, setForecasts] = useState<SkillForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/candidates/${candidateId}/skill-forecast`)
      .then(r => r.json())
      .then(data => setForecasts(data.skill_forecasts || []))
      .catch(() => setForecasts([]))
      .finally(() => setLoading(false));
  }, [candidateId]);

  if (loading) return <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Loading forecasts...</p>;
  if (!forecasts.length) return <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No forecast data available</p>;

  const trendIcon = (t: string) => {
    if (t === 'rising') return <TrendingUp size={13} color="#34d399" />;
    if (t === 'declining') return <TrendingDown size={13} color="#f43f5e" />;
    return <Minus size={13} color="#6b6b84" />;
  };
  const trendColor = (t: string) => t === 'rising' ? '#34d399' : t === 'declining' ? '#f43f5e' : '#9898b0';

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
      {forecasts.map(f => (
        <span key={f.skill} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          padding: '0.2rem 0.55rem', borderRadius: '6px', fontSize: '0.72rem',
          background: `${trendColor(f.trend)}15`,
          color: trendColor(f.trend),
          border: `1px solid ${trendColor(f.trend)}30`,
        }}>
          {trendIcon(f.trend)} {f.skill}
        </span>
      ))}
    </div>
  );
}

function CandidateCard({ candidate }: { candidate: RankedCandidate; jdProfile: JdProfile }) {
  const [expanded, setExpanded] = useState(false);
  const fc = candidate.fit_card;
  const fitColor = fitColors[fc.overall_fit] || '#6b6b84';

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${expanded ? 'var(--border-active)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.15rem',
        transition: 'all 0.25s ease',
        cursor: 'pointer',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={e => { if (!expanded) e.currentTarget.style.borderColor = 'var(--border-active)'; }}
      onMouseLeave={e => { if (!expanded) e.currentTarget.style.borderColor = 'var(--border-color)'; }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <h4 style={{ fontSize: '0.95rem', margin: 0 }}>{candidate.name}</h4>
          {candidate.non_traditional && (
            <span style={{
              fontSize: '0.65rem', fontWeight: 600, color: '#a855f7',
              background: 'rgba(168, 85, 247, 0.12)', padding: '0.15rem 0.45rem',
              borderRadius: '4px', border: '1px solid rgba(168, 85, 247, 0.25)',
            }}>Non-Traditional</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.55rem',
            borderRadius: '6px', background: `${fitColor}22`, color: fitColor,
            border: `1px solid ${fitColor}44`,
          }}>
            {fc.overall_fit}
          </span>
          <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {(candidate.total_score * 100).toFixed(0)}%
          </span>
          {expanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </div>

      {/* Quick info */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
        {candidate.matched_skills.slice(0, 3).map(s => <SkillTag key={s} skill={s} />)}
        {candidate.missing_skills.length > 0 && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
            +{candidate.missing_skills.length} gaps
          </span>
        )}
      </div>

      {/* Expanded fit card */}
      {expanded && (
        <div style={{
          marginTop: '0.8rem', paddingTop: '0.8rem',
          borderTop: '1px solid var(--border-color)',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          {/* Score breakdown */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem',
            marginBottom: '0.8rem',
          }}>
            {[
              { label: 'Semantic', value: candidate.semantic_score, icon: <Target size={13} />, color: '#6366f1' },
              { label: 'Graph Fit', value: candidate.graph_alignment_score, icon: <Zap size={13} />, color: '#22d3ee' },
              { label: 'Trajectory', value: candidate.trajectory_score, icon: <TrendingUp size={13} />, color: '#34d399' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.6rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{s.label}</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{(s.value * 100).toFixed(0)}%</span>
                <ProgressBar value={s.value * 100} color={s.color} />
              </div>
            ))}
          </div>

          {/* Strengths */}
          {fc.strengths.length > 0 && (
            <div style={{ marginBottom: '0.6rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#34d399', marginBottom: '0.3rem' }}>
                Strengths
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                {fc.strengths.map(s => <SkillTag key={s} skill={s} />)}
              </div>
            </div>
          )}

          {/* Gaps */}
          {fc.gaps.length > 0 && (
            <div style={{ marginBottom: '0.6rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 600, color: '#f43f5e', marginBottom: '0.3rem' }}>
                Gaps
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
                {fc.gaps.map(g => (
                  <span key={g.skill} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.72rem',
                    background: g.transferable ? 'rgba(251, 191, 36, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                    color: g.transferable ? '#fbbf24' : '#f43f5e',
                    border: `1px solid ${g.transferable ? '#fbbf2430' : '#f43f5e30'}`,
                  }}>
                    {g.skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Graph coverage */}
          <div style={{ marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Graph Coverage</span>
              <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{fc.graph_coverage_pct}%</span>
            </div>
            <ProgressBar value={fc.graph_coverage_pct} color="#6366f1" />
          </div>

          {/* Trajectory note */}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.6rem' }}>
            {fc.trajectory_note}
          </p>

          {/* Transferability */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.7rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Transferability Score</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{(candidate.transferability_score * 100).toFixed(0)}%</span>
          </div>

          {/* Skill Forecast Widget */}
          <div style={{ marginTop: '0.6rem', paddingTop: '0.6rem', borderTop: '1px solid var(--border-color)' }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '0.4rem' }}>
              Skill Outlook
            </p>
            <SkillForecastWidget candidateId={candidate.candidate_id} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function RecruiterDashboard() {
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [jdProfile, setJdProfile] = useState<JdProfile | null>(null);
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [error, setError] = useState('');

  const handleRank = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/match/rank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd_text: jdText, top_n: 20 }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Error ${res.status}`);
      }
      const data = await res.json();
      setJdProfile(data.jd_profile);
      setCandidates(data.ranked_candidates || []);
    } catch (e: any) {
      setError(e.message || 'Failed to rank candidates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ marginBottom: '0.3rem' }}>
          <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Recruiter Intelligence
          </span>
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Paste a job description to discover and rank the best-fit candidates from your talent pool
        </p>
      </div>

      {/* Two-panel layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* LEFT PANEL — JD Input */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          position: 'sticky', top: '80px',
        }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Search size={18} color="var(--accent-blue)" /> Job Description
          </h3>
          <textarea
            id="jd-input"
            value={jdText}
            onChange={e => setJdText(e.target.value)}
            placeholder="Paste a full job description here..."
            rows={10}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-color)', borderRadius: '8px',
              padding: '0.8rem', color: 'var(--text-primary)', fontSize: '0.82rem',
              resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6,
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
          <button
            id="rank-button"
            onClick={handleRank}
            disabled={loading || !jdText.trim()}
            style={{
              width: '100%', marginTop: '0.75rem', padding: '0.7rem',
              background: loading ? 'rgba(99, 102, 241, 0.3)' : 'var(--gradient-primary)',
              color: 'white', border: 'none', borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
              transition: 'all 0.2s', opacity: (!jdText.trim() || loading) ? 0.6 : 1,
            }}
          >
            {loading ? 'Analyzing...' : 'Rank Candidates'}
          </button>

          {error && (
            <div style={{
              marginTop: '0.6rem', padding: '0.6rem', borderRadius: '8px',
              background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f43f5e', fontSize: '0.78rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          {/* JD Profile decomposition result */}
          {jdProfile && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.82rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
                JD Decomposition
              </h4>

              <div style={{ marginBottom: '0.5rem' }}>
                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>EXPLICIT SKILLS</p>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {jdProfile.explicit_skills.map(s => <SkillTag key={s} skill={s} />)}
                </div>
              </div>

              {jdProfile.implied_skills.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>IMPLIED SKILLS</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {jdProfile.implied_skills.map(s => <SkillTag key={s} skill={s} muted />)}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem' }}>
                <SeniorityBadge level={jdProfile.seniority} />
                <span style={{
                  fontSize: '0.72rem', padding: '0.25rem 0.55rem', borderRadius: '6px',
                  background: 'rgba(34, 211, 238, 0.1)', color: '#22d3ee',
                  border: '1px solid rgba(34, 211, 238, 0.25)',
                }}>
                  {jdProfile.domain_cluster}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Ranked Shortlist */}
        <div>
          {candidates.length === 0 && !loading && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center',
            }}>
              <Users size={40} color="var(--text-muted)" style={{ marginBottom: '0.8rem' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Paste a job description and click <strong>Rank Candidates</strong> to see results
              </p>
            </div>
          )}

          {loading && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center',
            }}>
              <Sparkles size={32} color="var(--accent-blue)" style={{ animation: 'pulse-glow 1.5s infinite' }} />
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.8rem' }}>
                Analyzing JD and ranking {'>'}400 candidates...
              </p>
            </div>
          )}

          {candidates.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Users size={18} color="var(--accent-green)" />
                Top {candidates.length} Candidates
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {candidates.map((c) => (
                  <CandidateCard key={c.candidate_id} candidate={c} jdProfile={jdProfile!} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
