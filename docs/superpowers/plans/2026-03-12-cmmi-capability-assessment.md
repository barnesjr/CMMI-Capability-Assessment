# CMMI Capability Assessment Tool Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete CMMI Capability Assessment Tool — a FastAPI + React SPA for scoring ~300 assessment items across 20 CMMI V2.0 practice areas, with a CMMI-SVC extension module, 9 export deliverables, and PyInstaller packaging.

**Architecture:** Single-process FastAPI backend serves a React 19 SPA. Assessment state persists to `data.json` with atomic writes and backup. Framework definition is read-only JSON. Frontend uses React Context + structuredClone for immutable state with 300ms debounced auto-save.

**Tech Stack:** Python 3 / FastAPI / Pydantic v2 / openpyxl / docxtpl / python-pptx / matplotlib | React 19 / TypeScript 5.9+ / Vite 7 / Tailwind CSS 4 / Recharts / Lucide React / React Router 7

**Spec:** `docs/superpowers/specs/2026-03-12-cmmi-capability-assessment-design.md`
**Reference impl:** `/Users/john/Dev/Assessments/ITSM-ITIL/` (same grouped hierarchy pattern)
**Design guide:** `/Users/john/Dev/Assessments/Design-guide.md`

---

## Chunk 1: Project Scaffolding

### Task 1.1: Initialize Project Root Files

**Files:**
- Create: `.gitignore`
- Create: `requirements.txt`

- [ ] **Step 1: Create .gitignore**

```gitignore
__pycache__/
*.pyc
.venv/
*.egg-info/
dist/
build_temp/
*.spec.bak
data.json
data.json.bak
exports/
node_modules/
backend/static/
.DS_Store
*.tmp
```

- [ ] **Step 2: Create requirements.txt**

```
fastapi>=0.115.0
uvicorn[standard]>=0.30.0
pydantic>=2.0.0
openpyxl>=3.1.0
docxtpl>=0.18.0
python-pptx>=1.0.0
matplotlib>=3.9.0
pyinstaller>=6.0.0
```

- [ ] **Step 3: Create Python virtual environment and install deps**

Run:
```bash
cd /Users/john/Dev/Assessments/CMMI-Capability-Assessment
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore requirements.txt
git commit -m "feat: add project root files (.gitignore, requirements.txt)"
```

---

### Task 1.2: Backend Skeleton

**Files:**
- Create: `backend/__init__.py`
- Create: `backend/main.py`

- [ ] **Step 1: Create backend/__init__.py**

Empty file.

- [ ] **Step 2: Create backend/main.py with FastAPI skeleton**

```python
import os
import sys
import socket
import subprocess
import webbrowser
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn


def get_base_dir() -> str:
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return str(Path(__file__).parent.parent)


def get_resource_dir() -> str:
    if getattr(sys, "frozen", False):
        return sys._MEIPASS
    return str(Path(__file__).parent.parent)


BASE_DIR = get_base_dir()
RESOURCE_DIR = get_resource_dir()

app = FastAPI(title="CMMI Capability Assessment Tool", version="1.0.0")


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


# Static file serving
static_dir = Path(RESOURCE_DIR) / "backend" / "static"
if not static_dir.exists():
    static_dir = Path(RESOURCE_DIR) / "static"

if static_dir.exists() and (static_dir / "index.html").exists():
    assets_dir = static_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = static_dir / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(static_dir / "index.html"))


def find_available_port(start: int = 8751, end: int = 8760) -> int:
    for port in range(start, end + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                return port
            except OSError:
                continue
    # Log port diagnostics
    try:
        result = subprocess.run(
            ["lsof", "-i", f":{start}-{end}"],
            capture_output=True, text=True, timeout=5,
        )
        print(f"Port diagnostics:\n{result.stdout}")
    except Exception:
        pass
    raise RuntimeError(f"No available port in range {start}-{end}")


def main():
    try:
        port = find_available_port()
    except RuntimeError as e:
        print(f"ERROR: {e}")
        sys.exit(1)

    url = f"http://localhost:{port}"
    print(f"\n  CMMI Capability Assessment Tool")
    print(f"  Running at: {url}")
    print(f"  Press Ctrl+C to stop\n")

    webbrowser.open(url)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="warning")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Verify backend starts**

Run:
```bash
source .venv/bin/activate
python -m backend.main
```
Expected: Server starts on port 8751, health check at `http://localhost:8751/api/health` returns `{"status": "ok"}`.

- [ ] **Step 4: Commit**

```bash
git add backend/
git commit -m "feat: add FastAPI backend skeleton with health check and port discovery"
```

---

### Task 1.3: Frontend Scaffold

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.app.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/main.css`

- [ ] **Step 1: Create frontend/package.json**

```json
{
  "name": "cmmi-assessment-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.577.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^7.13.1",
    "recharts": "^3.8.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.2.1",
    "@types/node": "^25.4.0",
    "@types/react": "^19.2.7",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "tailwindcss": "^4.2.1",
    "typescript": "~5.9.3",
    "vite": "^7.3.1"
  }
}
```

- [ ] **Step 2: Create frontend/vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../backend/static'),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8751',
    },
  },
})
```

- [ ] **Step 3: Create frontend/tsconfig.json**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 4: Create frontend/tsconfig.app.json**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "types": ["vite/client"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create frontend/tsconfig.node.json**

```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "erasableSyntaxOnly": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Create frontend/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CMMI Capability Assessment Tool</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create frontend/src/main.css**

Tailwind CSS 4 entry point with Peraton design tokens:

```css
@import "tailwindcss";

@theme {
  --color-page-bg: #0A0A0B;
  --color-surface-dark: #131212;
  --color-surface-medium: #1C1C1E;
  --color-surface-elevated: #262626;
  --color-surface-muted: #333333;
  --color-accent: #1BA1E2;
  --color-accent-bright: #00BCF2;
  --color-link-blue: #45A2FF;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #D0D0D0;
  --color-border-gray: #6B6B6B;
  --color-score-1: #ef4444;
  --color-score-2: #f97316;
  --color-score-3: #eab308;
  --color-score-4: #84cc16;
  --color-score-5: #22c55e;
  --font-family-sans: "Segoe UI", -apple-system, system-ui, Roboto, "Helvetica Neue", sans-serif;
}

body {
  background-color: var(--color-page-bg);
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  margin: 0;
}
```

- [ ] **Step 8: Create frontend/src/main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './main.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 9: Create frontend/src/App.tsx (placeholder)**

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-page-bg text-text-primary flex items-center justify-center">
      <h1 className="text-2xl font-bold">CMMI Capability Assessment Tool</h1>
    </div>
  );
}
```

- [ ] **Step 10: Install frontend dependencies**

Run:
```bash
cd frontend && npm install
```

- [ ] **Step 11: Verify frontend dev server**

Run:
```bash
cd frontend && npm run dev
```
Expected: Vite dev server starts on port 5173, shows "CMMI Capability Assessment Tool" heading with dark background.

- [ ] **Step 12: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold React 19 + Vite 7 + TypeScript + Tailwind CSS 4 frontend"
```

---

### Task 1.4: Build Script

**Files:**
- Create: `build.py`

- [ ] **Step 1: Create build.py**

```python
#!/usr/bin/env python3
"""Build script for CMMI Capability Assessment Tool.

Usage:
  python build.py          # Build for current platform
  python build.py --dev    # Run in development mode (backend + frontend dev server)
  python build.py --frontend  # Build frontend only
  python build.py --dist   # Build and create distribution ZIP
"""

import subprocess
import sys
import os
from pathlib import Path

BASE = Path(__file__).parent


def build_frontend():
    print("Building frontend...")
    subprocess.run(
        ["npm", "run", "build"],
        cwd=str(BASE / "frontend"),
        check=True,
    )
    print("Frontend built to backend/static/")


def run_dev():
    """Run backend and frontend dev servers."""
    import signal

    print("Starting backend on :8751...")
    backend = subprocess.Popen(
        [sys.executable, "-m", "backend.main"],
        cwd=str(BASE),
    )

    print("Starting frontend dev server on :5173...")
    frontend = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(BASE / "frontend"),
    )

    def cleanup(sig, frame):
        backend.terminate()
        frontend.terminate()
        sys.exit(0)

    signal.signal(signal.SIGINT, cleanup)
    signal.signal(signal.SIGTERM, cleanup)

    try:
        backend.wait()
    except KeyboardInterrupt:
        cleanup(None, None)


