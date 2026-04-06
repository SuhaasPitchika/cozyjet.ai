# CozyJet AI Studio — Replit Project

## Overview
CozyJet is an AI-powered SaaS platform for solopreneurs. It provides three AI agents:
- **Skippy** — Work intelligence agent; reads activity data and surfaces professional stories
- **Snooks** — Personal brand strategist; builds repeatable growth systems from real user data
- **Meta** — Elite content writer; generates platform-native content in the user's exact voice

---

## Architecture

### Two-Service Stack
| Layer | Technology | Port |
|-------|-----------|------|
| Frontend | Next.js 15 (App Router) | 5000 → 80 |
| Backend | FastAPI (Python 3.12) | 8000 |

### Frontend → Backend Proxy
Next.js proxies `/backend/*` → `http://localhost:8000/*` via `next.config.ts` rewrites.
The axios client in `src/lib/api.ts` uses `/backend` as the base URL — no CORS issues.

### AI APIs
| Agent | SDK | Model | Temp |
|-------|-----|-------|------|
| Skippy | OpenAI SDK → OpenRouter | mistral-7b-instruct | 0.3 |
| Snooks | google-generativeai (direct Gemini) | gemini-1.5-flash | 0.5 |
| Meta | OpenAI SDK → OpenRouter | claude-3.5-sonnet | per-platform |
| Hook gen | OpenAI SDK → OpenRouter | mistral-7b-instruct | 0.9 |
| Audio | ElevenLabs SDK | eleven_turbo_v2_5 | — |

### Per-Platform Temperatures (Meta)
- LinkedIn: 0.75 — Twitter: 0.90 — Reddit: 0.65 — Instagram: 0.85 — YouTube: 0.70

---

## Secrets — Doppler Integration
All API keys live in Doppler project `cozyjet-ai`. The backend fetches them at startup via
`backend/start.py`. Only ONE secret needs to be set manually in any environment:

| Secret Name | Where to set | Purpose |
|-------------|-------------|---------|
| `DOPPLER_TOKEN` | Replit Secrets / Railway / Vercel env | Authenticates against Doppler API |

Everything else (OpenRouter, Gemini, ElevenLabs, Firebase, DB URL, etc.) is pulled from Doppler.

### Doppler config mapping
| Environment | Doppler config |
|-------------|---------------|
| Replit (dev) | `dev` |
| Railway (prod) | `prd` (native Doppler→Railway integration) |
| Vercel (frontend) | Doppler→Vercel native integration |

### `backend/start.py`
Startup launcher:
1. Reads `DOPPLER_TOKEN` from env
2. Calls `https://api.doppler.com/v3/configs/config/secrets/download` (no CLI needed)
3. Injects all secrets into the process environment
4. Exec-replaces itself with uvicorn (inherits all secrets)

Falls back gracefully if Doppler is unreachable — useful on Railway where secrets
are already injected natively.

### .gitignore
`.replit` is gitignored so the `userenv.shared` section (which holds `DOPPLER_TOKEN`
for Replit) is never committed to GitHub.

---

## Workflows
- **Start application** — `node scripts/start-dev.js` → port 5000 (webview)
  - Attempts Doppler fetch (gracefully skips if token missing/invalid)
  - Launches `node_modules/.bin/next dev` on 0.0.0.0:5000
- **Start backend** — `cd backend && .venv/bin/python start.py --config dev` → port 8000
  - Attempts Doppler fetch (gracefully skips if token missing/invalid)
  - Launches uvicorn on 0.0.0.0:8000

Python deps installed in `backend/.venv/` — created with `python3 -m venv .venv` and all packages from `requirements.txt` installed via `.venv/bin/pip install --no-user`.

## Backend Status — COMPLETE ✓
| Component | Status |
|-----------|--------|
| `main.py` | Fully wired — 10 routers, WebSocket, CORS, rate-limit middleware |
| Database | Connected + tables auto-created on startup |
| Auth | Signup/Login/Logout/Refresh/Me — bcrypt + JWT |
| Onboarding | Multi-turn Claude conversation → growth_profile extraction |
| Relationships | Full relationship pipeline with Snooks 3-week sequences |
| Virality Scoring | Mistral 7B at temp 0.3 scores all content pre-approval |
| Momentum Detection | 15-min Celery task, WebSocket alerts when score > 50 |
| Conversation Hunter | Claude finds 5 opportunities/day per user |
| All Celery Tasks | Skippy, Snooks, momentum, relationships, publishing, analytics |

