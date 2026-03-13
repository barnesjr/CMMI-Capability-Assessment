import { useStore } from '../store';
import { overallCompletion, weightedCompositeScore } from '../scoring';
import { getMaturityBand } from '../types';

export default function StatsFooter() {
  const { data, saveStatus } = useStore();

  if (!data) return null;

  const { scored: scoredCount, total: totalCount } = overallCompletion(data);
  const completionPct = totalCount > 0 ? Math.round((scoredCount / totalCount) * 100) : 0;

  const composite = weightedCompositeScore(data);
  const band = composite !== null ? getMaturityBand(composite) : null;

  const lastSaved = data.assessment_metadata.last_modified
    ? new Date(data.assessment_metadata.last_modified).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--';

  return (
    <footer className="h-10 bg-surface-dark border-t border-border-gray/20 flex items-center px-5 gap-6 shrink-0 text-[11px]">
      {/* Left: progress bar + item count */}
      <div className="flex items-center gap-2.5">
        <div className="w-24 h-1 bg-surface-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
        <span className="text-text-secondary font-medium">{completionPct}%</span>
        <span className="text-border-gray">{scoredCount} of {totalCount} items scored</span>
      </div>

      <div className="flex-1" />

      {/* Center: composite score */}
      {composite !== null ? (
        <div className="flex items-center gap-1.5">
          <span className="text-border-gray">Composite:</span>
          <span className="font-semibold" style={{ color: band!.color }}>
            {composite.toFixed(2)}
          </span>
          <span className="text-border-gray text-[10px]">({band!.label})</span>
        </div>
      ) : (
        <div className="flex items-center gap-1.5">
          <span className="text-border-gray">Composite:</span>
          <span className="text-border-gray">--</span>
        </div>
      )}

      <div className="flex-1" />

      {/* Right: save status */}
      <div className="flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            saveStatus === 'saving'
              ? 'bg-yellow-400'
              : saveStatus === 'saved'
              ? 'bg-green-400'
              : saveStatus === 'error'
              ? 'bg-red-400'
              : 'bg-border-gray'
          }`}
        />
        <span className="text-border-gray">
          {saveStatus === 'saving'
            ? 'Saving…'
            : saveStatus === 'error'
            ? 'Save error'
            : `Saved ${lastSaved}`}
        </span>
      </div>
    </footer>
  );
}
