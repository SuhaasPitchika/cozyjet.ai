import { NextRequest, NextResponse } from "next/server";

const VOICE_PRESETS: Record<string, { id: string; stability: number; similarity_boost: number; style: number }> = {
  sarah:    { id: "EXAVITQu4vr4xnSDxMaL", stability: 0.40, similarity_boost: 0.80, style: 0.45 },
  rachel:   { id: "21m00Tcm4TlvDq8ikWAM", stability: 0.35, similarity_boost: 0.82, style: 0.50 },
  adam:     { id: "pNInz6obpgDQGcFmaJgB", stability: 0.42, similarity_boost: 0.78, style: 0.40 },
  charlie:  { id: "IKne3meq5aSn9XLyUdCD", stability: 0.38, similarity_boost: 0.85, style: 0.55 },
  default:  { id: "EXAVITQu4vr4xnSDxMaL", stability: 0.38, similarity_boost: 0.82, style: 0.48 },
};

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId, emotion, voice } = await req.json();
    if (!text) return NextResponse.json({ error: "text is required" }, { status: 400 });

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 502 });
    }

    const preset = voice && VOICE_PRESETS[voice] ? VOICE_PRESETS[voice] : VOICE_PRESETS.default;
    const selectedVoiceId = voiceId || preset.id;

    let stability = preset.stability;
    let style = preset.style;
    if (emotion === "excited" || emotion === "energetic") { stability = 0.28; style = 0.70; }
    else if (emotion === "calm" || emotion === "thoughtful") { stability = 0.55; style = 0.25; }
    else if (emotion === "empathetic" || emotion === "warm") { stability = 0.40; style = 0.55; }

    const cleanText = text
      .replace(/[🎭🔧📈💡✍️💼🐦📸🧵🔴📧🎵▶️📘]/gu, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/#{1,6}\s/g, "")
      .replace(/`{1,3}.*?`{1,3}/gs, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanText) {
      return NextResponse.json({ error: "No readable text after cleanup" }, { status: 400 });
    }

    const truncated = cleanText.length > 4800 ? cleanText.slice(0, 4800) + "..." : cleanText;

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}/stream`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: truncated,
        model_id: "eleven_turbo_v2_5",
        voice_settings: {
          stability,
          similarity_boost: preset.similarity_boost,
          style,
          use_speaker_boost: true,
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("ElevenLabs TTS error:", res.status, err);
      throw new Error(`ElevenLabs error ${res.status}: ${err}`);
    }

    const audio = await res.arrayBuffer();
    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "TTS failed";
    console.error("TTS route error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