def build_package():
    """Build standalone executable with PyInstaller."""
    import platform
    try:
        import PyInstaller  # noqa: F401
    except ImportError:
        print("Installing PyInstaller...")
        subprocess.run([sys.executable, "-m", "pip", "install", "pyinstaller"], check=True)

    build_frontend()

    spec_file = "assessment-tool-macos.spec" if platform.system() == "Darwin" else "assessment-tool-windows.spec"
    spec_path = BASE / spec_file

    if spec_path.exists():
        print(f"Building with {spec_file}...")
        subprocess.run([
            sys.executable, "-m", "PyInstaller",
            "--distpath", str(BASE / "dist"),
            "--workpath", str(BASE / "build_temp"),
            str(spec_path),
        ], check=True)
        print("\nBuild complete! Executable: dist/assessment-tool")
    else:
        print(f"Warning: {spec_file} not found, falling back to CLI args")
        subprocess.run([
            sys.executable, "-m", "PyInstaller",
            "--name", "assessment-tool",
            "--onefile",
            "--add-data", "backend/static:static",
            "--add-data", "framework:framework",
            "--hidden-import", "uvicorn.logging",
            "--hidden-import", "uvicorn.protocols.http",
            "--hidden-import", "uvicorn.protocols.http.auto",
            "--hidden-import", "uvicorn.protocols.http.h11_impl",
            "--hidden-import", "uvicorn.protocols.websockets",
            "--hidden-import", "uvicorn.protocols.websockets.auto",
            "--hidden-import", "uvicorn.lifespan",
            "--hidden-import", "uvicorn.lifespan.on",
            "--hidden-import", "uvicorn.lifespan.off",
            "--hidden-import", "email.mime.multipart",
            "--hidden-import", "email.mime.text",
            "--distpath", str(BASE / "dist"),
            "--workpath", str(BASE / "build_temp"),
            "--specpath", str(BASE),
            str(BASE / "backend" / "main.py"),
        ], check=True)
        print("\nBuild complete! Executable: dist/assessment-tool")


def assemble_distribution():
    """Assemble distribution ZIP with executable, templates, framework, README."""
    import shutil
    import platform

    build_package()

    dist_name = "CMMIAssessment"
    dist_dir = BASE / "dist" / dist_name
    if dist_dir.exists():
        shutil.rmtree(dist_dir)
    dist_dir.mkdir(parents=True)

    exe_name = "assessment-tool"
    if platform.system() == "Windows":
        exe_name += ".exe"
    exe_src = BASE / "dist" / exe_name
    if not exe_src.exists():
        print(f"Error: executable not found at {exe_src}")
        sys.exit(1)
    shutil.copy2(str(exe_src), str(dist_dir / exe_name))

    readme = BASE / "README.txt"
    if readme.exists():
        shutil.copy2(str(readme), str(dist_dir / "README.txt"))

    templates_src = BASE / "templates"
    if templates_src.exists():
        shutil.copytree(str(templates_src), str(dist_dir / "templates"))
    else:
        (dist_dir / "templates").mkdir()

    framework_src = BASE / "framework"
    if framework_src.exists():
        shutil.copytree(str(framework_src), str(dist_dir / "framework"))

    (dist_dir / "exports").mkdir()

    zip_path = BASE / "dist" / dist_name
    shutil.make_archive(str(zip_path), "zip", str(BASE / "dist"), dist_name)

    zip_file = BASE / "dist" / f"{dist_name}.zip"
    size_mb = zip_file.stat().st_size / (1024 * 1024)
    print(f"\nDistribution ZIP: dist/{dist_name}.zip ({size_mb:.1f} MB)")


if __name__ == "__main__":
    if "--dev" in sys.argv:
        run_dev()
    elif "--frontend" in sys.argv:
        build_frontend()
    elif "--dist" in sys.argv:
        assemble_distribution()
    else:
        build_package()
```

- [ ] **Step 2: Verify dev mode**

Run:
```bash
source .venv/bin/activate
python3 build.py --dev
```
Expected: Backend starts on 8751, frontend dev server on 5173. `http://localhost:5173` shows the placeholder app. `http://localhost:5173/api/health` proxies to backend and returns `{"status": "ok"}`.

- [ ] **Step 3: Commit**

```bash
git add build.py
git commit -m "feat: add build.py with --dev, --frontend, --dist modes"
```

---

## Chunk 2: Data Model & Framework

### Task 2.1: Pydantic Models

**Files:**
- Create: `backend/models.py`

- [ ] **Step 1: Create backend/models.py**

```python
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


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
    confidence: Optional[str] = Field(None, pattern="^(High|Medium|Low)$")
    notes: str = ""
    evidence_references: list[EvidenceReference] = Field(default_factory=list)
    attachments: list[str] = Field(default_factory=list)


class CapabilityArea(BaseModel):
    id: str
    name: str
    items: list[AssessmentItem] = Field(default_factory=list)


class PracticeArea(BaseModel):
    id: str
    name: str
    weight: float = 0.05
    capability_areas: list[CapabilityArea] = Field(default_factory=list)


class CategoryGroup(BaseModel):
    id: str
    name: str
    practice_areas: list[PracticeArea] = Field(default_factory=list)


class SvcSection(BaseModel):
    id: str
    name: str
    capability_areas: list[CapabilityArea] = Field(default_factory=list)


class SvcExtension(BaseModel):
    enabled: bool = False
    sections: list[SvcSection] = Field(default_factory=list)


class ClientInfo(BaseModel):
    name: str = ""
    industry: str = ""
    assessment_date: str = ""
    assessor: str = ""


class AssessmentMetadata(BaseModel):
    framework_version: str = "1.0"
    tool_version: str = "1.0.0"
    last_modified: str = Field(default_factory=lambda: datetime.now().isoformat())


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

- [ ] **Step 2: Verify models load**

Run:
```bash
source .venv/bin/activate
python -c "from backend.models import AssessmentData; d = AssessmentData(); print(d.model_dump_json(indent=2)[:200])"
```
Expected: Prints valid JSON with default values.

- [ ] **Step 3: Commit**

```bash
git add backend/models.py
git commit -m "feat: add Pydantic v2 data models for CMMI assessment"
```

---

### Task 2.2: Data Manager

**Files:**
- Create: `backend/data_manager.py`

- [ ] **Step 1: Create backend/data_manager.py**

Follow the pattern from the ITSM-ITIL reference (`/Users/john/Dev/Assessments/ITSM-ITIL/backend/data_manager.py`) but adapted for CMMI hierarchy:

```python
import json
import os
import shutil
import tempfile
from pathlib import Path
from datetime import datetime

try:
    from .models import (
        AssessmentData, AssessmentItem, CapabilityArea, PracticeArea,
        CategoryGroup, SvcExtension, SvcSection,
        ClientInfo, AssessmentMetadata, ScoringConfig,
    )
