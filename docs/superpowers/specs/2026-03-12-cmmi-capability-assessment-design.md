# CMMI Capability Assessment Tool — Design Spec

> **Date:** 2026-03-12
> **Status:** Approved
> **Approach:** Build from scratch, referencing ITSM-ITIL for patterns

---

## 1. Architecture & Data Flow

Single-process FastAPI backend serving a React SPA. No external databases — all state persisted to a local JSON file.

```
Browser (React 19 SPA)
    ↕ JSON over HTTP
FastAPI Backend (Uvicorn, single process)
    ↕ File I/O
data.json + data.json.bak (assessment state)
framework/assessment-framework.json (read-only)
```

### Data Flow

1. **Load:** Frontend fetches `GET /api/assessment` + `GET /api/framework` in parallel on mount.
2. **Edit:** User changes flow through `store.tsx` → `structuredClone` deep copy → debounced 300ms → `PUT /api/assessment`.
3. **Save:** Backend writes `data.json.bak` first, then writes to temp file → `os.replace()` atomic swap to `data.json`.
4. **Load fallback:** Try `data.json` → fall back to `data.json.bak` → create fresh assessment from framework.
5. **Export:** Frontend `POST /api/export/{type}` → backend generates file in `exports/` → returns `{"filenames": ["path1", ...]}`.

### State Management

React Context + `useReducer` pattern. `useStore()` hook returns `{data, framework, loading, saveStatus, updateData}`.

`updateData(draft => { ... })` function:
- Clones state with `structuredClone`
- Applies mutation to clone
- Triggers debounced save (300ms)
- Tracks save status: `idle | saving | saved | error`

### API Routes

| Method | Endpoint | Request Body | Response |
|--------|----------|-------------|----------|
| `GET` | `/api/assessment` | — | Full `AssessmentData` JSON |
| `PUT` | `/api/assessment` | `AssessmentData` JSON | `{"status": "saved"}` |
| `GET` | `/api/framework` | — | Framework JSON (read-only) |
| `POST` | `/api/export/{type}` | — | `{"filenames": ["path1", ...]}` |

### Server Behavior

- **Port discovery:** Try 8751-8760, use first available. Log port diagnostics (`lsof`/`netstat`) if all ports busy.
- **Auto-launch browser:** `webbrowser.open(url)` after server starts.
- **Static files:** Serve built frontend from `backend/static/`.
- **SPA fallback:** Non-`/api/*` GET requests serve `index.html`.
- **No CORS:** Vite dev proxy handles `/api` in development.

---

## 2. Data Model & Hierarchy

### Grouped 3-Level Nesting

```
CategoryGroup (4: Doing, Managing, Enabling, Improving)
  └── PracticeArea (20 total, each with weight)
       └── CapabilityArea (3-5 per practice area)
            └── AssessmentItem (3-5 per capability area, ~300 total)
```

### Category Groups and Practice Areas

| Group | Practice Areas |
|-------|---------------|
| Doing (7) | EST, PLAN, MC, RDM, TS, PI, VV |
| Managing (3) | SAM, RSK, DAR |
| Enabling (6) | CM, CAR, PQA, OT, GOV, II |
| Improving (4) | PAD, MPM, PCM, OPF |

### Scoring Model

- **Item scores:** 1-5 integer or N/A (N/A requires justification)
- **Confidence:** High / Medium / Low (optional per item)
- **Notes + evidence references** per item
- **Score labels:** 1=Initial, 2=Managed, 3=Defined, 4=Quantitatively Managed, 5=Optimizing
- **Score colors:** 1=#ef4444, 2=#f97316, 3=#eab308, 4=#84cc16, 5=#22c55e

### Scoring Engine (`frontend/src/scoring.ts`)

