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