except ImportError:
    from models import (
        AssessmentData, AssessmentItem, CapabilityArea, PracticeArea,
        CategoryGroup, SvcExtension, SvcSection,
        ClientInfo, AssessmentMetadata, ScoringConfig,
    )


class DataManager:
    def __init__(self, base_dir: str, resource_dir: str | None = None):
        self.base_dir = Path(base_dir)
        self.resource_dir = Path(resource_dir) if resource_dir else self.base_dir
        self.data_path = self.base_dir / "data.json"
        self.backup_path = self.base_dir / "data.json.bak"
        self.framework_path = self.resource_dir / "framework" / "assessment-framework.json"
        self.exports_dir = self.base_dir / "exports"
        self.templates_dir = self.resource_dir / "templates"
        self._framework: dict | None = None

    def load_framework(self) -> dict:
        if self._framework is None:
            with open(self.framework_path, "r") as f:
                self._framework = json.load(f)
        return self._framework

    def _create_empty_item(self, fw_item: dict) -> dict:
        return {
            "id": fw_item["id"],
            "text": fw_item["text"],
            "score": None,
            "na": False,
            "na_justification": None,
            "confidence": None,
            "notes": "",
            "evidence_references": [],
            "attachments": [],
        }

    def create_empty_assessment(self) -> AssessmentData:
        fw = self.load_framework()

        category_groups = []
        for fw_group in fw["category_groups"]:
            practice_areas = []
            for fw_pa in fw_group["practice_areas"]:
                cas = []
                for fw_ca in fw_pa["capability_areas"]:
                    items = [AssessmentItem(**self._create_empty_item(fi)) for fi in fw_ca["items"]]
                    cas.append(CapabilityArea(id=fw_ca["id"], name=fw_ca["name"], items=items))
                practice_areas.append(PracticeArea(
                    id=fw_pa["id"],
                    name=fw_pa["name"],
                    weight=fw_pa.get("weight", 0.05),
                    capability_areas=cas,
                ))
            category_groups.append(CategoryGroup(
                id=fw_group["id"], name=fw_group["name"], practice_areas=practice_areas,
            ))

        svc_ext = None
        fw_svc = fw.get("svc_extension")
        if fw_svc:
            sections = []
            for fw_section in fw_svc.get("sections", []):
                cas = []
                for fw_ca in fw_section["capability_areas"]:
                    items = [AssessmentItem(**self._create_empty_item(fi)) for fi in fw_ca["items"]]
                    cas.append(CapabilityArea(id=fw_ca["id"], name=fw_ca["name"], items=items))
                sections.append(SvcSection(
                    id=fw_section["id"], name=fw_section["name"], capability_areas=cas,
                ))
            svc_ext = SvcExtension(enabled=True, sections=sections)

        all_pas = [pa for g in category_groups for pa in g.practice_areas]
        target_scores = {pa.id: 3.0 for pa in all_pas}
        weights = {pa.id: pa.weight for pa in all_pas}

        return AssessmentData(
            client_info=ClientInfo(assessment_date=datetime.now().strftime("%Y-%m-%d")),
            assessment_metadata=AssessmentMetadata(),
            scoring_config=ScoringConfig(practice_area_weights=weights),
            category_groups=category_groups,
            svc_enabled=False,
            svc_extension=svc_ext,
            target_scores=target_scores,
        )

    def load_assessment(self) -> AssessmentData:
        if not self.data_path.exists():
            data = self.create_empty_assessment()
            self.save_assessment(data)
            return data

        try:
            with open(self.data_path, "r") as f:
                raw = json.load(f)
            return AssessmentData(**raw)
        except (json.JSONDecodeError, Exception):
            if self.backup_path.exists():
                try:
                    with open(self.backup_path, "r") as f:
                        raw = json.load(f)
                    return AssessmentData(**raw)
                except Exception:
                    pass
            data = self.create_empty_assessment()
            self.save_assessment(data)
            return data

    def save_assessment(self, data: AssessmentData) -> None:
        data.assessment_metadata.last_modified = datetime.now().isoformat()
        self.exports_dir.mkdir(exist_ok=True)

        if self.data_path.exists():
            shutil.copy2(self.data_path, self.backup_path)

        fd, tmp_path = tempfile.mkstemp(
            dir=str(self.base_dir), suffix=".json.tmp"
        )
        try:
            with os.fdopen(fd, "w") as f:
                json.dump(data.model_dump(), f, indent=2, default=str)
            os.replace(tmp_path, str(self.data_path))
        except Exception:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
            raise
```

- [ ] **Step 2: Verify DataManager (requires framework JSON from Task 2.3 — verify after that task)**

This will be verified after the framework JSON is created in Task 2.3.

- [ ] **Step 3: Commit**

```bash
git add backend/data_manager.py
git commit -m "feat: add DataManager with load/save/backup and framework scaffolding"
```

---

### Task 2.3: Framework JSON — Generate Complete Content

**Files:**
- Create: `framework/assessment-framework.json`

This is the largest single task. Generate ~300 base assessment items across 20 practice areas (4 category groups) plus ~60-80 CMMI-SVC extension items. Every item needs a 5-level rubric.

- [ ] **Step 1: Create framework/assessment-framework.json**

Structure:
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
                  "text": "How well-defined is the organization's approach to estimation?",
                  "rubric": {
                    "initial": "No defined estimation approach...",
                    "managed": "Basic estimation processes exist...",
                    "defined": "Standardized estimation methodology...",
                    "quantitatively-managed": "Statistical models inform estimates...",
                    "optimizing": "Continuously improving estimation..."
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
    "sections": [...]
  },
  "weighting_models": {
    "balanced": {"label": "Balanced", "weights": {"est": 0.05, ...}},
    "delivery_focused": {"label": "Delivery-Focused", "weights": {...}},
    "quality_focused": {"label": "Quality-Focused", "weights": {...}},
    "risk_focused": {"label": "Risk-Focused", "weights": {...}}
  }
}
```

Generate content for all 20 practice areas following the spec's content specification (design spec Section 5). Each practice area gets 3-5 capability areas with 3-5 items each (~15 items per PA). Each item gets a descriptive 5-level rubric aligned to CMMI V2.0 practices.

The 20 practice areas and their capability area topics:

**Doing:**
1. EST — estimation approach, size estimation, effort/cost estimation, estimation validation, historical data
2. PLAN — work planning, resource planning, schedule development, stakeholder commitment, plan maintenance
3. MC — performance monitoring, corrective action, milestone tracking, data management, progress reporting
4. RDM — requirements elicitation, analysis, definition, traceability, change management, validation
5. TS — design approach, component design, build/buy/reuse, implementation standards, interface design
6. PI — integration strategy, interface management, assembly procedures, integration testing, delivery
7. VV — verification methods, peer reviews, validation approach, acceptance criteria, test coverage

**Managing:**
8. SAM — supplier selection, agreement establishment, performance monitoring, risk management, transition
9. RSK — risk identification, analysis, mitigation planning, opportunity capture, monitoring
10. DAR — decision criteria, alternative evaluation, trade studies, documentation, escalation

**Enabling:**
11. CM — configuration identification, change control, status accounting, audits, baseline management
12. CAR — root cause analysis, defect prevention, improvement actions, trend analysis
13. PQA — process adherence, product evaluation, noncompliance resolution, audit planning, quality metrics
14. OT — training needs, program development, delivery methods, effectiveness evaluation, knowledge mgmt
15. GOV — governance structure, policy management, oversight mechanisms, compliance, stakeholder engagement
16. II — process infrastructure, tool environment, measurement infrastructure, organizational standards

