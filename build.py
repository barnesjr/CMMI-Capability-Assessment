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
