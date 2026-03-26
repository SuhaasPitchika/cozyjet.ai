import { NextRequest, NextResponse } from 'next/server';
import AgenticBackend from '@/backend/agent-engine';

export async function POST(req: NextRequest) {
  try {
    const { messages, skippyContext } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'bot' ? 'assistant' : m.role,
      content: m.content
    }));

    const result = await AgenticBackend.processAgentTask(
      {
        id: 'snooks',
        name: 'Snooks',
        capabilities: ['marketing_strategy', 'content_creation'],
        maxTokens: 2000,
        temperature: 0.75
      },
      {
        chatHistory: history,
        skippyContext: skippyContext || ''
      },
      lastMessage
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    // Snooks returns JSON with responseText
    const output = result.result.output;
    const responseText = output.responseText || output.response || (typeof output === 'string' ? output : "Error generating response.");

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('Meta route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

