import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import Sidebar from './components/Sidebar';
import StatsFooter from './components/StatsFooter';
import { CommandPalette } from './components/CommandPalette';
import ClientInfo from './pages/ClientInfo';
import Dashboard from './pages/Dashboard';
import PracticeAreaSummary from './pages/PracticeAreaSummary';
import CapabilityAreaPage from './pages/CapabilityArea';
import SvcSummary from './pages/SvcSummary';
import SvcSection from './pages/SvcSection';
import Export from './pages/Export';
import { SettingsPage } from './pages/Settings';
import { HelpPage } from './pages/Help';
import { useNextUnscored } from './hooks/useNextUnscored';

function AppContent() {
  const { loading } = useStore();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const navigate = useNavigate();
  const nextUnscored = useNextUnscored();

  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    // Cmd/Ctrl+K → toggle command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setPaletteOpen((prev) => !prev);
    }
    // Cmd/Ctrl+Right → jump to next unscored
    if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
      e.preventDefault();
      if (nextUnscored) {
        navigate(nextUnscored.path);
      }
    }
  }, [nextUnscored, navigate]);

  useEffect(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

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
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Routes>
        </div>
        <StatsFooter />
      </main>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
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
