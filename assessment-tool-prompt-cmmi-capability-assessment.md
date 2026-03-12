# CMMI Capability Assessment Tool — Implementation Prompt

> **Purpose:** Implementation prompt for building the CMMI Capability Assessment Tool.
> Use this as the implementation prompt for Claude Code.

---

## 1. Branding & Design

All assessment tools follow the shared Peraton design system.

- **Design guide:** `/Users/john/Dev/Assessments/Design-guide.md`
- **Logo:** `/Users/john/Dev/Assessments/2025_Peraton_Logo_2000x541px_White_White.png`
- **Theme:** Dark mode — page background `#0A0A0B`, surfaces `#131212`/`#1C1C1E`/`#262626`/`#333333`
- **Primary accent:** `#1BA1E2` (Peraton Cyan)
- **Text:** White `#FFFFFF` primary, Light Gray `#D0D0D0` secondary
- **Font stack:** `"Segoe UI", -apple-system, system-ui, Roboto, "Helvetica Neue", sans-serif`
- **Logo placement:** Sidebar top-left, ~160px wide on dark surface; loading screen centered ~300px wide

---

## 2. Tech Stack (Fixed)

All assessment tools use this exact stack. Do not substitute.

### Backend
| Package | Purpose |
|---------|---------|
| Python 3 | Runtime |
| FastAPI | API framework |
| Uvicorn | ASGI server |
| Pydantic v2 | Data models & validation |
| openpyxl | Excel (.xlsx) export |
| docxtpl | Word (.docx) export (template-based, wraps python-docx) |
| python-pptx | PowerPoint (.pptx) export |
| matplotlib (Agg backend) | Radar chart PNG generation |
| PyInstaller | Standalone executable packaging |

### Frontend
| Package | Purpose |
|---------|---------|
| React 19 | UI framework |
| TypeScript 5.9+ | Type safety |
| Vite 7 | Build tool + dev server |
| Tailwind CSS 4 | Utility-first styling |
| Recharts | Interactive charts (RadarChart, BarChart) |
| Lucide React | Icon library |
| React Router 7 | Client-side routing |

### Python virtual environment
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## 3. Domain Configuration

### Identity
```
"CMMI Capability Assessment Tool"     # Tool display name
"cmmi-assessment"                     # Tool slug (filenames, dist folder)
"CMMI V2.0"                          # Framework alignment
"cmmi-sidebar"                       # localStorage sidebar key
8751                                  # Default port (auto-scans 8751-8760)
```

### Hierarchy Model

This tool uses **grouped (3-level nesting):**
```
Category Group (container of practice areas)
  └── Practice Area (scored + weighted)
       └── Capability Area
            └── Assessment Item
```

```
"grouped"                              # Hierarchy style
[                                      # Top-level entities (4 category groups)
  {"id":"doing","name":"Doing","children":["est","plan","mc","rdm","ts","pi","vv"]},
  {"id":"managing","name":"Managing","children":["sam","rsk","dar"]},
  {"id":"enabling","name":"Enabling","children":["cm","car","pqa","ot","gov","ii"]},
  {"id":"improving","name":"Improving","children":["pad","mpm","pcm","opf"]}
]
[                                      # Mid-level entities (20 practice areas with weights)
  {"id":"est","name":"Estimating","weight":0.05},
  {"id":"plan","name":"Planning","weight":0.05},
  {"id":"mc","name":"Monitor and Control","weight":0.05},
  {"id":"rdm","name":"Requirements Development and Management","weight":0.05},
  {"id":"ts","name":"Technical Solution","weight":0.05},
  {"id":"pi","name":"Product Integration","weight":0.05},
  {"id":"vv","name":"Verification and Validation","weight":0.05},
  {"id":"sam","name":"Supplier Agreement Management","weight":0.05},
  {"id":"rsk","name":"Risk and Opportunity Management","weight":0.05},
  {"id":"dar","name":"Decision Analysis and Resolution","weight":0.05},
  {"id":"cm","name":"Configuration Management","weight":0.05},
  {"id":"car","name":"Causal Analysis and Resolution","weight":0.05},
  {"id":"pqa","name":"Process Quality Assurance","weight":0.05},
  {"id":"ot","name":"Organizational Training","weight":0.05},
  {"id":"gov","name":"Governance","weight":0.05},
  {"id":"ii","name":"Implementation Infrastructure","weight":0.05},
  {"id":"pad","name":"Process Asset Development","weight":0.05},
  {"id":"mpm","name":"Managing Performance and Measurement","weight":0.05},
  {"id":"pcm","name":"Process Management","weight":0.05},
  {"id":"opf","name":"Organizational Performance Focus","weight":0.05}
]
```

### Scoring
```
"1-5"                                                                                              # Score scale
{1:"Initial", 2:"Managed", 3:"Defined", 4:"Quantitatively Managed", 5:"Optimizing"}               # Score labels
{1:"#ef4444", 2:"#f97316", 3:"#eab308", 4:"#84cc16", 5:"#22c55e"}                                 # Score colors
["initial","managed","defined","quantitatively-managed","optimizing"]                                # Rubric keys
```

### Maturity Bands
```
[
  {min:1.0, max:1.5, label:"Initial",                  color:"#ef4444"},
  {min:1.5, max:2.5, label:"Managed",                  color:"#f97316"},
  {min:2.5, max:3.5, label:"Defined",                  color:"#eab308"},
  {min:3.5, max:4.5, label:"Quantitatively Managed",   color:"#84cc16"},
  {min:4.5, max:5.0, label:"Optimizing",               color:"#22c55e"}
]
```

