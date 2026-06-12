import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MarketExplorer from './pages/MarketExplorer';
import SkillClusters from './pages/SkillClusters';
import TrendExplorer from './pages/TrendExplorer';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import SkillGraphPage from './pages/SkillGraph';
import Forecast from './pages/Forecast';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/market" element={<MarketExplorer />} />
          <Route path="/clusters" element={<SkillClusters />} />
          <Route path="/trends" element={<TrendExplorer />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/graph" element={<SkillGraphPage />} />
          <Route path="/forecast" element={<Forecast />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
