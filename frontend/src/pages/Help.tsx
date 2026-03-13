import { Keyboard, BookOpen, FileDown, Layers } from 'lucide-react';

export function HelpPage() {
  return (
    <div className="max-w-3xl p-8">
      <h2 className="text-2xl font-bold text-text-primary mb-8">Help & Reference</h2>

      {/* Keyboard Shortcuts */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <Keyboard size={14} /> Keyboard Shortcuts
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-2 text-sm">
          {[
            ['1 / 2 / 3 / 4 / 5', 'Set score on focused item'],
            ['N', 'Toggle N/A on focused item'],
            ['H / M / L', 'Set confidence (High / Medium / Low)'],
            ['Up / Down or J / K', 'Navigate between items'],
            ['Enter / Space', 'Expand or collapse focused item'],
            ['Cmd/Ctrl + K', 'Open command palette'],
            ['Cmd/Ctrl + Right', 'Jump to next unscored item'],
            ['Escape', 'Close palette or deselect item'],
          ].map(([keys, desc]) => (
            <div key={keys} className="flex items-center gap-3">
              <code className="bg-surface-elevated px-2 py-1 rounded text-xs text-accent font-mono min-w-[180px]">{keys}</code>
              <span className="text-text-secondary">{desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Assessment Workflow */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <BookOpen size={14} /> Assessment Workflow
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-3 text-sm text-text-secondary">
          <ol className="list-decimal list-inside space-y-2">
            <li>Enter client information on the home page</li>
            <li>Navigate to each practice area via the sidebar or command palette (Cmd+K)</li>
            <li>Score each assessment item on a 1-5 scale using the scoring widget or keyboard</li>
            <li>Add notes, evidence references, and confidence levels as needed</li>
            <li>Review the dashboard for overall maturity scores and gap analysis</li>
            <li>Adjust target scores and weighting model in Settings as needed</li>
            <li>Export deliverables from the Export page</li>
          </ol>
        </div>
      </section>

      {/* Scoring Methodology */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <BookOpen size={14} /> Scoring Rubric
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-3 text-sm text-text-secondary">
          <p>Each item is scored on the CMMI V2.0 capability scale (1-5):</p>
          <div className="grid grid-cols-1 gap-3 mt-3">
            {[
              ['1 -- Initial', 'Process is ad-hoc and unpredictable. Work gets completed but often exceeds budget and schedule.', '#ef4444'],
              ['2 -- Managed', 'Process is planned, performed, monitored, and controlled at the project level.', '#f97316'],
              ['3 -- Defined', 'Process is well characterized and understood; described in standards, procedures, tools, and methods.', '#eab308'],
              ['4 -- Quantitatively Managed', 'Process is controlled using statistical and quantitative techniques. Quality and performance are understood in statistical terms.', '#84cc16'],
              ['5 -- Optimizing', 'Process is continually improved based on quantitative understanding of common causes of variation.', '#22c55e'],
            ].map(([label, desc, color]) => (
              <div key={label} className="p-3 rounded-lg bg-surface-elevated border border-border-subtle">
                <div className="text-xs font-semibold mb-1" style={{ color: color as string }}>{label}</div>
                <p className="text-[11px] text-text-tertiary">{desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-3">Items may be marked N/A with justification. N/A items are excluded from score averaging.</p>
          <p>The weighted composite score combines all 20 practice area scores using the selected weighting model.</p>
        </div>
      </section>

      {/* Category Groups */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <Layers size={14} /> CMMI Practice Areas
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-3 text-sm text-text-secondary">
          <p>The assessment covers 20 practice areas organized into 4 categories:</p>
          <div className="space-y-3 mt-3">
            {[
              ['Doing', 'Estimating (EST), Planning (PLAN), Monitor & Control (MC), Requirements Development & Management (RDM), Technical Solution (TS), Product Integration (PI), Verification & Validation (VV), Supplier Agreement Management (SAM)'],
              ['Managing', 'Risk & Opportunity Management (RSK), Decision Analysis & Resolution (DAR), Configuration Management (CM), Causal Analysis & Resolution (CAR), Process Quality Assurance (PQA)'],
              ['Enabling', 'Organizational Training (OT), Governance (GOV), Implementation Infrastructure (II), Process Asset Development (PAD)'],
              ['Improving', 'Managing Performance & Measurement (MPM), Process Management (PCM), Organizational Performance Focus (OPF)'],
            ].map(([group, areas]) => (
              <div key={group} className="p-3 rounded-lg bg-surface-elevated border border-border-subtle">
                <div className="text-xs font-semibold text-accent-bright mb-1">{group}</div>
                <p className="text-[11px] text-text-tertiary">{areas}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CMMI-SVC Module */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <BookOpen size={14} /> CMMI-SVC Extension
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-3 text-sm text-text-secondary">
          <p>The optional CMMI for Services (SVC) module adds service-oriented assessment items covering:</p>
          <ul className="list-disc list-inside space-y-1 text-text-tertiary text-xs mt-2">
            <li>Service Delivery</li>
            <li>Strategic Service Management</li>
            <li>Service Establishment and Management</li>
            <li>Incident Resolution and Prevention</li>
            <li>Service Continuity</li>
            <li>Capacity and Availability Management</li>
          </ul>
          <p className="mt-2">Enable the module in Settings to include these items in your assessment.</p>
        </div>
      </section>

      {/* Export Guide */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <FileDown size={14} /> Export Deliverables
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-2 text-sm text-text-secondary">
          {[
            ['Findings', 'Assessment Findings (DOCX)', 'Per-practice-area findings with scores, capability areas, and recommendations'],
            ['Summary', 'Executive Summary (DOCX)', 'Client profile, overall score, radar chart, top priorities'],
            ['Gap', 'Gap Analysis & Roadmap (DOCX)', 'Current vs target gap matrix with severity and remediation roadmap'],
            ['Workbook', 'Scored Workbook (XLSX)', 'All 300+ item scores, confidence, evidence, with auto-calculated averages'],
            ['Outbrief', 'Out-Brief Presentation (PPTX)', 'Executive summary, radar chart, practice area breakdowns'],
            ['Heatmap', 'CMMI Heatmap (XLSX)', 'Practice area x capability area color-coded score matrix'],
            ['Quick Wins', 'Quick Wins Report (DOCX)', 'Low-effort, high-impact improvement opportunities'],
            ['SVC', 'SVC Alignment (DOCX)', 'Service alignment analysis (requires CMMI-SVC module)'],
            ['JSON', 'Raw Assessment Data (JSON)', 'Complete assessment data for backup or migration'],
          ].map(([code, name, desc]) => (
            <div key={code} className="flex items-start gap-3 py-1">
              <code className="bg-surface-elevated px-2 py-0.5 rounded text-[10px] text-text-tertiary font-mono shrink-0">{code}</code>
              <div>
                <div className="font-medium text-text-primary">{name}</div>
                <div className="text-xs text-text-tertiary">{desc}</div>
              </div>
            </div>
          ))}
          <p className="text-xs text-text-tertiary mt-3">
            Exports are saved to the <code className="bg-surface-elevated px-1 py-0.5 rounded">exports/</code> directory.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-8">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-accent-bright uppercase tracking-widest mb-4">
          <BookOpen size={14} /> FAQ
        </h3>
        <div className="bg-surface-medium border border-border rounded-xl p-5 space-y-4 text-sm text-text-secondary">
          {[
            ['How is the composite score calculated?', 'Each practice area score is averaged from its capability area items. The composite score is a weighted average of all 20 practice area scores, using the selected weighting model.'],
            ['What happens when I mark an item as N/A?', 'N/A items are excluded from score calculations. A justification is required to explain why the item is not applicable.'],
            ['Can I change the weighting model after scoring?', 'Yes. Changing the weighting model recalculates all composite scores immediately. Your individual item scores are not affected.'],
            ['How do I back up my assessment?', 'Use the JSON export to save a complete copy of your assessment data. The tool also auto-saves to the backend after each change.'],
            ['What is CMMI-SVC?', 'CMMI for Services (CMMI-SVC) is an extension that adds service delivery and management assessment items, useful for organizations focused on IT service management.'],
          ].map(([q, a]) => (
            <div key={q}>
              <div className="font-medium text-text-primary mb-1">{q}</div>
              <p className="text-xs text-text-tertiary">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