### Weighting Models
```
{
  "balanced":          {label:"Balanced",          weights:{"est":0.05,"plan":0.05,"mc":0.05,"rdm":0.05,"ts":0.05,"pi":0.05,"vv":0.05,"sam":0.05,"rsk":0.05,"dar":0.05,"cm":0.05,"car":0.05,"pqa":0.05,"ot":0.05,"gov":0.05,"ii":0.05,"pad":0.05,"mpm":0.05,"pcm":0.05,"opf":0.05}},
  "delivery_focused":  {label:"Delivery-Focused",  weights:{"est":0.07,"plan":0.08,"mc":0.07,"rdm":0.08,"ts":0.08,"pi":0.07,"vv":0.07,"sam":0.04,"rsk":0.05,"dar":0.04,"cm":0.04,"car":0.03,"pqa":0.04,"ot":0.03,"gov":0.03,"ii":0.03,"pad":0.03,"mpm":0.04,"pcm":0.04,"opf":0.04}},
  "quality_focused":   {label:"Quality-Focused",   weights:{"est":0.04,"plan":0.04,"mc":0.05,"rdm":0.06,"ts":0.05,"pi":0.05,"vv":0.08,"sam":0.04,"rsk":0.06,"dar":0.06,"cm":0.06,"car":0.07,"pqa":0.08,"ot":0.04,"gov":0.04,"ii":0.03,"pad":0.04,"mpm":0.05,"pcm":0.03,"opf":0.03}},
  "risk_focused":      {label:"Risk-Focused",      weights:{"est":0.04,"plan":0.05,"mc":0.07,"rdm":0.05,"ts":0.04,"pi":0.04,"vv":0.06,"sam":0.06,"rsk":0.08,"dar":0.07,"cm":0.06,"car":0.06,"pqa":0.06,"ot":0.03,"gov":0.06,"ii":0.03,"pad":0.03,"mpm":0.05,"pcm":0.03,"opf":0.03}}
}
"balanced"                             # Default weighting model
3.0                                    # Default per-practice-area target score
```

### Exports & Distribution
```
["findings","executive-summary","gap-analysis","workbook","outbrief","heatmap","quick-wins","cmmi-roadmap","svc-alignment"]
"CMMIAssessment"                       # Distribution folder name
```

### Extension Module: CMMI-SVC (Services)
```
true                                   # Extension enabled
"CMMI-SVC Module"                      # Extension name
"CMMI-SVC"                             # Short sidebar label
"sidebar switch"                       # Toggle mechanism

# Extension entities — CMMI for Services practice areas:
[
  {"id":"svc-sd","name":"Service Delivery"},
  {"id":"svc-scon","name":"Service Continuity"},
  {"id":"svc-sst","name":"Service System Transition"},
  {"id":"svc-ssd","name":"Strategic Service Management"},
  {"id":"svc-irp","name":"Incident Resolution and Prevention"},
  {"id":"svc-cam","name":"Capacity and Availability Management"}
]
```

---

## 4. Project Structure

```
cmmi-assessment/
├── backend/
│   ├── __init__.py
│   ├── main.py                        # FastAPI app — serves API + built frontend
│   ├── models.py                      # Pydantic data models
│   ├── data_manager.py                # Load/save assessment + framework JSON
│   ├── export_engine.py               # All export generators
│   └── static/                        # Vite build output (generated)
├── frontend/
│   ├── package.json
│   ├── vite.config.ts                 # Proxy /api → backend in dev
│   ├── tailwind.config.ts             # Design tokens from Design-guide.md
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── index.html
│   └── src/
│       ├── main.tsx                   # React entry point
│       ├── App.tsx                    # Router + layout (sidebar + content)
│       ├── store.tsx                  # React Context state management
│       ├── types.ts                   # TypeScript interfaces + constants
│       ├── api.ts                     # Fetch client for /api/*
│       ├── scoring.ts                 # Score calculations
│       ├── validation.ts              # Assessment validation rules
│       ├── hooks/
│       │   └── useNextUnscored.ts     # Cmd+Right jump-to-next-unscored logic
│       ├── components/
│       │   ├── Sidebar.tsx            # Collapsible nav tree with progress rings
│       │   ├── AssessmentItemCard.tsx  # Item card with scoring + notes
│       │   ├── ScoringWidget.tsx      # 1-5 radio buttons + N/A toggle
│       │   ├── ConfidenceWidget.tsx   # High/Medium/Low selector
│       │   ├── Breadcrumb.tsx         # Path breadcrumbs
│       │   ├── StatsFooter.tsx        # Progress bar + save status
│       │   ├── CommandPalette.tsx     # Cmd+K quick navigation
│       │   └── OnboardingTooltip.tsx  # First-time hints
│       └── pages/
│           ├── ClientInfo.tsx         # Client name, industry, date, assessor
│           ├── Dashboard.tsx          # Composite score, radar chart, progress
│           ├── PracticeAreaSummary.tsx # Practice area summary view
│           ├── CapabilityArea.tsx     # Item-level scoring (main work page)
│           ├── SvcSummary.tsx         # CMMI-SVC extension overview
│           ├── SvcSection.tsx         # CMMI-SVC section items
│           ├── Export.tsx             # Export deliverables UI
│           ├── Settings.tsx           # Weighting model, target scores, custom sliders
│           └── Help.tsx              # Keyboard shortcuts, documentation
├── framework/
│   └── assessment-framework.json      # Read-only framework definition
├── templates/                         # (Optional) Word/Excel/PowerPoint templates
├── exports/                           # Generated deliverables (created at runtime)
├── build.py                           # Build orchestration script
├── assessment-tool-macos.spec         # PyInstaller spec — macOS
├── assessment-tool-windows.spec       # PyInstaller spec — Windows
├── requirements.txt                   # Python dependencies
├── data.json                          # Persistent assessment data (auto-created)
├── data.json.bak                      # Backup (auto-created on save)
├── README.txt                         # End-user documentation
└── .gitignore
```

---

## 5. Data Model

### Backend — Pydantic Models (`backend/models.py`)

