import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, META_SYSTEM_PROMPT } from "@/backend/agent-engine";

export async function POST(req: NextRequest) {
  try {
    const { messages, skippyContext } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const systemContent = skippyContext
      ? `${META_SYSTEM_PROMPT}\n\nSKIPPY CONTEXT (user's current workspace activity):\n${skippyContext}\n\nUse this context to make generated content feel authentically personal and specific.`
      : META_SYSTEM_PROMPT;

    const openRouterMessages = [
      { role: "system" as const, content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: (m.role === "bot" ? "assistant" : m.role) as
          | "user"
          | "assistant",
        content: m.content,
      })),
    ];

    const response = await callOpenRouter(openRouterMessages, {
      maxTokens: 2500,
      temperature: 0.8,
    });

    return NextResponse.json({ response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Meta route error:", message);
    if (message.includes("OPEN_ROUTER") || message.includes("API key")) {
      return NextResponse.json(
        { error: "OPEN_ROUTER not configured. Add it in Secrets." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
