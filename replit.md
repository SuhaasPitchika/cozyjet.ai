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

## Replit Secrets
These must be set in the Replit Secrets panel:
| Secret Name | Used As |
|-------------|---------|
| `OPEN_ROUTER` | OpenRouter API key (Skippy + Meta via OpenRouter) |
| `GOOGLE_API_KEY` | Gemini API key (Snooks strategic analysis) |
| `ELEVENLABS_API_KEY` | ElevenLabs audio generation + transcription |
| `SESSION_SECRET` | JWT secret for backend auth |
| `DATABASE_URL` | PostgreSQL connection string |

The backend config (`backend/app/config.py`) auto-maps `OPEN_ROUTER` → `OPENROUTER_API_KEY`
and `GOOGLE_API_KEY` → `GEMINI_API_KEY` via `@model_validator`.

---

## Workflows
- **Start application** — `npm run dev` → port 5000 (webview)
- **Start backend** — `cd backend && .venv/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`

Python deps installed in `backend/.venv/` via `uv venv` + `uv pip install`.

## Backend Status (fully wired)
`main.py` mounts all 8 API routers (44 endpoints total) + WebSocket + CORS + rate limiting middleware + lifespan DB init. All agents, tasks, models, and services are implemented and connected.

---

## Backend API Routes
```
GET  /health                      — health check + agent status
POST /api/auth/signup             — user registration
POST /api/auth/login              — JWT authentication
GET  /api/skippy/seeds            — list content seeds
POST /api/skippy/sync-now         — trigger integration sync
POST /api/skippy/voice            — voice input → seed
POST /api/skippy/screenshot       — screenshot → seed
POST /api/snooks/suggest          — 5 weekly content recommendations (Gemini)
GET  /api/snooks/calendar         — calendar gap analysis
POST /api/meta/generate           — generate content (3 variations × N platforms)
POST /api/meta/refine             — refine with instruction
POST /api/meta/repurpose          — repurpose long-form to social
GET  /api/analytics/summary       — engagement metrics rollup
GET  /api/analytics/top-performing — ranked by engagement rate
POST /api/analytics/track         — record post metrics
GET  /api/tune/voice-profile      — current voice profile
POST /api/tune/samples            — add writing sample
POST /api/tune/process            — run style extraction → update voice profile
POST /api/audio/speak             — text → MP3 (ElevenLabs)
POST /api/audio/transcribe        — audio → text (ElevenLabs Scribe)
WS   /ws/main?token={jwt}        — real-time agent chat
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