```typescript
averageScore(items: AssessmentItem[]): number          // Mean of scored items (exclude N/A)
capabilityAreaScore(ca: CapabilityArea): number         // Average of CA items
practiceAreaScore(pa: PracticeArea): number             // Average of all items in practice area
weightedCompositeScore(data: AssessmentData): number    // Σ(practiceAreaScore × weight) / Σ(weights)
overallCompletion(data: AssessmentData): {scored: number, total: number}
```

- Capability area score = mean of scored items (excluding N/A)
- Practice area score = mean of all scored items across its capability areas
- Composite score = `Σ(practiceAreaScore × weight) / Σ(weights)` (only practice areas with scores)

### Maturity Bands

| Range | Label | Color |
|-------|-------|-------|
| 1.0-1.5 | Initial | #ef4444 |
| 1.5-2.5 | Managed | #f97316 |
| 2.5-3.5 | Defined | #eab308 |
| 3.5-4.5 | Quantitatively Managed | #84cc16 |
| 4.5-5.0 | Optimizing | #22c55e |

### Weighting Models

4 presets (balanced, delivery-focused, quality-focused, risk-focused) plus custom sliders:
- Each practice area: slider range 0.01-0.20, step 0.01
- Auto-normalize so all weights sum to 1.0
- Default model: balanced (all 0.05)
- Default target score: 3.0 per practice area

### CMMI-SVC Extension

- 6 sections: Service Delivery, Service Continuity, Service System Transition, Strategic Service Management, Incident Resolution and Prevention, Capacity and Availability Management
- ~60-80 items with same rubric structure
- Toggle on/off via sidebar switch
- Separate scoring — not included in main composite
- SVC Alignment export only generated when enabled

### Backend Models (Pydantic v2)

```python
EvidenceReference { document: str="", section: str="", date: str="" }
AssessmentItem { id: str, text: str, score: Optional[int]=None (ge=1,le=5), na: bool=False,
                 na_justification: Optional[str]=None, confidence: Optional[str]=None,
                 notes: str="", evidence_references: list[EvidenceReference]=[], attachments: list[str]=[] }
CapabilityArea { id: str, name: str, items: list[AssessmentItem]=[] }
PracticeArea { id: str, name: str, weight: float, capability_areas: list[CapabilityArea]=[] }
CategoryGroup { id: str, name: str, practice_areas: list[PracticeArea]=[] }
SvcSection { id: str, name: str, capability_areas: list[CapabilityArea]=[] }
SvcExtension { enabled: bool=False, sections: list[SvcSection]=[] }
ClientInfo { name: str="", industry: str="", assessment_date: str="", assessor: str="" }
AssessmentMetadata { framework_version: str="1.0", tool_version: str="1.0.0", last_modified: str="" }
ScoringConfig { weighting_model: str="balanced", practice_area_weights: dict[str,float]={},
                custom_weights: Optional[dict[str,float]]=None }
AssessmentData { client_info, assessment_metadata, scoring_config, category_groups: list[CategoryGroup]=[],
                 svc_enabled: bool=False, svc_extension: Optional[SvcExtension]=None,
                 target_scores: dict[str,float]={} }
```

### Frontend Interfaces (TypeScript)

Mirror Pydantic models 1:1, plus constants: `SCORE_LABELS`, `SCORE_COLORS`, `MATURITY_BANDS`, `WEIGHTING_MODELS`, `getMaturityBand()`.

---

## 3. Pages, Routing & Sidebar

### Routes

```
/                                → ClientInfo
/dashboard                       → Dashboard
/practice-area/:entityId         → PracticeAreaSummary
/practice-area/:entityId/:areaId → CapabilityArea
/svc                             → SvcSummary
/svc/:sectionId                  → SvcSection
/svc/:sectionId/:areaId          → SvcSection
/export                          → Export
/settings                        → Settings
/help                            → Help
```

### Sidebar

- **Collapsible:** 56px icon-only ↔ full width
- **Resizable:** Drag right edge (min 180px, max 480px, default 350px)
- **Persisted:** `localStorage["cmmi-sidebar"]`
- **Logo:** Top-left, ~160px wide on dark surface

