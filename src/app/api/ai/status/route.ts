import { NextResponse } from "next/server";
import { env } from "@/lib/env";

export async function GET() {
  const hasOpenRouter = !!process.env.OPEN_ROUTER;
  const hasElevenLabs = !!process.env.ELEVENLABS_API_KEY;
  const hasGoogle = !!process.env.GOOGLE_API_KEY;

  return NextResponse.json({
    openRouter: hasOpenRouter,
    elevenLabs: hasElevenLabs,
    google: hasGoogle,
    allConfigured: hasOpenRouter && hasElevenLabs,
    features: {
      chat: hasOpenRouter,
      tts: hasElevenLabs,
      stt: hasElevenLabs,
      voiceCall: hasElevenLabs && hasOpenRouter,
      screenAnalysis: hasOpenRouter,
      contentGeneration: hasOpenRouter,
    },
  });
}
