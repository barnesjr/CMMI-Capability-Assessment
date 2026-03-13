import type { AssessmentData, AssessmentItem, CapabilityArea, PracticeArea, CategoryGroup, SvcSection } from './types';

export function averageScore(items: AssessmentItem[]): number | null {
  const scored = items.filter((i) => i.score !== null && !i.na);
  if (scored.length === 0) return null;
  return scored.reduce((sum, i) => sum + (i.score as number), 0) / scored.length;
}

export function capabilityAreaScore(ca: CapabilityArea): number | null {
  return averageScore(ca.items);
}

export function practiceAreaScore(pa: PracticeArea): number | null {
  const allItems = pa.capability_areas.flatMap((ca) => ca.items);
  return averageScore(allItems);
}

export function practiceAreaCompletion(pa: PracticeArea): number {
  const allItems = pa.capability_areas.flatMap((ca) => ca.items);
  if (allItems.length === 0) return 0;
  const answered = allItems.filter((i) => i.score !== null || i.na);
  return answered.length / allItems.length;
}

export function groupScore(group: CategoryGroup): number | null {
  const allItems = group.practice_areas.flatMap((pa) => pa.capability_areas.flatMap((ca) => ca.items));
  return averageScore(allItems);
}

export function groupCompletion(group: CategoryGroup): number {
  const allItems = group.practice_areas.flatMap((pa) => pa.capability_areas.flatMap((ca) => ca.items));
  if (allItems.length === 0) return 0;
  const answered = allItems.filter((i) => i.score !== null || i.na);
  return answered.length / allItems.length;
}

export function svcSectionScore(section: SvcSection): number | null {
  const allItems = section.capability_areas.flatMap((ca) => ca.items);
  return averageScore(allItems);
}

export function svcSectionCompletion(section: SvcSection): number {
  const allItems = section.capability_areas.flatMap((ca) => ca.items);
  if (allItems.length === 0) return 0;
  const answered = allItems.filter((i) => i.score !== null || i.na);
  return answered.length / allItems.length;
}

export function weightedCompositeScore(data: AssessmentData): number | null {
  const weights = data.scoring_config.practice_area_weights;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const group of data.category_groups) {
    for (const pa of group.practice_areas) {
      const score = practiceAreaScore(pa);
      const weight = weights[pa.id] ?? 0;
      if (score !== null) {
        weightedSum += score * weight;
        totalWeight += weight;
      }
    }
  }
  if (totalWeight === 0) return null;
  return weightedSum / totalWeight;
}

export function overallCompletion(data: AssessmentData): { scored: number; total: number } {
  const baseItems = data.category_groups.flatMap((g) =>
    g.practice_areas.flatMap((pa) => pa.capability_areas.flatMap((ca) => ca.items))
  );
  const svcItems =
    data.svc_enabled && data.svc_extension
      ? data.svc_extension.sections.flatMap((s) => s.capability_areas.flatMap((ca) => ca.items))
      : [];
  const allItems = [...baseItems, ...svcItems];
  const scored = allItems.filter((i) => i.score !== null || i.na).length;
  return { scored, total: allItems.length };
}
