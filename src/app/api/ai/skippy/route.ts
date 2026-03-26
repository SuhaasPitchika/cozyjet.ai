import { NextRequest, NextResponse } from 'next/server';
import agenticBackend from '@/backend/agent-engine';

export async function POST(req: NextRequest) {
  try {
    const { userMessage, currentView, observationContext } = await req.json();
    if (!userMessage) return NextResponse.json({ error: 'userMessage is required' }, { status: 400 });
    
    const params = { currentView, observationContext };

    const result = await agenticBackend.processAgentTask(
      { id: 'skippy', name: 'Skippy', capabilities: ['observe', 'advise'] },
      params,
      userMessage
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'AI service error' }, { status: 502 });
    }

    return NextResponse.json({ response: result.result?.output ?? "I'm having a brief moment. Try again?" });
  } catch (error) {
    console.error('Skippy route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
