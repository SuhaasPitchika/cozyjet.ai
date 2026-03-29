import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, SKIPPY_SYSTEM_PROMPT } from "@/backend/agent-engine";

export async function POST(req: NextRequest) {
  try {
    const { userMessage, conversationHistory, observationContext } = await req.json();

    if (!userMessage) {
      return NextResponse.json({ error: "userMessage is required" }, { status: 400 });
    }

    const systemContent = observationContext
      ? `${SKIPPY_SYSTEM_PROMPT}\n\nCurrent observation context:\n${JSON.stringify(observationContext, null, 2)}`
      : SKIPPY_SYSTEM_PROMPT;

    const history = Array.isArray(conversationHistory) ? conversationHistory : [];
    const messages = [
      { role: "system" as const, content: systemContent },
      ...history.map((m: { role: string; content: string }) => ({
        role: (m.role === "bot" ? "assistant" : m.role) as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: userMessage },
    ];

    const response = await callOpenRouter(messages, {
      maxTokens: 1500,
      temperature: 0.6,
    });

    return NextResponse.json({ response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Skippy route error:", message);
    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "OPEN_ROUTER API key not configured. Add it in Secrets." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
