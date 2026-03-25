# CozyJet.AI — Replit Project

## Overview
CozyJet is an AI-powered SaaS platform for solopreneurs and startups. It provides three AI agents:
- **Skippy** — Workspace observer & context intelligence
- **Flippo** — Deep work & productivity timeline analysis
- **Snooks** — Marketing intelligence & content generation

## Architecture

### Stack
- **Frontend/Backend**: Next.js 15 (App Router) — full-stack, no separate backend service
- **AI**: OpenRouter API (`OPEN_ROUTER` secret) using `google/gemini-2.0-flash-001`
- **Auth & Database**: Firebase (Auth + Firestore)
- **UI**: Tailwind CSS, Framer Motion, Radix UI, shadcn/ui components
- **3D**: Three.js + React Three Fiber

### Key Directories
```
src/
  app/
    api/ai/           # Server-side API routes (OpenRouter)
      skippy/         # Chat interaction endpoint
      flippo/         # Productivity analysis endpoint
      snooks/         # Marketing intelligence endpoint
      timeline/       # Flippo timeline generation (rich emotional context)
      workspace/      # Workspace event processing endpoint
    dashboard/        # Protected dashboard pages
      skippy/         # Observer agent page (neumorphic toggle, dot cursor)
      flippo/         # Timeline/productivity page (dark theme, score ring)
      snooks/         # Marketing chat page with content blocks
      tuning/         # Model configuration page
    auth/             # Auth pages
  ai/
    client.ts         # Client-side API callers (fetch to /api/ai/*)
  firebase/           # Firebase client setup, Auth, Firestore hooks
  components/
    layout/
      navbar.tsx      # Glassmorphism nav, 64px logo, Launch Studio CTA
    sections/
      hero.tsx        # Anime bg, arch SVG timeline, glassmorphism text card
  hooks/              # Zustand stores (useDashboardStore)
```

### API Routes (Server-side)
All AI calls go through Next.js API routes in `src/app/api/ai/` which securely access the `OPEN_ROUTER` environment variable server-side. The client in `src/ai/client.ts` calls these routes via fetch.

## Environment Variables / Secrets
- `OPEN_ROUTER` — OpenRouter API key (required for all AI features)

## Running
- Dev: `npm run dev` → `next dev -p 5000 -H 0.0.0.0`
- The workflow "Start application" handles this automatically

## Firebase Config
Firebase config is in `src/firebase/config.ts`. The app uses Firebase Auth and Firestore.
Project: `studio-9941557236-b9262`

## Design System
- **Landing page**: Anime landscape background (hero-bg.webp), no white overlay, glassmorphism cards for text contrast
- **Navbar**: Frosted glass pill, 64px CozyJet logo, pixel font
- **Hero**: Quadratic bezier arch SVG with fill + spoke lines to hub, 6 platform nodes with sticky notes, staggered spring animations
- **Auth**: Cloud sky gradient background (SVG clouds), glassmorphism card, Sign In / Create Account tabs, email verification flow, password strength meter
- **Dashboard**: Light `#f0f4f8` background, frosted glass sidebar (64px wide), global Skippy chat panel slides in from right
- **Dashboard pages**: Dark `#0f0f0f` theme with white/opacity text
- **Font**: `font-pixel` (pixel font) for headings/labels throughout

## Key Design Decisions
- Hero background: `backgroundPosition: "center 15%"` to show sky/jet, crop bottom greenery slightly
- No white overlay on hero background — text uses glassmorphism card backdrop
- Skippy API returns `{ response: string }` — dashboard reads `result.response`
- Flippo uses `/api/ai/timeline` (richer than `/api/ai/flippo`) for emotional context
- All AI responses via OpenRouter with `google/gemini-2.0-flash-001`
