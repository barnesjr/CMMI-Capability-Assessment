CMMI Capability Assessment Tool
================================

Overview
--------
A desktop assessment tool for conducting CMMI V2.0 Capability Assessments.
Built with a FastAPI backend and React 19 frontend, packaged as a
standalone executable via PyInstaller.

The tool covers 20 CMMI practice areas organized into 4 categories,
with an optional CMMI-SVC (Services) extension module.


How to Run
----------
Option A: Double-click the executable (assessment-tool or assessment-tool.exe)
Option B: From source:
    pip install -r requirements.txt
    cd frontend && npm install && npm run build && cd ..
    python -m backend.main

The tool opens a browser window at http://localhost:8099.


Practice Areas (20 total)
-------------------------
DOING (8 practice areas):
  - Estimating (EST)
  - Planning (PLAN)
  - Monitor & Control (MC)
  - Requirements Development & Management (RDM)
  - Technical Solution (TS)
  - Product Integration (PI)
  - Verification & Validation (VV)
  - Supplier Agreement Management (SAM)

MANAGING (5 practice areas):
  - Risk & Opportunity Management (RSK)
  - Decision Analysis & Resolution (DAR)
  - Configuration Management (CM)
  - Causal Analysis & Resolution (CAR)
  - Process Quality Assurance (PQA)

ENABLING (4 practice areas):
  - Organizational Training (OT)
  - Governance (GOV)
  - Implementation Infrastructure (II)
  - Process Asset Development (PAD)

IMPROVING (3 practice areas):
  - Managing Performance & Measurement (MPM)
  - Process Management (PCM)
  - Organizational Performance Focus (OPF)


CMMI-SVC Extension
------------------
The optional CMMI for Services module adds service-oriented
assessment items covering Service Delivery, Strategic Service
Management, Incident Resolution and Prevention, Service Continuity,
and Capacity & Availability Management. Enable it in Settings.


Scoring Rubric (1-5 Scale)
--------------------------
1 - Initial:
    Process is ad-hoc and unpredictable.

2 - Managed:
    Process is planned, performed, monitored, and controlled
    at the project level.

3 - Defined:
    Process is well characterized and understood; described in
    standards, procedures, tools, and methods.

4 - Quantitatively Managed:
    Process is controlled using statistical and quantitative
    techniques.

5 - Optimizing:
    Process is continually improved based on quantitative
    understanding of common causes of variation.

Items may be marked N/A with justification (excluded from averages).


Export Deliverables (9 types)
-----------------------------
1. Assessment Findings (DOCX)
   Per-practice-area findings with scores and recommendations.

2. Executive Summary (DOCX)
   Client profile, overall score, radar chart, top priorities.

3. Gap Analysis & Roadmap (DOCX)
   Current vs target gap matrix with severity and remediation roadmap.

4. Scored Workbook (XLSX)
   All 300+ item scores with auto-calculated averages.

5. Out-Brief Presentation (PPTX)
   Executive summary, radar chart, practice area breakdowns.

6. CMMI Heatmap (XLSX)
   Practice area x capability area color-coded score matrix.

7. Quick Wins Report (DOCX)
   Low-effort, high-impact improvement opportunities.

8. SVC Alignment Report (DOCX)
   Service alignment analysis (requires CMMI-SVC module).

9. Raw Assessment Data (JSON)
   Complete assessment data for backup or migration.


Keyboard Shortcuts
------------------
1-5             Set score on focused item
N               Toggle N/A on focused item
H / M / L       Set confidence (High / Medium / Low)
Up/Down or J/K  Navigate between items
Enter/Space     Expand or collapse focused item
Cmd/Ctrl + K    Open command palette
Cmd/Ctrl + Right Jump to next unscored item
Escape          Close palette or deselect item


Troubleshooting
---------------
- Port conflict: If port 8099 is in use, the tool will report an error
  on startup. Close the conflicting application or check for another
  instance of the tool already running.

- Browser does not open: Navigate manually to http://localhost:8099

- Data not saving: Check that the data/ directory is writable. The tool
  auto-saves after each change with a 300ms debounce.

- Export errors: Ensure the exports/ directory exists and is writable.
  Check the terminal/console for detailed error messages.

- Blank screen: Clear browser cache and reload. Ensure the frontend
  was built before running (npm run build in the frontend directory).
