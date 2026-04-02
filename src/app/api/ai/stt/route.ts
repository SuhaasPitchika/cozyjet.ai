import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "ELEVENLABS_API_KEY not configured" }, { status: 502 });
    }

    const formData = await req.formData();
    const audio = formData.get("audio") as Blob | null;
    if (!audio) return NextResponse.json({ error: "audio file required" }, { status: 400 });

    const body = new FormData();
    body.append("audio", audio, "audio.webm");
    body.append("model_id", "scribe_v1");

    const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ElevenLabs STT error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return NextResponse.json({ text: data.text || "" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "STT failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
