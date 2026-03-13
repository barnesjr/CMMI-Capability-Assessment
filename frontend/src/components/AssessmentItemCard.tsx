import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Plus, X, AlertTriangle, Info } from 'lucide-react';
import { ScoringWidget } from './ScoringWidget';
import { ConfidenceWidget } from './ConfidenceWidget';
import { getItemValidation } from '../validation';
import type { AssessmentItem, EvidenceReference, FrameworkItem } from '../types';

interface AssessmentItemCardProps {
  item: AssessmentItem;
  frameworkItem?: FrameworkItem;
  onUpdate: (updates: Partial<AssessmentItem>) => void;
  focused?: boolean;
  onFocus?: () => void;
}

export function AssessmentItemCard({ item, frameworkItem, onUpdate, focused, onFocus }: AssessmentItemCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showRubric, setShowRubric] = useState(false);

  const issues = useMemo(() => getItemValidation(item), [item]);
  const hasError = issues.some((i) => i.severity === 'error');
  const hasWarning = issues.some((i) => i.severity === 'warning');

  return (
    <div
      className={`border rounded-xl bg-surface-medium transition-colors hover:border-accent/40 ${
        hasError ? 'border-red-500/60' : focused ? 'ring-2 ring-accent/50 border-accent/40' : 'border-border-gray/40'
      }`}
      onClick={onFocus}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 p-5">
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          className="mt-0.5 text-text-secondary/60 hover:text-text-primary transition-colors"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-text-primary leading-relaxed">{item.text}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-text-secondary/50 font-mono">{item.id}</span>
            {hasError && <span className="text-red-400" title="Has validation errors"><AlertTriangle size={11} /></span>}
            {hasWarning && !hasError && <span className="text-amber-400" title="Has warnings"><AlertTriangle size={11} /></span>}
            {!hasError && !hasWarning && issues.length > 0 && <span className="text-blue-400" title="Info"><Info size={11} /></span>}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <ScoringWidget
            score={item.score}
            na={item.na}
            naJustification={item.na_justification}
            onScoreChange={(score) => onUpdate({ score, na: false })}
            onNaChange={(na) => {
              onUpdate({ na, score: na ? null : item.score, na_justification: na ? (item.na_justification ?? '') : null });
              if (na && !expanded) setExpanded(true);
            }}
            onNaJustificationChange={(text) => onUpdate({ na_justification: text })}
          />
          <ConfidenceWidget
            confidence={item.confidence}
            onChange={(confidence) => onUpdate({ confidence })}
          />
        </div>
      </div>

      {/* Validation messages */}
      {issues.filter((i) => i.severity !== 'info').length > 0 && (
        <div className="px-5 pb-3 pl-12 flex flex-wrap gap-2">
          {issues.filter((i) => i.severity !== 'info').map((issue) => (
            <span
              key={issue.rule}
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                issue.severity === 'error'
                  ? 'bg-red-500/15 text-red-400'
                  : 'bg-amber-500/15 text-amber-400'
              }`}
            >
              {issue.message}
            </span>
          ))}
        </div>
      )}

      {/* N/A justification inline (when collapsed) */}
      {item.na && !expanded && (
        <div className="px-5 pb-4 pl-12">
          <label className="block text-[11px] font-medium text-amber-400 mb-1.5">N/A Justification (required)</label>
          <input
            type="text"
            value={item.na_justification ?? ''}
            onChange={(e) => onUpdate({ na_justification: e.target.value })}
            className="w-full px-4 py-2 text-sm bg-surface-elevated border border-amber-500/30 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            placeholder="Explain why this item is not applicable..."
          />
        </div>
      )}

      {/* Expanded section */}
      {expanded && (
        <div className="border-t border-border-gray/20 p-5 pl-12 space-y-5">
          {/* Rubric */}
          {frameworkItem?.rubric && Object.keys(frameworkItem.rubric).length > 0 && (
            <div>
              <button
                onClick={() => setShowRubric(!showRubric)}
                className="text-xs text-accent hover:text-accent-bright font-medium flex items-center gap-1.5 transition-colors"
              >
                {showRubric ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                Scoring Rubric
              </button>
              {showRubric && (
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {(['1', '2', '3', '4', '5'] as const).map((level) => {
                    const description = frameworkItem.rubric[level];
                    if (!description) return null;
                    const labels: Record<string, string> = {
                      '1': 'Initial',
                      '2': 'Managed',
                      '3': 'Defined',
                      '4': 'Quantitatively Managed',
                      '5': 'Optimizing',
                    };
                    return (
                      <div key={level} className="p-3 rounded-lg bg-surface-elevated border border-border-gray/20">
                        <div className="text-[10px] font-semibold text-accent-bright uppercase tracking-wide mb-1.5">
                          {level} — {labels[level]}
                        </div>
                        <p className="text-[11px] text-text-secondary leading-relaxed">{description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* N/A Justification (when expanded and NA) */}
          {item.na && (
            <div>
              <label className="block text-[11px] font-medium text-amber-400 mb-1.5">N/A Justification (required)</label>
              <input
                type="text"
                value={item.na_justification ?? ''}
                onChange={(e) => onUpdate({ na_justification: e.target.value })}
                className="w-full px-4 py-2 text-sm bg-surface-elevated border border-amber-500/30 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                placeholder="Explain why this item is not applicable..."
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-1.5">Notes & Observations</label>
            <textarea
              value={item.notes}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 text-sm bg-surface-elevated border border-border-gray/40 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 resize-y"
              placeholder="Enter observations, evidence, and recommendations..."
            />
          </div>

          {/* Evidence References */}
          <div>
            <label className="block text-[11px] font-medium text-text-secondary mb-2">Evidence References</label>
            {item.evidence_references.map((ref, i) => (
              <EvidenceRefRow
                key={i}
                ref_={ref}
                onChange={(updated) => {
                  const refs = [...item.evidence_references];
                  refs[i] = updated;
                  onUpdate({ evidence_references: refs });
                }}
                onRemove={() => {
                  const refs = item.evidence_references.filter((_, idx) => idx !== i);
                  onUpdate({ evidence_references: refs });
                }}
              />
            ))}
            <button
              onClick={() =>
                onUpdate({
                  evidence_references: [...item.evidence_references, { document: '', section: '', date: '' }],
                })
              }
              className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-bright mt-2 transition-colors"
            >
              <Plus size={12} /> Add reference
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function EvidenceRefRow({
  ref_,
  onChange,
  onRemove,
}: {
  ref_: EvidenceReference;
  onChange: (ref: EvidenceReference) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-2">
      <input
        type="text"
        value={ref_.document}
        onChange={(e) => onChange({ ...ref_, document: e.target.value })}
        className="flex-1 px-3 py-1.5 text-xs bg-surface-elevated border border-border-gray/40 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
        placeholder="Document name"
      />
      <input
        type="text"
        value={ref_.section}
        onChange={(e) => onChange({ ...ref_, section: e.target.value })}
        className="w-24 px-3 py-1.5 text-xs bg-surface-elevated border border-border-gray/40 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
        placeholder="Section"
      />
      <input
        type="date"
        value={ref_.date}
        onChange={(e) => onChange({ ...ref_, date: e.target.value })}
        className="w-36 px-3 py-1.5 text-xs bg-surface-elevated border border-border-gray/40 rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
      />
      <button onClick={onRemove} className="text-text-secondary/50 hover:text-red-400 transition-colors p-1">
        <X size={14} />
      </button>
    </div>
  );
}
