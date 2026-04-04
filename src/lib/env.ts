/**
 * CozyJet AI Studio — Central Environment Configuration
 *
 * All API keys and runtime config are sourced from Replit Secrets (injected
 * automatically into process.env). This file is the single source of truth
 * for every environment variable used across the codebase.
 *
 * Required secrets in Replit Secrets panel:
 *   OPEN_ROUTER          — OpenRouter API key (Meta, Skippy, Snooks, Tuning, Generate)
 *   ELEVENLABS_API_KEY   — ElevenLabs key (TTS read-aloud, STT voice input, Voice Call)
 *   GOOGLE_API_KEY       — Google Gemini API key (direct Gemini access, screen analysis)
 *
 * Optional:
 *   SMTP_HOST / SMTP_USER / SMTP_PASS / SMTP_PORT — email OTP delivery
 */

export const env = {
  // Accept both Doppler key names (OPENROUTER_API_KEY) and legacy Replit names (OPEN_ROUTER)
  OPEN_ROUTER:         process.env.OPEN_ROUTER         ?? process.env.OPENROUTER_API_KEY  ?? "",
  ELEVENLABS_API_KEY:  process.env.ELEVENLABS_API_KEY  ?? "",
  GOOGLE_API_KEY:      process.env.GOOGLE_API_KEY       ?? process.env.GEMINI_API_KEY      ?? "",

  SMTP_HOST: process.env.SMTP_HOST ?? "",
  SMTP_USER: process.env.SMTP_USER ?? "",
  SMTP_PASS: process.env.SMTP_PASS ?? "",
  SMTP_PORT: parseInt(process.env.SMTP_PORT ?? "587", 10),

  OPENROUTER_BASE:  "https://openrouter.ai/api/v1",
  ELEVENLABS_BASE:  "https://api.elevenlabs.io/v1",
  GOOGLE_AI_BASE:   "https://generativelanguage.googleapis.com/v1beta",

  OPENROUTER_REFERER: "https://cozyjet.ai",
  OPENROUTER_TITLE:   "CozyJet AI Studio",

  DEFAULT_VOICE_ID: "EXAVITQu4vr4xnSDxMaL",
  DEFAULT_TTS_MODEL: "eleven_turbo_v2_5",
  DEFAULT_STT_MODEL: "scribe_v1",

  DEFAULT_AI_MODEL: "google/gemini-2.0-flash-001",
  SMART_AI_MODEL:   "google/gemini-2.5-flash-preview",

  get hasOpenRouter()   { return !!this.OPEN_ROUTER; },
  get hasElevenLabs()   { return !!this.ELEVENLABS_API_KEY; },
  get hasGoogle()       { return !!this.GOOGLE_API_KEY; },
  get hasSmtp()         { return !!(this.SMTP_HOST && this.SMTP_USER && this.SMTP_PASS); },
  get allAiReady()      { return this.hasOpenRouter && this.hasElevenLabs; },
} as const;

export type Env = typeof env;
