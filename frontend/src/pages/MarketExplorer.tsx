import { useEffect, useState } from 'react';
import { getJobs, getTopSkills, uploadJobs } from '../api/client';
import SkillBarChart from '../components/SkillBarChart';
import { Search, Upload } from 'lucide-react';

export default function MarketExplorer() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [skills, setSkills] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    getJobs({ limit: 30 }).then(r => { setJobs(r.data.jobs || []); setTotal(r.data.total || 0); }).catch(() => {});
    getTopSkills(20).then(r => setSkills(r.data.skills || [])).catch(() => {});
  }, []);

  const handleSearch = () => {
    const params: Record<string, any> = { limit: 30 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    getJobs(params).then(r => { setJobs(r.data.jobs || []); setTotal(r.data.total || 0); }).catch(() => {});
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadJobs(file);
      alert('Dataset uploaded successfully! Run the ML pipeline to process it.');
    } catch { alert('Upload failed'); }
  };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', color: 'var(--text-primary)',
    fontSize: '0.85rem', outline: 'none', flex: 1, minWidth: '180px',
  };
  const btnStyle: React.CSSProperties = {
    background: 'var(--accent-blue)', color: 'white', border: 'none',
    borderRadius: 'var(--radius-sm)', padding: '0.6rem 1.2rem', cursor: 'pointer',
    fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Market Explorer</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Browse {total} job postings, search by keyword, and view top skills.
      </p>

      {}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <input style={inputStyle} placeholder="Search job descriptions..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <input style={{ ...inputStyle, maxWidth: '200px' }} placeholder="Filter by role..." value={roleFilter} onChange={e => setRoleFilter(e.target.value)} />
        <button style={btnStyle} onClick={handleSearch}><Search size={16} /> Search</button>
        <label style={{ ...btnStyle, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
          <Upload size={16} /> Upload
          <input type="file" accept=".csv,.json,.xlsx" onChange={handleUpload} hidden />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem', overflow: 'auto', maxHeight: '600px' }}>
          <h3 style={{ marginBottom: '1rem' }}>Job Postings ({total})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                {['Title', 'Company', 'Location', 'Experience'].map(h => (
                  <th key={h} style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(99,102,241,0.06)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                  <td style={{ padding: '0.5rem', color: 'var(--accent-blue)', fontWeight: 500 }}>{job.job_title}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{job.company}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>{job.location}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--text-muted)' }}>{job.experience}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {}
        <SkillBarChart data={skills} title="Top Skills by Frequency" />
      </div>
    </div>
  );
}
