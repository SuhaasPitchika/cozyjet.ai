import { NextRequest, NextResponse } from 'next/server';
import AgenticBackend from '@/backend/agent-engine';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: 'imageBase64 required' }, { status: 400 });

    const result = await AgenticBackend.processAgentTask(
      {
        id: 'skippy',
        name: 'Skippy',
        capabilities: ['vision_analysis'],
        maxTokens: 1000,
        temperature: 0.4
      },
      {
        image: { base64: imageBase64, mimeType: mimeType || 'image/jpeg' }
      },
      'Analyze my current screen and tell me what you observe.'
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    return NextResponse.json({ analysis: result.result.output });
  } catch (error) {
    console.error('Screen analyze error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

