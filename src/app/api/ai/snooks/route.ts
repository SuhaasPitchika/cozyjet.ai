import { NextRequest, NextResponse } from 'next/server';
import agenticBackend from '@/backend/agent-engine';

export async function POST(req: NextRequest) {
  try {
    const { userPrompt, userContext, skippyContext } = await req.json();
    if (!userPrompt) return NextResponse.json({ error: 'userPrompt is required' }, { status: 400 });

    const contextStr = typeof userContext === 'string' ? userContext : JSON.stringify(userContext ?? {});
    const params = { userContext: contextStr, skippyContext };

    const result = await agenticBackend.processAgentTask(
      { id: 'snooks', name: 'Snooks', capabilities: ['marketing', 'content'] },
      params,
      userPrompt
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'AI service error' }, { status: 502 });
    }

    return NextResponse.json(result.result?.output ?? {});
  } catch (error) {
    console.error('Snooks route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
