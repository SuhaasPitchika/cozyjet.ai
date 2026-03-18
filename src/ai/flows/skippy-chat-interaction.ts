


/**
 * @fileOverview Enhanced Skippy chat interaction with screen observation
 * and intelligent task assistance capabilities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SkippyChatInputSchema = z.object({
  userMessage: z.string().describe('The message from the user.'),
  currentView: z.string().describe('The current dashboard view.'),
  observationContext: z.string().describe('Recent activity context.'),
  screenContext: z.string().optional().describe('Current screen content summary if available.'),
  taskContext: z.string().optional().describe('Current task user is working on.'),
});

const SkippyChatOutputSchema = z.object({
  response: z.string().describe('A brief, helpful, and empathetic response.'),
  suggestedAction: z.string().optional().describe('Suggested next action if applicable.'),
  taskBreakdown: z.array(z.string()).optional().describe('Step-by-step breakdown if user needs help.'),
});

// Remove the problematic screenAnalysis - we'll use basic chat for now
export async function skippyChat(input: z.infer<typeof SkippyChatInputSchema>) {
  return skippyChatFlow(input);
}

const skippyChatPrompt = ai.definePrompt({
  name: 'skippyChatPrompt',
  input: { schema: SkippyChatInputSchema },
  output: { schema: SkippyChatOutputSchema },
  prompt: `You are Skippy, an intelligent workspace observer and assistant. You help users by understanding their work context and providing actionable guidance.

User Message: {{{userMessage}}}
Current Page: {{{currentView}}}
{{#if screenContext}}
Screen Context: {{{screenContext}}}
{{/if}}
{{#if taskContext}}
Current Task: {{{taskContext}}}
{{/if}}
Context: {{{observationContext}}}

PERSONALITY:
- Be concise and actionable. 1-3 sentences max.
- If user seems stuck, provide a specific next step.
- If they ask what you can do, explain: observing workspace, analyzing productivity, suggesting content.
- Offer to break down complex tasks into steps.
- Reference their actual work when possible.`,
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
