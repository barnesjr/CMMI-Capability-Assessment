import { SCORE_LABELS, SCORE_COLORS } from '../types';

interface ScoringWidgetProps {
  score: number | null;
  na: boolean;
  naJustification: string | null;
  onScoreChange: (score: number | null) => void;
  onNaChange: (na: boolean) => void;
  onNaJustificationChange: (text: string) => void;
  disabled?: boolean;
}

const SCORE_DESCRIPTIONS: Record<number, string> = {
  1: 'Ad-hoc, unpredictable processes',
  2: 'Managed at the project level',
  3: 'Defined, standardized organizational processes',
  4: 'Quantitatively measured and controlled',
  5: 'Focus on continuous improvement',
};

export function ScoringWidget({
  score,
  na,
  naJustification,
  onScoreChange,
  onNaChange,
  onNaJustificationChange,
  disabled = false,
}: ScoringWidgetProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <button
            key={level}
            onClick={() => {
              if (!disabled && !na) onScoreChange(level);
            }}
            disabled={disabled || na}
            title={`${SCORE_LABELS[level]}: ${SCORE_DESCRIPTIONS[level]}`}
            className={`w-8 h-8 text-xs font-semibold rounded-lg transition-all duration-150 border ${
              score === level && !na
                ? 'text-white border-transparent shadow-lg'
                : na || disabled
                  ? 'border-border-gray/30 text-border-gray/40 cursor-not-allowed'
                  : 'border-border-gray/50 text-text-secondary/60 hover:border-border-gray hover:text-text-secondary'
            }`}
            style={
              score === level && !na
                ? { backgroundColor: SCORE_COLORS[level], boxShadow: `0 0 12px ${SCORE_COLORS[level]}40` }
                : undefined
            }
          >
            {level}
          </button>
        ))}
        <label
          title="Not Applicable — requires justification"
          className={`w-8 h-8 text-[10px] font-semibold rounded-lg transition-all duration-150 border flex items-center justify-center cursor-pointer ${
            na
              ? 'bg-border-gray text-page-bg border-transparent'
              : 'border-border-gray/50 text-text-secondary/60 hover:border-border-gray hover:text-text-secondary'
          } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <input
            type="checkbox"
            className="sr-only"
            checked={na}
            disabled={disabled}
            onChange={(e) => {
              onNaChange(e.target.checked);
              if (e.target.checked) {
                onScoreChange(null);
              }
            }}
          />
          N/A
        </label>
      </div>
      {na && (
        <textarea
          value={naJustification ?? ''}
          onChange={(e) => onNaJustificationChange(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-xs bg-surface-elevated border border-amber-500/30 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-y"
          placeholder="Explain why this item is not applicable..."
        />
      )}
    </div>
  );
}
