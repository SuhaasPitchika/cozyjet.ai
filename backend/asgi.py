"""
ASGI entry when cwd is the `backend/` directory.

Use:  cd backend && python -m uvicorn asgi:app --host 0.0.0.0 --port 8000
"""
from __future__ import annotations

import sys
from pathlib import Path

_root = Path(__file__).resolve().parent
_key = str(_root)
if _key not in sys.path:
    sys.path.insert(0, _key)

from app.main import app  # noqa: E402

__all__ = ["app"]
