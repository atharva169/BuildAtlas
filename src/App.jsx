import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import FloorPlan from './pages/FloorPlan';
import CostEstimate from './pages/CostEstimate';
import Schedule from './pages/Schedule';
import Resources from './pages/Resources';
import RiskRegister from './pages/RiskRegister';
import Sandbox from './pages/Sandbox';
import ReversePlan from './pages/ReversePlan';
import DelayCascade from './pages/DelayCascade';
import MaterialSwap from './pages/MaterialSwap';
import Copilot from './pages/Copilot';
import { useProjectStore } from './store/projectStore';

function App() {
  const isAnalyzing = useProjectStore(s => s.isAnalyzing);

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          {isAnalyzing && (
            <div className="loading-overlay">
              <div className="spinner" />
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                Analyzing project parameters...
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Running 6 engines: Floor Plan → Cost → Schedule → Resources → Risk → Compliance
              </p>
            </div>
          )}
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/floorplan" element={<FloorPlan />} />
            <Route path="/cost" element={<CostEstimate />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/risk" element={<RiskRegister />} />
            <Route path="/sandbox" element={<Sandbox />} />
            <Route path="/reverse" element={<ReversePlan />} />
            <Route path="/cascade" element={<DelayCascade />} />
            <Route path="/materials" element={<MaterialSwap />} />
            <Route path="/copilot" element={<Copilot />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
