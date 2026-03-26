
/**
 * @fileOverview A Genkit flow for Skippy to provide contextual assistance.
 *
 * - skippyProvideContextualAssistance - A function that processes summarized screen activity
 *   and offers contextual assistance if the user appears to be stuck.
 * - SkippyProvideContextualAssistanceInput - The input type for the function.
 * - SkippyProvideContextualAssistanceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SkippyProvideContextualAssistanceInputSchema = z.object({
  currentActivityContext: z
    .string()
    .describe(
      "A summary of the user's current primary activity (e.g., 'working on a Next.js component', 'designing in Figma')."
    ),
  recentActionsSummary: z
    .string()
    .describe(
      "A summary of the user's recent interactions, including any pauses or repeated actions that might indicate being stuck."
    ),
  timeSinceLastMeaningfulInteractionSeconds: z
    .number()
    .describe('Number of seconds since the last non-repetitive user input.'),
});
export type SkippyProvideContextualAssistanceInput = z.infer<
  typeof SkippyProvideContextualAssistanceInputSchema
>;

const SkippyProvideContextualAssistanceOutputSchema = z.object({
  assistanceMessage: z
    .string()
    .describe(
      'A friendly, curious, and slightly comic message from Skippy, or a neutral observation if not stuck.'
    ),
});
export type SkippyProvideContextualAssistanceOutput = z.infer<
  typeof SkippyProvideContextualAssistanceOutputSchema
>;

export async function skippyProvideContextualAssistance(
  input: SkippyProvideContextualAssistanceInput
): Promise<SkippyProvideContextualAssistanceOutput> {
  return skippyProvideContextualAssistanceFlow(input);
}

const skippyProvideContextualAssistancePrompt = ai.definePrompt({
  name: 'skippyProvideContextualAssistancePrompt',
  input: { schema: SkippyProvideContextualAssistanceInputSchema },
  output: { schema: SkippyProvideContextualAssistanceOutputSchema },
  prompt: `You are Skippy, a curious, comic, and warm AI agent. Your goal is to gently check in with the user if they seem stuck and offer assistance.

Based on the following activity summary provided by a client-side agent:
Current Context: {{{currentActivityContext}}}
Recent Actions: {{{recentActionsSummary}}}
Idle Time: {{{timeSinceLastMeaningfulInteractionSeconds}}} seconds

Analyze the provided information. If the 'Idle Time' is greater than 60 seconds AND 'Recent Actions' suggest repetition, lack of progress, or unusual patterns (e.g., rapid scrolling without changes, repeated clicks on the same area, or prolonged inactivity), assume the user might be stuck.

If the user seems stuck, craft a short, friendly, and slightly comic message to offer help. For example: "Yo, you good? Wanna talk it out? 👀", "Lost in the sauce? I gotchu!", or "Brain glitch? I'm here to un-glitch!"

If the user does not seem stuck (idle time is low or actions indicate steady progress), respond with a very short, positive, and non-intrusive observation, or just a simple, encouraging phrase like "Looking good!" or "Keep up the great work!".

Do not explicitly state that you are an AI. Just provide the message. Ensure the message is direct and to the point.
`,
});

const skippyProvideContextualAssistanceFlow = ai.defineFlow(
  {
    name: 'skippyProvideContextualAssistanceFlow',
    inputSchema: SkippyProvideContextualAssistanceInputSchema,
    outputSchema: SkippyProvideContextualAssistanceOutputSchema,
  },
  async (input) => {
    const { output } = await skippyProvideContextualAssistancePrompt(input);
    return output!;
  }
);
