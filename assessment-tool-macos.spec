# assessment-tool-macos.spec
import os
from pathlib import Path

block_cipher = None
BASE = Path(SPECPATH)

datas = [
    (str(BASE / 'backend' / 'static'), 'static'),
    (str(BASE / 'framework'), 'framework'),
]
if os.path.isdir(str(BASE / 'templates')):
    datas.append((str(BASE / 'templates'), 'templates'))

a = Analysis(
    [str(BASE / 'backend' / 'main.py')],
    pathex=[str(BASE), str(BASE / 'backend')],
    binaries=[],
    datas=datas,
    hiddenimports=[
        'uvicorn.logging',
        'uvicorn.protocols.http',
        'uvicorn.protocols.http.auto',
        'uvicorn.protocols.http.h11_impl',
        'uvicorn.protocols.websockets',
        'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan',
        'uvicorn.lifespan.on',
        'uvicorn.lifespan.off',
        'email.mime.multipart',
        'email.mime.text',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='assessment-tool',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    target_arch='arm64',
    codesign_identity=None,
    entitlements_file=None,
)
