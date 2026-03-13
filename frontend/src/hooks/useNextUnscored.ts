import { useMemo } from 'react';
import { useStore } from '../store';

export function useNextUnscored(): { path: string } | null {
  const { data } = useStore();

  return useMemo(() => {
    if (!data) return null;

    // Search base assessment: category groups → practice areas → capability areas → items
    for (const group of data.category_groups) {
      for (const pa of group.practice_areas) {
        for (const ca of pa.capability_areas) {
          for (const item of ca.items) {
            if (item.score === null && !item.na) {
              return { path: `/practice-area/${pa.id}/${ca.id}` };
            }
          }
        }
      }
    }

    // Search SVC extension if enabled
    if (data.svc_enabled && data.svc_extension) {
      for (const section of data.svc_extension.sections) {
        for (const ca of section.capability_areas) {
          for (const item of ca.items) {
            if (item.score === null && !item.na) {
              return { path: `/svc/${section.id}/${ca.id}` };
            }
          }
        }
      }
    }

    return null;
  }, [data]);
}
