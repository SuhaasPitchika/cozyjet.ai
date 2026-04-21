"""
CozyJet backend launcher — fetches secrets from Doppler before starting uvicorn.

Usage:
    python start.py [--config dev|stg|prd]

The DOPPLER_TOKEN env var must be set (store it in Replit Secrets / Railway /
Vercel env — never commit it to git).  All other secrets are pulled from
Doppler at startup so they never need to be stored anywhere else.

Falls back gracefully: if DOPPLER_TOKEN is absent or the Doppler API is
unreachable, it logs a warning and starts the server anyway (useful when
running locally with a .env file or when all secrets are already injected by
the hosting platform, e.g. Railway's native Doppler integration).
"""
import os
import sys
import json
from pathlib import Path
import logging
import argparse
import subprocess
import urllib.request
import urllib.error

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] doppler-start: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("doppler-start")

DOPPLER_PROJECT = "cozyjet-ai"

DOPPLER_DOWNLOAD_URL = (
    "https://api.doppler.com/v3/configs/config/secrets/download"
    "?format=json"
    "&include_dynamic_secrets=true"
    "&dynamic_secrets_ttl_sec=1800"
    "&project={project}"
    "&config={config}"
)


def fetch_doppler_secrets(token: str, config: str) -> dict:
    url = DOPPLER_DOWNLOAD_URL.format(project=DOPPLER_PROJECT, config=config)
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


def inject_secrets(secrets: dict) -> None:
    """Write Doppler secrets into the current process environment."""
    injected = 0
    for key, value in secrets.items():
        if key.startswith("DOPPLER_"):
            continue
        if value is None:
            continue
        if key not in os.environ:
            os.environ[key] = str(value)
            injected += 1
        # Don't overwrite values already present — hosting platforms (Railway,
        # Vercel) may override specific keys at the platform level on purpose.
    log.info(f"Injected {injected} secret(s) from Doppler into environment")


def main() -> None:
    parser = argparse.ArgumentParser(description="CozyJet backend launcher")
    parser.add_argument(
        "--config",
        default=os.environ.get("DOPPLER_CONFIG", "dev"),
        choices=["dev", "dev_personal", "stg", "prd"],
        help="Doppler config to pull (default: dev)",
    )
    # Pass remaining args straight through to uvicorn
    args, uvicorn_extra = parser.parse_known_args()

    token = os.environ.get("DOPPLER_TOKEN", "").strip()
    if token:
        log.info(f"Fetching secrets from Doppler project={DOPPLER_PROJECT!r} config={args.config!r} …")
        try:
            secrets = fetch_doppler_secrets(token, args.config)
            inject_secrets(secrets)
        except urllib.error.HTTPError as exc:
            log.warning(f"Doppler HTTP {exc.code}: {exc.reason} — continuing without Doppler secrets")
        except Exception as exc:
            log.warning(f"Doppler unreachable ({exc}) — continuing without Doppler secrets")
    else:
        log.warning(
            "DOPPLER_TOKEN not set — skipping Doppler fetch. "
            "Secrets must already be present in the environment."
        )

    # ── Launch uvicorn ────────────────────────────────────────────────────────
    # Always run with cwd = backend/ so `app.main:app` resolves.
    _backend_dir = Path(__file__).resolve().parent
    os.chdir(_backend_dir)

    python = sys.executable
    port = os.environ.get("PORT", "8000")
    cmd = [
        python, "-m", "uvicorn",
        "asgi:app",
        "--host", "0.0.0.0",
        "--port", port,
    ]
    if os.environ.get("ENVIRONMENT", "development").lower() == "development":
        cmd.append("--reload")
    cmd += uvicorn_extra

    log.info(f"Starting uvicorn: {' '.join(cmd)}")
    os.execvp(python, cmd)  # Replace this process — uvicorn inherits the env


if __name__ == "__main__":
    main()
