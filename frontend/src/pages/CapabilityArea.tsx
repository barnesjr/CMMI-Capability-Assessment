import { useParams } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store';
import { Breadcrumb } from '../components/Breadcrumb';
import { AssessmentItemCard } from '../components/AssessmentItemCard';
import { capabilityAreaScore } from '../scoring';
import { SCORE_LABELS, getMaturityBand } from '../types';
import type { AssessmentItem, CapabilityArea, FrameworkCapabilityArea } from '../types';

export default function CapabilityAreaPage() {
  const { entityId, areaId } = useParams();
  const { data, framework, updateData } = useStore();
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  let area: CapabilityArea | undefined;
  let frameworkArea: FrameworkCapabilityArea | undefined;
  let practiceAreaName = '';
  let groupName = '';

  if (data && framework) {
    for (const group of data.category_groups) {
      const pa = group.practice_areas.find((p) => p.id === entityId);
      if (pa) {
        groupName = group.name;
        practiceAreaName = pa.name;
        area = pa.capability_areas.find((ca) => ca.id === areaId);
        // Find framework counterpart
        for (const fwGroup of framework.category_groups) {
          const fwPa = fwGroup.practice_areas.find((p) => p.id === entityId);
          if (fwPa) {
            frameworkArea = fwPa.capability_areas.find((ca) => ca.id === areaId);
            break;
          }
        }
        break;
      }
    }
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

  // Reset focus when navigating to a different area
  useEffect(() => {
    setFocusedIndex(-1);
  }, [entityId, areaId]);

  if (!data || !framework || !area) {
    return <div className="p-8 text-text-secondary">Capability area not found.</div>;
  }

  const score = capabilityAreaScore(area);
  const totalCount = area.items.length;
  const scoredCount = area.items.filter((i) => i.score !== null || i.na).length;
  const pct = totalCount > 0 ? Math.round((scoredCount / totalCount) * 100) : 0;

  function handleItemUpdate(itemId: string, updates: Partial<AssessmentItem>) {
    updateData((draft) => {
      for (const g of draft.category_groups) {
        for (const pa of g.practice_areas) {
          if (pa.id === entityId) {
            for (const ca of pa.capability_areas) {
              if (ca.id === areaId) {
                const item = ca.items.find((i) => i.id === itemId);
                if (item) {
                  Object.assign(item, updates);
                }
              }
            }
          }
        }
      }
    });
  }

  return (
    <div className="p-8">
      <Breadcrumb
        items={[
          { label: groupName, path: '/dashboard' },
          { label: practiceAreaName, path: `/practice-area/${entityId}` },
          { label: area.name },
        ]}
      />

      <div className="mb-8">
        <p className="text-[11px] text-accent-bright mb-2 uppercase font-semibold tracking-widest">{practiceAreaName}</p>
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
          Use <strong>1-5</strong> to score, <strong>Up/Down</strong> to navigate, <strong>H/M/L</strong> for confidence, <strong>N</strong> to toggle N/A
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
