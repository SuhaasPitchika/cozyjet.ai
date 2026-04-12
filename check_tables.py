"""Run DB table listing from repo root; implementation is in backend/check_tables.py."""
import runpy
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
SCRIPT = BACKEND / "check_tables.py"
if not SCRIPT.is_file():
    print(f"Missing {SCRIPT}", file=sys.stderr)
    sys.exit(1)
sys.path.insert(0, str(BACKEND))
runpy.run_path(str(SCRIPT), run_name="__main__")