```python
from pydantic import BaseModel, Field
from typing import Optional

class EvidenceReference(BaseModel):
    document: str = ""
    section: str = ""
    date: str = ""

class AssessmentItem(BaseModel):
    id: str
    text: str
    score: Optional[int] = Field(None, ge=1, le=5)
    na: bool = False
    na_justification: Optional[str] = None
    confidence: Optional[str] = None  # "High" | "Medium" | "Low"
    notes: str = ""
    evidence_references: list[EvidenceReference] = Field(default_factory=list)
    attachments: list[str] = Field(default_factory=list)  # Optional: file attachment paths

class CapabilityArea(BaseModel):
    id: str
    name: str
    items: list[AssessmentItem] = Field(default_factory=list)

# --- Grouped Hierarchy ---
class PracticeArea(BaseModel):
    id: str
    name: str
    weight: float
    capability_areas: list[CapabilityArea] = Field(default_factory=list)

class CategoryGroup(BaseModel):
    id: str
    name: str
    practice_areas: list[PracticeArea] = Field(default_factory=list)

# --- CMMI-SVC Extension ---
class SvcSection(BaseModel):
    id: str
    name: str
    capability_areas: list[CapabilityArea] = Field(default_factory=list)

class SvcExtension(BaseModel):
    enabled: bool = False
    sections: list[SvcSection] = Field(default_factory=list)

# --- Shared Models ---
class ClientInfo(BaseModel):
    name: str = ""
    industry: str = ""
    assessment_date: str = ""
    assessor: str = ""

class AssessmentMetadata(BaseModel):
    framework_version: str = "1.0"
    tool_version: str = "1.0.0"
    last_modified: str = ""

class ScoringConfig(BaseModel):
    weighting_model: str = "balanced"
    practice_area_weights: dict[str, float] = Field(default_factory=dict)
    custom_weights: Optional[dict[str, float]] = None

class AssessmentData(BaseModel):
    client_info: ClientInfo = Field(default_factory=ClientInfo)
    assessment_metadata: AssessmentMetadata = Field(default_factory=AssessmentMetadata)
    scoring_config: ScoringConfig = Field(default_factory=ScoringConfig)
    category_groups: list[CategoryGroup] = Field(default_factory=list)
    svc_enabled: bool = False
    svc_extension: Optional[SvcExtension] = None
    target_scores: dict[str, float] = Field(default_factory=dict)
```

### Frontend — TypeScript Interfaces (`frontend/src/types.ts`)

```typescript
// Score constants
export const SCORE_LABELS: Record<number, string> = {1:"Initial", 2:"Managed", 3:"Defined", 4:"Quantitatively Managed", 5:"Optimizing"};
export const SCORE_COLORS: Record<number, string> = {1:"#ef4444", 2:"#f97316", 3:"#eab308", 4:"#84cc16", 5:"#22c55e"};
export const MATURITY_BANDS = [
  {min:1.0, max:1.5, label:"Initial",                color:"#ef4444"},
  {min:1.5, max:2.5, label:"Managed",                color:"#f97316"},
  {min:2.5, max:3.5, label:"Defined",                color:"#eab308"},
  {min:3.5, max:4.5, label:"Quantitatively Managed", color:"#84cc16"},
  {min:4.5, max:5.0, label:"Optimizing",             color:"#22c55e"}
];
export const WEIGHTING_MODELS: Record<string, { label: string; weights: Record<string, number> }> = {
  "balanced":          {label:"Balanced",          weights:{"est":0.05,"plan":0.05,"mc":0.05,"rdm":0.05,"ts":0.05,"pi":0.05,"vv":0.05,"sam":0.05,"rsk":0.05,"dar":0.05,"cm":0.05,"car":0.05,"pqa":0.05,"ot":0.05,"gov":0.05,"ii":0.05,"pad":0.05,"mpm":0.05,"pcm":0.05,"opf":0.05}},
  "delivery_focused":  {label:"Delivery-Focused",  weights:{"est":0.07,"plan":0.08,"mc":0.07,"rdm":0.08,"ts":0.08,"pi":0.07,"vv":0.07,"sam":0.04,"rsk":0.05,"dar":0.04,"cm":0.04,"car":0.03,"pqa":0.04,"ot":0.03,"gov":0.03,"ii":0.03,"pad":0.03,"mpm":0.04,"pcm":0.04,"opf":0.04}},
  "quality_focused":   {label:"Quality-Focused",   weights:{"est":0.04,"plan":0.04,"mc":0.05,"rdm":0.06,"ts":0.05,"pi":0.05,"vv":0.08,"sam":0.04,"rsk":0.06,"dar":0.06,"cm":0.06,"car":0.07,"pqa":0.08,"ot":0.04,"gov":0.04,"ii":0.03,"pad":0.04,"mpm":0.05,"pcm":0.03,"opf":0.03}},
  "risk_focused":      {label:"Risk-Focused",      weights:{"est":0.04,"plan":0.05,"mc":0.07,"rdm":0.05,"ts":0.04,"pi":0.04,"vv":0.06,"sam":0.06,"rsk":0.08,"dar":0.07,"cm":0.06,"car":0.06,"pqa":0.06,"ot":0.03,"gov":0.06,"ii":0.03,"pad":0.03,"mpm":0.05,"pcm":0.03,"opf":0.03}}
};

// Utility function — maps a numeric score to its maturity band
export function getMaturityBand(score: number): { label: string; color: string } { ... }

// Assessment interfaces — mirror backend models
export interface EvidenceReference { document: string; section: string; date: string; }
export interface AssessmentItem { id: string; text: string; score: number | null; na: boolean; na_justification: string | null; confidence: string | null; notes: string; evidence_references: EvidenceReference[]; attachments: string[]; }
export interface CapabilityArea { id: string; name: string; items: AssessmentItem[]; }

// Grouped hierarchy
export interface PracticeArea { id: string; name: string; weight: number; capability_areas: CapabilityArea[]; }
export interface CategoryGroup { id: string; name: string; practice_areas: PracticeArea[]; }

// CMMI-SVC Extension
export interface SvcSection { id: string; name: string; capability_areas: CapabilityArea[]; }
export interface SvcExtension { enabled: boolean; sections: SvcSection[]; }

// Framework read-only interfaces
export interface FrameworkItem { id: string; text: string; rubric: Record<string, string>; }
// rubric keys = ["initial","managed","defined","quantitatively-managed","optimizing"]
export interface FrameworkCapabilityArea { id: string; name: string; items: FrameworkItem[]; }
// ... rest mirrors framework JSON structure ...

export interface ClientInfo { name: string; industry: string; assessment_date: string; assessor: string; }
export interface AssessmentMetadata { framework_version: string; tool_version: string; last_modified: string; }
```

