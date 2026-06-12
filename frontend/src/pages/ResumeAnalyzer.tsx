import { useState, useEffect } from 'react';
import { uploadResume, analyzeResume, getAvailableRoles } from '../api/client';
import ResumeGapChart from '../components/ResumeGapChart';
import { Upload, Target, BookOpen, Briefcase, DollarSign, TrendingUp } from 'lucide-react';

export default function ResumeAnalyzer() {
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState('ML Engineer');
  const [resumeText, setResumeText] = useState('');
  const [extractedSkills, setExtractedSkills] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAvailableRoles().then(r => setRoles(r.data.roles || [])).catch(() => {});
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const res = await uploadResume(file);
      setExtractedSkills(res.data.extracted_skills || []);
      // Build resume text from extracted info for analysis
      setResumeText(res.data.extracted_skills?.join(', ') || '');
    } catch { alert('Failed to parse resume'); }
    setLoading(false);
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) { alert('Please upload a resume or paste text first.'); return; }
    setLoading(true);
    try {
      const res = await analyzeResume(resumeText, selectedRole);
      setAnalysis(res.data);
    } catch { alert('Analysis failed'); }
    setLoading(false);
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', color: 'var(--text-primary)',
    fontSize: '0.85rem', outline: 'none', width: '100%',
  };
  const btnStyle: React.CSSProperties = {
    background: 'var(--gradient-primary)', color: 'white', border: 'none',
    borderRadius: 'var(--radius-sm)', padding: '0.7rem 1.5rem', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Resume Analyzer</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Upload your resume, choose a target role, and discover your skill gaps with a personalized learning roadmap.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Upload size={18} /> Upload Resume</h3>
            <label style={{ ...btnStyle, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', justifyContent: 'center', cursor: 'pointer' }}>
              Choose PDF, DOCX, or TXT
              <input type="file" accept=".pdf,.docx,.txt" onChange={handleUpload} hidden />
            </label>
            {extractedSkills.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Extracted skills ({extractedSkills.length}):</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {extractedSkills.map((s, i) => (
                    <span key={i} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: 'rgba(52,211,153,0.12)', borderRadius: '99px', color: 'var(--accent-green)' }}>{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Or paste resume text</h3>
            <textarea
              style={{ ...inputStyle, minHeight: '120px', resize: 'vertical', fontFamily: 'inherit' }}
              placeholder="Paste your resume content here..."
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
            />
          </div>

          {}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
            <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Target size={18} /> Target Role</h3>
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <button style={btnStyle} onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Analyzing...' : '🔍 Analyze Skill Gap'}
          </button>
        </div>

        {}
        <div>
          {analysis ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <ResumeGapChart matched={analysis.matched_skills} missing={analysis.missing_skills} matchPercentage={analysis.match_percentage} />

              {analysis.market_insights && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                  <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-green)' }}>
                    <TrendingUp size={18} /> Target Role Market Insights
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <DollarSign size={14} /> Avg Annual Salary
                      </p>
                      <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--text-primary)', margin: 0 }}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(analysis.market_insights.avg_salary)}
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Briefcase size={14} /> Top Hiring Companies
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {analysis.market_insights.top_companies?.map((c: string, idx: number) => (
                          <span key={idx} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', color: 'var(--text-primary)' }}>{c}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Top Industries</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {analysis.market_insights.top_industries?.map((ind: string, idx: number) => (
                          <span key={idx} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: 'rgba(56,189,248,0.12)', borderRadius: '4px', color: 'var(--accent-cyan)' }}>{ind}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Experience Distribution</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {Object.entries(analysis.market_insights.experience_dist || {}).map(([level, pct]: any, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{level}</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pct}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {analysis.learning_roadmap?.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                  <h3 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)' }}><BookOpen size={18} /> Learning Roadmap</h3>
                  {analysis.learning_roadmap.map((phase: any, i: number) => (
                    <div key={i} style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.85rem', color: phase.priority === 'high' ? 'var(--accent-rose)' : phase.priority === 'medium' ? 'var(--accent-amber)' : 'var(--accent-green)', marginBottom: '0.3rem' }}>
                        Phase {phase.phase}: {phase.title}
                      </h4>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{phase.description}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                        {phase.skills?.map((s: string, j: number) => (
                          <span key={j} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: 'rgba(99,102,241,0.12)', borderRadius: '99px', color: 'var(--accent-blue)' }}>{s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '3rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload a resume and click "Analyze" to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
