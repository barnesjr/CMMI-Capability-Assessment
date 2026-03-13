import { useState } from 'react';
import { useStore } from '@/store';
import { exportDeliverable } from '@/api';
import type { ExportType } from '@/api';
import {
  FileDown, FileText, FileSpreadsheet, Presentation,
  Loader2, CheckCircle, AlertCircle, BarChart3, Zap, BookOpen, Map,
} from 'lucide-react';

interface DeliverableDef {
  id: ExportType;
  name: string;
  description: string;
  format: string;
  icon: typeof FileText;
  section: 'core' | 'cmmi';
  requiresSvc?: boolean;
}

const DELIVERABLES: DeliverableDef[] = [
  { id: 'findings', name: 'D-01 Assessment Findings', description: 'Per practice area findings with scores, notes, and evidence', format: 'DOCX', icon: FileText, section: 'core' },
  { id: 'executive-summary', name: 'D-02 Executive Summary', description: 'Composite score, maturity band, radar chart, top gaps', format: 'DOCX', icon: FileText, section: 'core' },
  { id: 'gap-analysis', name: 'D-03 Gap Analysis & Roadmap', description: 'Current vs target gap matrix with remediation roadmap', format: 'DOCX', icon: FileText, section: 'core' },
  { id: 'workbook', name: 'D-04 Scored Assessment Workbook', description: 'All item scores, confidence, evidence with calculated averages', format: 'XLSX', icon: FileSpreadsheet, section: 'core' },
  { id: 'outbrief', name: 'D-05 Out-Brief Presentation', description: 'Executive summary, radar chart, category group breakdowns', format: 'PPTX', icon: Presentation, section: 'core' },
  { id: 'heatmap', name: 'D-06 Maturity Heatmap', description: 'Practice Area x Capability Area color-coded score grid', format: 'XLSX', icon: BarChart3, section: 'core' },
  { id: 'quick-wins', name: 'D-07 Quick Wins Report', description: 'Low-score items sorted by impact for rapid improvement', format: 'DOCX', icon: Zap, section: 'core' },
  { id: 'cmmi-roadmap', name: 'D-08 CMMI Roadmap', description: 'Level-by-level progression plan with practice area gaps', format: 'DOCX', icon: Map, section: 'core' },
  { id: 'svc-alignment', name: 'D-09 SVC Alignment Report', description: 'CMMI-SVC section scores and alignment analysis', format: 'DOCX', icon: BookOpen, section: 'cmmi', requiresSvc: true },
];

interface ExportStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
  filenames: string[];
}

export default function Export() {
  const { data } = useStore();
  const [statuses, setStatuses] = useState<Record<string, ExportStatus>>({});
  const [allLoading, setAllLoading] = useState(false);

  async function handleExport(id: ExportType) {
    setStatuses((s) => ({ ...s, [id]: { loading: true, success: false, error: null, filenames: [] } }));
    try {
      const result = await exportDeliverable(id);
      setStatuses((s) => ({ ...s, [id]: { loading: false, success: true, error: null, filenames: result.filenames } }));
    } catch (e) {
      setStatuses((s) => ({ ...s, [id]: { loading: false, success: false, error: (e as Error).message, filenames: [] } }));
    }
  }

  async function handleExportAll() {
    setAllLoading(true);
    try {
      const result = await exportDeliverable('all');
      const newStatuses: Record<string, ExportStatus> = {};
      for (const d of DELIVERABLES) {
        newStatuses[d.id] = { loading: false, success: true, error: null, filenames: result.filenames };
      }
      setStatuses(newStatuses);
    } catch (e) {
      for (const d of DELIVERABLES) {
        setStatuses((s) => ({ ...s, [d.id]: { loading: false, success: false, error: (e as Error).message, filenames: [] } }));
      }
    } finally {
      setAllLoading(false);
    }
  }

  const coreDeliverables = DELIVERABLES.filter((d) => d.section === 'core');
  const cmmiDeliverables = DELIVERABLES.filter((d) => d.section === 'cmmi');

  function renderCard(d: DeliverableDef) {
    const status = statuses[d.id];
    const Icon = d.icon;
    const disabled = d.requiresSvc && !data?.svc_enabled;

    return (
      <div
        key={d.id}
        className={`bg-surface-medium border border-border rounded-xl p-5 flex items-center gap-5 transition-colors hover:border-border-hover ${disabled ? 'opacity-50' : ''}`}
      >
        <div className="w-10 h-10 rounded-lg bg-surface-elevated flex items-center justify-center shrink-0">
          <Icon size={20} className="text-text-secondary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-semibold text-text-primary">{d.name}</h3>
            <span className="text-[10px] px-2 py-0.5 bg-surface-elevated text-text-tertiary rounded-md font-medium">{d.format}</span>
          </div>
          <p className="text-xs text-text-tertiary mt-1">{d.description}</p>
          {disabled && <p className="text-xs text-amber-400 mt-1">Requires SVC Extension to be enabled</p>}
          {status?.success && status.filenames.length > 0 && (
            <p className="text-xs text-green-400 mt-1.5">{status.filenames.join(', ')}</p>
          )}
          {status?.error && <p className="text-xs text-red-400 mt-1.5">{status.error}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {status?.loading ? <Loader2 size={16} className="animate-spin text-accent" /> :
           status?.success ? <CheckCircle size={16} className="text-green-400" /> :
           status?.error ? <AlertCircle size={16} className="text-red-400" /> : null}
          <button
            onClick={() => handleExport(d.id)}
            disabled={status?.loading || disabled}
            className="px-4 py-2 text-xs font-semibold text-accent border border-accent/30 rounded-lg hover:bg-accent/10 disabled:opacity-50 transition-all"
          >
            Export
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Export Deliverables</h2>
          <p className="text-sm text-text-tertiary mt-1">Generate assessment reports and workbooks.</p>
        </div>
        <button
          onClick={handleExportAll}
          disabled={allLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent text-page-bg text-sm font-semibold rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {allLoading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
          Export All
        </button>
      </div>

      <h3 className="text-[11px] font-semibold text-accent-bright uppercase tracking-widest mb-3">Core Deliverables</h3>
      <div className="space-y-3 mb-8">{coreDeliverables.map(renderCard)}</div>

      <h3 className="text-[11px] font-semibold text-accent-bright uppercase tracking-widest mb-3">CMMI-SVC Deliverables</h3>
      <div className="space-y-3">{cmmiDeliverables.map(renderCard)}</div>

      <p className="text-xs text-text-tertiary mt-6">
        Exports are saved to the <code className="bg-surface-elevated px-1.5 py-0.5 rounded-md text-text-secondary">exports/</code> directory.
      </p>
    </div>
  );
}
