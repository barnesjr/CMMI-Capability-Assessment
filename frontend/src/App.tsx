import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import Sidebar from './components/Sidebar';
import ClientInfo from './pages/ClientInfo';
import Dashboard from './pages/Dashboard';
import PracticeAreaSummary from './pages/PracticeAreaSummary';
import CapabilityAreaPage from './pages/CapabilityArea';

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
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<ClientInfo />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/practice-area/:entityId" element={<PracticeAreaSummary />} />
          <Route path="/practice-area/:entityId/:areaId" element={<CapabilityAreaPage />} />
        </Routes>
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
