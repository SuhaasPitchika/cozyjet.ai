# CozyJet FastAPI application package
import sys
from pathlib import Path

# When `import app.*` runs, ensure the parent of this package (`backend/`) is on sys.path
# so absolute `from app.xxx` imports work even if the process cwd is wrong.
_backend_root = Path(__file__).resolve().parent.parent
_br = str(_backend_root)
if _br not in sys.path:
    sys.path.insert(0, _br)
