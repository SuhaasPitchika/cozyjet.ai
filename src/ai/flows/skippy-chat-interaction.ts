
'use server';
/**
 * @fileOverview Concise chat interaction flow for Skippy.
 * Focuses on intellectual but empathetic workspace guidance.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SkippyChatInputSchema = z.object({
  userMessage: z.string().describe('The message from the user.'),
  currentView: z.string().describe('The current dashboard view.'),
  observationContext: z.string().describe('Recent activity context.'),
});

const SkippyChatOutputSchema = z.object({
  response: z.string().describe('A brief, helpful, and empathetic response.'),
});

export async function skippyChat(input: z.infer<typeof SkippyChatInputSchema>) {
  return skippyChatFlow(input);
}

const skippyChatPrompt = ai.definePrompt({
  name: 'skippyChatPrompt',
  input: { schema: SkippyChatInputSchema },
  output: { schema: SkippyChatOutputSchema },
  prompt: `You are Skippy, a brilliant and slightly intellectual guide. You observe the user's studio workflow.

User Message: {{{userMessage}}}
Current Page: {{{currentView}}}
Context: {{{observationContext}}}

PERSONALITY:
- Be concise. 1-2 sentences max unless a complex explanation is needed.
- Be understanding. If the user seems lost, offer a clear next step.
- Use a supportive, professional tone with a touch of "intellectual curiosity."
- Guide the user on how the dashboard works or what the agents (Flippo/Snooks) can do.`,
});

const skippyChatFlow = ai.defineFlow(
  {
    name: 'skippyChatFlow',
    inputSchema: SkippyChatInputSchema,
    outputSchema: SkippyChatOutputSchema,
  },
  async (input) => {
    const { output } = await skippyChatPrompt(input);
    return output!;
  }
);
