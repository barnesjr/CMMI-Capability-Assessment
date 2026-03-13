import { createContext, useContext, useCallback, useRef, useEffect, useState, type ReactNode } from 'react';
import type { AssessmentData, Framework } from './types';
import { fetchAssessment, saveAssessment, fetchFramework } from './api';

interface StoreContextType {
  data: AssessmentData | null;
  framework: Framework | null;
  loading: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  updateData: (updater: (draft: AssessmentData) => void) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AssessmentData | null>(null);
  const [framework, setFramework] = useState<Framework | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestData = useRef<AssessmentData | null>(null);

  useEffect(() => {
    Promise.all([fetchAssessment(), fetchFramework()])
      .then(([assessmentData, frameworkData]) => {
        setData(assessmentData);
        latestData.current = assessmentData;
        setFramework(frameworkData);
      })
      .catch((err) => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  }, []);

  const debouncedSave = useCallback((newData: AssessmentData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await saveAssessment(newData);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 300);
  }, []);

  const updateData = useCallback(
    (updater: (draft: AssessmentData) => void) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = structuredClone(prev);
        updater(next);
        next.assessment_metadata.last_modified = new Date().toISOString();
        latestData.current = next;
        debouncedSave(next);
        return next;
      });
    },
    [debouncedSave]
  );

  return (
    <StoreContext.Provider value={{ data, framework, loading, saveStatus, updateData }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
