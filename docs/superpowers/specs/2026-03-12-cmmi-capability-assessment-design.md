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
4. **Export:** Frontend `POST /api/export/{type}` → backend generates file in `exports/` → returns `{"filenames": ["path1", ...]}`.

### State Management

React Context + `useReducer` pattern. Single `updateData(draft => { ... })` function that:
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

- **Port discovery:** Try 8751-8760, use first available.
- **Auto-launch browser:** `webbrowser.open(url)` after server starts.
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

### Score Aggregation

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

```
EvidenceReference { document, section, date }
AssessmentItem { id, text, score(1-5|null), na, na_justification, confidence, notes, evidence_references[], attachments[] }
CapabilityArea { id, name, items[] }
PracticeArea { id, name, weight, capability_areas[] }
CategoryGroup { id, name, practice_areas[] }
SvcSection { id, name, capability_areas[] }
SvcExtension { enabled, sections[] }
ClientInfo { name, industry, assessment_date, assessor }
AssessmentMetadata { framework_version, tool_version, last_modified }
ScoringConfig { weighting_model, practice_area_weights{}, custom_weights{} }
AssessmentData { client_info, assessment_metadata, scoring_config, category_groups[], svc_enabled, svc_extension, target_scores{} }
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
| 1 | Findings | DOCX | Per-practice-area item breakdown with scores, notes, evidence |
| 2 | Executive Summary | DOCX | Composite score, embedded radar chart PNG, top gaps |
| 3 | Gap Analysis | DOCX | Current vs target matrix, remediation timeline |
| 4 | Workbook | XLSX | Multi-sheet: Dashboard + per-practice-area sheets |
| 5 | Out-Brief | PPTX | Title + overview + radar + per-category-group slides |
| 6 | Heatmap | XLSX | Practice Area × Capability Area color-coded grid |
| 7 | Quick Wins | DOCX | Low-score, high-impact items prioritized |
| 8 | CMMI Roadmap | DOCX | Level-by-level progression plan with milestones |
| 9 | SVC Alignment | DOCX | SVC scores → service delivery maturity (SVC enabled only) |

### Export Details

- **Filenames:** `D-XX_Name_YYYY-MM-DD_HHMMSS.ext`
- **Radar chart:** matplotlib Agg backend → `exports/radar_chart.png` (6x6in, 150 DPI)
- **Template fallback:** Use `templates/<name>-template.<ext>` if exists, otherwise auto-generate
- **"Export All":** Generates all applicable (skips SVC Alignment if SVC disabled)
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

## 6. Implementation Order

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

## 7. Design Decisions

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

## 8. Tech Stack

### Backend
Python 3, FastAPI, Uvicorn, Pydantic v2, openpyxl, docxtpl, python-pptx, matplotlib (Agg), PyInstaller

### Frontend
React 19, TypeScript 5.9+, Vite 7, Tailwind CSS 4, Recharts, Lucide React, React Router 7

### Design System
Peraton dark theme per `Design-guide.md`: page bg `#0A0A0B`, surfaces `#131212`/`#1C1C1E`/`#262626`/`#333333`, accent `#1BA1E2`, font Segoe UI system stack.
