import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { practiceAreaCompletion, practiceAreaScore } from '../scoring';
import { SCORE_COLORS } from '../types';
import { Search, Layers } from 'lucide-react';

interface PaletteEntry {
  id: string;
  label: string;
  breadcrumb: string;
  path: string;
  completionPct: number;
  score: number | null;
}

function fuzzyMatch(query: string, text: string): boolean {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.includes(q)) return true;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { data } = useStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const entries = useMemo(() => {
    if (!data) return [];
    const result: PaletteEntry[] = [];

    for (const group of data.category_groups) {
      for (const pa of group.practice_areas) {
        const paPct = Math.round(practiceAreaCompletion(pa) * 100);
        const paScore = practiceAreaScore(pa);
        result.push({
          id: pa.id,
          label: pa.name,
          breadcrumb: group.name,
          path: `/practice-area/${pa.id}`,
          completionPct: paPct,
          score: paScore,
        });
        for (const ca of pa.capability_areas) {
          const total = ca.items.length;
          const scored = ca.items.filter((i) => i.score !== null || i.na).length;
          const cPct = total > 0 ? Math.round((scored / total) * 100) : 0;
          const caItems = ca.items.filter((i) => i.score !== null && !i.na);
          const caScore = caItems.length > 0
            ? caItems.reduce((sum, i) => sum + (i.score as number), 0) / caItems.length
            : null;
          result.push({
            id: ca.id,
            label: ca.name,
            breadcrumb: `${group.name} → ${pa.name}`,
            path: `/practice-area/${pa.id}/${ca.id}`,
            completionPct: cPct,
            score: caScore,
          });
        }
      }
    }

    if (data.svc_enabled && data.svc_extension) {
      for (const section of data.svc_extension.sections) {
        for (const ca of section.capability_areas) {
          const total = ca.items.length;
          const scored = ca.items.filter((i) => i.score !== null || i.na).length;
          const cPct = total > 0 ? Math.round((scored / total) * 100) : 0;
          const caItems = ca.items.filter((i) => i.score !== null && !i.na);
          const caScore = caItems.length > 0
            ? caItems.reduce((sum, i) => sum + (i.score as number), 0) / caItems.length
            : null;
          result.push({
            id: ca.id,
            label: ca.name,
            breadcrumb: `CMMI-SVC → ${section.name}`,
            path: `/svc/${section.id}/${ca.id}`,
            completionPct: cPct,
            score: caScore,
          });
        }
      }
    }

    return result;
  }, [data]);

  const filtered = useMemo(() => {
    if (!query.trim()) return entries;
    return entries.filter((e) => fuzzyMatch(query, e.label) || fuzzyMatch(query, e.breadcrumb));
  }, [entries, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, open]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      navigate(filtered[selectedIndex].path);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-surface-dark border border-border rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <Search size={16} className="text-text-tertiary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search practice areas, capability areas..."
            className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-surface-elevated text-text-tertiary font-mono">esc</kbd>
        </div>
        <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-text-tertiary">No results found</div>
          )}
          {filtered.map((entry, i) => (
            <button
              key={entry.path}
              onClick={() => { navigate(entry.path); onClose(); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                i === selectedIndex ? 'bg-accent/12' : 'hover:bg-surface-elevated/50'
              }`}
            >
              <Layers size={15} className="text-text-tertiary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-text-primary truncate">{entry.label}</div>
                <div className="text-[10px] text-text-tertiary truncate">{entry.breadcrumb}</div>
              </div>
              {entry.score !== null && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                  style={{ color: SCORE_COLORS[Math.round(entry.score)] ?? '#888' }}
                >
                  {entry.score.toFixed(1)}
                </span>
              )}
              <span className="text-[10px] text-text-tertiary font-mono shrink-0">{entry.completionPct}%</span>
            </button>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-border-subtle flex items-center gap-4 text-[10px] text-text-tertiary">
          <span><kbd className="px-1 py-0.5 rounded bg-surface-elevated font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="px-1 py-0.5 rounded bg-surface-elevated font-mono">↵</kbd> open</span>
          <span><kbd className="px-1 py-0.5 rounded bg-surface-elevated font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}
