import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import Sidebar from './components/Sidebar';
import StatsFooter from './components/StatsFooter';
import ClientInfo from './pages/ClientInfo';
import Dashboard from './pages/Dashboard';
import PracticeAreaSummary from './pages/PracticeAreaSummary';
import CapabilityAreaPage from './pages/CapabilityArea';
import SvcSummary from './pages/SvcSummary';
import SvcSection from './pages/SvcSection';
import Export from './pages/Export';

function AppContent() {
  const { loading } = useStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <img src="/logo.png" alt="Peraton" className="w-[300px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg flex">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<ClientInfo />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/practice-area/:entityId" element={<PracticeAreaSummary />} />
            <Route path="/practice-area/:entityId/:areaId" element={<CapabilityAreaPage />} />
            <Route path="/svc" element={<SvcSummary />} />
            <Route path="/svc/:sectionId" element={<SvcSection />} />
            <Route path="/svc/:sectionId/:areaId" element={<SvcSection />} />
            <Route path="/export" element={<Export />} />
          </Routes>
        </div>
        <StatsFooter />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </BrowserRouter>
  );
}
