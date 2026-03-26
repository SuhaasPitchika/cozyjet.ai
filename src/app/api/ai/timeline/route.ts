import { NextRequest, NextResponse } from 'next/server';
import AgenticBackend from '@/backend/agent-engine';

export async function POST(req: NextRequest) {
  try {
    const { rawActivities, skippyContext } = await req.json();

    const result = await AgenticBackend.processAgentTask(
      {
        id: 'flippo',
        name: 'Flippo',
        capabilities: ['productivity_analysis'],
        maxTokens: 2000,
        temperature: 0.7
      },
      {
        rawActivities,
        skippyContext: skippyContext || 'No active observation'
      },
      `Analyze my activities and generate a productivity timeline. Raw activities: ${JSON.stringify(rawActivities)}`
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json(result.result.output);
  } catch (error) {
    console.error('Timeline route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

