import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useStore } from '../store';
import { svcSectionScore, svcSectionCompletion } from '../scoring';
import { getMaturityBand } from '../types';

export default function SvcSummary() {
  const { data } = useStore();
  if (!data) return null;

  if (!data.svc_enabled || !data.svc_extension) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-3">CMMI-SVC Module</h2>
        <p className="text-sm text-text-tertiary mb-6">
          The CMMI-SVC extension adds service-specific assessment items across 6 sections.
          Enable it in Settings or via the sidebar toggle to begin.
        </p>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-bright text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Settings size={16} />
          Go to Settings
        </Link>
      </div>
    );
  }

  const sections = data.svc_extension.sections;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary">CMMI-SVC Extension</h2>
        <p className="text-sm text-text-tertiary mt-1">
          Service-specific capability assessment across 6 sections.
        </p>
      </div>

      <div className="grid gap-3">
        {sections.map((section) => {
          const score = svcSectionScore(section);
          const completionFrac = svcSectionCompletion(section);
          const totalCount = section.capability_areas.flatMap((ca) => ca.items).length;
          const scoredCount = section.capability_areas
            .flatMap((ca) => ca.items)
            .filter((i) => i.score !== null || i.na).length;
          const pct = Math.round(completionFrac * 100);

          return (
            <Link
              key={section.id}
              to={`/svc/${section.id}`}
              className="block p-5 bg-surface-medium border border-border rounded-xl hover:border-accent/40 hover:bg-surface-medium/80 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">{section.name}</h3>
                {score !== null && (
                  <span
                    className="text-sm font-medium px-2.5 py-1 rounded-lg"
                    style={{
                      color: getMaturityBand(score).color,
                      backgroundColor: getMaturityBand(score).color + '12',
                    }}
                  >
                    {score.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1 h-1 bg-surface-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      backgroundColor: score !== null ? getMaturityBand(score).color : '#1BA1E2',
                      width: `${pct}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] text-text-tertiary font-mono">
                  {scoredCount}/{totalCount}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
