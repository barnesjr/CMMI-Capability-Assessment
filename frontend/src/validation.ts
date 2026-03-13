import type { AssessmentItem } from './types';

export interface ValidationIssue {
  rule: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
}

export function getItemValidation(item: AssessmentItem): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (item.score === null && !item.na) {
    issues.push({ rule: 'unscored', severity: 'info', message: 'Item has not been scored' });
  }
  if (item.na && !item.na_justification) {
    issues.push({ rule: 'na-no-justification', severity: 'error', message: 'N/A requires justification' });
  }
  if (item.score !== null && !item.notes) {
    issues.push({ rule: 'scored-no-notes', severity: 'warning', message: 'Consider adding notes to support this score' });
  }
  if (item.confidence === 'Low' && !item.notes) {
    issues.push({ rule: 'low-confidence-no-notes', severity: 'warning', message: 'Low confidence items should include notes' });
  }
  return issues;
}