**Improving:**
17. PAD — process asset library, standard processes, tailoring guidelines, lessons learned, best practices
18. MPM — measurement objectives, data collection, analysis techniques, performance baselines, statistical methods
19. PCM — process definition, deployment, monitoring, improvement, organizational alignment
20. OPF — performance objectives, improvement proposals, innovation deployment, capability analysis

**SVC Extension (6 sections, ~10-14 items each):**
- SD — SLA management, delivery execution, reporting, customer communication
- SCON — continuity planning, backup/recovery, essential functions, testing
- SST — transition planning, deployment management, evaluation, rollback
- SSD — service strategy, portfolio, demand management, financial management
- IRP — incident identification, analysis, resolution, prevention, knowledge base
- CAM — capacity planning, availability targets, monitoring, optimization

Include the weighting models with exact weights from the spec.

- [ ] **Step 2: Validate framework JSON**

Run:
```bash
source .venv/bin/activate
python -c "
import json
with open('framework/assessment-framework.json') as f:
    fw = json.load(f)
groups = fw['category_groups']
total_items = 0
for g in groups:
    for pa in g['practice_areas']:
        for ca in pa['capability_areas']:
            total_items += len(ca['items'])
            for item in ca['items']:
                assert 'rubric' in item, f'Missing rubric: {item[\"id\"]}'
                assert len(item['rubric']) == 5, f'Wrong rubric count: {item[\"id\"]}'
print(f'Total base items: {total_items}')
svc = fw.get('svc_extension', {})
svc_items = sum(len(i) for s in svc.get('sections', []) for ca in s['capability_areas'] for i in [ca['items']])
print(f'SVC items: {svc_items}')
print(f'Practice areas: {sum(len(g[\"practice_areas\"]) for g in groups)}')
print(f'Weighting models: {list(fw[\"weighting_models\"].keys())}')
"
```
Expected: ~300 base items, ~60-80 SVC items, 20 practice areas, 4 weighting models.

- [ ] **Step 3: Commit**

```bash
git add framework/
git commit -m "feat: add complete CMMI V2.0 assessment framework (~300 items + SVC extension)"
```

---

### Task 2.4: Wire API Endpoints

**Files:**
- Modify: `backend/main.py`

- [ ] **Step 1: Add data_manager and export_engine imports and API routes to main.py**

Add after the `get_resource_dir` function and before `app = FastAPI(...)`:

```python
try:
    from .models import AssessmentData
    from .data_manager import DataManager
except ImportError:
    from models import AssessmentData
    from data_manager import DataManager
```

Add `data_manager` initialization:
```python
data_manager = DataManager(BASE_DIR, resource_dir=RESOURCE_DIR)
```

Replace the health check with full API routes:

```python
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


@app.get("/api/assessment")
async def get_assessment():
    try:
        data = data_manager.load_assessment()
        return data.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/assessment")
async def save_assessment(data: AssessmentData):
    try:
        data_manager.save_assessment(data)
        return {"status": "saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/framework")
async def get_framework():
    try:
        fw = data_manager.load_framework()
        return fw
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Framework file not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **Step 2: Verify API works end-to-end**

Run:
```bash
source .venv/bin/activate
python -m backend.main &
sleep 2
curl -s http://localhost:8751/api/health | python -m json.tool
curl -s http://localhost:8751/api/framework | python -c "import sys,json; d=json.load(sys.stdin); print(f'Groups: {len(d[\"category_groups\"])}, PAs: {sum(len(g[\"practice_areas\"]) for g in d[\"category_groups\"])}')"
curl -s http://localhost:8751/api/assessment | python -c "import sys,json; d=json.load(sys.stdin); print(f'Groups: {len(d[\"category_groups\"])}')"
kill %1
```
Expected: Health OK, 4 groups / 20 PAs from framework, assessment data loads with empty scores.

- [ ] **Step 3: Commit**

```bash
git add backend/main.py
git commit -m "feat: wire assessment and framework API endpoints"
```

---

### Task 2.5: TypeScript Types and Constants

**Files:**
- Create: `frontend/src/types.ts`

- [ ] **Step 1: Create frontend/src/types.ts**

```typescript
// Score constants
export const SCORE_LABELS: Record<number, string> = {
  1: "Initial",
  2: "Managed",
  3: "Defined",
  4: "Quantitatively Managed",
  5: "Optimizing",
};

export const SCORE_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#84cc16",
  5: "#22c55e",
};

export const MATURITY_BANDS = [
  { min: 1.0, max: 1.5, label: "Initial", color: "#ef4444" },
  { min: 1.5, max: 2.5, label: "Managed", color: "#f97316" },
  { min: 2.5, max: 3.5, label: "Defined", color: "#eab308" },
  { min: 3.5, max: 4.5, label: "Quantitatively Managed", color: "#84cc16" },
  { min: 4.5, max: 5.0, label: "Optimizing", color: "#22c55e" },
] as const;

export const WEIGHTING_MODELS: Record<string, { label: string; weights: Record<string, number> }> = {
  balanced: {
    label: "Balanced",
    weights: { est: 0.05, plan: 0.05, mc: 0.05, rdm: 0.05, ts: 0.05, pi: 0.05, vv: 0.05, sam: 0.05, rsk: 0.05, dar: 0.05, cm: 0.05, car: 0.05, pqa: 0.05, ot: 0.05, gov: 0.05, ii: 0.05, pad: 0.05, mpm: 0.05, pcm: 0.05, opf: 0.05 },
  },
  delivery_focused: {
    label: "Delivery-Focused",
    weights: { est: 0.07, plan: 0.08, mc: 0.07, rdm: 0.08, ts: 0.08, pi: 0.07, vv: 0.07, sam: 0.04, rsk: 0.05, dar: 0.04, cm: 0.04, car: 0.03, pqa: 0.04, ot: 0.03, gov: 0.03, ii: 0.03, pad: 0.03, mpm: 0.04, pcm: 0.04, opf: 0.04 },
  },
  quality_focused: {
    label: "Quality-Focused",
    weights: { est: 0.04, plan: 0.04, mc: 0.05, rdm: 0.06, ts: 0.05, pi: 0.05, vv: 0.08, sam: 0.04, rsk: 0.06, dar: 0.06, cm: 0.06, car: 0.07, pqa: 0.08, ot: 0.04, gov: 0.04, ii: 0.03, pad: 0.04, mpm: 0.05, pcm: 0.03, opf: 0.03 },
  },
  risk_focused: {
    label: "Risk-Focused",
    weights: { est: 0.04, plan: 0.05, mc: 0.07, rdm: 0.05, ts: 0.04, pi: 0.04, vv: 0.06, sam: 0.06, rsk: 0.08, dar: 0.07, cm: 0.06, car: 0.06, pqa: 0.06, ot: 0.03, gov: 0.06, ii: 0.03, pad: 0.03, mpm: 0.05, pcm: 0.03, opf: 0.03 },
  },
};

export function getMaturityBand(score: number): { label: string; color: string } {
  for (let i = 0; i < MATURITY_BANDS.length; i++) {
    const band = MATURITY_BANDS[i];
    const isLast = i === MATURITY_BANDS.length - 1;
    if (score >= band.min && (isLast ? score <= band.max : score < band.max)) {
      return { label: band.label, color: band.color };
    }
  }
  return { label: MATURITY_BANDS[MATURITY_BANDS.length - 1].label, color: MATURITY_BANDS[MATURITY_BANDS.length - 1].color };
}

// Assessment interfaces — mirror backend models
export interface EvidenceReference {
  document: string;
  section: string;
  date: string;
}

export interface AssessmentItem {
  id: string;
  text: string;
  score: number | null;
  na: boolean;
  na_justification: string | null;
  confidence: string | null;
  notes: string;
  evidence_references: EvidenceReference[];
  attachments: string[];
}

