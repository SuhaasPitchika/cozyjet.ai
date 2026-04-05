import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/backend/agent-engine";

const VOICE_EXTRACTOR_PROMPT = `You are a precision writing-style analyst. Your job is to extract a structured voice profile from writing samples — specific enough that another writer could mirror the style exactly.

RULES:
- Be brutally specific. Not "writes professionally" but "opens sentences with the object, not the subject" or "uses em-dashes for asides, never parentheses".
- Extract patterns that DISTINGUISH this writer — not generic traits everyone has.
- Each observation must be falsifiable: either it's true of this writing or it isn't.
- Observations should be instructional: "do X" not "doesn't do Y".

Return ONLY valid JSON matching this exact schema:
{
  "tone": "one or two words, e.g. 'direct, dry'",
  "formality": "one of: casual / semi-formal / formal",
  "humor": "one of: none / dry / warm / self-deprecating / witty",
  "length_preference": "one of: brief / medium / long-form",
  "preferred_style": "one of: storytelling / analytical / conversational / instructional",
  "style_observations": [
    "specific observation 1",
    "specific observation 2",
    "specific observation 3",
    "specific observation 4",
    "specific observation 5"
  ],
  "signature_moves": [
    "rhetorical move they use repeatedly"
  ],
  "avoid": [
    "thing that would sound wrong for this voice"
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const { samples } = await req.json();

    if (!samples || !Array.isArray(samples) || samples.length === 0) {
      return NextResponse.json({ error: "samples array is required" }, { status: 400 });
    }

    const combined = samples
      .map((s: { text: string; label?: string }, i: number) =>
        `--- Sample ${i + 1}${s.label ? ` (${s.label})` : ""} ---\n${s.text}`
      )
      .join("\n\n");

    const userMessage = `Analyze these writing samples and extract a precise voice profile:\n\n${combined.slice(0, 12000)}`;

    const messages = [
      { role: "system" as const, content: VOICE_EXTRACTOR_PROMPT },
      { role: "user" as const, content: userMessage },
    ];

    const raw = await callOpenRouter(messages, {
      model: "anthropic/claude-3-haiku",
      maxTokens: 800,
      temperature: 0.2,
    });

    let profile: Record<string, unknown>;
    try {
      const cleaned = raw.trim().replace(/^```json?\n?/, "").replace(/\n?```$/, "");
      profile = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: "Failed to parse voice profile", raw }, { status: 500 });
    }

    return NextResponse.json({ profile, samples_count: samples.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Voice extraction error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
