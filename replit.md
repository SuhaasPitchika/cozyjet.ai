# CozyJet.AI — Replit Project

## Overview
CozyJet is an AI-powered SaaS platform for solopreneurs and startups. It provides three AI agents:
- **Skippy** — Workspace observer, screen capture & context intelligence
- **Snooks** — Productivity timeline generator (AI-powered, uses Skippy context)
- **Meta** — Marketing intelligence & content chat (OpenRouter-powered)

## Architecture

### Stack
- **Frontend/Backend**: Next.js 15 (App Router) — full-stack, no separate backend service
- **AI**: OpenRouter API (`OPEN_ROUTER` secret) using `google/gemini-2.0-flash-001`
- **Auth & Database**: Firebase (Auth + Firestore)
- **UI**: Tailwind CSS, Framer Motion, Radix UI, shadcn/ui components
- **3D**: Three.js + React Three Fiber
- **Email**: Nodemailer (requires SMTP_HOST, SMTP_USER, SMTP_PASS env vars; dev mode shows code in toast)

### Key Directories
```
src/
  app/
    api/
      ai/
        skippy/         # Skippy screen analysis endpoint
        snooks/         # Content strategy + chat endpoint
        screen-analyze/ # Screen capture vision analysis
        meta/           # Meta copywriter chat endpoint
      auth/
        send-verification/ # Email OTP generation & sending
    dashboard/
      layout.tsx        # Expandable/collapsible sidebar — creamy skin bg (#f5ede0), horizontal labels (VT323), shadow-only active state
      skippy/           # Integration hub with glassmorphism pill bar (light yellow tint), real app icons (GitHub/Notion/Figma/GDrive/GCal/Linear/Slack/VSCode), glassmorphism popup, sticky-note seed cards (draggable, 5-6 lines, 3D shadow, swipeable)
      snooks/           # Chat with auto-note detection ("auto" keyword → calendar), mesh-grid bg, bigger calendar text, yellow pins
      meta/             # Chat with mesh-grid bg (same as snooks), solid black textarea, white text
      tuning/           # Chat with pixelated dot pattern bg (dark pixel field), solid black textarea, white text
      settings/         # Dots-animated bg, centered layout, account+logout+delete-account only, API keys modal popup
    auth/               # Email + code verification flow (6-digit OTP)
  components/
    layout/
      navbar.tsx        # Glassmorphic pill, CozyJet logo
    sections/           # Landing page sections
  hooks/                # Zustand stores (useDashboardStore)
```

### Dashboard Design System (v2)
- **Background**: warm cream gradient `#f5f0eb → #ede8e3 → #f0ece7`
- **Sidebar**: ultra-minimal glassmorphism, 5 items only (Skippy/Snooks/Meta/Tuning/Settings), emoji icons
- **Cards**: `rgba(255,255,255,0.72)` with `backdrop-filter: blur(24px)`, thick white borders
- **Chat UI**: shared design — white glass bubbles (bot), warm amber/violet/pink tinted (user)
- **Skippy**: left panel = integration cards grid, right panel = content seeds feed
- **Snooks**: full chat + collapsible mini-calendar sidebar with event dots
- **Meta**: chat with platform tab selector (All/LinkedIn/Twitter/Instagram) + voice prefs strip
- **Tuning**: chat with collapsible config panel (model selector, tone tags, API key)

### API Routes (Server-side)
- `/api/ai/skippy` — Chat & workspace intelligence (OpenRouter, multi-turn)
- `/api/ai/snooks` — Productivity timeline generation (OpenRouter, JSON output)
- `/api/ai/meta` — Meta marketing chat (OpenRouter, full conversation history, 2000 tokens)
- `/api/ai/screen-analyze` — Vision analysis of screen captures (OpenRouter, multimodal)
- `/api/ai/generate` — Multi-platform batch content generation (returns JSON per platform)
- `/api/ai/workspace` — Workspace event stream analysis with content opportunity detection
- `/api/auth/send-verification` — Generate & send 6-digit OTP codes (nodemailer)

## Environment Variables / Secrets
- `OPEN_ROUTER` — OpenRouter API key (required for all AI chat features: Meta, Skippy, Snooks, Tuning, Flippo, Generate)
- `ELEVENLABS_API_KEY` — ElevenLabs API key (required for TTS read-aloud and STT voice input in Meta)
- `GOOGLE_API_KEY` — Google Gemini API key (configured; currently AI routed via OpenRouter using gemini-2.0-flash-001)
- `SMTP_HOST` — SMTP server hostname (optional; enables real email OTPs)
- `SMTP_USER` — SMTP username/email (optional)
- `SMTP_PASS` — SMTP password (optional)
- `SMTP_PORT` — SMTP port, default 587 (optional)

