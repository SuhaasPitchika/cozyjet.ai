import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, TUNING_SYSTEM_PROMPT, DEFAULT_MODEL } from "@/backend/agent-engine";

export async function POST(req: NextRequest) {
  try {
    const { messages, selectedModel, tones, skippyContext, voiceProfile } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    let systemContent = TUNING_SYSTEM_PROMPT;

    if (tones && tones.length > 0) {
      systemContent += `\n\nActive tone profile: ${tones.join(", ")}. Apply these tones when rewriting or generating content.`;
    }

    if (skippyContext) {
      systemContent += `\n\nWorkspace context from Skippy:\n${skippyContext}`;
    }

    if (voiceProfile && Object.keys(voiceProfile).length > 0) {
      const obs = (voiceProfile.style_observations as string[] | undefined) || [];
      const moves = (voiceProfile.signature_moves as string[] | undefined) || [];
      const avoid = (voiceProfile.avoid as string[] | undefined) || [];

      systemContent += `\n\n=== THIS USER'S VOICE PROFILE (extracted from their actual writing) ===
Tone: ${voiceProfile.tone || "not set"}
Formality: ${voiceProfile.formality || "not set"}
Humor: ${voiceProfile.humor || "none"}
Length preference: ${voiceProfile.length_preference || "medium"}
Style: ${voiceProfile.preferred_style || "not set"}
${obs.length > 0 ? `\nKey observations (mirror these exactly):\n${obs.map((o: string) => `- ${o}`).join("\n")}` : ""}
${moves.length > 0 ? `\nSignature moves (use these patterns):\n${moves.map((m: string) => `- ${m}`).join("\n")}` : ""}
${avoid.length > 0 ? `\nAvoid (would sound wrong for this voice):\n${avoid.map((a: string) => `- ${a}`).join("\n")}` : ""}

When rewriting, humanizing, or generating any content for this user, apply every observation above. The goal: output they could post without changing a word.`;
    }

    const model = selectedModel || DEFAULT_MODEL;
    const openRouterMessages = [
      { role: "system" as const, content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: (m.role === "bot" ? "assistant" : m.role) as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await callOpenRouter(openRouterMessages, {
      model,
      maxTokens: 2000,
      temperature: 0.75,
    });

    return NextResponse.json({ response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Tuning route error:", message);
    if (message.includes("OPEN_ROUTER") || message.includes("API key")) {
      return NextResponse.json(
        { error: "OPEN_ROUTER not configured. Add it in Secrets." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
