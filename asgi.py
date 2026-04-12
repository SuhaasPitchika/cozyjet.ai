"""
ASGI entry for repo root or backend-only deploys.

Use from monorepo root:  python -m uvicorn asgi:app --host 0.0.0.0 --port $PORT
If the host only uploads `backend/`, copy this file next to `app/` or set PYTHONPATH.
"""
from __future__ import annotations

import sys
from pathlib import Path

_here = Path(__file__).resolve().parent

# Monorepo: .../cozyjet.ai/backend/app
# Backend-only: .../app (this file lives beside app/)
if (_here / "backend" / "app").is_dir():
    _backend = _here / "backend"
elif (_here / "app").is_dir():
    _backend = _here
else:
    _backend = _here / "backend"

_key = str(_backend.resolve())
if _key not in sys.path:
    sys.path.insert(0, _key)

from app.main import app  # noqa: E402

__all__ = ["app"]