---

## Backend API Routes
```
GET  /health                           — health check + agent status

POST /api/auth/signup                  — user registration
POST /api/auth/login                   — JWT authentication

POST /api/onboarding/chat              — multi-turn Claude onboarding conversation
GET  /api/onboarding/status            — check if onboarding is complete
POST /api/onboarding/reset             — reset onboarding session

GET  /api/skippy/seeds                 — list content seeds
POST /api/skippy/sync-now              — trigger integration sync
POST /api/skippy/voice                 — voice input → seed
POST /api/skippy/screenshot            — screenshot → seed
GET  /api/skippy/opportunities         — current conversation queue

GET  /api/snooks/strategy              — current weekly plan
GET  /api/snooks/calendar              — calendar gap analysis
GET  /api/snooks/narrative-arcs        — active story arcs
POST /api/snooks/create-arc            — start a new narrative arc
GET  /api/snooks/relationships         — relationship pipeline
GET  /api/snooks/gap-report            — competitor gap analysis

GET  /api/relationships                — list relationship targets
POST /api/relationships                — add relationship target
GET  /api/relationships/{id}           — get target + sequence
PATCH /api/relationships/{id}          — update stage / notes
DELETE /api/relationships/{id}         — remove target
POST /api/relationships/{id}/sequence  — generate Snooks 3-week sequence

POST /api/meta/generate                — generate content (3 variations × N platforms)
POST /api/meta/refine                  — refine with instruction
POST /api/meta/repurpose               — repurpose long-form to social
POST /api/meta/improve-score           — improve low-scoring content

GET  /api/analytics/summary            — engagement metrics rollup
GET  /api/analytics/top-performing     — ranked by engagement rate
POST /api/analytics/track              — record post metrics
GET  /api/analytics/experiments        — experiment results
GET  /api/analytics/positioning        — brand positioning drift score

GET  /api/tune/voice-profile           — current voice profile
POST /api/tune/samples                 — add writing sample
POST /api/tune/process                 — run style extraction → update voice profile

POST /api/audio/speak                  — text → MP3 (ElevenLabs)
POST /api/audio/transcribe             — audio → text (ElevenLabs Scribe)

WS   /ws/main?token={jwt}             — real-time agent chat + momentum alerts
```

---

## Backend File Structure
```
backend/
  .env                          — safe defaults (real secrets from Replit Secrets)
  requirements.txt
  app/
    main.py                     — FastAPI app + all router registrations
    config.py                   — Pydantic settings with key aliasing + dynamic CORS
    database.py                 — async SQLAlchemy + asyncpg
    dependencies.py             — JWT auth dependency injection
    middleware.py               — rate limiting (graceful if Redis absent)
    websocket.py                — WS handler (Redis pub/sub optional)
    services/
      model_router.py           — OpenAI→OpenRouter, Gemini, ElevenLabs SDK wrappers
      encryption_service.py     — Fernet AES-256 for OAuth token storage
      voice_service.py          — voice profile management
    agents/
      skippy.py                 — Skippy agent (temp 0.3, journalist framing)
      snooks.py                 — Snooks agent (temp 0.5, Gemini direct)
      meta.py                   — Meta agent (per-platform temp, 3 variations parallel)
    api/
      auth.py skippy.py snooks.py meta.py
      analytics.py tune.py audio.py integrations.py
    models/
      user.py content.py analytics.py tune_samples.py ...
    tasks/
      skippy_tasks.py analytics_tasks.py publishing_tasks.py
```

---

## Frontend File Structure
```
src/
  app/
    dashboard/
      layout.tsx               — glassmorphism sidebar, no emojis
      skippy/page.tsx
      snooks/page.tsx
      meta/page.tsx
    api/                       — Next.js API routes (call AI directly via env.ts)
  lib/
    api.ts                     — Axios client → /backend (proxy to FastAPI)
    env.ts                     — AI key config for Next.js API routes
  store/
    auth-store.ts              — Zustand auth state
```

---

## Design Constraints
- No emojis in any dashboard UI
- Glassmorphism sidebar with floating toggle button
- CozyJet branding throughout