**Tree structure:**
```
Client Info → Dashboard
────────────
DOING [chevron]
  ├── Estimating (EST)        [score badge] [progress ring]
  ├── Planning (PLAN)         ...
  └── ... (7 practice areas)
MANAGING [chevron]
  ├── ... (3 practice areas)
ENABLING [chevron]
  ├── ... (6 practice areas)
IMPROVING [chevron]
  ├── ... (4 practice areas)
────────────
CMMI-SVC [toggle switch]
  ├── Service Delivery (SD)
  └── ... (6 sections)
────────────
Export / Settings / Help
```

- **Progress rings:** SVG circle showing % scored per practice area
- **Score badges:** Rounded average, color-coded by score color map

### Keyboard Shortcuts

**Global:**
- `Cmd/Ctrl+K` — Toggle Command Palette
- `Cmd/Ctrl+Right` — Jump to next unscored item

**CapabilityArea page:**
- `1-5` — Set score on focused item
- `H/M/L` — Set confidence
- `N` — Toggle N/A
- `Up/Down` — Navigate between items

### Command Palette

Fuzzy search across all practice areas + capability areas. Shows score + completion status in results. Navigate to any page instantly.

---

## 4. Exports & Build Pipeline

### 9 Export Types

| # | Name | Format | Content |
|---|------|--------|---------|
| 1 | Assessment Findings | DOCX | Per-practice-area item breakdown with scores, notes, evidence |
| 2 | Executive Summary | DOCX | Composite score, embedded radar chart PNG, top gaps |
| 3 | Gap Analysis & Roadmap | DOCX | Current vs target matrix, remediation timeline |
| 4 | Scored Assessment Workbook | XLSX | Multi-sheet: Dashboard + per-practice-area sheets |
| 5 | Out-Brief Presentation | PPTX | Title + overview + radar + per-category-group slides |
| 6 | Maturity Heatmap | XLSX | Practice Area × Capability Area color-coded grid |
| 7 | Quick Wins Report | DOCX | Low-score, high-impact items prioritized |
| 8 | CMMI Roadmap | DOCX | Level-by-level progression plan with milestones |
| 9 | SVC Alignment Report | DOCX | SVC scores → service delivery maturity (SVC enabled only) |

### Export Details

- **Filenames:** `D-XX_Name_YYYY-MM-DD_HHMMSS.ext`
- **Radar chart:** matplotlib Agg backend → `exports/radar_chart.png` (6x6in, 150 DPI)
- **Template fallback:** Use `templates/<name>-template.<ext>` if exists, otherwise auto-generate
- **"Export All":** Type `"all"` generates all applicable exports (skips SVC Alignment if SVC disabled)
- **Valid types:** `["findings","executive-summary","gap-analysis","workbook","outbrief","heatmap","quick-wins","cmmi-roadmap","svc-alignment","all"]`
- **Error codes:** 400 invalid type, 404 framework missing, 500 server error

### Build Pipeline (`build.py`)

| Command | Action |
|---------|--------|
| `python3 build.py --dev` | Backend on 8751 + frontend on 5173 (Vite proxy) |
| `python3 build.py --frontend` | Vite build → `backend/static/` |
| `python3 build.py` | PyInstaller executable |
| `python3 build.py --dist` | Executable + assets → `CMMIAssessment.zip` |

### Distribution ZIP Structure

```
CMMIAssessment/
├── assessment-tool           # Executable
├── README.txt
├── framework/
├── templates/
└── exports/                  # Empty, populated at runtime
```

### CI/CD

- **ci.yml:** Lint + type-check on push/PR
- **release.yml:** On tag `v*`, builds macOS ARM + Windows executables, creates draft GitHub release with `CMMIAssessment-macOS-v*.zip` and `CMMIAssessment-Windows-v*.zip`

---

## 5. Framework Content

### Base Assessment (~300 items)

