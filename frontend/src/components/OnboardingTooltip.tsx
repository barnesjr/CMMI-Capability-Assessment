import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const STORAGE_KEY = 'cmmi-onboarding-dismissed';

function getDismissed(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch { /* ignore */ }
  return new Set();
}

function dismissTooltip(id: string) {
  const dismissed = getDismissed();
  dismissed.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...dismissed]));
}

interface OnboardingTooltipProps {
  id: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

export function OnboardingTooltip({ id, children, position = 'bottom' }: OnboardingTooltipProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = getDismissed();
    if (!dismissed.has(id)) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [id]);

  if (!visible) return null;

  function handleDismiss() {
    setVisible(false);
    dismissTooltip(id);
  }

  return (
    <div
      className={`absolute z-40 ${
        position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
      } left-0 right-0 animate-fade-in`}
    >
      <div className="bg-accent/95 text-page-bg text-xs rounded-lg px-3 py-2.5 shadow-lg max-w-sm mx-auto flex items-start gap-2">
        <div className="flex-1 leading-relaxed font-medium">{children}</div>
        <button
          onClick={handleDismiss}
          className="shrink-0 opacity-70 hover:opacity-100 transition-opacity mt-0.5"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

export function useTooltipDismissed(id: string): boolean {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(getDismissed().has(id));
  }, [id]);
  return dismissed;
}