## Python Backend (FastAPI)

Located in `backend/`. Full spec implemented:

### New files added
- `app/services/encryption_service.py` — Fernet AES-256 encrypt/decrypt for OAuth tokens
- `app/models/integration.py` — OAuth integrations table (all 8 platforms)
- `app/models/chat_sessions.py` — chat sessions per user/mode
- `app/models/tune_samples.py` — voice learning sample store
- `app/models/__init__.py` — exports all models
- `app/schemas/integration.py` — Pydantic schemas for integrations
- `app/api/integrations.py` — OAuth connect/callback/status/disconnect
- `app/websocket.py` — WS /ws/main?token={jwt} with pub/sub forwarding
- `app/tasks/skippy_tasks.py` — Celery: sync_all_users, sync_user, sync_integration
- `app/tasks/publishing_tasks.py` — Celery: publish_scheduled_content (60s interval)

### Updated files
- `app/agents/skippy.py` — full JSON seed output (title, description, tags, content_angles)
- `app/agents/snooks.py` — 5-suggestion output with best_day/best_time/reasoning
- `app/agents/meta.py` — 3 variations + from-idea, from-trend, repurpose, refine + voice learning
- `app/api/auth.py` — password validation, email verification token, logout blacklist, refresh
- `app/api/skippy.py` — enhance, voice, screenshot, sync-now, seeds, dismiss
- `app/api/snooks.py` — suggest (14d seeds + 30d analytics + top 10 trends), calendar, schedule, gaps
- `app/api/meta.py` — generate, generate-from-idea, generate-from-trend, repurpose, refine, approve
- `app/dependencies.py` — Redis token blacklist check on every protected route
- `app/database.py` — handles both postgres:// and postgresql:// URL formats
- `app/config.py` — ENCRYPTION_KEY + all OAuth client IDs/secrets
- `app/tasks/celery_app.py` — beat schedule (sync every 2h, publish every 60s)
- `app/main.py` — integrations router + WS /ws/main registered

### OAuth Platforms supported
github, notion, figma, google_drive, google_calendar, linkedin, twitter, instagram

### Running the backend (manual, not wired to Replit workflow)
```
cd backend
uvicorn app.main:app --reload --port 8000
# Celery worker:
celery -A app.tasks.celery_app.celery_app worker --loglevel=info
# Celery beat:
celery -A app.tasks.celery_app.celery_app beat --loglevel=info
```

## Running (Next.js frontend)
- Dev: `npm run dev` (runs `next dev -p 5000 -H 0.0.0.0`)
- The workflow "Start application" handles this automatically via `npm run dev`
- Production: `npm run build && npm run start`

## Firebase Config
Firebase config is in `src/firebase/config.ts`. The app uses Firebase Auth and Firestore.

## Design System
- **Landing page**: Anime landscape background (hero-bg.webp), 100vh hero
- **Navbar**: Frosted glass pill, 80px CozyJet logo (larger than text), pixel font
- **Hero**: 100vh, bezier arch SVG, 11 platform nodes all on timeline (YouTube, Twitter, Reddit, TikTok, Threads, Email, Instagram, Pinterest, Slack, Discord, LinkedIn), neumorphic icon boxes, hyperrealistic yellow sticky notes on outer nodes, hub glow at center node (Email)
- **Slideshow**: Compact (42vh), "Projects" heading, animated subtitle strip
- **Auth**: Dark #050814 background, mesh canvas, 6-digit OTP code input, auto-verify on paste
- **Dashboard sidebar**: 72px wide, glassmorphic, Skippy/Snooks/Meta with icon+label
- **Skippy page**: White bg, dot cursor canvas, glowing pink toggle (reference image style), screen share button with browser permission modal
- **Snooks page**: Light #fafafa bg, AI timeline generator with arc progress bars + score rings
- **Meta page**: Dark #0f0f0f, pink-accented chat UI, conversation history, Skippy context integration

## Key Design Decisions
- Sidebar nav uses Skippy/Snooks/Meta labels (not abstract icon names)
- Screen sharing uses browser's native `getDisplayMedia()` API for privacy
- Email OTP codes stored in-memory with 10-min expiry (no DB dependency)
- All AI responses via OpenRouter with google/gemini-2.0-flash-001
- Hydration-safe: date formatting moved to useEffect