20 practice areas, each with 3-5 capability areas, each with 3-5 items. Every item includes question text and 5-level rubric (initial, managed, defined, quantitatively-managed, optimizing) aligned to CMMI V2.0.

**Item distribution:**
- Doing: ~105 items (~15 per PA × 7 PAs)
- Managing: ~45 items (~15 per PA × 3 PAs)
- Enabling: ~90 items (~15 per PA × 6 PAs)
- Improving: ~60 items (~15 per PA × 4 PAs)

### CMMI-SVC Extension (~60-80 items)

6 sections (SD, SCON, SST, SSD, IRP, CAM) following the same capability area → item → rubric structure.

### ID Conventions

- Capability areas: `est-ca1`, `plan-ca2`, `svc-sd-ca1`
- Items: `est-1-1`, `plan-2-3`, `svc-sd-1-1`

---

## 6. Validation Rules (`frontend/src/validation.ts`)

| Rule | Severity | Condition |
|------|----------|-----------|
| `unscored` | info | Item has no score and is not N/A |
| `na-no-justification` | error | N/A checked but no justification |
| `scored-no-notes` | warning | Score assigned but notes empty |
| `low-confidence-no-notes` | warning | Confidence = "Low" with no notes |

---

## 7. Project Structure

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
│           └── Help.tsx               # Keyboard shortcuts, documentation
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

### Identity Constants

```
"CMMI Capability Assessment Tool"     # Tool display name
"cmmi-assessment"                     # Tool slug (filenames, dist folder)
"CMMI V2.0"                          # Framework alignment
"cmmi-sidebar"                       # localStorage sidebar key
8751                                  # Default port (auto-scans 8751-8760)
```

---

## 8. Implementation Order

8 sequential chunks, each fully functional before proceeding:

1. **Project Scaffolding** — Git, dependencies, FastAPI skeleton, Vite+React+TS+Tailwind, `build.py --dev`
2. **Data Model & Framework** — Pydantic models, data_manager, TypeScript types, full framework JSON (~300+80 items), API endpoints
3. **State Management & Core Layout** — Store, API client, App shell, Sidebar, ClientInfo, basic Dashboard
4. **Assessment Scoring UI** — Scoring engine, AssessmentItemCard, ScoringWidget, ConfidenceWidget, PracticeAreaSummary, CapabilityArea page, Breadcrumb
5. **Dashboard & Charts** — Radar chart, bar chart, progress summary, maturity bands, StatsFooter
6. **CMMI-SVC Extension** — Extension models, SvcSummary, SvcSection, sidebar toggle, extension scoring
7. **Exports** — All 9 export generators, radar chart PNG, Export page
8. **Polish & Packaging** — CommandPalette, OnboardingTooltip, validation, Settings (custom sliders), Help, PyInstaller specs, README.txt

---

## 9. Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Build approach | From scratch | Clean git history, no leftover artifacts from reference |
| Reference impl | ITSM-ITIL | Same grouped hierarchy pattern, proven architecture |
| Scoring scale | 1-5 (not 1-4) | CMMI V2.0 native capability levels |
| State management | React Context | Matches reference, sufficient for single-user tool |
| Content generation | All upfront in Chunk 2 | User preference, complete tool from first working build |
| Extension scoring | Separate from composite | SVC is supplementary, not core CMMI |
| Custom sliders | Auto-normalize to 1.0 | Prevents invalid weight configurations |

---

## 10. Tech Stack

### Backend
Python 3, FastAPI, Uvicorn, Pydantic v2, openpyxl, docxtpl, python-pptx, matplotlib (Agg), PyInstaller

### Frontend
React 19, TypeScript 5.9+, Vite 7, Tailwind CSS 4, Recharts, Lucide React, React Router 7

### Design System
Peraton dark theme per `Design-guide.md`: page bg `#0A0A0B`, surfaces `#131212`/`#1C1C1E`/`#262626`/`#333333`, accent `#1BA1E2`, font Segoe UI system stack.
