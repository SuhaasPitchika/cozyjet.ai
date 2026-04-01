import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, SNOOKS_SYSTEM_PROMPT } from "@/backend/agent-engine";

export async function POST(req: NextRequest) {
  try {
    const { userPrompt, userContext, skippyContext, contentSeeds, conversationHistory } =
      await req.json();

    if (!userPrompt) {
      return NextResponse.json({ error: "userPrompt is required" }, { status: 400 });
    }

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

    const history = Array.isArray(conversationHistory) ? conversationHistory : [];

    let chatMessages: { role: "user" | "assistant"; content: string }[];

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

    const messages = [
      { role: "system" as const, content: systemContent },
      ...chatMessages,
    ];

    const isPlanningRequest = /\bplan\b|content plan|week|calendar|schedule\b|content strategy|when to post|content for the next/i.test(userPrompt);

    const responseText = await callOpenRouter(messages, {
      maxTokens: 2500,
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
          try {
            parsed = JSON.parse(match[0]);
          } catch {
            parsed = { response: responseText };
          }
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
    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured. Add it in Secrets." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
