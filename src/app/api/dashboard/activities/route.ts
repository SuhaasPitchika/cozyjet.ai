import { NextResponse } from 'next/server';

// Simple backend-provided mock data for integration activities.
const sample = [
  {
    id: 'evt-1',
    title: 'JWT Auth Implemented',
    timestamp: new Date().toISOString(),
    type: 'coding',
  },
  {
    id: 'evt-2',
    title: 'Dashboard Wireup',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    type: 'design',
  },
];

export async function GET() {
  return NextResponse.json({ activities: sample });
}
