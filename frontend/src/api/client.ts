import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});


export const getDashboardStats = () => client.get('/api/dashboard');
export const getHealth = () => client.get('/api/health');


export const getJobs = (params?: Record<string, string | number>) =>
  client.get('/api/jobs', { params });
export const uploadJobs = (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return client.post('/api/jobs/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};


export const getTopSkills = (n = 30) =>
  client.get('/api/skills/top', { params: { n } });
export const searchSkills = (q: string) =>
  client.get('/api/skills/search', { params: { q } });


export const getClusters = () => client.get('/api/clusters');
export const getCluster = (id: number) => client.get(`/api/clusters/${id}`);


export const getTrends = () => client.get('/api/trends');
export const getEmergingSkills = () => client.get('/api/trends/emerging');
export const getDecliningSkills = () => client.get('/api/trends/declining');
export const getMonthlyData = () => client.get('/api/trends/monthly');


export const uploadResume = (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return client.post('/api/resume/upload', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const analyzeResume = (resume_text: string, target_role: string) =>
  client.post('/api/resume/analyze', { resume_text, target_role });
export const getAvailableRoles = () => client.get('/api/resume/roles');


export const getGraph = () => client.get('/api/graph');


export const getForecast = () => client.get('/api/forecast');
export const getForecastEmerging = () => client.get('/api/forecast/emerging');


// ── Recruiter Intelligence ──
export const matchRank = (jd_text: string, top_n = 20) =>
  client.post('/api/match/rank', { jd_text, top_n });

export const getCandidates = (page = 1, limit = 50) =>
  client.get('/api/candidates', { params: { page, limit } });

export const getCandidate = (candidateId: string) =>
  client.get(`/api/candidates/${candidateId}`);

export const getPoolAnalytics = () => client.get('/api/pool/analytics');

export const getCandidateSkillForecast = (candidateId: string) =>
  client.get(`/api/candidates/${candidateId}/skill-forecast`);

export const analyzeResumeV2 = (file: File, jd_text: string) => {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('jd_text', jd_text);
  return client.post('/api/resume/analyze-v2', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export default client;
