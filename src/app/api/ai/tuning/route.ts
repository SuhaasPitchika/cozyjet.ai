import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, TUNING_SYSTEM_PROMPT, DEFAULT_MODEL } from "@/backend/agent-engine";

export async function POST(req: NextRequest) {
  try {
    const { messages, selectedModel, tones, skippyContext } = await req.json();

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
    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "OPEN_ROUTER API key not configured. Add it in Secrets." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
