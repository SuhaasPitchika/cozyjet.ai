import { NextRequest, NextResponse } from 'next/server';
import agenticBackend from '@/backend/agent-engine';

export async function POST(req: NextRequest) {
  try {
    const { activitySummaries } = await req.json();

    if (!activitySummaries || !Array.isArray(activitySummaries)) {
      return NextResponse.json({ error: 'activitySummaries array is required' }, { status: 400 });
    }

    const activitiesText = activitySummaries
      .map((a: any) => `- From ${a.startTime} to ${a.endTime}: ${a.description}`)
      .join('\n');

    const result = await agenticBackend.processAgentTask(
      { id: 'flippo', name: 'Flippo', capabilities: ['analyze', 'productivity'] },
      { activitySummaries },
      activitiesText
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'AI service error' }, { status: 502 });
    }

    return NextResponse.json(result.result?.output ?? {});
  } catch (error) {
    console.error('Flippo route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
