import type { AssessmentData, Framework } from './types';

const API_BASE = '/api';

export async function fetchAssessment(): Promise<AssessmentData> {
  const res = await fetch(`${API_BASE}/assessment`);
  if (!res.ok) throw new Error(`Failed to fetch assessment: ${res.statusText}`);
  return res.json() as Promise<AssessmentData>;
}

export async function saveAssessment(data: AssessmentData): Promise<void> {
  const res = await fetch(`${API_BASE}/assessment`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to save assessment: ${res.statusText}`);
}

export async function fetchFramework(): Promise<Framework> {
  const res = await fetch(`${API_BASE}/framework`);
  if (!res.ok) throw new Error(`Failed to fetch framework: ${res.statusText}`);
  return res.json() as Promise<Framework>;
}

export type ExportType =
  | 'findings' | 'executive-summary' | 'gap-analysis' | 'workbook'
  | 'outbrief' | 'heatmap' | 'quick-wins' | 'cmmi-roadmap'
  | 'svc-alignment' | 'all';

export async function exportDeliverable(type: ExportType): Promise<{ filenames: string[] }> {
  const res = await fetch(`${API_BASE}/export/${type}`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText })) as { detail?: string };
    throw new Error(err.detail || `Export failed: ${res.statusText}`);
  }
  return res.json() as Promise<{ filenames: string[] }>;
}
