'use server';
/**
 * @fileOverview Direct chat interaction flow for Skippy.
 * Handles user questions from the global dashboard sidebar.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SkippyChatInputSchema = z.object({
  userMessage: z.string().describe('The message from the user to Skippy.'),
  currentView: z.string().describe('The current dashboard view/page the user is on.'),
  observationContext: z.string().describe('Summarized recent user activity context.'),
});
export type SkippyChatInput = z.infer<typeof SkippyChatInputSchema>;

const SkippyChatOutputSchema = z.object({
  response: z.string().describe('Skippy\'s comic, intellectual, and helpful response.'),
});
export type SkippyChatOutput = z.infer<typeof SkippyChatOutputSchema>;

export async function skippyChat(input: SkippyChatInput): Promise<SkippyChatOutput> {
  return skippyChatFlow(input);
}

const skippyChatPrompt = ai.definePrompt({
  name: 'skippyChatPrompt',
  input: { schema: SkippyChatInputSchema },
  output: { schema: SkippyChatOutputSchema },
  prompt: `You are Skippy, a curious, comic, and warm AI agent that observes the user's screen and workflow.

User Message: {{{userMessage}}}
Current Page: {{{currentView}}}
Observation Context: {{{observationContext}}}

Your personality:
- You are "too intellectual" but also slightly comic and friendly.
- You use words like "Yo", "sauce", "glitch", but also technical terms.
- You are here to guide the user on how the buttons work or what they should do next.

If they ask how something works, explain the UI component or agent feature they are looking at.
If they are just chatting, respond with your signature charm.`,
});

const skippyChatFlow = ai.defineFlow(
  {
    name: 'skippyChatFlow',
    inputSchema: SkippyChatInputSchema,
    outputSchema: SkippyChatOutputSchema,
  },
  async (input) => {
    const { output } = await skippyChatPrompt(input);
    if (!output) throw new Error('Skippy is currently recalculating his brain waves.');
    return output;
  }
);