---

## 6. API Routes

All tools expose exactly these endpoints:

| Method | Endpoint | Request Body | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/assessment` | — | Full `AssessmentData` JSON |
| `PUT` | `/api/assessment` | `AssessmentData` JSON | `{"status": "saved"}` |
| `GET` | `/api/framework` | — | Framework JSON (read-only) |
| `POST` | `/api/export/{type}` | — | `{"filenames": ["path1", ...]}` |

### Implementation Details (`backend/main.py`)

- **Port discovery:** Try `8751` through `8760`, use first available; log port diagnostics (`lsof`/`netstat`) if all ports busy
- **Auto-launch browser:** Call `webbrowser.open(url)` after server starts
- **Static files:** Serve built frontend from `backend/static/`
- **SPA fallback:** All non-`/api/*` GET requests serve `index.html`
- **No CORS needed:** Vite dev server proxies `/api` requests, so no CORS middleware required
- **Atomic save:** Write to temp file, then `os.replace()` to swap into `data.json`; write `data.json.bak` before overwriting
- **Load behavior:** Try `data.json` → fall back to `data.json.bak` → create fresh from framework
- **Export types:** `["findings","executive-summary","gap-analysis","workbook","outbrief","heatmap","quick-wins","cmmi-roadmap","svc-alignment"]` + `"all"`
- **Error codes:** 400 invalid export type, 404 framework missing, 500 server error

---

## 7. Pages & Routing

```typescript
<BrowserRouter>
  <Routes>
    <Route path="/" element={<ClientInfoPage />} />
    <Route path="/dashboard" element={<DashboardPage />} />

    {/* --- Grouped Hierarchy: Practice Areas --- */}
    <Route path="/practice-area/:entityId" element={<PracticeAreaSummary />} />
    <Route path="/practice-area/:entityId/:areaId" element={<CapabilityAreaPage />} />

    {/* --- CMMI-SVC Extension --- */}
    <Route path="/svc" element={<SvcSummary />} />
    <Route path="/svc/:sectionId" element={<SvcSection />} />
    <Route path="/svc/:sectionId/:areaId" element={<SvcSection />} />

    {/* --- Standard pages --- */}
    <Route path="/export" element={<ExportPage />} />
    <Route path="/settings" element={<SettingsPage />} />
    <Route path="/help" element={<HelpPage />} />
  </Routes>
</BrowserRouter>
```

### Global Keyboard Shortcuts
- `Cmd/Ctrl+K` — Toggle Command Palette
- `Cmd/Ctrl+Right` — Jump to next unscored item

### CapabilityArea Page Keyboard Shortcuts
- `1`-`5` — Set score on focused item
- `H`/`M`/`L` — Set confidence (High/Medium/Low)
- `N` — Toggle N/A
- `Arrow Up/Down` — Navigate between items

---

## 8. Sidebar Structure

### Layout
```
[Logo ~160px wide]
──────────────────
Client Info          (link → /)
Dashboard            (link → /dashboard)
──────────────────

DOING                                                [chevron]
  ├── Estimating (EST)                               [score badge] [progress ring]
  ├── Planning (PLAN)                                [score] [ring]
  ├── Monitor and Control (MC)                       [score] [ring]
  ├── Requirements Dev & Mgmt (RDM)                  [score] [ring]
  ├── Technical Solution (TS)                        [score] [ring]
  ├── Product Integration (PI)                       [score] [ring]
  └── Verification and Validation (VV)               [score] [ring]

MANAGING                                             [chevron]
  ├── Supplier Agreement Mgmt (SAM)                  [score] [ring]
  ├── Risk and Opportunity Mgmt (RSK)                [score] [ring]
  └── Decision Analysis and Resolution (DAR)         [score] [ring]

ENABLING                                             [chevron]
  ├── Configuration Management (CM)                  [score] [ring]
  ├── Causal Analysis and Resolution (CAR)           [score] [ring]
  ├── Process Quality Assurance (PQA)                [score] [ring]
  ├── Organizational Training (OT)                   [score] [ring]
  ├── Governance (GOV)                               [score] [ring]
  └── Implementation Infrastructure (II)             [score] [ring]

IMPROVING                                            [chevron]
  ├── Process Asset Development (PAD)                [score] [ring]
  ├── Managing Performance & Measurement (MPM)       [score] [ring]
  ├── Process Management (PCM)                       [score] [ring]
  └── Organizational Performance Focus (OPF)         [score] [ring]

──────────────────
CMMI-SVC  [toggle switch]
  ├── Service Delivery (SD)
  ├── Service Continuity (SCON)
  ├── Service System Transition (SST)
  ├── Strategic Service Management (SSD)
  ├── Incident Resolution & Prevention (IRP)
  └── Capacity & Availability Mgmt (CAM)
──────────────────

