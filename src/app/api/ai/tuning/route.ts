import { NextRequest, NextResponse } from "next/server";
import { callOpenRouter, DEFAULT_MODEL } from "@/backend/agent-engine";

const VOICE_CALIBRATION_PROMPT = `You are the Tuning engine for CozyJet AI Studio. Your only job is to calibrate Meta and Snooks — the content-generation agents — to write in this specific user's voice.

You are NOT a writing assistant. You are NOT a text humanizer. You do not rewrite or improve text.

You are a voice interviewer and profile builder. Through conversation, you extract exactly how this person writes — their rhythm, their tone, their humor, their vocabulary, their rhetorical patterns — and you build a voice profile that Meta and Snooks use when generating all content.

YOUR APPROACH:
- Ask specific, targeted questions about HOW they write. Not "what are your interests" — that's irrelevant. Ask about craft and style.
- Good questions: "Do you open posts with a statement or a question?", "How long are your sentences typically?", "Do you swear ever, or keep it clean?", "Do you use analogies a lot?", "What's something you hate seeing in content?"
- Bad questions: "What topics do you write about?", "What are your goals?", "Who is your audience?"
- Ask ONE question at a time. Never list multiple questions.
- When they give you examples of their writing, analyze the specific stylistic patterns.
- Be direct and efficient. No flattery. No "Great answer!"

BUILDING THE PROFILE:
- After 4-6 exchanges, you should have enough to propose a voice profile.
- When proposing, format it clearly with these fields:
  TONE: (1-3 words)
  FORMALITY: (casual / semi-formal / formal)
  HUMOR: (none / dry / warm / self-deprecating / witty)
  LENGTH: (brief / medium / long-form)
  STYLE: (storytelling / analytical / conversational / instructional)
  OBSERVATIONS: (5-8 specific, concrete writing traits)
  SIGNATURE MOVES: (2-3 rhetorical patterns they use)
  AVOID: (2-3 things that would sound wrong for their voice)

- After proposing the profile, ask if it's accurate or needs refinement.
- When they confirm it's right, tell them to click "Save Profile" — this is what teaches Meta and Snooks to write in their voice.

IMPORTANT: If they share a sample of their writing, extract specific stylistic patterns from it — don't just describe it generally. Look for: sentence length variation, how they use punctuation, how they start paragraphs, their vocabulary tier, whether they use rhetorical questions, their humor register, how they handle transitions.

Start immediately. Do not introduce yourself. Ask the first question.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, selectedModel, voiceProfile } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array is required" }, { status: 400 });
    }

    let systemContent = VOICE_CALIBRATION_PROMPT;

    if (voiceProfile && Object.keys(voiceProfile).length > 0) {
      const obs = (voiceProfile.style_observations as string[] | undefined) || [];
      const moves = (voiceProfile.signature_moves as string[] | undefined) || [];
      const avoid = (voiceProfile.avoid as string[] | undefined) || [];

      systemContent += `\n\n=== CURRENT VOICE PROFILE (already extracted from samples) ===
Tone: ${voiceProfile.tone || "not set"}
Formality: ${voiceProfile.formality || "not set"}
Humor: ${voiceProfile.humor || "none"}
Length: ${voiceProfile.length_preference || "medium"}
Style: ${voiceProfile.preferred_style || "not set"}
${obs.length > 0 ? `Observations: ${obs.join("; ")}` : ""}
${moves.length > 0 ? `Signature moves: ${moves.join("; ")}` : ""}
${avoid.length > 0 ? `Avoid: ${avoid.join("; ")}` : ""}

This profile was auto-extracted from their writing samples. Your job now is to refine it through conversation — ask questions to verify accuracy, uncover anything the samples missed, and sharpen the observations. Ask them if this profile sounds right, starting with the aspect most likely to be off.`;
    }

    const model = selectedModel || DEFAULT_MODEL;
    const openRouterMessages = [
      { role: "system" as const, content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({
        role: (m.role === "bot" ? "assistant" : m.role) as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await callOpenRouter(openRouterMessages, {
      model,
      maxTokens: 1200,
      temperature: 0.45,
    });

    return NextResponse.json({ response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Tuning route error:", message);
    if (message.includes("OPEN_ROUTER") || message.includes("API key")) {
      return NextResponse.json(
        { error: "OPEN_ROUTER not configured. Add it in Secrets." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
