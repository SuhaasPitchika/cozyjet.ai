import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, SKIPPY_SYSTEM_PROMPT } from "@/backend/agent-engine";
import type { OpenRouterMessage } from "@/backend/agent-engine";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: "imageBase64 required" },
        { status: 400 }
      );
    }

    const dataUrl = `data:${mimeType || "image/jpeg"};base64,${imageBase64}`;

    const messages: OpenRouterMessage[] = [
      { role: "system", content: SKIPPY_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analyze this screenshot of my screen. Identify what I am working on, extract meaningful content seeds, and provide workspace intelligence. Return valid JSON only.",
          },
          {
            type: "image_url",
            image_url: { url: dataUrl },
          },
        ],
      },
    ];

    const response = await callOpenRouter(messages, {
      model: "google/gemini-2.0-flash-001",
      maxTokens: 1500,
      temperature: 0.4,
      jsonMode: true,
    });

    let analysis: unknown;
    try {
      analysis = JSON.parse(response);
    } catch {
      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          analysis = JSON.parse(match[0]);
        } catch {
          analysis = { signal: "Screen analyzed", activity: response, apps: [], focus_score: 70, content_seeds: [] };
        }
      } else {
        analysis = { signal: "Screen analyzed", activity: response, apps: [], focus_score: 70, content_seeds: [] };
      }
    }

    return NextResponse.json({ analysis });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Screen analyze error:", message);
    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured. Add OPEN_ROUTER in Secrets." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
