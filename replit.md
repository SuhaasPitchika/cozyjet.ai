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
      workspace/      # Workspace event processing endpoint
    dashboard/        # Protected dashboard pages
      skippy/         # Observer agent page
      flippo/         # Timeline/productivity page
      snooks/         # Marketing chat page
      tuning/         # Model configuration page
    auth/             # Auth pages
  ai/
    client.ts         # Client-side API callers (fetch to /api/ai/*)
    flows/            # Original Genkit flow definitions (reference)
    genkit.ts         # Genkit config (unused in production)
  firebase/           # Firebase client setup, Auth, Firestore hooks
  components/         # UI components
  hooks/              # Zustand stores (useDashboardStore)
```

### API Routes (Server-side)
All AI calls go through Next.js API routes in `src/app/api/ai/` which securely access the `OPEN_ROUTER` environment variable server-side. The client in `src/ai/client.ts` calls these routes via fetch.

## Environment Variables / Secrets
- `OPEN_ROUTER` — OpenRouter API key (required for all AI features)
- `GH_PAT` — GitHub Personal Access Token for auto-push to `SuhaasPitchika/cozyjet.ai`

## Running
- Dev: `npx next dev -p 5000 -H 0.0.0.0`
- The workflow "Start application" handles this automatically

## GitHub Auto-Push
Run `bash scripts/push-to-github.sh "commit message"` to push to GitHub.
**Note**: `GH_PAT` must be a GitHub Personal Access Token (classic), not a repository URL.

## Firebase Config
Firebase config is in `src/firebase/config.ts`. The app uses Firebase Auth and Firestore.
Project: `studio-9941557236-b9262`

## UI Design
- Dark theme: `#0f0f0f` background, `#141414` sidebar
- Modern minimal: white accents, subtle borders (`border-white/5`)
- Inter font, tight tracking, clean typography
