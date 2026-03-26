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
        skippy/         # Skippy chat + workspace intelligence endpoint
        snooks/         # Marketing content generation endpoint
        screen-analyze/ # Screen capture vision analysis (NEW)
      auth/
        send-verification/ # Email OTP generation & sending (NEW)
    dashboard/
      layout.tsx        # Glassmorphic sidebar: Skippy / Snooks / Meta nav
      skippy/           # Observer: dot cursor canvas, glowing toggle, screen share
      snooks/           # Productivity timeline generator with score rings
      meta/             # Chat system with OpenRouter, conversation history (NEW)
    auth/               # Email + code verification flow (6-digit OTP)
  components/
    layout/
      navbar.tsx        # 80px logo (bigger than text), glassmorphic pill
    sections/
      hero.tsx          # 100vh, social logos (Reddit/Slack/TikTok/Pinterest/Discord), hyperrealistic sticky notes
      three-slideshow.tsx # Smaller (42vh), "Projects" heading, animated text below
  hooks/                # Zustand stores (useDashboardStore)
```

### API Routes (Server-side)
- `/api/ai/skippy` — Chat & workspace intelligence (OpenRouter, multi-turn)
- `/api/ai/snooks` — Productivity timeline generation (OpenRouter, JSON output)
- `/api/ai/meta` — Meta marketing chat (OpenRouter, full conversation history, 2000 tokens)
- `/api/ai/screen-analyze` — Vision analysis of screen captures (OpenRouter, multimodal)
- `/api/ai/generate` — Multi-platform batch content generation (returns JSON per platform)
- `/api/ai/workspace` — Workspace event stream analysis with content opportunity detection
- `/api/auth/send-verification` — Generate & send 6-digit OTP codes (nodemailer)

## Environment Variables / Secrets
- `OPEN_ROUTER` — OpenRouter API key (required for all AI features)
- `SMTP_HOST` — SMTP server hostname (optional; enables real email OTPs)
- `SMTP_USER` — SMTP username/email (optional)
- `SMTP_PASS` — SMTP password (optional)
- `SMTP_PORT` — SMTP port, default 587 (optional)

## Running
- Dev: `npm run dev` → `next dev -p 5000 -H 0.0.0.0`
- The workflow "Start application" handles this automatically

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
