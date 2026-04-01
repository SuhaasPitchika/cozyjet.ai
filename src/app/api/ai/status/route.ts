import { NextResponse } from "next/server";

export async function GET() {
  const hasOpenRouter = !!process.env.OPENAI_API_KEY;
  return NextResponse.json({ openRouter: hasOpenRouter });
}
