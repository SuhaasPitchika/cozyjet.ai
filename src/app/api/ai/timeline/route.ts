import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/backend/agent-engine";

const TIMELINE_SYSTEM_PROMPT = `You are Flippo, the Productivity Intelligence agent inside CozyJet AI Studio.

Analyze the user's raw activities and generate a structured productivity timeline with emotional depth and professional insight.

Return valid JSON:
{
  "sessions": [
    {
      "id": "unique-id",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "title": "Session title",
      "description": "2-3 sentence description",
      "energy": "high | medium | low",
      "type": "deep_work | meeting | creative | admin | break",
      "impact": "high | medium | low",
      "milestone": true | false,
      "deepWorkMinutes": 0,
      "tags": ["tag1"]
    }
  ],
  "deep_work_score": 0-100,
  "total_deep_work_minutes": 0,
  "flow_moments": ["description of peak flow moments"],
  "insight": "2-3 sentence productivity pattern insight",
  "tomorrow_tip": "one actionable tip for tomorrow"
}`;

export async function POST(req: NextRequest) {
  try {
    const { rawActivities, skippyContext } = await req.json();

    let userContent = `Analyze my work session and generate a productivity timeline.`;
    if (rawActivities) {
      userContent += `\n\nActivities:\n${JSON.stringify(rawActivities, null, 2)}`;
    }
    if (skippyContext) {
      userContent += `\n\nWorkspace context: ${skippyContext}`;
    }

    const response = await callOpenRouter(
      [
        { role: "system", content: TIMELINE_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      { maxTokens: 2000, temperature: 0.6, jsonMode: true }
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(response);
    } catch {
      const match = response.match(/\{[\s\S]*\}/);
      if (match) {
        try { parsed = JSON.parse(match[0]); } catch { parsed = { error: "Parse error", raw: response }; }
      } else {
        parsed = { error: "Parse error", raw: response };
      }
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Timeline route error:", message);
    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "OPEN_ROUTER API key not configured. Add it in Secrets." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
