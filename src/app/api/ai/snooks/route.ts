import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, SNOOKS_SYSTEM_PROMPT } from "@/backend/agent-engine";

export async function POST(req: NextRequest) {
  try {
    const { userPrompt, userContext, skippyContext, contentSeeds } =
      await req.json();

    if (!userPrompt) {
      return NextResponse.json(
        { error: "userPrompt is required" },
        { status: 400 }
      );
    }

    let systemContent = SNOOKS_SYSTEM_PROMPT;
    if (skippyContext) {
      systemContent += `\n\nSKIPPY CONTEXT:\n${skippyContext}`;
    }
    if (contentSeeds && contentSeeds.length > 0) {
      systemContent += `\n\nAVAILABLE CONTENT SEEDS FROM SKIPPY:\n${JSON.stringify(contentSeeds, null, 2)}`;
    }

    const contextNote = userContext
      ? `\nUser context: ${typeof userContext === "string" ? userContext : JSON.stringify(userContext)}`
      : "";

    const response = await callOpenRouter(
      [
        { role: "system", content: systemContent },
        { role: "user", content: userPrompt + contextNote },
      ],
      {
        maxTokens: 3000,
        temperature: 0.65,
        jsonMode: true,
      }
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(response);
    } catch {
      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          parsed = { responseText: response, raw: response };
        }
      } else {
        parsed = { responseText: response, raw: response };
      }
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Snooks route error:", message);
    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "OPEN_ROUTER API key not configured. Add it in Secrets." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
