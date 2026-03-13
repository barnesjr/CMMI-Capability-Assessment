interface ConfidenceWidgetProps {
  confidence: string | null;
  onChange: (confidence: string | null) => void;
}

const CONFIDENCE_DESCRIPTIONS: Record<string, string> = {
  High: 'Multiple independent evidence sources',
  Medium: 'Primary sources or limited corroboration',
  Low: 'Single source or incomplete evidence',
};

const CONFIDENCE_SHORT: Record<string, string> = {
  High: 'H',
  Medium: 'M',
  Low: 'L',
};

export function ConfidenceWidget({ confidence, onChange }: ConfidenceWidgetProps) {
  return (
    <div className="flex items-center gap-1">
      {(['High', 'Medium', 'Low'] as const).map((level) => (
        <button
          key={level}
          onClick={() => onChange(confidence === level ? null : level)}
          title={`${level}: ${CONFIDENCE_DESCRIPTIONS[level]}`}
          className={`w-8 h-8 text-[10px] font-semibold rounded-lg transition-all duration-150 border ${
            confidence === level
              ? 'bg-accent text-page-bg border-transparent shadow-lg'
              : 'border-border-gray/50 text-text-secondary/60 hover:border-border-gray hover:text-text-secondary'
          }`}
          style={
            confidence === level
              ? { boxShadow: '0 0 12px rgba(27, 161, 226, 0.3)' }
              : undefined
          }
        >
          {CONFIDENCE_SHORT[level]}
        </button>
      ))}
    </div>
  );
}