export interface CapabilityArea {
  id: string;
  name: string;
  items: AssessmentItem[];
}

// Grouped hierarchy
export interface PracticeArea {
  id: string;
  name: string;
  weight: number;
  capability_areas: CapabilityArea[];
}

export interface CategoryGroup {
  id: string;
  name: string;
  practice_areas: PracticeArea[];
}

// CMMI-SVC Extension
export interface SvcSection {
  id: string;
  name: string;
  capability_areas: CapabilityArea[];
}

export interface SvcExtension {
  enabled: boolean;
  sections: SvcSection[];
}

// Framework read-only interfaces
export interface FrameworkItem {
  id: string;
  text: string;
  rubric: Record<string, string>;
}

export interface FrameworkCapabilityArea {
  id: string;
  name: string;
  items: FrameworkItem[];
}

export interface FrameworkPracticeArea {
  id: string;
  name: string;
  weight: number;
  capability_areas: FrameworkCapabilityArea[];
}

export interface FrameworkCategoryGroup {
  id: string;
  name: string;
  practice_areas: FrameworkPracticeArea[];
}

export interface FrameworkSvcSection {
  id: string;
  name: string;
  capability_areas: FrameworkCapabilityArea[];
}

export interface Framework {
  version: string;
  framework_alignment: string;
  category_groups: FrameworkCategoryGroup[];
  svc_extension?: {
    sections: FrameworkSvcSection[];
  };
  weighting_models: Record<string, { label: string; weights: Record<string, number> }>;
}

// Shared models
export interface ClientInfo {
  name: string;
  industry: string;
  assessment_date: string;
  assessor: string;
}

export interface AssessmentMetadata {
  framework_version: string;
  tool_version: string;
  last_modified: string;
}

export interface ScoringConfig {
  weighting_model: string;
  practice_area_weights: Record<string, number>;
  custom_weights: Record<string, number> | null;
}

export interface AssessmentData {
  client_info: ClientInfo;
  assessment_metadata: AssessmentMetadata;
  scoring_config: ScoringConfig;
  category_groups: CategoryGroup[];
  svc_enabled: boolean;
  svc_extension: SvcExtension | null;
  target_scores: Record<string, number>;
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run:
```bash
cd frontend && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/types.ts
git commit -m "feat: add TypeScript interfaces and scoring constants"
```

---

## Chunk 3: State Management & Core Layout

### Task 3.1: API Client

**Files:**
- Create: `frontend/src/api.ts`

- [ ] **Step 1: Create frontend/src/api.ts**

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/api.ts
git commit -m "feat: add API fetch client for assessment, framework, and exports"
```

---

### Task 3.2: Store (Context + Auto-Save)

**Files:**
- Create: `frontend/src/store.tsx`

- [ ] **Step 1: Create frontend/src/store.tsx**

Follow the ITSM-ITIL store pattern exactly (`/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/store.tsx`), adapted for CMMI types:

```tsx
import { createContext, useContext, useCallback, useRef, useEffect, useState, type ReactNode } from 'react';
import type { AssessmentData, Framework } from './types';
import { fetchAssessment, saveAssessment, fetchFramework } from './api';

interface StoreContextType {
  data: AssessmentData | null;
  framework: Framework | null;
  loading: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  updateData: (updater: (draft: AssessmentData) => void) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AssessmentData | null>(null);
  const [framework, setFramework] = useState<Framework | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestData = useRef<AssessmentData | null>(null);

  useEffect(() => {
    Promise.all([fetchAssessment(), fetchFramework()])
      .then(([assessmentData, frameworkData]) => {
        setData(assessmentData);
        latestData.current = assessmentData;
        setFramework(frameworkData);
      })
      .catch((err) => console.error('Failed to load data:', err))
      .finally(() => setLoading(false));
  }, []);

  const debouncedSave = useCallback((newData: AssessmentData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await saveAssessment(newData);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 300);
  }, []);

  const updateData = useCallback(
    (updater: (draft: AssessmentData) => void) => {
      setData((prev) => {
        if (!prev) return prev;
        const next = structuredClone(prev);
        updater(next);
        next.assessment_metadata.last_modified = new Date().toISOString();
        latestData.current = next;
        debouncedSave(next);
        return next;
      });
    },
    [debouncedSave]
  );

