import { NextResponse } from "next/server";

export async function GET() {
  const hasOpenRouter = !!process.env.OPEN_ROUTER;
  return NextResponse.json({ openRouter: hasOpenRouter });
}
