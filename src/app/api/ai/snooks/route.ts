import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, SNOOKS_SYSTEM_PROMPT } from "@/backend/agent-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      messages,
      userPrompt,
      userContext,
      skippyContext,
      contentSeeds,
      conversationHistory,
    } = body;

    let chatMessages: { role: "user" | "assistant"; content: string }[] = [];

    if (Array.isArray(messages) && messages.length > 0) {
      chatMessages = messages.map((m: { role: string; content: string }) => ({
        role: (m.role === "bot" ? "assistant" : m.role) as "user" | "assistant",
        content: m.content,
      }));
    } else if (userPrompt) {
      const history = Array.isArray(conversationHistory) ? conversationHistory : [];
      if (history.length > 0) {
        chatMessages = history.map((m: { role: string; content: string }) => ({
          role: (m.role === "bot" ? "assistant" : m.role) as "user" | "assistant",
          content: m.content,
        }));
        const lastMsg = chatMessages[chatMessages.length - 1];
        if (!lastMsg || lastMsg.role !== "user" || !lastMsg.content.startsWith(userPrompt.slice(0, 30))) {
          chatMessages.push({ role: "user", content: userPrompt });
        }
      } else {
        chatMessages = [{ role: "user", content: userPrompt }];
      }
    } else {
      return NextResponse.json({ error: "messages array or userPrompt is required" }, { status: 400 });
    }

    const lastUserMsg = [...chatMessages].reverse().find(m => m.role === "user")?.content || "";

    let systemContent = SNOOKS_SYSTEM_PROMPT;
    if (skippyContext) {
      systemContent += `\n\nSKIPPY CONTEXT:\n${skippyContext}`;
    }
    if (contentSeeds && contentSeeds.length > 0) {
      systemContent += `\n\nAVAILABLE CONTENT SEEDS FROM SKIPPY:\n${JSON.stringify(contentSeeds, null, 2)}`;
    }
    if (userContext) {
      systemContent += `\n\nUSER CONTEXT:\n${typeof userContext === "string" ? userContext : JSON.stringify(userContext)}`;
    }

    const allMessages = [
      { role: "system" as const, content: systemContent },
      ...chatMessages,
    ];

    const isPlanningRequest = /\bplan\b|content plan|week|calendar|schedule\b|content strategy|when to post|content for the next/i.test(lastUserMsg);

    const responseText = await callOpenRouter(allMessages, {
      maxTokens: 2800,
      temperature: 0.65,
      jsonMode: isPlanningRequest,
    });

    if (isPlanningRequest) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        const match = responseText.match(/\{[\s\S]*\}/);
        if (match) {
          try { parsed = JSON.parse(match[0]); } catch { parsed = { response: responseText }; }
        } else {
          parsed = { response: responseText };
        }
      }
      return NextResponse.json(parsed);
    }

    return NextResponse.json({ response: responseText });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Snooks route error:", message);
    if (message.includes("OPEN_ROUTER") || message.includes("API key")) {
      return NextResponse.json(
        { error: "OPEN_ROUTER not configured. Add it in Secrets." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