  return (
    <StoreContext.Provider value={{ data, framework, loading, saveStatus, updateData }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/store.tsx
git commit -m "feat: add React Context store with debounced auto-save"
```

---

### Task 3.3: App Shell with Router and Sidebar

**Files:**
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/components/Sidebar.tsx`
- Create: `frontend/src/pages/ClientInfo.tsx`
- Create: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Create frontend/src/components/Sidebar.tsx**

Build the collapsible, resizable sidebar with:
- Logo at top (~160px wide), loaded from `/2025_Peraton_Logo_2000x541px_White_White.png` (copy to `frontend/public/` or use absolute path)
- Client Info + Dashboard links at top
- 4 category groups (DOING, MANAGING, ENABLING, IMPROVING) with chevron expand/collapse
- 20 practice areas nested under groups with score badges and progress rings
- CMMI-SVC toggle section (placeholder — wired in Chunk 6)
- Export / Settings / Help links at bottom
- Collapsible to 56px icon-only, resizable 180-480px (default 350px)
- Persist width + collapsed state to `localStorage["cmmi-sidebar"]`
- Active route highlighting

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/components/Sidebar.tsx` (~430 LOC)

Score badges: show rounded practice area average, colored by `SCORE_COLORS`.
Progress rings: SVG circle showing % of items scored/N/A per practice area.

- [ ] **Step 2: Create frontend/src/pages/ClientInfo.tsx**

Simple form page with 4 fields: Client Name, Industry, Assessment Date, Assessor Name.
Uses `useStore()` to read/write `data.client_info`.
Peraton dark theme styling.

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/pages/ClientInfo.tsx` (~75 LOC)

- [ ] **Step 3: Create frontend/src/pages/Dashboard.tsx (basic placeholder)**

Shows "Dashboard" heading and a "No data yet" message. Will be fully built in Chunk 5.

- [ ] **Step 4: Rewrite frontend/src/App.tsx with router and layout**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider, useStore } from './store';
import Sidebar from './components/Sidebar';
import ClientInfo from './pages/ClientInfo';
import Dashboard from './pages/Dashboard';

function AppContent() {
  const { loading } = useStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-page-bg flex items-center justify-center">
        <img src="/logo.png" alt="Peraton" className="w-[300px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg flex">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<ClientInfo />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <AppContent />
      </StoreProvider>
    </BrowserRouter>
  );
}
```

- [ ] **Step 5: Copy Peraton logo to frontend/public/**

```bash
cp "/Users/john/Dev/Assessments/2025_Peraton_Logo_2000x541px_White_White.png" frontend/public/logo.png
```

- [ ] **Step 6: Verify with dev mode**

Run: `python3 build.py --dev`
Expected: Navigate between Client Info and Dashboard. Sidebar shows all 20 practice areas grouped under 4 categories. Sidebar collapses, resizes, and persists state.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/ frontend/public/
git commit -m "feat: add App shell with router, sidebar, ClientInfo, and basic Dashboard"
```

---

## Chunk 4: Assessment Scoring UI

### Task 4.1: Scoring Engine

**Files:**
- Create: `frontend/src/scoring.ts`

- [ ] **Step 1: Create frontend/src/scoring.ts**

```typescript
import type { AssessmentData, AssessmentItem, CapabilityArea, PracticeArea, CategoryGroup, SvcSection } from './types';

export function averageScore(items: AssessmentItem[]): number | null {
  const scored = items.filter((i) => i.score !== null && !i.na);
  if (scored.length === 0) return null;
  return scored.reduce((sum, i) => sum + (i.score as number), 0) / scored.length;
}

export function capabilityAreaScore(ca: CapabilityArea): number | null {
  return averageScore(ca.items);
}

export function practiceAreaScore(pa: PracticeArea): number | null {
  const allItems = pa.capability_areas.flatMap((ca) => ca.items);
  return averageScore(allItems);
}

export function practiceAreaCompletion(pa: PracticeArea): number {
  const allItems = pa.capability_areas.flatMap((ca) => ca.items);
  if (allItems.length === 0) return 0;
  const answered = allItems.filter((i) => i.score !== null || i.na);
  return answered.length / allItems.length;
}

export function groupScore(group: CategoryGroup): number | null {
  const allItems = group.practice_areas.flatMap((pa) => pa.capability_areas.flatMap((ca) => ca.items));
  return averageScore(allItems);
}

export function groupCompletion(group: CategoryGroup): number {
  const allItems = group.practice_areas.flatMap((pa) => pa.capability_areas.flatMap((ca) => ca.items));
  if (allItems.length === 0) return 0;
  const answered = allItems.filter((i) => i.score !== null || i.na);
  return answered.length / allItems.length;
}

export function svcSectionScore(section: SvcSection): number | null {
  const allItems = section.capability_areas.flatMap((ca) => ca.items);
  return averageScore(allItems);
}

export function svcSectionCompletion(section: SvcSection): number {
  const allItems = section.capability_areas.flatMap((ca) => ca.items);
  if (allItems.length === 0) return 0;
  const answered = allItems.filter((i) => i.score !== null || i.na);
  return answered.length / allItems.length;
}

export function weightedCompositeScore(data: AssessmentData): number | null {
  const weights = data.scoring_config.practice_area_weights;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const group of data.category_groups) {
    for (const pa of group.practice_areas) {
      const score = practiceAreaScore(pa);
      const weight = weights[pa.id] ?? 0;
      if (score !== null) {
        weightedSum += score * weight;
        totalWeight += weight;
      }
    }
  }
  if (totalWeight === 0) return null;
  return weightedSum / totalWeight;
}

export function overallCompletion(data: AssessmentData): { scored: number; total: number } {
  const baseItems = data.category_groups.flatMap((g) =>
    g.practice_areas.flatMap((pa) => pa.capability_areas.flatMap((ca) => ca.items))
  );
  const svcItems =
    data.svc_enabled && data.svc_extension
      ? data.svc_extension.sections.flatMap((s) => s.capability_areas.flatMap((ca) => ca.items))
      : [];
  const allItems = [...baseItems, ...svcItems];
  const scored = allItems.filter((i) => i.score !== null || i.na).length;
  return { scored, total: allItems.length };
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/scoring.ts
git commit -m "feat: add scoring engine with weighted composite and completion calculations"
```

---

### Task 4.2: Scoring Components

**Files:**
- Create: `frontend/src/components/ScoringWidget.tsx`
- Create: `frontend/src/components/ConfidenceWidget.tsx`
- Create: `frontend/src/components/AssessmentItemCard.tsx`
- Create: `frontend/src/components/Breadcrumb.tsx`

- [ ] **Step 1: Create ScoringWidget.tsx**

5 radio buttons (1-5) with score labels and colors. N/A toggle checkbox. When N/A is checked, score buttons are disabled and a justification textarea appears.

- [ ] **Step 2: Create ConfidenceWidget.tsx**

3 buttons: High / Medium / Low. Toggleable (click again to deselect).

- [ ] **Step 3: Create AssessmentItemCard.tsx**

Card component for a single assessment item:
- Item text at top
- Rubric accordion (expandable, shows all 5 level descriptions from framework)
- ScoringWidget (1-5 + N/A)
- ConfidenceWidget (H/M/L)
- Notes textarea
- Evidence references section (document, section, date fields — add/remove)
- Dark theme styling per Design-guide.md

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/components/AssessmentItemCard.tsx` (~209 LOC)

- [ ] **Step 4: Create Breadcrumb.tsx**

Path breadcrumbs: Category Group > Practice Area > Capability Area. Each segment is a link.

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/components/Breadcrumb.tsx` (~64 LOC)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/
git commit -m "feat: add ScoringWidget, ConfidenceWidget, AssessmentItemCard, and Breadcrumb"
```

---

### Task 4.3: Assessment Pages

**Files:**
- Create: `frontend/src/pages/PracticeAreaSummary.tsx`
- Create: `frontend/src/pages/CapabilityArea.tsx`
- Modify: `frontend/src/App.tsx` (add routes)

- [ ] **Step 1: Create PracticeAreaSummary.tsx**

Route: `/practice-area/:entityId`

Shows:
- Breadcrumb (Category Group > Practice Area)
- Practice area name and overall score
- List of capability areas as cards with score badges and completion %
- Click a capability area card to navigate to `/practice-area/:entityId/:areaId`

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/pages/DomainSummary.tsx` (~93 LOC)

- [ ] **Step 2: Create CapabilityArea.tsx**

Route: `/practice-area/:entityId/:areaId`

Main assessment work page:
- Breadcrumb (Category Group > Practice Area > Capability Area)
- List of AssessmentItemCards for all items in the capability area
- Keyboard shortcuts: `1-5` score, `H/M/L` confidence, `N` toggle N/A, `Up/Down` navigate items
- Uses `useStore()` to read framework rubrics and update assessment data
- Focused item tracking for keyboard navigation

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/pages/CapabilityArea.tsx` (~245 LOC)

- [ ] **Step 3: Add routes to App.tsx**

Add imports for PracticeAreaSummary and CapabilityArea, add routes:
```tsx
<Route path="/practice-area/:entityId" element={<PracticeAreaSummary />} />
<Route path="/practice-area/:entityId/:areaId" element={<CapabilityArea />} />
```

- [ ] **Step 4: Verify scoring flow**

Run: `python3 build.py --dev`
Expected: Navigate sidebar → practice area → capability area. Score items with mouse clicks and keyboard. Scores persist (auto-save). Sidebar score badges and progress rings update.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/pages/ frontend/src/App.tsx
git commit -m "feat: add PracticeAreaSummary and CapabilityArea pages with scoring UI"
```

---

## Chunk 5: Dashboard & Charts

### Task 5.1: Full Dashboard Page

**Files:**
- Modify: `frontend/src/pages/Dashboard.tsx`

- [ ] **Step 1: Rewrite Dashboard.tsx with full content**

Dashboard shows:
- **Composite score** — large display with maturity band label and color
- **Radar chart** — Recharts `RadarChart`, one axis per practice area (20 axes), scale 0-5. Show current scores and target scores as two overlapping radar shapes.
- **Bar chart** — Recharts `BarChart`, practice area scores grouped by category group, bars colored by maturity band
- **Progress summary** — overall completion % with progress bar
- **Per-category-group summary** — 4 cards showing group name, average score, completion %
- **Top gaps** — list of practice areas with largest gap between current and target score

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/pages/Dashboard.tsx` (~237 LOC)

- [ ] **Step 2: Verify dashboard**

Run: `python3 build.py --dev`
Expected: Dashboard renders with charts. Score some items, return to dashboard, see scores reflected in charts and progress.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/Dashboard.tsx
git commit -m "feat: build full Dashboard with radar chart, bar chart, and progress summary"
```

---

### Task 5.2: StatsFooter

**Files:**
- Create: `frontend/src/components/StatsFooter.tsx`
- Modify: `frontend/src/App.tsx` (add StatsFooter to layout)

- [ ] **Step 1: Create StatsFooter.tsx**

Fixed footer at bottom of content area:
- Left: overall progress bar + "X of Y items scored"
- Center: composite score with maturity band color
- Right: save status indicator ("Saving..." / "Saved" / "Error")

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/components/StatsFooter.tsx` (~142 LOC)

- [ ] **Step 2: Add StatsFooter to App.tsx layout**

Place below `<Routes>` inside the main content area.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/StatsFooter.tsx frontend/src/App.tsx
git commit -m "feat: add StatsFooter with progress bar, composite score, and save status"
```

---

## Chunk 6: CMMI-SVC Extension Module

### Task 6.1: SVC Pages

**Files:**
- Create: `frontend/src/pages/SvcSummary.tsx`
- Create: `frontend/src/pages/SvcSection.tsx`
- Modify: `frontend/src/App.tsx` (add SVC routes)
- Modify: `frontend/src/components/Sidebar.tsx` (wire SVC toggle)

- [ ] **Step 1: Create SvcSummary.tsx**

Route: `/svc`

Overview page for CMMI-SVC extension:
- Shows all 6 SVC sections as cards with score badges and completion %
- Click a section card to navigate to `/svc/:sectionId`
- Only visible when `data.svc_enabled` is true

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/pages/ITIL4Summary.tsx` (~84 LOC)

- [ ] **Step 2: Create SvcSection.tsx**

Route: `/svc/:sectionId` and `/svc/:sectionId/:areaId`

When `:areaId` is present, shows AssessmentItemCards for that capability area (reuse the same pattern as CapabilityArea.tsx but reading from `data.svc_extension.sections`).

When only `:sectionId`, shows list of capability areas in that section.

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/pages/ITIL4Section.tsx` (~244 LOC)

- [ ] **Step 3: Add SVC routes to App.tsx**

```tsx
<Route path="/svc" element={<SvcSummary />} />
<Route path="/svc/:sectionId" element={<SvcSection />} />
<Route path="/svc/:sectionId/:areaId" element={<SvcSection />} />
```

- [ ] **Step 4: Wire SVC toggle in Sidebar.tsx**

Add toggle switch in the CMMI-SVC section of sidebar. When toggled:
- `updateData(d => { d.svc_enabled = !d.svc_enabled; })`
- Show/hide SVC section links in sidebar
- SVC sections show score badges and progress rings when enabled

- [ ] **Step 5: Verify SVC extension**

Run: `python3 build.py --dev`
Expected: Toggle SVC in sidebar → SVC sections appear. Navigate to SVC section → score items. Toggle off → SVC nav disappears. SVC scores are separate from main composite.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/SvcSummary.tsx frontend/src/pages/SvcSection.tsx frontend/src/App.tsx frontend/src/components/Sidebar.tsx
git commit -m "feat: add CMMI-SVC extension with toggle, summary, and section pages"
```

---

## Chunk 7: Exports

### Task 7.1: Export Engine Backend

**Files:**
- Create: `backend/export_engine.py`

- [ ] **Step 1: Create backend/export_engine.py**

Implement all 9 export generators plus `export_all`:

```python
class ExportEngine:
    def __init__(self, base_dir, resource_dir=None):
        # Set up paths for exports/, templates/
        ...