Export               (link → /export)
Settings             (link → /settings)
Help                 (link → /help)
```

### Behavior
- **Collapsible:** Toggle between 56px icon-only and full width
- **Resizable:** Drag right edge (min: `180px`, max: `480px`, default: `350px`)
- **Persist state:** `localStorage` key `"cmmi-sidebar"`
- **Progress rings:** SVG circle showing % scored per practice area
- **Score badges:** Rounded average score, color-coded by `{1:"#ef4444", 2:"#f97316", 3:"#eab308", 4:"#84cc16", 5:"#22c55e"}`
- **Chevron expand:** Click to show/hide children in tree

---

## 9. Export Deliverables

### Core Exports (all tools)

| # | Name | Format | Content |
|---|------|--------|---------|
| 1 | Assessment Findings | DOCX | Per-practice-area item breakdown with scores, notes, evidence |
| 2 | Executive Summary | DOCX | Composite score, radar chart (embedded PNG), top gaps |
| 3 | Gap Analysis & Roadmap | DOCX | Gap matrix table (current vs target), remediation timeline |
| 4 | Scored Assessment Workbook | XLSX | Multi-sheet: Dashboard + per-practice-area sheets with all items |
| 5 | Out-Brief Presentation | PPTX | Title + overview + radar chart + per-category-group slides |

### Domain-Specific Exports

| # | Name | Format | Content |
|---|------|--------|---------|
| 6 | Maturity Heatmap | XLSX | Practice Area x Capability Area color-coded score grid |
| 7 | Quick Wins Report | DOCX | Low-score, high-impact items prioritized for quick remediation |
| 8 | CMMI Roadmap | DOCX | Level-by-level capability progression plan with milestones, mapping current maturity to target levels across practice areas |
| 9 | SVC Alignment Report | DOCX | Maps CMMI-SVC scores to service delivery maturity; only generated when SVC extension is enabled |

### Export Implementation Details
- **Filenames:** `D-XX_Name_YYYY-MM-DD_HHMMSS.ext` (timestamped)
- **Radar chart:** matplotlib Agg backend → `exports/radar_chart.png` (6x6 in, 150 DPI)
- **Template support:** If `templates/<name>-template.<ext>` exists, use it; otherwise auto-generate
- **"Export All" button:** Generates core exports + domain-specific (skip SVC Alignment if SVC extension disabled)

---

## 10. Key Behaviors

### Auto-Save
- **Debounce:** 300ms after any data change
- **Mechanism:** `PUT /api/assessment` with full `AssessmentData`
- **Backup:** Server writes `data.json.bak` before overwriting `data.json`
- **Status indicator:** StatsFooter shows "Saving..." / "Saved" / "Error"

### Scoring Engine (`frontend/src/scoring.ts`)
```typescript
averageScore(items: AssessmentItem[]): number          // Mean of scored items (exclude N/A)
capabilityAreaScore(ca: CapabilityArea): number         // Average of CA items
practiceAreaScore(pa: PracticeArea): number             // Average of all items in practice area
weightedCompositeScore(data: AssessmentData): number    // Σ(practiceAreaScore × weight) / Σ(weights)
overallCompletion(data: AssessmentData): {scored: number, total: number}
```

### Command Palette (`Cmd+K`)
- Fuzzy search across all practice areas + capability areas
- Navigate to any page instantly
- Show score + completion status in results

### Validation (`frontend/src/validation.ts`)
| Rule | Severity | Condition |
|------|----------|-----------|
| `unscored` | info | Item has no score and is not N/A |
| `na-no-justification` | error | N/A checked but no justification |
| `scored-no-notes` | warning | Score assigned but notes empty |
| `low-confidence-no-notes` | warning | Confidence = "Low" with no notes |

### Charts (Dashboard)
- **Radar chart:** Recharts `RadarChart` — one axis per practice area, scale 0-5
- **Bar chart:** Recharts `BarChart` — practice area scores grouped by category, maturity band colors
- **Progress:** Overall completion percentage + per-practice-area progress rings

### State Management (`frontend/src/store.tsx`)
- React Context with `useReducer` pattern
- `StoreProvider` wraps entire app
- `useStore()` hook returns `{data, framework, loading, saveStatus, updateData}`
- `updateData()` uses `structuredClone` for immutable updates

### Custom Weighting Sliders (Settings Page)
- Each practice area gets a slider (range 0.01-0.20, step 0.01)
- Sliders auto-normalize so all weights sum to 1.0
- Visual bar chart shows current weight distribution
- Preset buttons reset sliders to named preset values

---

## 11. Framework Content

The framework JSON defines all assessment items and rubrics. Place at `framework/assessment-framework.json`.

### Structure

```json
{
  "version": "1.0",
  "framework_alignment": "CMMI V2.0",

  "category_groups": [
    {
      "id": "doing",
      "name": "Doing",
      "practice_areas": [
        {
          "id": "est",
          "name": "Estimating",
          "weight": 0.05,
          "capability_areas": [
            {
              "id": "est-ca1",
              "name": "Estimation Approach",
              "items": [
                {
                  "id": "est-1-1",
                  "text": "Assessment item question text",
                  "rubric": {
                    "initial": "Level 1 description...",
                    "managed": "Level 2 description...",
                    "defined": "Level 3 description...",
                    "quantitatively-managed": "Level 4 description...",
                    "optimizing": "Level 5 description..."
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ],

  "svc_extension": {
    "sections": [
      {
        "id": "svc-sd",
        "name": "Service Delivery",
        "capability_areas": [...]
      }
    ]
  },

  "weighting_models": {
    "balanced":          {"label":"Balanced",          "weights":{"est":0.05,"plan":0.05,"mc":0.05,"rdm":0.05,"ts":0.05,"pi":0.05,"vv":0.05,"sam":0.05,"rsk":0.05,"dar":0.05,"cm":0.05,"car":0.05,"pqa":0.05,"ot":0.05,"gov":0.05,"ii":0.05,"pad":0.05,"mpm":0.05,"pcm":0.05,"opf":0.05}},
    "delivery_focused":  {"label":"Delivery-Focused",  "weights":{"est":0.07,"plan":0.08,"mc":0.07,"rdm":0.08,"ts":0.08,"pi":0.07,"vv":0.07,"sam":0.04,"rsk":0.05,"dar":0.04,"cm":0.04,"car":0.03,"pqa":0.04,"ot":0.03,"gov":0.03,"ii":0.03,"pad":0.03,"mpm":0.04,"pcm":0.04,"opf":0.04}},
    "quality_focused":   {"label":"Quality-Focused",   "weights":{"est":0.04,"plan":0.04,"mc":0.05,"rdm":0.06,"ts":0.05,"pi":0.05,"vv":0.08,"sam":0.04,"rsk":0.06,"dar":0.06,"cm":0.06,"car":0.07,"pqa":0.08,"ot":0.04,"gov":0.04,"ii":0.03,"pad":0.04,"mpm":0.05,"pcm":0.03,"opf":0.03}},
    "risk_focused":      {"label":"Risk-Focused",      "weights":{"est":0.04,"plan":0.05,"mc":0.07,"rdm":0.05,"ts":0.04,"pi":0.04,"vv":0.06,"sam":0.06,"rsk":0.08,"dar":0.07,"cm":0.06,"car":0.06,"pqa":0.06,"ot":0.03,"gov":0.06,"ii":0.03,"pad":0.03,"mpm":0.05,"pcm":0.03,"opf":0.03}}
  }
}
```

### Content Specification

Generate ~300 assessment items across the 20 practice areas (4 category groups), aligned to CMMI V2.0 practice statements. Additionally, generate ~60-80 extension items for the CMMI-SVC module.

**Category Group: Doing (~105 items, ~15 per PA):**

1. **Estimating (EST)** — Estimation approach, size estimation, effort/cost estimation, estimation validation, historical data usage
2. **Planning (PLAN)** — Work planning, resource planning, schedule development, stakeholder commitment, plan maintenance
3. **Monitor and Control (MC)** — Performance monitoring, corrective action, milestone tracking, data management, progress reporting
4. **Requirements Development and Management (RDM)** — Requirements elicitation, analysis, definition, traceability, change management, validation
5. **Technical Solution (TS)** — Design approach, component design, build/buy/reuse decisions, implementation standards, interface design
6. **Product Integration (PI)** — Integration strategy, interface management, assembly procedures, integration testing, delivery
7. **Verification and Validation (VV)** — Verification methods, peer reviews, validation approach, acceptance criteria, test coverage

**Category Group: Managing (~45 items, ~15 per PA):**

8. **Supplier Agreement Management (SAM)** — Supplier selection, agreement establishment, performance monitoring, risk management, transition planning
9. **Risk and Opportunity Management (RSK)** — Risk identification, analysis, mitigation planning, opportunity capture, risk monitoring
10. **Decision Analysis and Resolution (DAR)** — Decision criteria, alternative evaluation, trade studies, decision documentation, escalation

**Category Group: Enabling (~90 items, ~15 per PA):**

11. **Configuration Management (CM)** — Configuration identification, change control, status accounting, audits, baseline management
12. **Causal Analysis and Resolution (CAR)** — Root cause analysis, defect prevention, process improvement actions, trend analysis
13. **Process Quality Assurance (PQA)** — Process adherence, product evaluation, noncompliance resolution, audit planning, quality metrics
14. **Organizational Training (OT)** — Training needs, program development, delivery methods, effectiveness evaluation, knowledge management
15. **Governance (GOV)** — Governance structure, policy management, oversight mechanisms, compliance assurance, stakeholder engagement
16. **Implementation Infrastructure (II)** — Process infrastructure, tool environment, measurement infrastructure, organizational standards

**Category Group: Improving (~60 items, ~15 per PA):**

17. **Process Asset Development (PAD)** — Process asset library, standard processes, tailoring guidelines, lessons learned, best practices
18. **Managing Performance and Measurement (MPM)** — Measurement objectives, data collection, analysis techniques, performance baselines, statistical methods
19. **Process Management (PCM)** — Process definition, deployment, monitoring, improvement, organizational alignment
20. **Organizational Performance Focus (OPF)** — Performance objectives, process improvement proposals, innovation deployment, capability analysis

**CMMI-SVC Extension (~60-80 items):**

- **Service Delivery (SD)** — Service level agreements, service delivery execution, service reporting, customer communication
- **Service Continuity (SCON)** — Continuity planning, backup and recovery, essential functions, continuity testing
- **Service System Transition (SST)** — Transition planning, deployment management, service system evaluation, rollback procedures
- **Strategic Service Management (SSD)** — Service strategy, service portfolio, demand management, financial management
- **Incident Resolution and Prevention (IRP)** — Incident identification, analysis, resolution, prevention, knowledge base management
- **Capacity and Availability Management (CAM)** — Capacity planning, availability targets, performance monitoring, capacity optimization

Each item must include a 5-level rubric with descriptions for: initial, managed, defined, quantitatively-managed, optimizing.

---

## 12. Build & Packaging

### `build.py` Commands

```bash
python3 build.py              # Build standalone executable (PyInstaller)
python3 build.py --dev        # Run backend (FastAPI) + frontend (Vite) dev servers
python3 build.py --frontend   # Build frontend only → backend/static/
python3 build.py --dist       # Build + create distribution ZIP
```

### Development Mode (`--dev`)
- Backend: `python -m backend.main` on port `8751`
- Frontend: `npm run dev` on port `5173` with Vite proxy `/api → localhost:8751`

### Frontend Build (`--frontend`)
- Runs `npm run build` in `frontend/`
- Output copied to `backend/static/`

### PyInstaller Packaging
- Spec files: `assessment-tool-macos.spec`, `assessment-tool-windows.spec`
- Entry point: `backend/main.py`
- Bundled data: `backend/static/`, `framework/`, `templates/` (if present)
- Hidden imports: `uvicorn.logging`, `uvicorn.loops.auto`, `uvicorn.protocols.http.auto`, `uvicorn.protocols.websockets.auto`, `uvicorn.lifespan.on`
- Output: `dist/assessment-tool` (macOS) or `dist/assessment-tool.exe` (Windows)

### Distribution ZIP (`--dist`)
Creates `dist/CMMIAssessment/`:
```
CMMIAssessment/
├── assessment-tool           # Executable
├── README.txt                # End-user guide
├── framework/                # Read-only framework JSON
├── templates/                # Optional export templates
└── exports/                  # Empty (generated at runtime)
```
Zipped to `dist/CMMIAssessment.zip` (local builds) or `CMMIAssessment-macOS-v1.0.0.zip` / `CMMIAssessment-Windows-v1.0.0.zip` (GitHub Actions releases, version tag appended).

### GitHub Actions (`.github/workflows/`)

#### CI (`.github/workflows/ci.yml`)
Lint + type-check on push and pull requests.

#### Release (`.github/workflows/release.yml`)

Builds macOS (ARM) + Windows executables and creates a draft GitHub release with both ZIPs. **Release zip filenames include the version tag** (e.g., `CMMIAssessment-macOS-v1.0.0.zip`, `CMMIAssessment-Windows-v1.0.0.zip`).

**Critical notes:**
- **GitHub macOS runners are ARM-only** (`macos-latest` = Apple Silicon). The macOS PyInstaller spec must use `target_arch='arm64'`. There are no x86 macOS runners available.
- **The `templates/` directory is optional and may not exist in the repo.** PyInstaller spec files must conditionally include it or the build will fail with `ERROR: Unable to find '…/templates'`. Use this pattern in both spec files:

```python
import os

datas = [
    ('backend/static', 'static'),
    ('framework', 'framework'),
]
if os.path.isdir('templates'):
    datas.append(('templates', 'templates'))

a = Analysis(
    ['backend/main.py'],
    datas=datas,
    ...
)
```

**Workflow structure:**

```yaml
name: Build & Release

on:
  push:
    tags: ['v*']
  workflow_dispatch:
    inputs:
      tag:
        description: 'Release tag (e.g. v1.0.0)'
        required: true

permissions:
  contents: write

jobs:
  build:
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: macos-latest        # ARM only
            platform: macos
            zip_base: CMMIAssessment-macOS
          - os: windows-latest
            platform: windows
            zip_base: CMMIAssessment-Windows

    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt pyinstaller

      - name: Install and build frontend
        working-directory: frontend
        run: npm ci && npm run build

      - name: Build executable (macOS)
        if: matrix.platform == 'macos'
        run: python -m PyInstaller --distpath dist --workpath build_temp assessment-tool-macos.spec

      - name: Build executable (Windows)
        if: matrix.platform == 'windows'
        run: python -m PyInstaller --distpath dist --workpath build_temp assessment-tool-windows.spec

      - name: Determine version tag
        id: version
        shell: bash
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            echo "tag=${{ github.event.inputs.tag }}" >> "$GITHUB_OUTPUT"
          else
            echo "tag=${GITHUB_REF#refs/tags/}" >> "$GITHUB_OUTPUT"
          fi

      - name: Assemble distribution (macOS)
        if: matrix.platform == 'macos'
        run: |
          ZIP_NAME="${{ matrix.zip_base }}-${{ steps.version.outputs.tag }}"
          mkdir -p dist/${ZIP_NAME}
          cp dist/assessment-tool dist/${ZIP_NAME}/
          chmod +x dist/${ZIP_NAME}/assessment-tool
          cp -r framework dist/${ZIP_NAME}/
          if [ -d templates ]; then cp -r templates dist/${ZIP_NAME}/; else mkdir dist/${ZIP_NAME}/templates; fi
          if [ -f README.txt ]; then cp README.txt dist/${ZIP_NAME}/; fi
          mkdir -p dist/${ZIP_NAME}/exports
          cd dist && zip -r ${ZIP_NAME}.zip ${ZIP_NAME}

      - name: Assemble distribution (Windows)
        if: matrix.platform == 'windows'
        shell: pwsh
        run: |
          $ZipName = "${{ matrix.zip_base }}-${{ steps.version.outputs.tag }}"
          New-Item -ItemType Directory -Force -Path "dist/$ZipName"
          Copy-Item "dist/assessment-tool.exe" "dist/$ZipName/"
          Copy-Item -Recurse "framework" "dist/$ZipName/framework"
          if (Test-Path "templates") { Copy-Item -Recurse "templates" "dist/$ZipName/templates" } else { New-Item -ItemType Directory -Force -Path "dist/$ZipName/templates" }
          if (Test-Path "README.txt") { Copy-Item "README.txt" "dist/$ZipName/" }
          New-Item -ItemType Directory -Force -Path "dist/$ZipName/exports"
          Compress-Archive -Path "dist/$ZipName" -DestinationPath "dist/$ZipName.zip"

      - uses: actions/upload-artifact@v4
        with:
          name: ${{ matrix.zip_base }}-${{ steps.version.outputs.tag }}
          path: dist/${{ matrix.zip_base }}-${{ steps.version.outputs.tag }}.zip

  release:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Determine tag
        id: tag
        run: |
          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then
            echo "version=${{ github.event.inputs.tag }}" >> "$GITHUB_OUTPUT"
          else
            echo "version=${GITHUB_REF#refs/tags/}" >> "$GITHUB_OUTPUT"
          fi
      - uses: actions/download-artifact@v4
        with:
          path: artifacts
      - uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ steps.tag.outputs.version }}
          name: CMMI Capability Assessment Tool ${{ steps.tag.outputs.version }}
          draft: true
          generate_release_notes: true
          files: |
            artifacts/CMMIAssessment-macOS-${{ steps.tag.outputs.version }}/CMMIAssessment-macOS-${{ steps.tag.outputs.version }}.zip
            artifacts/CMMIAssessment-Windows-${{ steps.tag.outputs.version }}/CMMIAssessment-Windows-${{ steps.tag.outputs.version }}.zip
```

---

## 13. Implementation Order

Build in 8 sequential chunks. Each chunk should be fully functional before moving to the next.

### Chunk 1 — Project Scaffolding
- Initialize git repo, `.gitignore`, `requirements.txt`, `package.json`
- Backend: `main.py` with FastAPI skeleton, health check endpoint
- Frontend: Vite + React + TypeScript + Tailwind setup
- `build.py` with `--dev` and `--frontend` modes
- Verify: `python3 build.py --dev` serves empty app

### Chunk 2 — Data Model & Framework
- Backend: `models.py` with all Pydantic models
- Backend: `data_manager.py` (load/save/backup logic)
- Frontend: `types.ts` with all interfaces + constants
- Framework: `assessment-framework.json` with complete content (~300 items + ~60-80 extension items)
- API: `GET/PUT /api/assessment`, `GET /api/framework`
- Verify: API returns framework and saves/loads assessment

### Chunk 3 — State Management & Core Layout
- Frontend: `store.tsx` (Context + auto-save)
- Frontend: `api.ts` (fetch client)
- Frontend: `App.tsx` (router + sidebar + content layout)
- Frontend: `Sidebar.tsx` (collapsible, resizable, persistent)
- Pages: `ClientInfo.tsx`, `Dashboard.tsx` (basic)
- Verify: Navigate between pages, data persists

### Chunk 4 — Assessment Scoring UI
- Frontend: `scoring.ts` (all calculation functions)
- Components: `AssessmentItemCard.tsx`, `ScoringWidget.tsx`, `ConfidenceWidget.tsx`
- Pages: `PracticeAreaSummary.tsx`, `CapabilityArea.tsx` (keyboard shortcuts)
- Component: `Breadcrumb.tsx`
- Verify: Score items, see scores update in sidebar + dashboard

### Chunk 5 — Dashboard & Charts
- Dashboard: Radar chart (Recharts), bar chart, progress summary
- Dashboard: Maturity band display, top gaps list
- Component: `StatsFooter.tsx` (global progress + save status)
- Verify: Dashboard reflects scoring accurately

### Chunk 6 — CMMI-SVC Extension Module
- Backend: Extension models + framework loading
- Frontend: `SvcSummary.tsx` + `SvcSection.tsx`
- Sidebar: CMMI-SVC toggle + navigation
- Scoring: Extension scores (separate from composite unless specified)
- Verify: Toggle extension, score items, see results

### Chunk 7 — Exports
- Backend: `export_engine.py` — all 9 export generators (5 core + heatmap + quick-wins + cmmi-roadmap + svc-alignment)
- Radar chart PNG generation (matplotlib)
- API: `POST /api/export/{type}`
- Frontend: `Export.tsx` page with buttons + validation
- Verify: Each export generates a real, correct file

### Chunk 8 — Polish & Packaging
- Components: `CommandPalette.tsx`, `OnboardingTooltip.tsx`
- Frontend: `validation.ts` + validation warnings in Export page
- Pages: `Settings.tsx` (weighting presets + custom sliders), `Help.tsx`
- PyInstaller specs + `build.py --dist`
- `README.txt` for end users
- Verify: Standalone executable runs, all features work

---

## 14. Reference Implementations

Use these existing tools as canonical examples. When in doubt, match their patterns exactly.

| Tool | Path | Hierarchy | Extension |
|------|------|-----------|-----------|
| Zero-Trust Assessment | `/Users/john/Dev/Assessments/Zero-Trust/` | Flat (Pillars + Cross-Cutting) | Classified Extension |
| ITSM Maturity Assessment | `/Users/john/Dev/Assessments/ITSM-ITIL/` | Grouped (Domain Groups → Domains) | ITIL 4 Module |

### Key Patterns to Replicate
- **Auto-save with debounce** — 300ms, immutable state updates via `structuredClone`
- **Sidebar resize + collapse** — drag handle, localStorage persistence, icon-only mode
- **Progress rings** — SVG circles in sidebar showing % complete per entity
- **Score color coding** — consistent colors across sidebar badges, charts, exports
- **Template fallback exports** — check for template file, auto-generate if missing
- **Port scanning** — try default port, increment up to +9 if occupied
- **SPA routing** — FastAPI serves `index.html` for all non-API routes
- **Backup on save** — always write `.bak` before overwriting main data file
- **Dark theme** — all colors from `Design-guide.md`, no light mode

### CMMI-Specific Patterns
- **5-level scoring** — Unlike the 4-level scale in other tools, this uses CMMI's native 1-5 capability levels. The `ScoringWidget` must render 5 radio buttons instead of 4.
- **Grouped hierarchy** — Uses the ITSM-ITIL grouped pattern (Category Group → Practice Area), not the Zero-Trust flat pattern. Reference ITSM-ITIL for sidebar nesting, routing, and scoring aggregation.
- **Custom weight sliders** — The Settings page includes interactive sliders for each practice area weight, with auto-normalization and visual distribution chart. This is unique to this tool.

---

## Quick Start Checklist

1. ~~Copy this template~~ ✓
2. ~~Fill in all placeholder values~~ ✓
3. Write the full framework JSON content (~300 items + ~60-80 extension items with rubrics)
4. ~~Create the git repo and add as submodule~~ ✓
5. Follow the 8-chunk implementation order
6. Cross-reference the two existing tools whenever you need implementation details
