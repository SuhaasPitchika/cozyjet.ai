import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter } from "@/backend/agent-engine";

const FLIPPO_SYSTEM_PROMPT = `You are Flippo, the Productivity Intelligence agent inside CozyJet AI Studio.

Analyze the user's work session activity summaries and generate a rich productivity timeline with emotional context.

Return valid JSON:
{
  "sessions": [
    {
      "id": "unique-id",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "title": "Session title",
      "description": "2-3 sentence description of the work done",
      "energy": "high | medium | low",
      "type": "deep_work | meeting | creative | admin | break",
      "impact": "high | medium | low",
      "milestone": true | false,
      "tags": ["tag1", "tag2"]
    }
  ],
  "deep_work_score": 0-100,
  "flow_moments": ["description of peak flow moments"],
  "insight": "2-3 sentence insight about the user's productivity pattern today",
  "tomorrow_tip": "one actionable tip for tomorrow based on today's pattern"
}`;

export async function POST(req: NextRequest) {
  try {
    const { activitySummaries } = await req.json();

    if (!activitySummaries || !Array.isArray(activitySummaries)) {
      return NextResponse.json({ error: "activitySummaries array is required" }, { status: 400 });
    }

    const activitiesText = activitySummaries
      .map((a: { startTime: string; endTime: string; description: string }) =>
        `- From ${a.startTime} to ${a.endTime}: ${a.description}`
      )
      .join("\n");

    const response = await callOpenRouter(
      [
        { role: "system", content: FLIPPO_SYSTEM_PROMPT },
        { role: "user", content: `Analyze my work session today:\n\n${activitiesText}` },
      ],
      { maxTokens: 2000, temperature: 0.65, jsonMode: true }
    );

    let parsed: unknown;
    try {
      parsed = JSON.parse(response);
    } catch {
      const match = response.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { error: "Parse error", raw: response };
    }

    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Flippo route error:", message);
    if (message.includes("API key")) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured. Add it in Secrets." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