    def export_findings(self, data) -> str:          # D-01 Assessment Findings (DOCX)
    def export_executive_summary(self, data) -> str:  # D-02 Executive Summary (DOCX)
    def export_gap_analysis(self, data) -> str:       # D-03 Gap Analysis & Roadmap (DOCX)
    def export_workbook(self, data) -> str:           # D-04 Scored Assessment Workbook (XLSX)
    def export_outbrief(self, data) -> str:           # D-05 Out-Brief Presentation (PPTX)
    def export_heatmap(self, data) -> str:            # D-06 Maturity Heatmap (XLSX)
    def export_quick_wins(self, data) -> str:         # D-07 Quick Wins Report (DOCX)
    def export_cmmi_roadmap(self, data) -> str:       # D-08 CMMI Roadmap (DOCX)
    def export_svc_alignment(self, data) -> str:      # D-09 SVC Alignment Report (DOCX)
    def export_all(self, data) -> list[str]:          # All applicable
```

Each method:
- Generates timestamped filename: `D-XX_Name_YYYY-MM-DD_HHMMSS.ext`
- Checks for template in `templates/` directory, auto-generates if missing
- Uses docxtpl for DOCX, openpyxl for XLSX, python-pptx for PPTX
- Radar chart: matplotlib Agg backend → `exports/radar_chart.png` (6x6in, 150 DPI)
- Returns full path to generated file

`export_all`: runs all exports, skips `svc_alignment` if `svc_enabled` is false.

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/backend/export_engine.py` (~708 LOC)

- [ ] **Step 2: Wire export routes in main.py**

Add ExportEngine import and initialization:
```python
try:
    from .export_engine import ExportEngine
except ImportError:
    from export_engine import ExportEngine

export_engine = ExportEngine(BASE_DIR, resource_dir=RESOURCE_DIR)
```

Add export endpoint:
```python
@app.post("/api/export/{export_type}")
async def export_deliverable(export_type: str):
    valid_types = [
        "findings", "executive-summary", "gap-analysis", "workbook",
        "outbrief", "heatmap", "quick-wins", "cmmi-roadmap",
        "svc-alignment", "all",
    ]
    if export_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Unknown export type: {export_type}")

    try:
        data = data_manager.load_assessment()
        method_map = {
            "findings": export_engine.export_findings,
            "executive-summary": export_engine.export_executive_summary,
            "gap-analysis": export_engine.export_gap_analysis,
            "workbook": export_engine.export_workbook,
            "outbrief": export_engine.export_outbrief,
            "heatmap": export_engine.export_heatmap,
            "quick-wins": export_engine.export_quick_wins,
            "cmmi-roadmap": export_engine.export_cmmi_roadmap,
            "svc-alignment": export_engine.export_svc_alignment,
        }
        if export_type == "svc-alignment" and not data.svc_enabled:
            raise HTTPException(status_code=400, detail="SVC extension is not enabled")
        if export_type == "all":
            filenames = export_engine.export_all(data)
        else:
            filenames = [method_map[export_type](data)]
        return {"filenames": filenames}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

- [ ] **Step 3: Verify exports generate**

Run:
```bash
source .venv/bin/activate
python -m backend.main &
sleep 2
curl -X POST http://localhost:8751/api/export/findings | python -m json.tool
curl -X POST http://localhost:8751/api/export/workbook | python -m json.tool
curl -X POST http://localhost:8751/api/export/outbrief | python -m json.tool
ls exports/
kill %1
```
Expected: Each export returns `{"filenames": ["exports/D-XX_..."]}` and files exist in `exports/`.

- [ ] **Step 4: Commit**

```bash
git add backend/export_engine.py backend/main.py
git commit -m "feat: add export engine with 9 generators and radar chart PNG"
```

---

### Task 7.2: Export Page Frontend

**Files:**
- Create: `frontend/src/pages/Export.tsx`
- Modify: `frontend/src/App.tsx` (add export route)

- [ ] **Step 1: Create Export.tsx**

Page with:
- Grid of export buttons (9 individual + "Export All")
- Each button shows export name, format icon, and description
- Click triggers `exportDeliverable(type)` from api.ts
- Progress/loading state per button
- Success: show generated filename(s)
- Error: show error message
- Validation warnings at top (if items unscored, etc.)

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/pages/Export.tsx` (~143 LOC)

- [ ] **Step 2: Add route to App.tsx**

```tsx
<Route path="/export" element={<Export />} />
```

- [ ] **Step 3: Verify export UI**

Run: `python3 build.py --dev`
Expected: Navigate to Export page, click buttons, files generate successfully.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Export.tsx frontend/src/App.tsx
git commit -m "feat: add Export page with buttons for all 9 deliverable types"
```

---

## Chunk 8: Polish & Packaging

### Task 8.1: Command Palette and Keyboard Shortcuts

**Files:**
- Create: `frontend/src/components/CommandPalette.tsx`
- Create: `frontend/src/hooks/useNextUnscored.ts`
- Modify: `frontend/src/App.tsx` (wire Cmd+K and Cmd+Right)

- [ ] **Step 1: Create CommandPalette.tsx**

Overlay modal triggered by Cmd/Ctrl+K:
- Text input for fuzzy search
- Results list: all practice areas + capability areas
- Each result shows name, score badge, completion %
- Enter/click navigates to that page
- Escape closes

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/components/CommandPalette.tsx` (~194 LOC)

- [ ] **Step 2: Create useNextUnscored.ts**

Hook that finds the next unscored item across the entire assessment and returns a navigation path to it. Used by Cmd/Ctrl+Right shortcut.

- [ ] **Step 3: Wire global shortcuts in App.tsx**

- Cmd/Ctrl+K → toggle CommandPalette
- Cmd/Ctrl+Right → navigate to next unscored (using useNextUnscored)

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/CommandPalette.tsx frontend/src/hooks/useNextUnscored.ts frontend/src/App.tsx
git commit -m "feat: add Command Palette (Cmd+K) and jump-to-next-unscored (Cmd+Right)"
```

---

### Task 8.2: Validation and Onboarding

**Files:**
- Create: `frontend/src/validation.ts`
- Create: `frontend/src/components/OnboardingTooltip.tsx`

- [ ] **Step 1: Create validation.ts**

```typescript
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
```

- [ ] **Step 2: Create OnboardingTooltip.tsx**

Contextual hints for first-time users:
- Show on first visit (check localStorage)
- Tips: "Use 1-5 keys to score", "Cmd+K for quick navigation", "Expand rubric for level descriptions"
- Dismiss button, "Don't show again" option

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/components/OnboardingTooltip.tsx` (~69 LOC)

- [ ] **Step 3: Integrate validation into AssessmentItemCard.tsx**

Modify `frontend/src/components/AssessmentItemCard.tsx` to:
- Import `getItemValidation` from `../validation`
- Call `getItemValidation(item)` for each item
- Display validation indicators: error border (red) for `na-no-justification`, warning icon (yellow) for `scored-no-notes` and `low-confidence-no-notes`, info badge for `unscored`
- Show validation messages below the item card when issues exist

- [ ] **Step 4: Commit**

```bash
git add frontend/src/validation.ts frontend/src/components/OnboardingTooltip.tsx frontend/src/components/AssessmentItemCard.tsx
git commit -m "feat: add validation rules, onboarding tooltips, and validation indicators on item cards"
```

---

### Task 8.3: Settings and Help Pages

**Files:**
- Create: `frontend/src/pages/Settings.tsx`
- Create: `frontend/src/pages/Help.tsx`
- Modify: `frontend/src/App.tsx` (add routes)

- [ ] **Step 1: Create Settings.tsx**

Settings page with:
- **Weighting model selector** — dropdown with 4 presets (balanced, delivery, quality, risk) + "Custom". Read preset values from `framework.weighting_models` (via `useStore()`) rather than the hardcoded `WEIGHTING_MODELS` constant — the framework JSON is the source of truth; the TypeScript constant serves as a fallback only.
- **Custom weight sliders** — one slider per practice area (range 0.01-0.20, step 0.01)
  - Auto-normalize: when one slider changes, all others adjust proportionally so sum = 1.0
  - Visual bar chart showing current weight distribution (Recharts BarChart)
  - Preset buttons to reset sliders to named preset values
- **Target score sliders** — one per practice area (range 1.0-5.0, step 0.5, default 3.0)
- **SVC toggle** — enable/disable CMMI-SVC extension (same as sidebar toggle)

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/pages/Settings.tsx` (~102 LOC) — but CMMI adds custom weight sliders which is new.

- [ ] **Step 2: Create Help.tsx**

Help page with:
- Keyboard shortcuts table
- Assessment workflow guide
- Scoring rubric overview (what each 1-5 level means)
- Export descriptions
- FAQ

Reference: `/Users/john/Dev/Assessments/ITSM-ITIL/frontend/src/pages/Help.tsx` (~128 LOC)

- [ ] **Step 3: Add routes to App.tsx**

```tsx
<Route path="/settings" element={<Settings />} />
<Route path="/help" element={<Help />} />
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/Settings.tsx frontend/src/pages/Help.tsx frontend/src/App.tsx
git commit -m "feat: add Settings page with custom weight sliders and Help page"
```

---

### Task 8.4: PyInstaller Specs and CI/CD

**Files:**
- Create: `assessment-tool-macos.spec`
- Create: `assessment-tool-windows.spec`
- Create: `.github/workflows/ci.yml`
- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create assessment-tool-macos.spec**

```python
# -*- mode: python ; coding: utf-8 -*-
import os

datas = [
    ('backend/static', 'static'),
    ('framework', 'framework'),
]
if os.path.isdir('templates'):
    datas.append(('templates', 'templates'))

a = Analysis(
    ['backend/main.py'],
    pathex=[],
    binaries=[],
    datas=datas,
    hiddenimports=[
        'uvicorn.logging', 'uvicorn.loops.auto',
        'uvicorn.protocols.http.auto', 'uvicorn.protocols.http.h11_impl',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan.on', 'uvicorn.lifespan.off',
        'email.mime.multipart', 'email.mime.text',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)
pyz = PYZ(a.pure)
exe = EXE(
    pyz, a.scripts, a.binaries, a.datas, [],
    name='assessment-tool',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    target_arch='arm64',
)
```

- [ ] **Step 2: Create assessment-tool-windows.spec**

Same as macOS but without `target_arch='arm64'`.

- [ ] **Step 3: Create .github/workflows/ci.yml**

Lint + type-check on push/PR. Runs `cd frontend && npx tsc --noEmit`.

- [ ] **Step 4: Create .github/workflows/release.yml**

Full release workflow per the spec (Section 12 of the design spec). Builds macOS ARM + Windows executables, assembles versioned ZIPs, creates draft GitHub release.

Use the exact workflow YAML from the implementation prompt (lines 743-866).

- [ ] **Step 5: Commit**

```bash
git add assessment-tool-macos.spec assessment-tool-windows.spec .github/
git commit -m "feat: add PyInstaller specs and GitHub Actions CI/CD workflows"
```

---

### Task 8.5: README and Final Verification

**Files:**
- Create: `README.txt`

- [ ] **Step 1: Create README.txt**

End-user documentation:
- Tool overview
- How to run the executable
- 20 practice area descriptions (grouped by 4 categories)
- CMMI-SVC extension description
- Scoring rubric (1-5 scale with level descriptions)
- Export deliverables list
- Keyboard shortcuts
- Troubleshooting (port fallback, data recovery from .bak)

- [ ] **Step 2: Build frontend and verify production mode**

```bash
source .venv/bin/activate
python3 build.py --frontend
python -m backend.main
```
Expected: Full app serves from `backend/static/`. All features work: navigation, scoring, auto-save, charts, exports, settings, SVC toggle.

- [ ] **Step 3: Commit**

```bash
git add README.txt
git commit -m "feat: add end-user README.txt documentation"
```

- [ ] **Step 4: Final commit — verify clean state**

```bash
git status
```
Expected: Clean working tree. All features implemented per spec.
