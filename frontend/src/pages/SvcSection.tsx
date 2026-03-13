import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store';
import { AssessmentItemCard } from '../components/AssessmentItemCard';
import { Breadcrumb } from '../components/Breadcrumb';
import { svcSectionScore, svcSectionCompletion, capabilityAreaScore } from '../scoring';
import { SCORE_LABELS, getMaturityBand } from '../types';
import type { AssessmentItem, FrameworkCapabilityArea } from '../types';

export default function SvcSection() {
  const { sectionId, areaId } = useParams();
  const { data, framework, updateData } = useStore();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Reset on navigation
  useEffect(() => {
    setFocusedIndex(-1);
  }, [sectionId, areaId]);

  if (!data || !framework) return null;

  if (!data.svc_enabled || !data.svc_extension) {
    return <div className="p-8 text-text-tertiary">CMMI-SVC module is not enabled.</div>;
  }

  const section = data.svc_extension.sections.find((s) => s.id === sectionId);
  if (!section) return <div className="p-8 text-text-tertiary">Section not found.</div>;

  const fwSection = framework.svc_extension?.sections.find((s) => s.id === sectionId);

  // Section summary view (no areaId)
  if (!areaId) {
    const score = svcSectionScore(section);
    const completionFrac = svcSectionCompletion(section);
    const totalCount = section.capability_areas.flatMap((ca) => ca.items).length;
    const scoredCount = section.capability_areas
      .flatMap((ca) => ca.items)
      .filter((i) => i.score !== null || i.na).length;
    const pct = Math.round(completionFrac * 100);

    return (
      <div className="p-8">
        <Breadcrumb
          items={[
            { label: 'CMMI-SVC', path: '/svc' },
            { label: section.name },
          ]}
        />

        <div className="mb-8">
          <p className="text-[11px] text-accent-bright mb-2 uppercase font-semibold tracking-widest">
            CMMI-SVC
          </p>
          <h2 className="text-2xl font-bold text-text-primary">{section.name}</h2>
          <div className="flex items-center gap-5 mt-3">
            <span className="text-sm text-text-secondary">
              {scoredCount} / {totalCount} items ({pct}%)
            </span>
            {score !== null && (
              <span className="text-sm font-medium" style={{ color: getMaturityBand(score).color }}>
                Score: {score.toFixed(2)} — {getMaturityBand(score).label}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-3">
          {section.capability_areas.map((ca) => {
            const caScore = capabilityAreaScore(ca);
            const caTotal = ca.items.length;
            const caScored = ca.items.filter((i) => i.score !== null || i.na).length;
            const caPct = caTotal > 0 ? Math.round((caScored / caTotal) * 100) : 0;
            return (
              <Link
                key={ca.id}
                to={`/svc/${sectionId}/${ca.id}`}
                className="block p-5 bg-surface-medium border border-border rounded-xl hover:border-accent/40 hover:bg-surface-medium/80 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">{ca.name}</h3>
                  {caScore !== null && (
                    <span
                      className="text-sm font-medium px-2.5 py-1 rounded-lg"
                      style={{
                        color: getMaturityBand(caScore).color,
                        backgroundColor: getMaturityBand(caScore).color + '12',
                      }}
                    >
                      {caScore.toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor:
                          caScore !== null ? getMaturityBand(caScore).color : '#1BA1E2',
                        width: `${caPct}%`,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-text-tertiary font-mono">
                    {caScored}/{caTotal}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  // Capability area detail view (with areaId)
  const area = section.capability_areas.find((ca) => ca.id === areaId);
  if (!area) return <div className="p-8 text-text-tertiary">Capability area not found.</div>;

  const frameworkArea: FrameworkCapabilityArea | undefined = fwSection?.capability_areas.find(
    (ca) => ca.id === areaId,
  );
  const score = capabilityAreaScore(area);
  const totalCount = area.items.length;
  const scoredCount = area.items.filter((i) => i.score !== null || i.na).length;
  const pct = totalCount > 0 ? Math.round((scoredCount / totalCount) * 100) : 0;

  function handleItemUpdate(itemId: string, updates: Partial<AssessmentItem>) {
    updateData((draft) => {
      if (!draft.svc_extension) return;
      for (const s of draft.svc_extension.sections) {
        if (s.id === sectionId) {
          for (const ca of s.capability_areas) {
            if (ca.id === areaId) {
              const item = ca.items.find((i) => i.id === itemId);
              if (item) Object.assign(item, updates);
              return;
            }
          }
        }
      }
    });
  }

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!area) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const items = area.items;
      const fi = focusedIndex;

      switch (e.key) {
        case 'ArrowDown':
        case 'j':
          e.preventDefault();
          setFocusedIndex((i) => {
            const next = Math.min(i + 1, items.length - 1);
            itemRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return next;
          });
          break;
        case 'ArrowUp':
        case 'k':
          e.preventDefault();
          setFocusedIndex((i) => {
            const next = Math.max(i - 1, 0);
            itemRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return next;
          });
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
          if (fi >= 0 && fi < items.length) {
            e.preventDefault();
            handleItemUpdate(items[fi].id, { score: parseInt(e.key), na: false });
          }
          break;
        case 'n':
        case 'N':
          if (fi >= 0 && fi < items.length) {
            e.preventDefault();
            const item = items[fi];
            handleItemUpdate(item.id, {
              score: null,
              na: !item.na,
              na_justification: !item.na ? (item.na_justification ?? '') : null,
            });
          }
          break;
        case 'h':
        case 'H':
          if (fi >= 0 && fi < items.length) {
            e.preventDefault();
            handleItemUpdate(items[fi].id, { confidence: 'High' });
          }
          break;
        case 'm':
        case 'M':
          if (fi >= 0 && fi < items.length) {
            e.preventDefault();
            handleItemUpdate(items[fi].id, { confidence: 'Medium' });
          }
          break;
        case 'l':
        case 'L':
          if (fi >= 0 && fi < items.length) {
            e.preventDefault();
            handleItemUpdate(items[fi].id, { confidence: 'Low' });
          }
          break;
        case 'Escape':
          setFocusedIndex(-1);
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [area, focusedIndex],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="p-8">
      <Breadcrumb
        items={[
          { label: 'CMMI-SVC', path: '/svc' },
          { label: section.name, path: `/svc/${sectionId}` },
          { label: area.name },
        ]}
      />

      <div className="mb-8">
        <p className="text-[11px] text-accent-bright mb-2 uppercase font-semibold tracking-widest">
          {section.name}
        </p>
        <h2 className="text-2xl font-bold text-text-primary">{area.name}</h2>
        <div className="flex items-center gap-5 mt-3">
          <span className="text-sm text-text-secondary">
            {scoredCount} / {totalCount} items scored ({pct}%)
          </span>
          {score !== null && (
            <span className="text-sm font-medium" style={{ color: getMaturityBand(score).color }}>
              Avg: {score.toFixed(2)} ({SCORE_LABELS[Math.round(score)] ?? ''})
            </span>
          )}
        </div>
        <p className="text-xs text-text-secondary/50 mt-2">
          Use <strong>1-5</strong> to score, <strong>Up/Down</strong> to navigate,{' '}
          <strong>H/M/L</strong> for confidence, <strong>N</strong> to toggle N/A
        </p>
      </div>

      <div className="space-y-3">
        {area.items.map((item, i) => {
          const fwItem = frameworkArea?.items.find((fi) => fi.id === item.id);
          return (
            <div
              key={item.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
            >
              <AssessmentItemCard
                item={item}
                frameworkItem={fwItem}
                onUpdate={(updates) => handleItemUpdate(item.id, updates)}
                focused={focusedIndex === i}
                onFocus={() => setFocusedIndex(i)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
